import { describe, expect, it } from 'vitest';

import { inlineStylesheets } from '../scripts/inlineCss.ts';

const sheets = new Map([
	['/_astro/Layout.abc.css', 'body{color:red}'],
	['/_astro/index.def.css', '.a{content:"$&"}'],
]);
const readCss = (href: string): string => sheets.get(href) ?? '';

describe('inlineStylesheets', () => {
	it('replaces each style sheet link with its CSS, in order', () => {
		const { html, inlined } = inlineStylesheets(
			'<head><link rel="stylesheet" href="/_astro/Layout.abc.css"><link rel="stylesheet" href="/_astro/index.def.css"></head>',
			readCss,
		);

		expect(html).toBe(
			'<head><style>body{color:red}</style><style>.a{content:"$&"}</style></head>',
		);
		expect(inlined).toStrictEqual([
			'/_astro/Layout.abc.css',
			'/_astro/index.def.css',
		]);
	});

	it('leaves preloads, icons and external style sheets alone', () => {
		const page =
			'<link as="font" crossorigin href="/_astro/barlow.woff2" rel="preload"><link rel="icon" href="/favicon.svg"><link rel="stylesheet" href="https://fonts.example/a.css">';

		expect(inlineStylesheets(page, readCss)).toStrictEqual({
			html: page,
			inlined: [],
		});
	});

	it('refuses CSS that would close the style element', () => {
		expect(() =>
			inlineStylesheets(
				'<link rel="stylesheet" href="/_astro/x.css">',
				() => '.a{content:"</style>"}',
			),
		).toThrow('</style');
	});
});
