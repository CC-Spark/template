// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from 'eslint-plugin-storybook';

// TODO: generator should generate a working eslint config
const baseConfig = await import('../../eslint.config.js');

export default [
    ...baseConfig.default,
    {
        // Storybook files - apply Storybook-specific rules
        files: ['**/*.stories.{ts,tsx,js,jsx}'],
        plugins: {
            storybook,
        },
        rules: {
            ...storybook.configs.recommended.rules,
        },
    },
];
