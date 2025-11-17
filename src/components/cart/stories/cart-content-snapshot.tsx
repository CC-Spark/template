import { vi, expect, test, describe, afterEach } from 'vitest';
import type { AnchorHTMLAttributes, ReactNode, FormHTMLAttributes } from 'react';

const fetcherMock = {
    data: null as unknown,
    state: 'idle' as const,
    submit: vi.fn(),
    Form: (props: FormHTMLAttributes<HTMLFormElement> & { children?: ReactNode }) => (
        <form {...props}>{props.children}</form>
    ),
};

type LinkProps =
    | (AnchorHTMLAttributes<HTMLAnchorElement> & {
          to?: string;
          href?: string;
          children?: ReactNode;
      })
    | null;

vi.mock('react-router', () => ({
    createContext: vi.fn().mockImplementation(() => ({})),
    useFetcher: () => fetcherMock,
    useFetchers: () => [],
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
    useNavigation: () => ({
        state: 'idle',
        location: { pathname: '/', search: '', hash: '', state: null, key: 'test' },
    }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Link: (props: LinkProps) => {
        const { to, href, children, ...rest } = (props ?? {}) as AnchorHTMLAttributes<HTMLAnchorElement> & {
            to?: string;
            href?: string;
            children?: ReactNode;
        };
        return (
            <a href={to ?? href} {...rest}>
                {children}
            </a>
        );
    },
}));
vi.mock('react-router-dom', async (importOriginal) => {
    const actual: Record<string, unknown> = await importOriginal();
    return {
        ...(actual as object),
        useFetcher: () => fetcherMock,
        useFetchers: () => [],
        useNavigate: () => vi.fn(),
        useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
        useNavigation: () => ({
            state: 'idle',
            location: { pathname: '/', search: '', hash: '', state: null, key: 'test' },
        }),
        useSearchParams: () => [new URLSearchParams(), vi.fn()],
        Link: (props: LinkProps) => {
            const { to, href, children, ...rest } = (props ?? {}) as AnchorHTMLAttributes<HTMLAnchorElement> & {
                to?: string;
                href?: string;
                children?: ReactNode;
            };
            return (
                <a href={to ?? href} {...rest}>
                    {children}
                </a>
            );
        },
    };
});
vi.mock('@/components/toast', () => ({
    useToast: () => ({ addToast: vi.fn() }),
}));

import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as CartStories from './cart-content.stories';
import { render, cleanup } from '@testing-library/react';
import { ConfigProvider } from '@/config/context';
import { mockConfig } from '@/test-utils/config';

const composed = composeStories(CartStories);

afterEach(() => {
    cleanup();
});

describe('CartContent stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        if (Story?.parameters?.snapshot === false || /interactiontests?/i.test(storyName)) continue;
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(
                <ConfigProvider config={mockConfig}>
                    <Story />
                </ConfigProvider>
            );
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
