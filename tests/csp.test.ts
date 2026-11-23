import { describe, expect, it } from 'vitest';

import {
	buildPolicy,
	hashSource,
	inlineScripts,
	inlineStyles,
} from '../scripts/csp.ts';

/**
 * Splits a policy into its directives.
 * @param policy - A header value.
 * @returns Directive name → its sources.
 */
const parse = (policy: string): Map<string, string[]> =>
	new Map(
		policy.split('; ').map((directive) => {
			const [name, ...sources] = directive.split(' ');

			return [name, sources];
		}),
	);

describe('inlineScripts', () => {
	it('keeps classic and module scripts, quoted or not', () => {
		const html = [
			'<script>a()</script>',
			'<script type="module">b()</script>',
			'<script type=module>c()</script>',
			"<script type='text/javascript'>d()</script>",
		].join('');

		expect(inlineScripts(html)).toStrictEqual(['a()', 'b()', 'c()', 'd()']);
	});

	it('skips external scripts and data blocks', () => {
		const html = [
			'<script type="module" src="/_astro/a.js"></script>',
			'<script defer src="https://example.com/x.js" type="text/partytown"></script>',
			'<script type="application/ld+json">{"@type":"Person"}</script>',
			'<script type="text/partytown">gtag()</script>',
		].join('');

		expect(inlineScripts(html)).toStrictEqual([]);
	});

	it('keeps the exact text, whitespace included, so the hash matches', () => {
		expect(inlineScripts('<script>\n\ta();\n</script>')).toStrictEqual([
			'\n\ta();\n',
		]);
	});
});

describe('inlineStyles', () => {
	it('keeps every <style> element, attributes or not', () => {
		const html =
			'<style>a{color:red}</style><link rel="stylesheet" href="/x.css"><style media="print">b{}</style>';

		expect(inlineStyles(html)).toStrictEqual(['a{color:red}', 'b{}']);
	});
});

describe('hashSource', () => {
	it('is the base64 SHA-256 of the text, quoted as a CSP source', () => {
		expect(hashSource('alert(1)')).toBe(
			"'sha256-bhHHL3z2vDgxUt0W3dWQOrprscmda2Y5pLsLg4GF+pI='",
		);
	});
});

describe('buildPolicy', () => {
	const hash = hashSource('a()');
	const styleHash = hashSource('a{}');
	const policy = buildPolicy({ scripts: [hash], styles: [styleHash] });
	const directives = parse(policy);

	it('allows inline scripts and styles only by hash', () => {
		expect(directives.get('script-src')).toStrictEqual([
			"'self'",
			hash,
			'https://*.googletagmanager.com',
		]);
		expect(directives.get('style-src')).toStrictEqual([
			"'self'",
			styleHash,
		]);
		expect(policy).not.toContain("'unsafe-inline'");
		expect(policy).not.toContain("'unsafe-eval'");
	});

	it('locks down plugins, base URLs, forms and framing', () => {
		expect(directives.get('object-src')).toStrictEqual(["'none'"]);
		expect(directives.get('base-uri')).toStrictEqual(["'none'"]);
		expect(directives.get('form-action')).toStrictEqual(["'none'"]);
		expect(directives.get('frame-ancestors')).toStrictEqual(["'none'"]);
	});

	it('falls back to same-origin only', () => {
		expect(directives.get('default-src')).toStrictEqual(["'self'"]);
	});
});
