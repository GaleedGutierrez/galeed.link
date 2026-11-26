import { lighthouse } from '@galeedgutierrez/frontend-config/lighthouse';

// The 404 is noindex, so only the home asserts SEO and is-crawlable.
export default lighthouse({
	paths: ['/', '/404.html'],
	// Analytics never reach CI (gtag also sets Google's opt-out flag off the
	// live domain, since this doesn't reach Partytown's worker).
	blockedUrlPatterns: ['*googletagmanager.com*', '*google-analytics.com*'],
});
