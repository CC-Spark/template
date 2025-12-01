import { vi, expect, test, describe, afterEach } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import * as ProductCartActionsStories from './product-cart-actions.stories';
import { render, cleanup } from '@testing-library/react';

// Mock useItemFetcher
vi.mock('@/hooks/use-item-fetcher', () => ({
    useItemFetcherLoading: () => false,
    useItemFetcher: () => ({ Form: (props: any) => <form {...props} />, state: 'idle', submit: vi.fn() }),
}));

// Mock react-router for useFetcher called directly in useProductActions
const fetcherMock = {
    data: null,
    state: 'idle',
    submit: vi.fn(),
    Form: (props: any) => <form {...props} />,
    load: vi.fn(),
};

vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useFetcher: () => fetcherMock,
        useFetchers: () => [],
        useNavigate: () => vi.fn(),
        useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
        useNavigation: () => ({
            state: 'idle',
            location: { pathname: '/', search: '', hash: '', state: null, key: 'test' },
        }),
        useSearchParams: () => [new URLSearchParams(), vi.fn()],
    };
});

const composed = composeStories(ProductCartActionsStories);

afterEach(() => {
    cleanup();
});

describe('ProductCartActions stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
