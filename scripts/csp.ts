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

// Cloudflare Web Analytics: the edge injects its beacon into every page, so
// the script is never in the built HTML.
const CLOUDFLARE_BEACON = 'https://static.cloudflareinsights.com';
const CLOUDFLARE_RUM = 'https://cloudflareinsights.com';

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
		['script-src', "'self'", ...scripts, TAG_MANAGER, CLOUDFLARE_BEACON],
		['style-src', "'self'", ...styles],
		['img-src', "'self'", ...ANALYTICS],
		// Vite inlines font files under 4 KB into the CSS as data: URIs.
		['font-src', "'self'", 'data:'],
		['connect-src', "'self'", ...ANALYTICS, CLOUDFLARE_RUM],
		// Partytown's service worker, served from /~partytown/.
		['worker-src', "'self'"],
		['object-src', "'none'"],
		['base-uri', "'none'"],
		['form-action', "'none'"],
		['frame-ancestors', "'none'"],
	]
		.map((directive) => directive.join(' '))
		.join('; ');

/**
 * Policy for Partytown's own files (`/~partytown/*`). Its sandbox page runs an
 * inline script, and its worker runs gtag through `eval` / `new Function`
 * from a `blob:` URL, so this path needs what the page policy forbids. The
 * files are fixed vendor code from the build, so the exceptions stay here and
 * the rest still limits where they connect and who can frame them.
 */
export const PARTYTOWN_POLICY = [
	['default-src', "'self'"],
	[
		'script-src',
		"'self'",
		"'unsafe-inline'",
		"'unsafe-eval'",
		'blob:',
		TAG_MANAGER,
	],
	['img-src', "'self'", ...ANALYTICS],
	['connect-src', "'self'", ...ANALYTICS],
	['worker-src', "'self'", 'blob:'],
	['object-src', "'none'"],
	['base-uri', "'none'"],
	['form-action', "'none'"],
	// The page frames the sandbox; nobody else may.
	['frame-ancestors', "'self'"],
]
	.map((directive) => directive.join(' '))
	.join('; ');

const WILDCARD_RULE = '/*';
const FRAME_OPTIONS_HEADER = 'X-Frame-Options';

const PARTYTOWN_MARKER =
	"# Partytown's files get their own policy (PARTYTOWN_POLICY in scripts/csp.ts).";

// Cloudflare rejects longer lines in _headers.
const MAX_LINE_LENGTH = 2000;

/**
 * The CSP line of a rule, checked against Cloudflare's limit.
 * @param policy - Header value.
 * @returns The indented line.
 */
const policyLine = (policy: string): string => {
	const line = `  ${CSP_HEADER}: ${policy}`;

	if (line.length > MAX_LINE_LENGTH) {
		throw new Error(
			`The CSP line is ${line.length} characters; Cloudflare allows ${MAX_LINE_LENGTH}.`,
		);
	}

	return line;
};

/**
 * Adds the policies to a `_headers` file.
 *
 * The page policy goes inside the existing `/*` rule: a second `/*` rule
 * replaces the first one on Cloudflare, which dropped the other security
 * headers.
 *
 * Partytown's rule comes last. Cloudflare joins every matching rule, so it
 * detaches the `/*` values it replaces before setting its own: a joined CSP
 * would be enforced on top of Partytown's and block its eval, and the page's
 * `X-Frame-Options: DENY` would forbid the page from framing the sandbox.
 * Applying it twice gives the same file.
 * @param headersFile - The `_headers` file as copied from `public/`.
 * @param policy - The page policy.
 * @returns The file with both policies.
 */
export const applyPolicy = (headersFile: string, policy: string): string => {
	const pageLine = policyLine(policy);
	const markerIndex = headersFile.indexOf(PARTYTOWN_MARKER);
	const lines = (
		markerIndex === -1 ? headersFile : headersFile.slice(0, markerIndex)
	)
		.trimEnd()
		.split('\n')
		.filter((line) => !line.startsWith(`  ${CSP_HEADER}:`));
	const ruleIndex = lines.indexOf(WILDCARD_RULE);

	if (ruleIndex === -1) {
		lines.push('', WILDCARD_RULE, pageLine);
	} else {
		lines.splice(ruleIndex + 1, 0, pageLine);
	}

	const partytownRule = [
		PARTYTOWN_MARKER,
		'/~partytown/*',
		`  ! ${CSP_HEADER}`,
		policyLine(PARTYTOWN_POLICY),
		`  ! ${FRAME_OPTIONS_HEADER}`,
		`  ${FRAME_OPTIONS_HEADER}: SAMEORIGIN`,
	];

	return [...lines, '', ...partytownRule, ''].join('\n').trimStart();
};
