/* eslint-disable camelcase -- the web manifest spec names its keys in snake_case */
import type { APIRoute } from 'astro';

import { personalSchema } from '@/data/personalSchema';
import { THEME_COLORS } from '@/data/themeColors';

// /site.webmanifest, built from the same data as the page, so the name and
// description never drift from it. It isn't a PWA: no `display`, so an
// installed copy opens in the browser.
const manifest = {
	// `id` and `start_url` fixed to the home: without them, installing from
	// the 404 would open the 404.
	id: '/',
	start_url: '/',
	scope: '/',
	name: personalSchema.name,
	short_name: personalSchema.alternateName[0],
	description: personalSchema.description,
	lang: 'es',
	dir: 'ltr',
	// One color per manifest: the dark one, like the icons (rendered from
	// the favicon's dark version). The <meta name="theme-color"> tags still
	// follow the OS theme in the browser.
	theme_color: THEME_COLORS.dark,
	background_color: THEME_COLORS.dark,
	icons: [
		{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
		{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
		// The mark inside the central 80% circle, so Android's launcher masks
		// crop the background only, never the ring.
		{
			src: '/icon-maskable-512.png',
			sizes: '512x512',
			type: 'image/png',
			purpose: 'maskable',
		},
	],
};

export const GET: APIRoute = () =>
	Response.json(manifest, {
		headers: { 'Content-Type': 'application/manifest+json' },
	});
