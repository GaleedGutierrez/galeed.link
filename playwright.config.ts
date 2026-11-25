import { defineConfig, devices } from '@playwright/test';

// The `npm run preview` port (package.json), which serves the built dist/.
const PORT = 4173;
const isCI = Boolean(process.env.CI);

export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	forbidOnly: isCI,
	reporter: [[isCI ? 'github' : 'list'], ['html', { open: 'never' }]],
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'retain-on-failure',
	},
	// The layout changes at 40em, so both sides of it.
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile', use: { ...devices['Pixel 7'] } },
	],
	// Tests the build, not the dev server: the post-build steps rewrite the
	// CSS, fonts and HTML. Run `npm run build` first.
	webServer: {
		command: 'npm run preview',
		url: `http://localhost:${PORT}`,
		reuseExistingServer: !isCI,
	},
});
