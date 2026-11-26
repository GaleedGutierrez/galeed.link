/* eslint-disable security/detect-non-literal-fs-filename -- build step: every path comes from dist/ or the repo, never from user input */
import console from 'node:console';
import fs, { globSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import browserslist from 'browserslist';
import { browserslistToTargets, transform } from 'lightningcss';

const distributionPath = path.join(import.meta.dirname, '..', 'dist');
// The `browserslist` field of package.json (Baseline Widely available, plus
// the browsers built on the same engines). cssnano's autoprefixer reads it too.
const targets = browserslistToTargets(
	browserslist(undefined, { path: import.meta.dirname }),
);

/**
 * Total size of the given dist files, read before any step rewrites them.
 * @param files - Paths relative to dist.
 * @returns The size in bytes.
 */
function totalSizeOf(files: string[]): number {
	let total = 0;

	for (const file of files) {
		total += fs.statSync(path.join(distributionPath, file)).size;
	}

	return total;
}

function calculateFileSize(filePath: string): string {
	try {
		const stats = fs.statSync(filePath);
		const sizeKB = (stats.size / 1024).toFixed(2);

		return `${sizeKB}kb`;
	} catch {
		return 'unknown size';
	}
}

function logMessage(message: string, level = 'info'): void {
	// Simplified logging - can be enhanced based on environment
	if (level === 'error') {
		console.error(message);

		return;
	}

	console.info(message);
}

const processCSSFile = (cssFile: string): number | undefined => {
	const cssFilePath = path.join(distributionPath, cssFile);
	const beforeSize = calculateFileSize(cssFilePath);
	const beforeBytes = fs.statSync(cssFilePath).size;

	logMessage(`📂 Processing: ${cssFile} (${beforeSize})`);

	try {
		// Read the CSS file
		const cssContent = fs.readFileSync(cssFilePath, 'utf8');

		// Transform with LightningCSS
		const result = transform({
			filename: cssFilePath,
			code: Buffer.from(cssContent),
			minify: true,
			targets,
		});

		// Rules it couldn't parse or lower are dropped or kept as written:
		// show them instead of shipping the surprise.
		for (const warning of result.warnings) {
			console.warn(
				`⚠️ ${cssFile}:${warning.loc.line}:${warning.loc.column} ${warning.message}`,
			);
		}

		logMessage(`✅ LightningCSS completed for ${cssFile}`);

		// Write the optimized CSS back to the file
		fs.writeFileSync(cssFilePath, result.code);

		const afterSize = calculateFileSize(cssFilePath);
		const afterBytes = fs.statSync(cssFilePath).size;
		const savings = beforeBytes - afterBytes;

		console.info(
			`📊 Result: ${cssFile} - Before: ${beforeSize}, After: ${afterSize} (Saved: ${(savings / 1024).toFixed(2)}kb)`,
		);

		return savings;
	} catch (error) {
		console.error(
			`❌ Error processing ${cssFile}:`,
			error instanceof Error ? error.message : error,
		);
		// Keep going with the other files, but fail the build: an
		// untransformed sheet would otherwise ship without a trace.
		process.exitCode = 1;

		return undefined;
	}
};

function runLightningCSS(): void {
	try {
		if (!fs.existsSync(distributionPath)) {
			logMessage('❌ Distribution (dist) folder not found', 'error');
			process.exitCode = 1;

			return;
		}

		logMessage('⚡ Running LightningCSS...');

		const cssFiles = globSync('**/*.css', {
			cwd: distributionPath,
		});

		if (cssFiles.length === 0) {
			logMessage('⚠️ No CSS files found in dist folder', 'error');

			return;
		}

		const beforeTotalSize = totalSizeOf(cssFiles);

		const savingsResults = cssFiles.map((cssFile) =>
			processCSSFile(cssFile),
		);
		let totalSavings = 0;

		for (const savings of savingsResults) {
			if (typeof savings === 'number') {
				totalSavings += savings;
			}
		}

		if (totalSavings > 0) {
			const percentage = (totalSavings / beforeTotalSize) * 100;

			console.info(
				`🎉 Total CSS reduced by ${(totalSavings / 1024).toFixed(2)}kb (${percentage.toFixed(2)}%)`,
			);
		} else {
			console.info('✨ CSS files were already optimized!');
		}
	} catch (error) {
		// Log the error for debugging purposes
		console.error(
			'❌ Error running LightningCSS:',
			error instanceof Error ? error.message : error,
		);

		// Re-throw to allow calling code to handle it
		throw error instanceof Error
			? error
			: new Error('LightningCSS execution failed');
	}
}

// Run the LightningCSS function if this module is the entry point
const entryPoint = process.argv[1];

if (entryPoint && import.meta.url === pathToFileURL(entryPoint).href) {
	runLightningCSS();
}

export { runLightningCSS };
