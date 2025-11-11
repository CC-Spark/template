import { expect, test, describe, afterEach } from 'vitest';
import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as PasswordUpdateFieldsStories from './password-update-fields.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(PasswordUpdateFieldsStories);

afterEach(() => {
    cleanup();
});

describe('PasswordUpdateFields stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        if (Story?.parameters?.snapshot === false || /interactiontests?/i.test(storyName)) continue;
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
