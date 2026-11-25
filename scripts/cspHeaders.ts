/* eslint-disable security/detect-non-literal-fs-filename -- build step: every path comes from dist/ or the repo, never from user input */
/**
 * Post-build: adds the Content-Security-Policy to `dist/_headers`.
 *
 * The hashes depend on the built HTML, so the header can't live in
 * `public/_headers`: it is generated here from every page's inline scripts
 * and `<style>` elements.
 * Runs last, once the HTML is final. Re-running it gives the same file.
 */
import console from 'node:console';
import fs, { globSync } from 'node:fs';
import path from 'node:path';

import {
	applyPolicy,
	buildPolicy,
	hashSource,
	inlineScripts,
	inlineStyles,
} from './csp.ts';

const distributionPath = path.join(import.meta.dirname, '..', 'dist');
const headersPath = path.join(distributionPath, '_headers');

const run = (): void => {
	console.info('🛡️  Generating the Content-Security-Policy...');

	// Partytown's sandbox page is vendor code with its own inline script; it
	// gets its own policy instead (`PARTYTOWN_POLICY`).
	const htmlFiles = globSync('**/*.html', {
		cwd: distributionPath,
		exclude: ['~partytown/**'],
	});

	const scripts = new Set<string>();
	const styles = new Set<string>();

	for (const file of htmlFiles) {
		const html = fs.readFileSync(path.join(distributionPath, file), 'utf8');

		for (const script of inlineScripts(html)) {
			scripts.add(hashSource(script));
		}

		for (const style of inlineStyles(html)) {
			styles.add(hashSource(style));
		}
	}

	// Sorted, so the header only changes when a hash does.
	const sorted = (hashes: Set<string>): string[] =>
		[...hashes].toSorted((a, b) => a.localeCompare(b));
	const policy = buildPolicy({
		scripts: sorted(scripts),
		styles: sorted(styles),
	});
	const existing = fs.existsSync(headersPath)
		? fs.readFileSync(headersPath, 'utf8')
		: '';

	fs.writeFileSync(headersPath, applyPolicy(existing, policy));

	console.info(
		`✅ ${scripts.size} script and ${styles.size} style hashes from ${htmlFiles.length} pages`,
	);
};

run();
