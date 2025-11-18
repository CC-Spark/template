import { vi, expect, test, describe, afterEach } from 'vitest';

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
}));
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
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
        Link: (props: React.PropsWithChildren<{ to?: string; href?: string; [key: string]: unknown }>) => {
            const { to, href, children, ...rest } = props ?? {};
            return (
                <a href={to ?? href} {...rest}>
                    {children}
                </a>
            );
        },
    };
});

import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as CheckoutErrorBoundaryStories from './checkout-error-boundary.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(CheckoutErrorBoundaryStories);

afterEach(() => {
    cleanup();
});

describe('CheckoutErrorBoundary stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
