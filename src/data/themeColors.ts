/**
 * Browser UI colors: the page background of each theme, as hex, because
 * `<meta name="theme-color">` and the web manifest take no `light-dark()` or
 * custom property. Keep them equal to `--bone-100` and `--charcoal-950`
 * (`src/styles/settings/colors.css`); `tests/tokens.test.ts` checks it.
 */
export const THEME_COLORS = {
	light: '#ede6d8',
	dark: '#141414',
} as const;
