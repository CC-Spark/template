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
    RouterProvider: ({ router }: { router: { routes: unknown[] } }) => <div>{router.routes[0]?.element || null}</div>,
}));

import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as MyCartStories from './index.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(MyCartStories);

afterEach(() => {
    cleanup();
});

describe('MyCart stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            // Normalize dynamic Radix IDs so snapshots are stable across runs
            const root = container as unknown as HTMLElement;
            const attrs = ['id', 'aria-controls', 'aria-labelledby'];
            const sel = attrs.map((a) => `[${a}^="radix-"]`).join(',');
            root.querySelectorAll(sel).forEach((el) => {
                attrs.forEach((a) => {
                    const v = el.getAttribute(a);
                    if (v && v.startsWith('radix-')) el.setAttribute(a, 'radix-«x»');
                });
            });
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
