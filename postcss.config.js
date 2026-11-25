import cssnano from 'cssnano';
import postcssCustomProperties from 'postcss-custom-properties';
import postcssMixins from 'postcss-mixins';
import postcssUtopia from 'postcss-utopia';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [
		// CSS Modules and atoms can call @mixin heading-xl etc. without importing tools/.
		postcssMixins({ mixinsFiles: './src/styles/tools/*.css' }),
		postcssCustomProperties({ preserve: false }),
		postcssUtopia({ minWidth: 360, maxWidth: 448 }),
		// Builds only: in dev it slowed HMR and minified what DevTools shows.
		// postcss-load-config skips a `false` plugin.
		process.env.NODE_ENV === 'production' &&
			cssnano({
				// Vite runs PostCSS once per file, and these advanced plugins
				// assume they see the whole site:
				// - discardUnused deleted every Fontsource @font-face (each file
				//   declares a face it doesn't use itself).
				// - reduceIdents renamed each file's keyframes to a, b, c…, so
				//   two files bundled into one sheet would collide.
				// - mergeIdents merges same-body keyframes, with the same risk.
				// - zindex rebases each file's z-index from 1, which breaks the
				//   stacking order between files.
				preset: [
					'advanced',
					{
						discardUnused: false,
						reduceIdents: false,
						mergeIdents: false,
						zindex: false,
					},
				],
			}),
	],
};

export default config;
