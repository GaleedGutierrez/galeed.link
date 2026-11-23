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
		cssnano({
			preset: ['advanced', {}],
		}),
	],
};

export default config;
