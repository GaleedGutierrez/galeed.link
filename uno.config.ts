/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { defineConfig } from 'unocss';

export default defineConfig({
	rules: [
		// Redefinir mt para usar margin-block-start
		[
			/^mt-(.+)$/,
			([, d]) => ({
				'margin-block-start': `${d === 'auto' ? 'auto' : `${Number(d) * 0.25}rem`}`,
			}),
		],

		// También puedes redefinir mb para margin-block-end
		[
			/^mb-(.+)$/,
			([, d]) => ({
				'margin-block-end': `${d === 'auto' ? 'auto' : `${Number(d) * 0.25}rem`}`,
			}),
		],

		// Y ms/me para margin-inline-start/end
		[
			/^ms-(.+)$/,
			([, d]) => ({
				'margin-inline-start': `${d === 'auto' ? 'auto' : `${Number(d) * 0.25}rem`}`,
			}),
		],
		[
			/^me-(.+)$/,
			([, d]) => ({
				'margin-inline-end': `${d === 'auto' ? 'auto' : `${Number(d) * 0.25}rem`}`,
			}),
		],

		// box-shadow
		[
			/^shadow-(.+)$/,
			([, d]) => ({
				'box-shadow': `var(--shadow-${d})`,
			}),
		],
	],
});
