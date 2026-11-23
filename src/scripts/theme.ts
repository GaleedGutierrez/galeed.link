/**
 * Data model: tri-state (nothing stored = 'system', or a literal 'light' |
 * 'dark' override). UI: two states (one button). The explicit value matching
 * the OS is unreachable: flipping back to the OS theme clears the override
 * instead of storing it (DESIGN_SYSTEM.md §2.1, §2.3).
 */
export const THEME_STORAGE_KEY = 'galeed:theme' as const;
export const RESOLVED_THEMES = ['light', 'dark'] as const;

export type ResolvedTheme = (typeof RESOLVED_THEMES)[number];
export type ThemePreference = ResolvedTheme | 'system';
export interface ThemeChangeDetail {
	preference: ThemePreference;
	resolved: ResolvedTheme;
}

declare global {
	interface DocumentEventMap {
		themechange: CustomEvent<ThemeChangeDetail>;
	}
}

const darkQuery = (): MediaQueryList =>
	matchMedia('(prefers-color-scheme: dark)');

const systemTheme = (): ResolvedTheme =>
	darkQuery().matches ? 'dark' : 'light';

export const isResolvedTheme = (value: unknown): value is ResolvedTheme =>
	value === 'light' || value === 'dark';

export function readPreference(): ThemePreference {
	try {
		const stored = localStorage.getItem(THEME_STORAGE_KEY);

		return isResolvedTheme(stored) ? stored : 'system';
	} catch {
		return 'system';
	}
}

export const resolveTheme = (preference: ThemePreference): ResolvedTheme =>
	preference === 'system' ? systemTheme() : preference;

/** The theme on screen right now: the source of truth for the toggle. */
const renderedTheme = (): ResolvedTheme =>
	document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';

/**
 * Paint a preference. Never touches storage.
 * @param preference - The preference to render.
 */
/* eslint-disable unicorn/dom-node-dataset -- PurgeCSS only keeps the
   [data-theme*] rules when the literal attribute names are in the built JS. */
function render(preference: ThemePreference): void {
	const root = document.documentElement;
	const resolved = resolveTheme(preference);

	// Suppress color transitions for two frames so the swap is instant.
	root.setAttribute('data-theme-switching', '');
	// Literal attribute names: visible to PurgeCSS (§9.1).
	root.setAttribute('data-theme', resolved);
	root.setAttribute('data-theme-pref', preference);
	root.style.colorScheme = resolved;
	requestAnimationFrame(() =>
		requestAnimationFrame(() =>
			root.removeAttribute('data-theme-switching'),
		),
	);

	document.dispatchEvent(
		new CustomEvent<ThemeChangeDetail>('themechange', {
			detail: { preference, resolved },
		}),
	);
}
/* eslint-enable unicorn/dom-node-dataset */

/**
 * Two-state toggle:
 * 1. target = the opposite of what is rendered;
 * 2. target ≠ OS → store it literally;
 * 3. target = OS → the user is undoing their adjustment: remove the key.
 * Divergence is checked here only. A stored value the OS later matches is kept.
 */
export function toggleTheme(): void {
	const target: ResolvedTheme = renderedTheme() === 'dark' ? 'light' : 'dark';
	const preference: ThemePreference =
		target === systemTheme() ? 'system' : target;

	try {
		if (preference === 'system') {
			localStorage.removeItem(THEME_STORAGE_KEY);
		} else {
			localStorage.setItem(THEME_STORAGE_KEY, preference);
		}
	} catch {
		// Storage unavailable: the theme still applies for this page view.
	}

	render(preference);
}

let hasBoundGlobalListeners = false;

/** Call once per page load (and after Astro view-transition swaps). */
export function initTheme(): void {
	// Re-assert attributes (needed after <ClientRouter /> swaps the document).
	render(readPreference());

	for (const button of document.querySelectorAll<HTMLButtonElement>(
		'[data-theme-toggle]',
	)) {
		button.hidden = false;

		if (button.dataset.bound) {
			continue;
		}

		button.dataset.bound = 'true';
		button.addEventListener('click', toggleTheme);
	}
	// No toggle sync needed: its icon and label follow :root[data-theme] in CSS.

	if (hasBoundGlobalListeners) {
		return;
	}

	// initTheme runs again after every page swap; these listeners must not.
	// eslint-disable-next-line unicorn/no-top-level-assignment-in-function -- bind-once guard
	hasBoundGlobalListeners = true;

	darkQuery().addEventListener('change', () => {
		// Follow the OS only while no override is active. Never clear a stored
		// value because the OS now matches it.
		if (document.documentElement.dataset.themePref === 'system') {
			render('system');
		}
	});

	addEventListener('storage', (event) => {
		// key === null means another tab called localStorage.clear()
		if (event.key !== THEME_STORAGE_KEY && event.key !== null) {
			return;
		}

		render(readPreference());
	});

	document.addEventListener('astro:after-swap', initTheme);
}
