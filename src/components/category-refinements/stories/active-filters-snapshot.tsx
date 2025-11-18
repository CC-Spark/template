import { expect, test, describe, afterEach } from 'vitest';
import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as ActiveFiltersStories from './active-filters.stories';
import { render, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

const composed = composeStories(ActiveFiltersStories);

afterEach(() => {
    cleanup();
});

describe('ActiveFilters stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const router = createMemoryRouter(
                [
                    {
                        path: '/',
                        element: <Story />,
                    },
                ],
                { initialEntries: ['/?refine=c_refinementColor=Black&refine=c_size=M'] }
            );

            const { container } = render(<RouterProvider router={router} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
