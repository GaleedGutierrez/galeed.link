import cssnano from 'cssnano';
import postcssCustomProperties from 'postcss-custom-properties';
import postcssNested from 'postcss-nested';
import postcssUtopia from 'postcss-utopia';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [
		cssnano({ preset: ['default'] }),
		postcssNested,
		postcssCustomProperties({ preserve: false }),
		postcssUtopia({ minWidth: 360, maxWidth: 448 }),
	],
};

export default config;
