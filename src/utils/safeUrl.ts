const LINK_PROTOCOLS = new Set(['http:', 'https:']);

/**
 * Gate for URLs that come from shared-assets before they reach an `href`.
 * Astro escapes attribute quotes but not schemes, so a `javascript:` or
 * `data:` value would still run when clicked.
 * @param value - URL from project data.
 * @returns The URL when it is absolute http(s), otherwise undefined.
 */
export const toSafeUrl = (value?: string): string | undefined =>
	value && URL.canParse(value) && LINK_PROTOCOLS.has(new URL(value).protocol)
		? value
		: undefined;
