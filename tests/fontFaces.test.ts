import { describe, expect, it } from 'vitest';

import {
	hasCharacterInRange,
	parseUnicodeRange,
	pruneFontFaces,
} from '../scripts/fontFaces.ts';

const face = (subset: string, range: string): string =>
	`@font-face{font-family:Barlow;src:url(/_astro/barlow-${subset}.a.woff2)format("woff2"),url(/_astro/barlow-${subset}.b.woff)format("woff");unicode-range:${range}}`;

describe('parseUnicodeRange', () => {
	it('reads single code points, ranges and wildcards', () => {
		expect(parseUnicodeRange('U+??,U+131,U+2000-206F,U+4??')).toStrictEqual(
			[
				[0x00, 0xff],
				[0x1_31, 0x1_31],
				[0x20_00, 0x20_6f],
				[0x4_00, 0x4_ff],
			],
		);
	});
});

describe('hasCharacterInRange', () => {
	it('matches a character inside the range', () => {
		expect(hasCharacterInRange('U+0370-03FF', 'aλ')).toBe(true);
	});

	it('ignores characters outside it', () => {
		expect(
			hasCharacterInRange('U+0100-02BA,U+1E00-1E9F', 'Jujuy ñ —'),
		).toBe(false);
	});
});

describe('pruneFontFaces', () => {
	const css = `${face('latin', 'U+??,U+2000-206F')}${face('latin-ext', 'U+100-2BA')}.a{color:red}`;

	it('drops the rules no page character falls in', () => {
		const result = pruneFontFaces(css, 'Hola ñ —');

		expect(result).not.toContain('latin-ext');
		expect(result).toContain('barlow-latin.a.woff2');
		expect(result).toContain('.a{color:red}');
	});

	it('drops the WOFF fallback of the rules that stay', () => {
		expect(pruneFontFaces(css, 'Hola')).toBe(
			'@font-face{font-family:Barlow;src:url(/_astro/barlow-latin.a.woff2)format("woff2");unicode-range:U+??,U+2000-206F}.a{color:red}',
		);
	});

	it('keeps rules without a unicode-range', () => {
		const fallback =
			'@font-face{font-family:"Barlow Fallback";src:local("Arial")}';

		expect(pruneFontFaces(fallback, 'Hola')).toBe(fallback);
	});
});
