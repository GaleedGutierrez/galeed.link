/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { defineConfig, presetWind3, transformerVariantGroup } from 'unocss';

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

export default defineConfig({
	presets: [presetWind3()],
	transformers: [transformerVariantGroup()],
	blocklist: VISUAL_UTILITIES,
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
