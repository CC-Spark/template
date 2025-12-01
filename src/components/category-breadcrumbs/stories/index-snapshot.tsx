import { expect, test, describe, afterEach } from 'vitest';
import { composeStories } from '@storybook/react-vite';

import * as CategoryBreadcrumbsStories from './index.stories';
import { render, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';

const composed = composeStories(CategoryBreadcrumbsStories);

afterEach(() => {
    cleanup();
});

describe('CategoryBreadcrumbs stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const router = createMemoryRouter(
                [
                    {
                        path: '/',
                        element: <Story />,
                    },
                ],
                { initialEntries: ['/'] }
            );

            const { container } = render(<RouterProvider router={router} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
