import { postcssConfig } from '@galeedgutierrez/frontend-config/postcss';

// The hub's column: fluid sizes grow from 360px to 448px wide.
export default postcssConfig({ utopia: { minWidth: 360, maxWidth: 448 } });
