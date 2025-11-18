import { vi, expect, test, describe, afterEach } from 'vitest';

type MockFormProps = React.PropsWithChildren<Record<string, unknown>>;
type MockLinkProps = React.PropsWithChildren<{ to?: string; href?: string; [key: string]: unknown }>;

const fetcherMock = {
    data: null,
    state: 'idle' as const,
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    submit: () => {},
    Form: (props: MockFormProps) => <form {...props}>{props.children}</form>,
};

vi.mock('react-router', () => ({
    createContext: vi.fn().mockImplementation(() => ({})),
    useFetcher: () => fetcherMock,
    useFetchers: () => [],
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    useNavigate: () => () => {},
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
    useNavigation: () => ({
        state: 'idle' as const,
        location: { pathname: '/', search: '', hash: '', state: null, key: 'test' },
    }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    Form: (props: MockFormProps) => <form {...props}>{props.children}</form>,
    createMemoryRouter: vi.fn().mockImplementation(() => ({
        navigate: vi.fn(),
        state: { location: { pathname: '/', search: '', hash: '', state: null } },
    })),
    RouterProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Link: (props: MockLinkProps) => {
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
        ...(actual as Record<string, unknown>),
        useFetcher: () => fetcherMock,
        useFetchers: () => [],
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        useNavigate: () => () => {},
        useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
        useNavigation: () => ({
            state: 'idle' as const,
            location: { pathname: '/', search: '', hash: '', state: null, key: 'test' },
        }),
        createMemoryRouter: vi.fn().mockImplementation(() => ({
            navigate: vi.fn(),
            state: { location: { pathname: '/', search: '', hash: '', state: null } },
        })),
        Link: (props: MockLinkProps) => {
            const { to, href, children, ...rest } = props ?? {};
            return (
                <a href={to ?? href} {...rest}>
                    {children}
                </a>
            );
        },
    };
});

vi.mock('@/config', async () => {
    const actual = await vi.importActual('@/config');
    return {
        ...(actual as Record<string, unknown>),
        useConfig: () => ({
            pages: {
                cart: {
                    quantityUpdateDebounce: 750,
                },
            },
        }),
    };
});

import { composeStories } from '@storybook/react-vite';
// eslint-disable-next-line import/no-namespace
import * as CartQuantityPickerStories from './cart-quantity-picker.stories';
import { render, cleanup } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { ConfigProvider } from '@/config';
import { mockConfig } from '@/test-utils/config';

const composed = composeStories(CartQuantityPickerStories);

afterEach(() => {
    cleanup();
});

describe('CartQuantityPicker stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const router = createMemoryRouter(
                [
                    {
                        path: '/',
                        element: (
                            <ConfigProvider config={mockConfig}>
                                <Story />
                            </ConfigProvider>
                        ),
                    },
                ],
                { initialEntries: ['/'] }
            );

            const { container } = render(<RouterProvider router={router} />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
