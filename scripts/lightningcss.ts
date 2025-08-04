/* eslint-disable security/detect-non-literal-fs-filename */
import console from 'node:console';
import fs, { globSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import browserslist from 'browserslist';
import { browserslistToTargets, transform } from 'lightningcss';

const distributionPath = path.join(import.meta.dirname, '..', 'dist');
let beforeTotalSize = 0;
const targets = browserslistToTargets(
	browserslist(['>= 0.25%', 'not dead', 'supports css-nesting']),
);

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

	beforeTotalSize += beforeBytes;
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
		if (error instanceof Error) {
			console.error(`❌ Error processing ${cssFile}:`, error.message);
		}
	}
};

function runLightningCSS(): void {
	try {
		if (!fs.existsSync(distributionPath)) {
			logMessage('❌ Distribution (dist) folder not found', 'error');

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
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	runLightningCSS();
}

export { runLightningCSS };
