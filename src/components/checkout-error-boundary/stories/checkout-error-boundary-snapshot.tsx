import { vi, expect, test, describe, afterEach, beforeEach } from 'vitest';
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
}));
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
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

// Suppress console.error for expected error boundary errors
// eslint-disable-next-line no-console
const originalError = console.error;
beforeEach(() => {
    // eslint-disable-next-line no-console
    console.error = vi.fn((...args: unknown[]) => {
        // Suppress expected error boundary errors
        const message = args.map((arg) => (typeof arg === 'string' ? arg : String(arg))).join(' ');
        if (
            message.includes('Test error for error boundary') ||
            message.includes('Error handled by React Router default ErrorBoundary') ||
            (message.includes('Error') && message.includes('error boundary'))
        ) {
            return;
        }
        originalError(...args);
    });
});

afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = originalError;
});

import { composeStories } from '@storybook/react-vite';

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
