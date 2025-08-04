import cssnano from 'cssnano';
import postcssCustomProperties from 'postcss-custom-properties';
import postcssNested from 'postcss-nested';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [
		cssnano({ preset: ['default'] }),
		postcssNested,
		postcssCustomProperties({ preserve: false }),
	],
};

export default config;
