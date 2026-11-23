import { execFileSync } from 'node:child_process';

// Paths whose changes alter what the page says: the source, the static files
// and the lockfile (shared-assets content arrives as a package bump).
const CONTENT_PATHS = ['src', 'public', 'package-lock.json'];

/**
 * Date of the last commit that touched the page's content. Used for the
 * ProfilePage `dateModified` and the sitemap `lastmod`, so they only move
 * when the content does, not on every build.
 * @returns The commit date, or the build time when git is unavailable.
 */
export const getLastModified = (): Date => {
	try {
		const output = execFileSync(
			'git',
			['log', '-1', '--format=%cI', '--', ...CONTENT_PATHS],
			{ encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] },
		).trim();
		const date = new Date(output);

		return Number.isNaN(date.getTime()) ? new Date() : date;
	} catch {
		return new Date();
	}
};
