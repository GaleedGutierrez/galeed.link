import { AxeBuilder } from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
	{ name: 'home', path: '/' },
	{ name: '404', path: '/404.html' },
] as const;

const COLOR_SCHEMES = ['light', 'dark'] as const;

/**
 * WCAG 2.2 AAA, the site's target (`color-contrast-enhanced` checks the 7:1
 * text ratio), plus axe's best practices.
 */
const AXE_TAGS = [
	'wcag2a',
	'wcag2aa',
	'wcag2aaa',
	'wcag21a',
	'wcag21aa',
	'wcag22aa',
	'best-practice',
];

/**
 * Kaspersky injects its script into every page (it would be audited with the
 * site), and the analytics need no audit and must not count test runs.
 */
const BLOCKED_HOSTS =
	/kaspersky-labs\.com|googletagmanager\.com|google-analytics\.com/;

for (const { name, path } of PAGES) {
	for (const colorScheme of COLOR_SCHEMES) {
		test.describe(`${name} page, ${colorScheme} theme`, () => {
			// Without a stored theme the page follows the OS. Reduced motion
			// skips the entrance animations, so contrast is measured on the
			// final colors.
			test.use({ colorScheme, reducedMotion: 'reduce' });

			test('has no axe violations', async ({ page }, testInfo) => {
				await page.route(BLOCKED_HOSTS, async (route) => route.abort());
				await page.goto(path);

				const results = await new AxeBuilder({ page })
					.withTags(AXE_TAGS)
					.analyze();

				await testInfo.attach('axe-results.json', {
					body: JSON.stringify(results.violations, undefined, '\t'),
					contentType: 'application/json',
				});

				// The rule, its impact and the failing elements, so the diff
				// reads without opening the attachment.
				const violations = results.violations.map(
					({ id, impact, nodes }) => ({
						id,
						impact,
						targets: nodes.map(({ target }) => target.join(' ')),
					}),
				);

				expect(violations).toStrictEqual([]);
			});
		});
	}
}
