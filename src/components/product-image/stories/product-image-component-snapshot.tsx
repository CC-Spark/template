import * as ProductImageStories from './product-image-component.stories';
import { composeStories } from '@storybook/react-vite';
import { render } from '@testing-library/react';
import { describe, test, expect, vi } from 'vitest';

// Mock mocks
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useNavigate: vi.fn(),
        useLocation: vi.fn(),
        useResolvedPath: vi.fn(),
        useHref: vi.fn(),
        Link: ({ children, to, preventScrollReset: _preventScrollReset, ...props }: any) => (
            <a href={to} {...props}>
                {children}
            </a>
        ),
        NavLink: ({ children, to, preventScrollReset: _preventScrollReset, ...props }: any) => (
            <a href={to} {...props}>
                {children}
            </a>
        ),
    };
});

const { Default, ErrorFallback } = composeStories(ProductImageStories);

describe('ProductImage Snapshots', () => {
    test('Default snapshot', () => {
        const { container } = render(<Default />);
        expect(container).toMatchSnapshot();
    });

    test('ErrorFallback snapshot', () => {
        const { container } = render(<ErrorFallback />);
        expect(container).toMatchSnapshot();
    });
});
