/// <reference types="vitest/config" />
// The reference loads Vitest's augmentation of Vite's UserConfig, which adds
// the `test` key that getViteConfig would otherwise reject.
import { getViteConfig } from 'astro/config';

// Reuse Astro's Vite config, so tsconfig path aliases (@/…) resolve in tests.
export default getViteConfig({
	test: {
		include: ['tests/**/*.test.ts'],
	},
});
