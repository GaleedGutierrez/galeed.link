/* eslint-disable new-cap -- Sonda and UnoCSS name their integration factories in PascalCase */
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import { optimize } from '@galeedgutierrez/frontend-config/astro';
import { getLastModified } from '@galeedgutierrez/frontend-config/git';
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';
import Sonda from 'sonda/astro';
import UnoCSS from 'unocss/astro';

try {
	process.loadEnvFile();
} catch {
	console.error('No .env file found, using environment variables');
}

// Google's documented GA4 origins. gtag normally runs inside Partytown's
// worker, but when the worker can't fetch it, Partytown falls back to a
// regular <script> on the page, and then the page's policy applies.
const TAG_MANAGER = 'https://*.googletagmanager.com';
const ANALYTICS = [
	'https://*.google-analytics.com',
	'https://*.analytics.google.com',
	TAG_MANAGER,
];

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
		// Last content commit, not the build time.
		sitemap({ lastmod: getLastModified() }),
		icon(),
		process.env.ENABLE_SOURCEMAP === 'true' &&
			Sonda({ server: true, open: false }),
		partytown({
			config: {
				forward: ['dataLayer.push', 'gtag'],
			},
		}),
		// generic/light-reset.css is the only reset.
		UnoCSS({
			injectReset: false,
		}),
		// Post-build CSS, fonts and CSP. Last: it needs every other
		// integration's output.
		optimize({
			purgeCss: {
				// Set at runtime: data-theme, -pref, -switching, -toggle
				// (theme.ts) and the section nav's scrollspy.
				safelist: { standard: [/^data-theme/, 'aria-current'] },
			},
			subsetFonts: {
				// JetBrains Mono only renders at --fw-medium (the `micro` mixin
				// and the `owner/repo` tile title).
				pinnedAxes: { 'jetbrains-mono-': { wght: 500 } },
			},
			cspHeaders: {
				sources: {
					// Cloudflare Web Analytics: the edge injects its beacon into
					// every page, so the script is never in the built HTML.
					'script-src': [
						TAG_MANAGER,
						'https://static.cloudflareinsights.com',
					],
					'img-src': ANALYTICS,
					'connect-src': [
						...ANALYTICS,
						'https://cloudflareinsights.com',
					],
				},
				// gtag runs in Partytown's worker (eval, blob: workers).
				partytown: {
					sources: {
						'script-src': [TAG_MANAGER],
						'img-src': ANALYTICS,
						'connect-src': ANALYTICS,
					},
				},
			},
		}),
	],
});
