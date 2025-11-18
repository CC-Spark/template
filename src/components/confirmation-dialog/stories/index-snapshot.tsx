import { expect, test, describe, afterEach } from 'vitest';

import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as ConfirmationDialogStories from './index.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(ConfirmationDialogStories);

afterEach(() => {
    cleanup();
});

describe('ConfirmationDialog stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
