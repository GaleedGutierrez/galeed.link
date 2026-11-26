import type { UserConfig } from '@commitlint/types';

// calibreapp/image-actions commits the compressed images with a fixed message
// (no input changes it), which failed the PR's commitlint check.
const IMAGE_ACTIONS_COMMIT = 'Optimised images with calibre/image-actions';

const config: UserConfig = {
	extends: ['@commitlint/config-conventional'],
	formatter: '@commitlint/format',
	ignores: [(message): boolean => message.startsWith(IMAGE_ACTIONS_COMMIT)],
};

export default config;
