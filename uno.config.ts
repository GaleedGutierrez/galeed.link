/* eslint-disable security/detect-object-injection -- the keys come from UnoCSS rule matches, checked against fixed maps */
/* eslint-disable @typescript-eslint/explicit-function-return-type -- UnoCSS types each rule and preflight callback */
import {
	defineConfig,
	type Postprocessor,
	presetWind3,
	transformerVariantGroup,
} from 'unocss';

/**
 * UnoCSS is for LAYOUT ONLY: display, flex/grid, gap, padding/margin, sizing,
 * position/inset, overflow, aspect-ratio, order, line-clamp, and their
 * responsive variants. Color, type, borders, radius, shadows and motion live in
 * src/styles (tokens, mixins, atoms) and in each component's CSS Module.
 *
 * Spacing needs no theme: p-4 / gap-4 = 1rem = --spacing-4 (N × 4px).
 */
const VISUAL_UTILITIES = [
	/(^|:)(bg|text|border|divide|ring|outline|shadow|rounded|font|leading|tracking|decoration|underline|transition|duration|ease|delay|animate|opacity|fill|stroke|accent|caret|placeholder)(-|$)/,
	/(^|:)(uppercase|lowercase|capitalize|italic|truncate|antialiased)$/,
];

/**
 * Not utilities: the extractor reads the `<h1>`…`<h6>` tags as Wind's `h1`
 * shorthand (`h-1`) and generated `.h2 { height: .5rem }`.
 */
const HEADING_TAGS = /^h[1-6]$/;

const SIDES = {
	top: 'block-start',
	bottom: 'block-end',
	left: 'inline-start',
	right: 'inline-end',
} as const;
const CORNERS = {
	'top-left': 'start-start',
	'top-right': 'start-end',
	'bottom-left': 'end-start',
	'bottom-right': 'end-end',
} as const;

/** Physical property → its logical twin, for horizontal-tb writing modes. */
const LOGICAL_PROPERTIES: Record<string, string> = Object.fromEntries<string>([
	['width', 'inline-size'],
	['height', 'block-size'],
	['min-width', 'min-inline-size'],
	['max-width', 'max-inline-size'],
	['min-height', 'min-block-size'],
	['max-height', 'max-block-size'],
	...Object.entries(SIDES).flatMap(([side, logical]): [string, string][] => [
		[side, `inset-${logical}`],
		...['margin', 'padding', 'scroll-margin', 'scroll-padding'].map(
			(property): [string, string] => [
				`${property}-${side}`,
				`${property}-${logical}`,
			],
		),
		...['', '-width', '-style', '-color'].map(
			(suffix): [string, string] => [
				`border-${side}${suffix}`,
				`border-${logical}${suffix}`,
			],
		),
	]),
	...Object.entries(CORNERS).map(([corner, logical]): [string, string] => [
		`border-${corner}-radius`,
		`border-${logical}-radius`,
	]),
]);

/** `(min-width: 40em)` → `(width >= 40em)`, likewise max- and height. */
const toRangeSyntax = (query: string) =>
	query.replaceAll(
		/\((min|max)-(width|height):\s*([^)]+)\)/g,
		(_, bound: string, feature: string, value: string) =>
			`(${feature} ${bound === 'min' ? '>=' : '<='} ${value.trim()})`,
	);

/**
 * Rewrites every utility to logical properties and range media queries, the
 * same rules stylelint enforces on hand-written CSS (it never sees UnoCSS'
 * output; tests/unocss.test.ts lints it). Drop it from `postprocess` in a
 * project that wants Wind's physical output.
 * @param utility - A generated utility, rewritten in place.
 */
const toLogical: Postprocessor = (utility) => {
	utility.entries = utility.entries.map(([property, value]) => [
		LOGICAL_PROPERTIES[property] ?? property,
		value,
	]);
	utility.parent = utility.parent?.startsWith('@media')
		? toRangeSyntax(utility.parent)
		: utility.parent;
};

export default defineConfig({
	// The preflight declares every --un-* variable (transforms, rings,
	// shadows, filters) on every element; 'on-demand' keeps only the ones a
	// used utility needs.
	presets: [presetWind3({ preflight: 'on-demand' })],
	transformers: [transformerVariantGroup()],
	blocklist: [...VISUAL_UTILITIES, HEADING_TAGS],
	postprocess: [toLogical],
	theme: {
		// em, not px, so layouts follow the user's text size (§5.4).
		breakpoints: {
			sm: '40em',
			md: '48em',
			lg: '64em',
			xl: '90em',
		},
	},
	// User rules are matched before preset rules, so these logical versions
	// replace the preset's physical pt/pb/mt/mb/w utilities.
	preflights: [
		{
			getCSS: () => `
				:root {
					--un-unit: 0.25rem;
				}
			`,
		},
	],
	rules: [
		[
			/^pt-(.+)$/,
			([, d]) => ({
				'padding-block-start':
					d === 'auto'
						? 'auto'
						: `calc(var(--un-unit) * ${Number(d)})`,
			}),
		],
		[
			/^pb-(.+)$/,
			([, d]) => ({
				'padding-block-end':
					d === 'auto'
						? 'auto'
						: `calc(var(--un-unit) * ${Number(d)})`,
			}),
		],

		[
			/^mt-(.+)$/,
			([, d]) => ({
				'margin-block-start':
					d === 'auto'
						? 'auto'
						: `calc(var(--un-unit) * ${Number(d)})`,
			}),
		],
		[
			/^mb-(.+)$/,
			([, d]) => ({
				'margin-block-end':
					d === 'auto'
						? 'auto'
						: `calc(var(--un-unit) * ${Number(d)})`,
			}),
		],

		// Width utilities usando inline-size
		[
			/^w-(.+)$/,
			([, d]) => {
				// Valores especiales
				const specialValues: Record<string, string> = {
					auto: 'auto',
					full: '100%',
					screen: '100vw',
					min: 'min-content',
					max: 'max-content',
					fit: 'fit-content',
					xs: 'var(--max-w-xs, 20rem)',
					sm: 'var(--max-w-sm, 24rem)',
					md: 'var(--max-w-md, 28rem)',
					lg: 'var(--max-w-lg, 32rem)',
					xl: 'var(--max-w-xl, 36rem)',
					'2xl': 'var(--max-w-2xl, 42rem)',
					'3xl': 'var(--max-w-3xl, 48rem)',
					'4xl': 'var(--max-w-4xl, 56rem)',
					'5xl': 'var(--max-w-5xl, 64rem)',
					'6xl': 'var(--max-w-6xl, 72rem)',
					'7xl': 'var(--max-w-7xl, 80rem)',
				};

				if (Object.prototype.hasOwnProperty.call(specialValues, d)) {
					return { 'inline-size': specialValues[d] };
				}

				// Fracciones
				if (d.split('/').length === 2) {
					const [numerator, denominator] = d.split('/', 2);

					if (
						!Number.isNaN(Number(numerator)) &&
						!Number.isNaN(Number(denominator))
					) {
						return {
							'inline-size': `${(Number(numerator) / Number(denominator)) * 100}%`,
						};
					}
				}

				// Valores numéricos (en rem)
				if (!Number.isNaN(Number(d))) {
					return {
						'inline-size': `calc(var(--un-unit) * ${Number(d)})`,
					};
				}

				// Valores arbitrarios como w-[200px]
				if (d.startsWith('[') && d.endsWith(']')) {
					const value = d.slice(1, -1);

					return { 'inline-size': value };
				}

				return {};
			},
		],
	],
});
