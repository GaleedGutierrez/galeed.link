import { readFileSync } from 'node:fs';

import { transform } from 'lightningcss';
import { describe, expect, it } from 'vitest';

import { THEME_COLORS } from '@/data/themeColors';
import { COLOR_TOKENS, SHARED_COLOR_TOKENS } from '@/types/designTokens';

/**
 * Read a CSS file without comments: they mention [data-theme] and would trip
 * the override check.
 * @param file - Path from the repository root.
 * @returns The file contents without comments.
 */
const readCss = (file: string): string =>
	// eslint-disable-next-line security/detect-non-literal-fs-filename -- fixed paths below
	readFileSync(file, 'utf8').replaceAll(/\/\*[\s\S]*?\*\//g, '');

const colors = readCss('src/styles/settings/colors.css');
const rootBlock = /:root\s*\{([\s\S]*?)\n\}/.exec(colors)?.[1] ?? '';
const shared = new Set<string>(SHARED_COLOR_TOKENS);

const declarationOf = (token: string, flags = ''): RegExp =>
	// eslint-disable-next-line security/detect-non-literal-regexp -- token names come from COLOR_TOKENS
	new RegExp(String.raw`--${token}:\s*([^;]+);`, flags);

describe('color tokens (DESIGN_SYSTEM.md §9.9)', () => {
	it.each(COLOR_TOKENS)('--%s is declared once in :root', (token) => {
		const declarations = rootBlock.match(declarationOf(token, 'g'));

		expect(declarations).toHaveLength(1);
	});

	it.each(COLOR_TOKENS.filter((token) => !shared.has(token)))(
		'--%s uses light-dark()',
		(token) => {
			const value = declarationOf(token).exec(rootBlock)?.[1]?.trim();

			expect(value).toMatch(/^light-dark\(/);
		},
	);

	// postcss-custom-properties (preserve: false) only reads :root, so a
	// per-theme override would be inlined away at build time.
	it('is never redefined under [data-theme]', () => {
		expect(colors).not.toMatch(
			/\[data-theme[^\]]*\][^{]*\{[^}]*--(background|text|border|outline)-color-/,
		);
	});

	// The theme-color metas and the web manifest need hex, so they can't read
	// the tokens. lightningcss lowers oklch() to its sRGB hex for old targets.
	it.each([
		['light', 'bone-100', THEME_COLORS.light],
		['dark', 'charcoal-950', THEME_COLORS.dark],
	])('THEME_COLORS.%s is --%s in hex', (_theme, token, hex) => {
		const oklch = declarationOf(token).exec(colors)?.[1]?.trim() ?? '';
		const { code } = transform({
			filename: 'token.css',
			code: Buffer.from(`a{color:${oklch}}`),
			minify: true,
			// Chrome 80 (major << 16) has no oklch(), so the hex comes first.
			targets: { chrome: 80 << 16 },
		});

		expect(code.toString()).toContain(`color:${hex};`);
	});

	it('keeps both shell shadow values', () => {
		const shadows = readCss('src/styles/settings/shadows.css');

		expect(shadows).toContain('--box-shadow-shell-light:');
		expect(shadows).toContain('--box-shadow-shell-dark:');
	});
});
