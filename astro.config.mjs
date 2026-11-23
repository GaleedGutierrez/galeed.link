/* eslint-disable new-cap */
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
// import playformCompress from '@playform/compress';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import Sonda from 'sonda/astro';
import UnoCSS from 'unocss/astro';

import { getLastModified } from './src/utils/lastModified.ts';

try {
	process.loadEnvFile();
} catch {
	console.error('No .env file found, using environment variables');
}

// https://astro.build/config
export default defineConfig({
	site: 'https://galeed.link',
	// Astro 7 defaults to 'jsx', which drops the whitespace between inline
	// elements ("© 2026 Galeed" became "© 2026Galeed"). Keep the HTML-aware
	// compression.
	compressHTML: true,
	vite: {
		// shared-assets imports its images and svg?raw icons; Vite must
		// process it, because plain Node can't import those files. Set on
		// `resolve`, not `ssr`: Astro 7 prerenders in its own `prerender`
		// environment, which ignores `ssr.noExternal`.
		resolve: {
			noExternal: ['@galeedgutierrez/shared-assets'],
		},
		build: {
			sourcemap: process.env.ENABLE_SOURCEMAP === 'true',
		},
	},
	integrations: [
		// Last content commit, not the build time (src/utils/lastModified.ts).
		sitemap({ lastmod: getLastModified() }),
		icon(),
		process.env.ENABLE_SOURCEMAP === 'true' &&
			Sonda({ server: true, open: false }),
		partytown({
			config: {
				forward: ['dataLayer.push', 'gtag'],
			},
		}),
		// playformCompress({
		// 	CSS: {
		// 		csso: false,
		// 	},
		// 	HTML: {
		// 		'html-minifier-terser': {
		// 			removeComments: true,
		// 		},
		// 	},
		// }),
		// generic/light-reset.css is the only reset.
		UnoCSS({
			injectReset: false,
		}),
	],
});
