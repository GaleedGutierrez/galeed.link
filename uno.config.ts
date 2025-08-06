/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { defineConfig } from 'unocss';

export default defineConfig({
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
		// Redefinir mt para usar margin-block-start
		[
			/^mt-(.+)$/,
			([, d]) => ({
				'margin-block-start': `${d === 'auto' ? 'auto' : `calc(var(--un-unit) * ${Number(d)})`}`,
			}),
		],

		// También puedes redefinir mb para margin-block-end
		[
			/^mb-(.+)$/,
			([, d]) => ({
				'margin-block-end': `${d === 'auto' ? 'auto' : `calc(var(--un-unit) * ${Number(d)})`}`,
			}),
		],

		// Y ms/me para margin-inline-start/end
		[
			/^ms-(.+)$/,
			([, d]) => ({
				'margin-inline-start': `${d === 'auto' ? 'auto' : `calc(var(--un-unit) * ${Number(d)})`}`,
			}),
		],
		[
			/^me-(.+)$/,
			([, d]) => ({
				'margin-inline-end': `${d === 'auto' ? 'auto' : `calc(var(--un-unit) * ${Number(d)})`}`,
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
					const [numerator, denominator] = d.split('/');

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
