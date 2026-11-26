// CommonJS: textlint loads .textlintrc.cjs with require(), which loads the
// ES module (Node 22.12 and later).
module.exports =
	require('@galeedgutierrez/frontend-config/textlint').textlint();
