/* eslint-disable new-cap */
// @ts-check
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import playformCompress from '@playform/compress';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import Sonda from 'sonda/astro';

process.loadEnvFile();

// https://astro.build/config
export default defineConfig({
	site: 'https://galeed.link',
	vite: {
		build: {
			sourcemap: process.env.ENABLE_SOURCEMAP === 'true',
		},
	},
	server: {
		host: true,
	},
	integrations: [
		sitemap(),
		icon(),
		process.env.ENABLE_SOURCEMAP === 'true' &&
			Sonda({ server: true, open: false }),
		partytown({
			config: {
				forward: ['dataLayer.push', 'gtag'],
			},
		}),
		playformCompress({
			CSS: {
				csso: false,
			},
			HTML: {
				'html-minifier-terser': {
					removeComments: true,
				},
			},
		}),
	],
});
