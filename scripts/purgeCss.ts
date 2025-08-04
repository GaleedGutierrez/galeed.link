/* eslint-disable security/detect-non-literal-fs-filename */
import console from 'node:console';
import fs, { globSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

import postcss from 'postcss';
import type postcssrc from 'postcss-load-config';
import { PurgeCSS, type UserDefinedOptions } from 'purgecss';

import postcssConfig from '../postcss.config.js';

const distributionPath = path.join(import.meta.dirname, '..', 'dist');
let beforeTotalSize = 0;
const purgeCssConfig: Omit<UserDefinedOptions, 'css'> = {
	content: ['dist/**/*.html', 'dist/**/*.js'],
	safelist: {
		standard: [
			'html',
			'body',
			'a',
			'a:hover',
			'a:focus-visible',
			'a:active',
			/^\[data-.*\]$/,
			/^\[aria-.*\]$/,

			// Media queries y clases responsivas
			/^@media/,
			/^@container/,
			/^@supports/,

			// Clases con prefijos responsivos (Tailwind-style)
			/^sm:/,
			/^md:/,
			/^lg:/,
			/^xl:/,
			/^2xl:/,

			// Clases responsivas específicas
			/^md\\:/,
			/^lg\\:/,
			/^xl\\:/,
			/^2xl\\:/,

			// Escapar caracteres especiales en nombres de clase
			/\\:/,
			/\\./,
			/\\\[/,
			/\\]/,

			// Pseudo-clases básicas
			/:hover$/,
			/:focus$/,
			/:focus-visible$/,
			/:focus-within$/,
			/:active$/,
			/:visited$/,
			/:link$/,
			/:target$/,
			/:enabled$/,
			/:disabled$/,
			/:checked$/,
			/:indeterminate$/,
			/:default$/,
			/:valid$/,
			/:invalid$/,
			/:in-range$/,
			/:out-of-range$/,
			/:required$/,
			/:optional$/,
			/:read-only$/,
			/:read-write$/,
			/:placeholder-shown$/,
			/:autofill$/,

			// Pseudo-clases estructurales
			/:root$/,
			/:empty$/,
			/:first-child$/,
			/:last-child$/,
			/:only-child$/,
			/:first-of-type$/,
			/:last-of-type$/,
			/:only-of-type$/,
			/:nth-child$/,
			/:nth-last-child$/,
			/:nth-of-type$/,
			/:nth-last-of-type$/,

			// Pseudo-clases funcionales modernas
			/:is$/,
			/:where$/,
			/:not$/,
			/:has$/,

			// Pseudo-clases de dirección
			/:dir\(ltr\)$/,
			/:dir\(rtl\)$/,
			/:lang$/,

			// Pseudo-clases de estado
			/:playing$/,
			/:paused$/,
			/:seeking$/,
			/:buffering$/,
			/:stalled$/,
			/:muted$/,
			/:volume-locked$/,
			/:fullscreen$/,
			/:picture-in-picture$/,

			// Pseudo-clases de modal
			/:modal$/,
			/:popover-open$/,

			// Pseudo-elementos
			/::before$/,
			/::after$/,
			/::first-line$/,
			/::first-letter$/,
			/::selection$/,
			/::backdrop$/,
			/::placeholder$/,
			/::marker$/,
			/::spelling-error$/,
			/::grammar-error$/,
			/::file-selector-button$/,
			/::part$/,
			/::slotted$/,
			/::view-transition$/,
			/::view-transition-group$/,
			/::view-transition-image-pair$/,
			/::view-transition-old$/,
			/::view-transition-new$/,
		],
		deep: [
			// Pseudo-clases básicas
			/:hover$/,
			/:focus$/,
			/:focus-visible$/,
			/:focus-within$/,
			/:active$/,
			/:visited$/,
			/:target$/,
			/:enabled$/,
			/:disabled$/,
			/:checked$/,
			/:indeterminate$/,
			/:valid$/,
			/:invalid$/,
			/:placeholder-shown$/,
			/:autofill$/,

			// Pseudo-clases estructurales
			/:empty$/,
			/:first-child$/,
			/:last-child$/,
			/:only-child$/,
			/:first-of-type$/,
			/:last-of-type$/,
			/:only-of-type$/,
			/:nth-child$/,
			/:nth-last-child$/,
			/:nth-of-type$/,
			/:nth-last-of-type$/,

			// Pseudo-clases funcionales modernas
			/:is$/,
			/:where$/,
			/:not$/,
			/:has$/,

			// Pseudo-elementos (con soporte para :: y :)
			/::?before$/,
			/::?after$/,
			/::?first-line$/,
			/::?first-letter$/,
			/::selection$/,
			/::backdrop$/,
			/::placeholder$/,
			/::marker$/,
			/::file-selector-button$/,
			/::part$/,
			/::slotted$/,

			// Media queries para deep scanning
			/^@media/,
			/^@container/,

			// Clases responsivas
			/^sm:/,
			/^md:/,
			/^lg:/,
			/^xl:/,
			/^2xl:/,
		],
		// Preservar todas las reglas dentro de media queries
		greedy: [/^@media/, /^@container/, /^@supports/],
	},
	keyframes: true,
	fontFace: true,
	variables: true,
	skippedContentGlobs: ['node_modules/**', '.sonda/**'],
};

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

// Helper function to filter valid PostCSS plugins
function getValidPostCSSPlugins(
	plugins: postcssrc.Config['plugins'],
): postcss.AcceptedPlugin[] {
	if (!Array.isArray(plugins)) {
		return [];
	}

	const validPlugins: postcss.AcceptedPlugin[] = [];

	for (const plugin of plugins) {
		// Skip disabled plugins
		if (plugin === false) {
			continue;
		}

		// Handle different plugin formats from postcss-load-config
		if (typeof plugin === 'function') {
			// Direct plugin function
			validPlugins.push(plugin);
		} else if (typeof plugin === 'object') {
			// Check if it's a plugin instance with postcss property
			if ('postcss' in plugin && typeof plugin.postcss === 'function') {
				validPlugins.push(plugin as postcss.AcceptedPlugin);
			}
			// Check if it's a plugin with process method
			else if (
				'process' in plugin &&
				typeof plugin.process === 'function'
			) {
				validPlugins.push(plugin as postcss.AcceptedPlugin);
			}
			// Check if it's a plugin creator result
			else if (
				'pluginName' in plugin &&
				typeof plugin.pluginName === 'string'
			) {
				validPlugins.push(plugin as postcss.AcceptedPlugin);
			}
		}
	}

	return validPlugins;
}

const processCSSFile = async (cssFile: string): Promise<number | undefined> => {
	const cssFilePath = path.join(distributionPath, cssFile);
	const beforeSize = calculateFileSize(cssFilePath);
	const beforeBytes = fs.statSync(cssFilePath).size;

	beforeTotalSize += beforeBytes;
	logMessage(`📂 Processing: ${cssFile} (${beforeSize})`);

	try {
		const purgeCSSResult = await new PurgeCSS().purge({
			...purgeCssConfig,
			css: [cssFilePath],
		});

		logMessage(`✅ PurgeCSS completed for ${cssFile}`);

		if (purgeCSSResult[0]) {
			const validPlugins = getValidPostCSSPlugins(postcssConfig.plugins);

			const result = await postcss(validPlugins).process(
				purgeCSSResult[0].css,
				{ from: undefined },
			);

			fs.writeFileSync(cssFilePath, result.css);
		}

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

async function runPurgeCSS(): Promise<void> {
	try {
		if (!fs.existsSync(distributionPath)) {
			logMessage('❌ Distribution (dist) folder not found', 'error');

			return;
		}

		logMessage('🧹 Running PurgeCSS...');

		const cssFiles = globSync('**/*.css', {
			cwd: distributionPath,
		});

		if (cssFiles.length === 0) {
			logMessage('⚠️ No CSS files found in dist folder', 'error');

			return;
		}

		const savingsResults = await Promise.all(
			cssFiles.map((cssFile) => processCSSFile(cssFile)),
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
		}
	} catch (error) {
		// Log the error for debugging purposes
		console.error(
			'❌ Error running PurgeCSS:',
			error instanceof Error ? error.message : error,
		);

		// Re-throw to allow calling code to handle it
		throw error instanceof Error
			? error
			: new Error('PurgeCSS execution failed');
	}
}

// Run the PurgeCSS function if this module is the entry point
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
	await runPurgeCSS();
}
