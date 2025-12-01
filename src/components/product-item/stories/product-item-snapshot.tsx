import { vi, expect, test, describe, afterEach } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import * as ProductItemStories from './product-item.stories';
import { render, cleanup } from '@testing-library/react';

// Mock useItemFetcherLoading which is used in ProductItem
vi.mock('@/hooks/use-item-fetcher', () => ({
    useItemFetcherLoading: () => false,
    useItemFetcher: () => ({ Form: 'form' }),
}));

vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-router')>();
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useLocation: () => ({ pathname: '/', search: '', hash: '', state: null, key: 'test' }),
        useResolvedPath: () => ({ pathname: '/', search: '', hash: '' }),
        useHref: () => '/',
        Link: (props: any) => (
            <a href={props.to} {...props}>
                {props.children}
            </a>
        ),
        NavLink: (props: any) => (
            <a href={props.to} {...props}>
                {props.children}
            </a>
        ),
    };
});

const composed = composeStories(ProductItemStories);

afterEach(() => {
    cleanup();
});

describe('ProductItem stories snapshot', () => {
    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
