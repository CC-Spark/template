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
        formAction: undefined,
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
    Form: (props: React.PropsWithChildren<Record<string, unknown>>) => <form {...props}>{props.children}</form>,
    createMemoryRouter: vi.fn(),
    RouterProvider: ({ router }: { router: { routes: Array<{ element?: unknown }> } }) => (
        <div>{router.routes[0]?.element || null}</div>
    ),
}));

let mockAuthValue: unknown = undefined;

vi.mock('@/providers/auth', () => ({
    default: ({ children, value }: { children: React.ReactNode; value: unknown }) => {
        mockAuthValue = value;
        return <div>{children}</div>;
    },
    useAuth: () => mockAuthValue,
}));

import { composeStories } from '@storybook/react-vite';

import * as UserActionsStories from './user-actions.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(UserActionsStories);

afterEach(() => {
    cleanup();
});

describe('UserActions stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        if (Story?.parameters?.snapshot === false || /interactiontests?/i.test(storyName)) continue;
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
