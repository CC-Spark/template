import { vi, expect, test, describe, afterEach } from 'vitest';
import type React from 'react';

vi.mock('react-router', () => ({
    createContext: vi.fn().mockImplementation(() => ({})),
    useFetcher: () => ({
        data: null,
        state: 'idle',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        submit: () => {},
        Form: (props: React.PropsWithChildren<Record<string, unknown>>) => <form {...props}>{props.children}</form>,
    }),
    useFetchers: () => [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    useNavigate: () => () => {},
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
    useNavigation: () => ({
        state: 'idle',
        location: { pathname: '/', search: '', hash: '', state: null, key: 'test' },
    }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Link: (props: React.PropsWithChildren<{ to?: string; href?: string; [key: string]: unknown }>) => {
        const { to, href, children, ...rest } = props ?? {};
        return (
            <a href={to ?? href} {...rest}>
                {children}
            </a>
        );
    },
    createMemoryRouter: vi.fn(),
    RouterProvider: ({ router }: { router: { routes: Array<{ element?: unknown }> } }) => (
        <div>{router.routes[0]?.element || null}</div>
    ),
}));

vi.mock('@/hooks/use-search-suggestions', () => ({
    useSearchSuggestions: () => ({
        data: undefined,
        isLoading: false,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        refetch: async () => {},
    }),
}));

vi.mock('@/hooks/use-transform-search-suggestions', () => ({
    useTransformSearchSuggestions: () => null,
}));

vi.mock('@/config', () => ({
    useConfig: () => ({
        pages: {
            search: {
                suggestionsDebounce: 300,
            },
        },
    }),
}));

import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as SearchStories from './search.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(SearchStories);

afterEach(() => {
    cleanup();
});

describe('Search stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        if (Story?.parameters?.snapshot === false || /interactiontests?/i.test(storyName)) continue;
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
