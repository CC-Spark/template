import { vi, expect, test, describe, afterEach } from 'vitest';
import type React from 'react';

vi.mock('react-router', () => ({
    createContext: vi.fn().mockImplementation(() => ({})),
    useFetcher: () => ({
        data: null,
        state: 'idle',

        submit: () => {},
        Form: (props: React.PropsWithChildren<Record<string, unknown>>) => <form {...props}>{props.children}</form>,
    }),
    useFetchers: () => [],

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
    Suspense: ({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) => (
        <div>{fallback || children}</div>
    ),
    Await: ({
        resolve: _resolve,
        children,
    }: {
        resolve: Promise<unknown>;
        children: (data: unknown) => React.ReactNode;
    }) => {
        // For snapshot tests, we need to handle the promise synchronously
        // Since we can't actually await in a mock, we'll render children with an empty array
        // The actual promise resolution happens in the real component during story rendering
        // This mock just ensures the component structure is captured in snapshots
        try {
            // Try to get the value if it's already resolved (for already-resolved promises)
            // This is a best-effort approach for snapshot tests
            return <>{children([])}</>;
        } catch {
            // If there's an error, still render with empty array
            return <>{children([])}</>;
        }
    },
    createMemoryRouter: vi.fn(),
    RouterProvider: ({ router }: { router: { routes: Array<{ element?: unknown }> } }) => {
        const element = router.routes[0]?.element;
        return <div>{element ? (element as React.ReactNode) : null}</div>;
    },
}));

vi.mock('@/components/content-card', () => ({
    ContentCard: (props: Record<string, unknown>) => <div data-testid="content-card">{JSON.stringify(props)}</div>,
}));

import { composeStories } from '@storybook/react-vite';

import * as PopularCategoriesStories from './popular-categories.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(PopularCategoriesStories);

afterEach(() => {
    cleanup();
});

describe('PopularCategories stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        if (Story?.parameters?.snapshot === false || /interactiontests?/i.test(storyName)) continue;
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
