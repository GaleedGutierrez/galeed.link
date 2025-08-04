import cssnano from 'cssnano';
import postcssCustomProperties from 'postcss-custom-properties';
import postcssUtopia from 'postcss-utopia';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [
		postcssCustomProperties({ preserve: false }),
		postcssUtopia({ minWidth: 360, maxWidth: 448 }),
		cssnano({
			preset: ['advanced', {}],
		}),
	],
};

export default config;
