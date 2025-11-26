import { vi, expect, test, describe, afterEach } from 'vitest';
import type React from 'react';

vi.mock('react-router', () => ({
    createCookie: (name: string) => ({
        name,
        parse: () => null,
        serialize: () => '',
    }),
    createContext: vi.fn().mockImplementation(() => ({})),
    useFetcher: () => ({
        data: null,
        state: 'idle',
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        submit: () => {},
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
    Form: (props: React.PropsWithChildren<Record<string, unknown>>) => <form {...props}>{props.children}</form>,
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

import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as ForgotPasswordFormStories from './index.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(ForgotPasswordFormStories);

afterEach(() => {
    cleanup();
});

describe('ForgotPasswordForm stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        if (Story?.parameters?.snapshot === false || /interactiontests?/i.test(storyName)) continue;
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
