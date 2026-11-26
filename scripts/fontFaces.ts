/**
 * Helpers for `subsetFonts.ts`: drops the `@font-face` rules a page can never
 * use. Fontsource declares one rule per script subset (latin, latin-ext,
 * vietnamese, cyrillic…), and the browser only downloads a subset when the
 * page has a character in its `unicode-range`. A rule that matches none of
 * the page's characters is dead CSS pointing at a dead file.
 */

/** An inclusive code point range. */
type CodePointRange = readonly [start: number, end: number];

const FONT_FACE_PATTERN = /@font-face\s*\{[^}]*\}/g;
const UNICODE_RANGE_PATTERN = /unicode-range:\s*([^;}]+)/i;
// One `url(…) format("woff")` source and the comma before it.
const WOFF_SOURCE_PATTERN =
	/\s*,\s*url\(\s*["']?[^"')]+\.woff["']?\s*\)\s*format\(\s*["']?woff["']?\s*\)/gi;

/**
 * Parses a `unicode-range` value, including the wildcard form (`U+4??`) that
 * minifiers write.
 * @param value - The descriptor value, e.g. `U+??,U+131,U+2000-206F`.
 * @returns The ranges it covers.
 */
export const parseUnicodeRange = (value: string): CodePointRange[] =>
	value.split(',').flatMap((token): CodePointRange[] => {
		const parts = token.trim().replace(/^u\+/i, '').split('-');
		// Code points have at most six hex digits; only a single one may use
		// the ? wildcard.
		const isValid =
			parts.length === 2
				? parts.every((part) => /^[\da-f]{1,6}$/i.test(part))
				: parts.length === 1 && /^[\da-f?]{1,6}$/i.test(parts[0] ?? '');

		if (!isValid) {
			return [];
		}

		// A single code point is its own range; ? spans 0 to f.
		const [start = '', end = start] = parts;

		return [
			[
				Number.parseInt(start.replaceAll('?', '0'), 16),
				Number.parseInt(end.replaceAll('?', 'f'), 16),
			],
		];
	});

/**
 * Whether any of the characters falls in a `unicode-range`.
 * @param value - The descriptor value.
 * @param characters - The page's characters.
 * @returns True when the browser would download that subset.
 */
export const hasCharacterInRange = (
	value: string,
	characters: string,
): boolean => {
	const ranges = parseUnicodeRange(value);

	// eslint-disable-next-line @typescript-eslint/no-misused-spread -- unicode-range matches code points, which is what the spread yields
	return [...characters].some((character) => {
		const codePoint = character.codePointAt(0) ?? -1;

		return ranges.some(
			([start, end]) => codePoint >= start && codePoint <= end,
		);
	});
};

/**
 * Removes the `@font-face` rules whose `unicode-range` covers none of the
 * characters, and the WOFF fallback of the ones that stay: every browser the
 * site supports takes the WOFF2 source first, so it never fetches the WOFF.
 * Rules without a `unicode-range` (the `local()` fallback faces) stay.
 * @param css - A built style sheet.
 * @param characters - Every character the pages use.
 * @returns The style sheet without those rules and sources.
 */
export const pruneFontFaces = (css: string, characters: string): string =>
	css.replaceAll(FONT_FACE_PATTERN, (rule) => {
		const range = UNICODE_RANGE_PATTERN.exec(rule)?.[1];

		return range && !hasCharacterInRange(range, characters)
			? ''
			: rule.replaceAll(WOFF_SOURCE_PATTERN, '');
	});
