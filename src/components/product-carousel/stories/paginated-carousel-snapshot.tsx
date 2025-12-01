import { vi, expect, test, describe, afterEach } from 'vitest';
import { composeStories } from '@storybook/react-vite';
import * as PaginatedCarouselStories from './paginated-carousel.stories';
import { render, cleanup } from '@testing-library/react';

const composed = composeStories(PaginatedCarouselStories);

afterEach(() => {
    cleanup();
});

describe('PaginatedProductCarousel stories snapshot', () => {
    // Mock the necessary react-router hooks
    vi.mock('react-router', async (importOriginal) => {
        const actual = await importOriginal<typeof import('react-router')>();
        return {
            ...actual,
            useNavigate: () => vi.fn(),
            useLocation: () => ({
                pathname: '/',
                search: '',
                hash: '',
                state: null,
                key: 'default',
            }),
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

    for (const [storyName, Story] of Object.entries(composed)) {
        test(`${storyName} story renders and matches snapshot`, () => {
            const { container } = render(<Story />);
            expect(container.firstChild).toMatchSnapshot();
        });
    }
});
