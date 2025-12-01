import { expect, test, describe, afterEach } from 'vitest';

import { composeStories } from '@storybook/react-vite';

import * as GridStories from './index.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(GridStories);

afterEach(() => {
    cleanup();
});

describe('Grid stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
