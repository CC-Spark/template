import { vi, expect, test, describe, afterEach } from 'vitest';

type MockFormProps = React.PropsWithChildren<Record<string, unknown>>;
type MockLinkProps = React.PropsWithChildren<{ to?: string; href?: string; [key: string]: unknown }>;

const fetcherMock = {
    data: null,
    state: 'idle',

    submit: () => {},
    Form: (props: MockFormProps) => <form {...props}>{props.children}</form>,
};

vi.mock('react-router', () => ({
    createContext: vi.fn().mockImplementation(() => ({})),
    createCookie: vi.fn().mockImplementation((name) => ({ name, parse: vi.fn(), serialize: vi.fn() })),
    useFetcher: () => fetcherMock,
    useFetchers: () => [],

    useNavigate: () => () => {},
    useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
    useNavigation: () => ({
        state: 'idle',
        location: { pathname: '/', search: '', hash: '', state: null, key: 'test' },
    }),
    useSearchParams: () => [new URLSearchParams(), vi.fn()],
    useInRouterContext: () => false,
    // Add missing Form component
    Form: (props: MockFormProps) => <form {...props}>{props.children}</form>,
    // Add missing createMemoryRouter
    createMemoryRouter: vi.fn().mockImplementation(() => ({
        navigate: vi.fn(),
        state: { location: { pathname: '/', search: '', hash: '', state: null } },
    })),
    // Add missing RouterProvider
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
vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useFetcher: () => fetcherMock,
        useFetchers: () => [],

        useNavigate: () => () => {},
        useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
        useNavigation: () => ({
            state: 'idle',
            location: { pathname: '/', search: '', hash: '', state: null, key: 'test' },
        }),
        useInRouterContext: () => false,
        // Add missing createMemoryRouter
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
vi.mock('@/components/toast', () => ({
    useToast: () => ({
        addToast: () => {},
    }),
}));

import { composeStories } from '@storybook/react-vite';

import * as ProductInfoStories from './product-info.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(ProductInfoStories);

afterEach(() => {
    cleanup();
});

describe('ProductInfo stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
