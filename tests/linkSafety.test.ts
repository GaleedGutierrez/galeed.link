import { describe, expect, it } from 'vitest';

import { markdownLink, toMarkdownText } from '@/utils/markdown';
import { toSafeUrl } from '@/utils/safeUrl';

describe('toSafeUrl', () => {
	it.each(['https://galeed.link/', 'http://example.com/a?b=c'])(
		'keeps the http(s) URL %s',
		(value) => {
			expect(toSafeUrl(value)).toBe(value);
		},
	);

	it.each([
		'javascript:alert(1)',
		'JavaScript:alert(1)',
		'data:text/html,<script>alert(1)</script>',
		'vbscript:msgbox(1)',
		'mailto:someone@example.com',
		'/relative/path',
		'not a url',
		'',
		undefined,
	])('drops %s', (value) => {
		expect(toSafeUrl(value)).toBeUndefined();
	});
});

describe('markdownLink', () => {
	it('builds a plain list item', () => {
		expect(markdownLink('Repo', 'https://github.com/a/b', 'Astro')).toBe(
			'- [Repo](https://github.com/a/b): Astro',
		);
	});

	it('keeps injected markup from adding links or lines', () => {
		const line = markdownLink(
			'x](https://evil.example)',
			'https://example.com/a b(c)',
			'note\n# Heading [link](https://evil.example) <b>',
		);

		expect(line).toBe(
			String.raw`- [x\](https://evil.example)](https://example.com/a%20b%28c%29): note # Heading \[link\](https://evil.example) \<b\>`,
		);
		expect(line).not.toContain('\n');
	});

	it('escapes backslashes before the characters it escapes', () => {
		expect(toMarkdownText(String.raw`a\]`)).toBe(String.raw`a\\\]`);
	});
});
