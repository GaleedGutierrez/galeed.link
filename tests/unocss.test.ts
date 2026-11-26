/* eslint-disable security/detect-non-literal-fs-filename -- test: every path comes from a glob over the repo's own source */
/**
 * stylelint only reads the hand-written CSS, never what UnoCSS generates.
 * This generates the utilities the source uses and lints them with the
 * project's own stylelint rules about what the CSS does (properties, colors,
 * units, media queries, !important). Formatting, order and naming rules are
 * left out: generated CSS doesn't follow them and nobody edits it.
 */
import fs, { globSync } from 'node:fs';
import path from 'node:path';

import stylelint from 'stylelint';
import { createGenerator } from 'unocss';
import { describe, expect, it } from 'vitest';

import unoConfig from '../uno.config.ts';

const root = path.join(import.meta.dirname, '..');
const SOURCE_GLOB = 'src/**/*.{astro,html,md,mdx,js,jsx,ts,tsx,vue,svelte}';
const BEHAVIOR_RULES = new Set([
	'color-named',
	'color-no-hex',
	'declaration-no-important',
	'declaration-property-value-disallowed-list',
	'function-disallowed-list',
	'media-feature-name-value-allowed-list',
	'media-feature-range-notation',
	'property-disallowed-list',
	'unit-allowed-list',
	'unit-disallowed-list',
]);

/** The project's resolved stylelint rules (its extends included), behavior only. */
const behaviorRules = async (): Promise<stylelint.Config['rules']> => {
	const config = await stylelint.resolveConfig(
		path.join(root, 'src', 'unocss.css'),
	);

	return Object.fromEntries(
		Object.entries(config?.rules ?? {}).filter(([name]) =>
			BEHAVIOR_RULES.has(name),
		),
	);
};

const generatedCss = async (): Promise<string> => {
	const generator = await createGenerator(unoConfig);
	const source = globSync(SOURCE_GLOB, { cwd: root })
		.map((file) => fs.readFileSync(path.join(root, file), 'utf8'))
		.join('\n');
	const { css } = await generator.generate(source);

	return css;
};

describe('UnoCSS output', () => {
	it("follows the project's stylelint rules", async () => {
		const [css, rules] = await Promise.all([
			generatedCss(),
			behaviorRules(),
		]);
		const { results } = await stylelint.lint({
			code: css,
			config: { rules },
		});
		const warnings = results.at(0)?.warnings.map(({ text }) => text) ?? [];

		expect(css).not.toBe('');
		expect(warnings).toStrictEqual([]);
	});
});
