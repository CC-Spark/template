import type { Meta, StoryObj } from '@storybook/react-vite';
import ProductCartActions from '../index';
// @ts-expect-error mock file is JS
import { mockStandardProductOrderable } from '../../__mocks__/standard-product';
import ProductViewProvider from '@/providers/product-view';
import { ConfigProvider } from '@/config/context';
import { mockConfig } from '@/test-utils/config';
import { expect, within } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';
import { useEffect, useRef, type ReactElement, type ReactNode } from 'react';
import AnalyticsProvider from '@/providers/analytics';
import { action } from 'storybook/actions';

// Mock ProductViewProvider to control internal state if needed,
// but using the real one is better for integration testing if possible.
// We need to ensure all dependencies of ProductViewProvider are met.

// Create a mock analytics value
const mockAnalytics = {
    track: () => {},
};

function ActionLogger({ children }: { children: ReactNode }): ReactElement {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const logAction = action('interaction');

        const handleClick = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;

            const interactiveElement = target.closest('button, a, [role="button"]');
            if (interactiveElement) {
                const label = interactiveElement.textContent?.trim().substring(0, 50) || 'unlabeled';
                const tag = interactiveElement.tagName.toLowerCase();

                if (label.match(/add to cart/i)) {
                    action('add-to-cart')({ label });
                } else if (label.match(/wishlist/i)) {
                    action('wishlist')({ label });
                } else {
                    logAction({ type: 'click', tag, label });
                }
            }
        };

        root.addEventListener('click', handleClick, true);
        return () => {
            root.removeEventListener('click', handleClick, true);
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
}

const meta: Meta<typeof ProductCartActions> = {
    title: 'Components/ProductCartActions',
    component: ProductCartActions,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'centered',
    },
    decorators: [
        (Story: React.ComponentType, context) => {
            return (
                <ConfigProvider config={mockConfig}>
                    <AnalyticsProvider value={mockAnalytics}>
                        <ProductViewProvider product={context.args.product as any} initialQuantity={1} mode="add">
                            <ActionLogger>
                                <Story />
                            </ActionLogger>
                        </ProductViewProvider>
                    </AnalyticsProvider>
                </ConfigProvider>
            );
        },
    ],
};

export default meta;
type Story = StoryObj<typeof ProductCartActions>;

export const Default: Story = {
    args: {
        product: mockStandardProductOrderable.product as any,
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const addToCartButton = canvas.getByRole('button', { name: /add to cart/i });
        await expect(addToCartButton).toBeInTheDocument();
        await expect(addToCartButton).toBeEnabled();

        const wishlistButton = canvas.getByRole('button', { name: /add to wishlist/i });
        await expect(wishlistButton).toBeInTheDocument();
    },
};

export const EditMode: Story = {
    args: {
        product: mockStandardProductOrderable.product as any,
    },
    decorators: [
        (Story: React.ComponentType, context) => (
            <ConfigProvider config={mockConfig}>
                <AnalyticsProvider value={mockAnalytics}>
                    <ProductViewProvider product={context.args.product as any} initialQuantity={1} mode="edit">
                        <ActionLogger>
                            <Story />
                        </ActionLogger>
                    </ProductViewProvider>
                </AnalyticsProvider>
            </ConfigProvider>
        ),
    ],
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        // Updated matcher to find "Update" or "Update Cart"
        const updateCartButton = canvas.getByRole('button', { name: /update/i });
        await expect(updateCartButton).toBeInTheDocument();

        // Wishlist button should not be present in edit mode
        const wishlistButton = canvas.queryByRole('button', { name: /add to wishlist/i });
        await expect(wishlistButton).not.toBeInTheDocument();
    },
};
