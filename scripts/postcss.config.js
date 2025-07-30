// import autoprefixer from 'autoprefixer';
// import discardComments from 'postcss-discard-comments';
// import discardEmpty from 'postcss-discard-empty';
import cssnano from 'cssnano';
import postcssNested from 'postcss-nested';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [cssnano, postcssNested],
	cssnano: {
		preset: ['default'],
	},
};

export default config;
