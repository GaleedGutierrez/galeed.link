/* eslint-disable new-cap */
// @ts-check
import sitemap from '@astrojs/sitemap';
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
		process.env.ENABLE_SOURCEMAP === 'true' && Sonda({ server: true }),
	],
});
