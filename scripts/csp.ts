/**
 * Content-Security-Policy for the built pages. Pure helpers, so the policy
 * and the hash extraction can be tested without a build;
 * `cspHeaders.ts` applies them to `dist/`.
 *
 * The site is static, so nonces are impossible: every inline script that the
 * browser executes is allowed by the SHA-256 hash of its exact text.
 */
import { createHash } from 'node:crypto';

/**
 * Report-Only while the policy is new: violations show in the console and
 * nothing is blocked. Switch to `Content-Security-Policy` to enforce it.
 */
export const CSP_HEADER = 'Content-Security-Policy-Report-Only';

// Google's documented GA4 origins. gtag normally runs inside Partytown's
// worker, but when the worker can't fetch it, Partytown falls back to a
// regular <script> on the page, and then the page's policy applies.
const TAG_MANAGER = 'https://*.googletagmanager.com';
const ANALYTICS = [
	'https://*.google-analytics.com',
	'https://*.analytics.google.com',
	TAG_MANAGER,
];

// Types the browser executes. Anything else (`application/ld+json`,
// `text/partytown`) is a data block and is not subject to `script-src`.
const EXECUTABLE_TYPES = new Set([
	'',
	'module',
	'text/javascript',
	'application/javascript',
]);

const SCRIPT_PATTERN = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
const SRC_PATTERN = /(?:^|\s)src\s*=/i;
const TYPE_PATTERN = /(?:^|\s)type\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+))/i;

/**
 * Text of every inline script the browser would execute.
 * @param html - A built HTML document.
 * @returns The scripts' contents, in document order.
 */
export const inlineScripts = (html: string): string[] =>
	html
		.matchAll(SCRIPT_PATTERN)
		.filter(([, attributes]) => !SRC_PATTERN.test(attributes))
		.filter(([, attributes]) => {
			const match = TYPE_PATTERN.exec(attributes);
			const type = (match?.[1] ?? match?.[2] ?? match?.[3] ?? '')
				.trim()
				.toLowerCase();

			return EXECUTABLE_TYPES.has(type);
		})
		.map((match) => match[2])
		.toArray();

const STYLE_PATTERN = /<style\b[^>]*>([\s\S]*?)<\/style>/gi;

/**
 * Text of every `<style>` element. Astro inlines small stylesheets
 * (`inlineStylesheets: 'auto'`), so a page can have some.
 * @param html - A built HTML document.
 * @returns The style sheets' contents, in document order.
 */
export const inlineStyles = (html: string): string[] =>
	html
		.matchAll(STYLE_PATTERN)
		.map((match) => match[1])
		.toArray();

/**
 * CSP source expression for one inline script or style sheet.
 * @param source - The element's exact text, as it appears in the HTML.
 * @returns `'sha256-…'`, quotes included.
 */
export const hashSource = (source: string): string =>
	`'sha256-${createHash('sha256').update(source, 'utf8').digest('base64')}'`;

interface PolicyHashes {
	/** Hash sources of the inline scripts. */
	scripts: string[];
	/** Hash sources of the `<style>` elements. */
	styles: string[];
}

/**
 * The page policy.
 * @param hashes - Hash sources of the inline scripts and style sheets.
 * @returns The header value.
 */
export const buildPolicy = ({ scripts, styles }: PolicyHashes): string =>
	[
		['default-src', "'self'"],
		['script-src', "'self'", ...scripts, TAG_MANAGER],
		['style-src', "'self'", ...styles],
		['img-src', "'self'", ...ANALYTICS],
		// Vite inlines font files under 4 KB into the CSS as data: URIs.
		['font-src', "'self'", 'data:'],
		['connect-src', "'self'", ...ANALYTICS],
		// Partytown's service worker, served from /~partytown/.
		['worker-src', "'self'"],
		['object-src', "'none'"],
		['base-uri', "'none'"],
		['form-action', "'none'"],
		['frame-ancestors', "'none'"],
	]
		.map((directive) => directive.join(' '))
		.join('; ');
