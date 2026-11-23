/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * Post-build: subset every web font to the characters the built pages use.
 *
 * The page text is fixed at build time (shared-assets content included), so
 * the glyphs it needs are known: Barlow and JetBrains Mono drop from ~136 KB
 * to ~46 KB. Runs last, after purge-css and lightningcss, because it renames
 * files: each subset font gets a content hash, and so does every CSS file
 * that points at a font, so a cached stylesheet can never reference a font
 * that a later deploy removed.
 */
import console from 'node:console';
import { createHash } from 'node:crypto';
import fs, { globSync } from 'node:fs';
import path from 'node:path';

import subsetFont from 'subset-font';

const distributionPath = path.join(import.meta.dirname, '..', 'dist');
const assetsPath = path.join(distributionPath, '_astro');

// Always kept, on top of the page text: digits, Spanish letters and common
// punctuation. A small margin for text a future build might add.
const SAFETY_CHARACTERS =
	'  0123456789.,:;!?¿¡()[]-–—·…\'"“”‘’/#@&%+*=<>©áéíóúüñÁÉÍÓÚÜÑ';

const NAMED_ENTITIES: Record<string, string> = {
	amp: '&',
	apos: "'",
	gt: '>',
	lt: '<',
	nbsp: ' ',
	quot: '"',
};

const decodeEntities = (text: string): string =>
	text.replaceAll(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
		if (code.startsWith('#x') || code.startsWith('#X')) {
			return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
		}

		if (code.startsWith('#')) {
			return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
		}

		return NAMED_ENTITIES[code.toLowerCase()] ?? entity;
	});

/** Visible text of an HTML document: no scripts, styles, comments or tags. */
const extractText = (html: string): string =>
	decodeEntities(
		html
			.replaceAll(/<script[\s\S]*?<\/script>/gi, ' ')
			.replaceAll(/<style[\s\S]*?<\/style>/gi, ' ')
			.replaceAll(/<!--[\s\S]*?-->/g, ' ')
			.replaceAll(/<[^>]+>/g, ' '),
	);

/** Strings in CSS `content` (pseudo-element text). */
const extractCssContent = (css: string): string =>
	[...css.matchAll(/content:\s*(["'])(.*?)\1/g)]
		.map((match) =>
			match[2].replaceAll(
				/\\([\da-f]{1,6})\s?/gi,
				(_match, hex: string) =>
					String.fromCodePoint(Number.parseInt(hex, 16)),
			),
		)
		.join('');

const hashOf = (content: Buffer | string): string =>
	createHash('sha256').update(content).digest('base64url').slice(0, 8);

/** "barlow-latin-400-normal.qiz4-Cze.woff2" → "barlow-latin-400-normal" */
const stemOf = (fileName: string): string =>
	fileName.replace(/\.[\w-]+\.(woff2|css)$/, '');

const toKb = (bytes: number): string => `${(bytes / 1024).toFixed(1)}kb`;

const collectCharacters = (htmlFiles: string[], cssFiles: string[]): string => {
	let text = SAFETY_CHARACTERS;

	for (const file of htmlFiles) {
		text += extractText(fs.readFileSync(file, 'utf8'));
	}

	for (const file of cssFiles) {
		text += extractCssContent(fs.readFileSync(file, 'utf8'));
	}

	// text-transform can render either case of any letter.
	const characters = new Set(
		[...text, ...text.toUpperCase(), ...text.toLowerCase()].filter(
			(character) => character !== '\n' && character !== '\t',
		),
	);

	return [...characters].join('');
};

/** Replaces every `/_astro/<old>` reference in the given files. */
const rewriteReferences = (
	files: string[],
	renames: Map<string, string>,
): void => {
	for (const file of files) {
		const before = fs.readFileSync(file, 'utf8');
		let after = before;

		for (const [oldName, newName] of renames) {
			after = after.replaceAll(
				`/_astro/${oldName}`,
				`/_astro/${newName}`,
			);
		}

		if (after !== before) {
			fs.writeFileSync(file, after);
		}
	}
};

const run = async (): Promise<void> => {
	console.info('🔤 Subsetting fonts...');

	const htmlFiles = globSync('**/*.html', { cwd: distributionPath }).map(
		(file) => path.join(distributionPath, file),
	);
	const cssFiles = (): string[] =>
		globSync('*.css', { cwd: assetsPath }).map((file) =>
			path.join(assetsPath, file),
		);
	const fontFiles = globSync('*.woff2', { cwd: assetsPath });

	if (fontFiles.length === 0) {
		console.info('No fonts in dist/_astro, nothing to do.');

		return;
	}

	const characters = collectCharacters(htmlFiles, cssFiles());

	console.info(`   ${[...characters].length} distinct characters kept`);

	const results = await Promise.all(
		fontFiles.map(async (fontFile) => {
			const fontPath = path.join(assetsPath, fontFile);
			const original = fs.readFileSync(fontPath);
			// Variable fonts keep their axes (subset-font's default).
			const subset = await subsetFont(original, characters, {
				targetFormat: 'woff2',
			});
			const newName = `${stemOf(fontFile)}.${hashOf(subset)}.woff2`;

			fs.writeFileSync(path.join(assetsPath, newName), subset);

			if (newName !== fontFile) {
				fs.rmSync(fontPath);
			}

			return {
				fontFile,
				newName,
				before: original.length,
				after: subset.length,
			};
		}),
	);
	const fontRenames = new Map(
		results.map(({ fontFile, newName }) => [fontFile, newName]),
	);
	const beforeTotal = results.reduce((sum, { before }) => sum + before, 0);
	const afterTotal = results.reduce((sum, { after }) => sum + after, 0);

	// Fonts are referenced from the CSS (@font-face) and the HTML (preloads).
	rewriteReferences([...cssFiles(), ...htmlFiles], fontRenames);

	// Re-hash the stylesheets whose content just changed.
	const cssRenames = new Map<string, string>();

	for (const cssPath of cssFiles()) {
		const cssFile = path.basename(cssPath);
		const newName = `${stemOf(cssFile)}.${hashOf(fs.readFileSync(cssPath))}.css`;

		if (newName !== cssFile) {
			fs.renameSync(cssPath, path.join(assetsPath, newName));
			cssRenames.set(cssFile, newName);
		}
	}

	rewriteReferences(htmlFiles, cssRenames);

	console.info(
		`✅ ${fontFiles.length} fonts: ${toKb(beforeTotal)} → ${toKb(afterTotal)} (all subsets, not only the ones a page downloads)`,
	);
};

await run();
