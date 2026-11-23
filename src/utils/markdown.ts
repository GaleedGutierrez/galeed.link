/**
 * Collapse line breaks and escape the characters that open Markdown links,
 * code or HTML, so a value stays one plain-text list item. Emphasis markers
 * are left alone: they can't add links or headings.
 * @param value - Text from project data.
 * @returns Text safe to place inside a Markdown list item.
 */
export const toMarkdownText = (value: string): string =>
	value
		.replaceAll(/\s+/g, ' ')
		.trim()
		.replaceAll(/[\\`[\]<>]/g, String.raw`\$&`);

/**
 * Percent-encode the characters that would end a Markdown link destination.
 * @param href - An absolute URL (already validated by the caller).
 * @returns The URL with spaces, parentheses and angle brackets encoded.
 */
export const toMarkdownHref = (href: string): string =>
	href.replaceAll(
		/[\s()<>]/g,
		(character) =>
			`%${character.codePointAt(0)?.toString(16).toUpperCase().padStart(2, '0') ?? ''}`,
	);

/**
 * One Markdown list item with a link and an optional plain-text note.
 * @param label - Link text.
 * @param href - Link destination.
 * @param note - Text after the link.
 * @returns The list item.
 */
export const markdownLink = (
	label: string,
	href: string,
	note?: string,
): string =>
	`- [${toMarkdownText(label)}](${toMarkdownHref(href)})${note ? `: ${toMarkdownText(note)}` : ''}`;
