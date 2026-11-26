import { markdownlint } from '@galeedgutierrez/frontend-config/markdownlint';

// DESIGN_SYSTEM.md caps its own lines at 400 characters (a
// markdownlint-configure-file comment at its top): Prettier skips it.
export default markdownlint();
