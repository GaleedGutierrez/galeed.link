import { unoConfig } from '@galeedgutierrez/frontend-config/unocss';

// Same values as stylelint's media-feature-name-value-allowed-list
// (DESIGN_SYSTEM.md §5.4).
export default unoConfig({
	breakpoints: { sm: '40em', md: '48em', lg: '64em', xl: '90em' },
});
