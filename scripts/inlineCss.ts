/* eslint-disable security/detect-non-literal-fs-filename -- build step: every path comes from dist/ or the repo, never from user input */
/**
 * Post-build: replaces each page's `/_astro/*.css` links with `<style>`
 * elements.
 *
 * The site's whole CSS is ~13 KB compressed, so a separate request only costs
 * a round trip before the first paint (PageSpeed's "render-blocking
 * requests"). Runs after subset-fonts, which renames the style sheets, and
 * before csp-headers, which hashes the new `<style>` elements.
 */
import console from 'node:console';
import fs, { globSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const distributionPath = path.join(import.meta.dirname, '..', 'dist');
const LINK_PATTERN = /<link\b[^>]*>/gi;
const STYLESHEET_PATTERN = /\brel=["']?stylesheet["'\s>]/i;
const HREF_PATTERN = /\bhref=["']?(\/_astro\/[^"'\s>]+\.css)/i;

/**
 * Inlines a page's own style sheets, in place, so the cascade order holds.
 * @param html - A built HTML document.
 * @param readCss - Returns the CSS of a `/_astro/…` path.
 * @returns The new HTML and the paths it inlined.
 */
export const inlineStylesheets = (
	html: string,
	readCss: (href: string) => string,
): { html: string; inlined: string[] } => {
	const inlined: string[] = [];
	const result = html.replaceAll(LINK_PATTERN, (link) => {
		const href = HREF_PATTERN.exec(link)?.[1];

		if (!href || !STYLESHEET_PATTERN.test(link)) {
			return link;
		}

		const css = readCss(href);

		// "</style" in a string or comment would end the element early.
		if (/<\/style/i.test(css)) {
			throw new Error(`${href} contains "</style", can't inline it`);
		}

		inlined.push(href);

		// A function result, so a `$` in the CSS is never read as a pattern.
		return `<style>${css}</style>`;
	});

	return { html: result, inlined };
};

const run = (): void => {
	console.info('🎨 Inlining style sheets...');

	// Partytown's sandbox page is vendor code and links no style sheet.
	const htmlFiles = globSync('**/*.html', {
		cwd: distributionPath,
		exclude: ['~partytown/**'],
	}).map((file) => path.join(distributionPath, file));
	const readCss = (href: string): string =>
		fs.readFileSync(path.join(distributionPath, href), 'utf8').trim();
	const inlinedFiles = new Set<string>();

	for (const file of htmlFiles) {
		const { html, inlined } = inlineStylesheets(
			fs.readFileSync(file, 'utf8'),
			readCss,
		);

		if (inlined.length > 0) {
			fs.writeFileSync(file, html);
		}

		for (const href of inlined) {
			inlinedFiles.add(href);
		}
	}

	// Every page now carries its CSS, so the files are never requested.
	for (const href of inlinedFiles) {
		fs.rmSync(path.join(distributionPath, href));
	}

	console.info(
		`✅ ${inlinedFiles.size} style sheets inlined into ${htmlFiles.length} pages`,
	);
};

const entryPoint = process.argv[1];

if (entryPoint && import.meta.url === pathToFileURL(entryPoint).href) {
	run();
}
