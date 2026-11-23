/* eslint-disable new-cap */
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
// import playformCompress from '@playform/compress';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import Sonda from 'sonda/astro';
import UnoCSS from 'unocss/astro';

try {
	process.loadEnvFile();
} catch {
	console.error('No .env file found, using environment variables');
}

// https://astro.build/config
export default defineConfig({
	site: 'https://galeed.link',
	vite: {
		// shared-assets imports its images and svg?raw icons; Vite must
		// process it, because plain Node can't import those files.
		ssr: {
			noExternal: ['@galeedgutierrez/shared-assets'],
		},
		build: {
			sourcemap: process.env.ENABLE_SOURCEMAP === 'true',
		},
	},
	server: {
		host: true,
	},
	integrations: [
		sitemap({ lastmod: new Date() }),
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
