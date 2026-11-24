/**
 * Pre-build: fetches the full git history when the checkout is shallow.
 *
 * Cloudflare Pages clones only the latest commit. In a shallow clone that
 * commit looks like it added every file, so `getLastModified()`
 * (`src/utils/lastModified.ts`) returned it and the sitemap `lastmod` and the
 * ProfilePage `dateModified` moved on every deploy, content change or not.
 */
import { execFileSync } from 'node:child_process';
import console from 'node:console';

/**
 * Runs git and returns its trimmed output.
 * @param gitArguments - The git arguments.
 * @returns The command's standard output.
 */
const git = (...gitArguments: string[]): string =>
	execFileSync('git', gitArguments, {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
	}).trim();

try {
	if (git('rev-parse', '--is-shallow-repository') === 'true') {
		console.info(
			'📜 Shallow clone: fetching the full history for lastmod...',
		);
		git('fetch', '--unshallow', '--quiet');
	}
} catch (error) {
	// Not a git checkout, or no network. The build still runs; the dates fall
	// back to the latest commit (or the build time) instead.
	console.warn(
		`⚠️  Could not fetch the full git history: ${error instanceof Error ? error.message : String(error)}`,
	);
}
