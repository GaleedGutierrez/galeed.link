import { getViteConfig } from 'astro/config';

// Reuse Astro's Vite config, so tsconfig path aliases (@/…) resolve in tests.
export default getViteConfig({
	test: {
		include: ['tests/**/*.test.ts'],
	},
});
