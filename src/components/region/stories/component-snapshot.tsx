import { composeStories } from '@storybook/react-vite';

import * as ComponentStories from './component.stories';
import { expect, test, describe, afterEach } from 'vitest';
import { render, cleanup, waitFor } from '@testing-library/react';
const composed = composeStories(ComponentStories);

afterEach(() => {
    cleanup();
});

describe('Component stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, async () => {
            const { container } = render(<Story />);
            await waitFor(() => expect(container.firstChild).toMatchSnapshot());
        });
    }
});
