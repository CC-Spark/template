import type { Meta, StoryObj } from '@storybook/react-vite';
import CartSkeleton from '../cart-skeleton';
import { expect } from 'storybook/test';

const meta: Meta<typeof CartSkeleton> = {
    title: 'CART/Cart Skeleton',
    component: CartSkeleton,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
A skeleton loading component for the shopping cart page. This component displays placeholder content while the actual cart data is being loaded.

## Features

- **Loading State**: Shows skeleton placeholders for all cart elements
- **Layout Structure**: Matches the actual cart layout structure
- **Product Items**: Skeleton placeholders for product items
- **Order Summary**: Skeleton for order summary section
- **CTA Buttons**: Skeleton for checkout buttons
- **Responsive**: Adapts to mobile and desktop layouts

## Usage

The CartSkeleton is displayed while:
- Cart data is being fetched from the API
- Basket information is loading
- Product details are being retrieved
- Initial page load

\`\`\`tsx
import CartSkeleton from '../cart-skeleton';

function CartPage() {
  if (isLoading) {
    return <CartSkeleton />;
  }
  return <CartContent basket={basket} />;
}
\`\`\`

## Structure

- **Cart Title Skeleton**: Placeholder for cart title
- **Product Items Skeleton**: Placeholder cards for cart items
- **Order Summary Skeleton**: Placeholder for order totals
- **CTA Skeleton**: Placeholder for checkout button and payment icons
- **Mobile/Desktop**: Different layouts for different screen sizes
                `,
            },
        },
    },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: `
The default CartSkeleton shows the complete loading state:

### Features:
- **Cart title skeleton**: Placeholder for "Shopping Cart" title
- **Product items skeleton**: Placeholder cards for cart items
- **Order summary skeleton**: Placeholder for order totals section
- **CTA skeleton**: Placeholder for checkout button and payment icons
- **Full layout**: Complete cart page structure

### Use Cases:
- Initial page load
- Cart data fetching
- Product details loading
- Standard loading state
                `,
            },
        },
    },
    play: async ({ canvasElement }) => {
        // Test skeleton container is present
        const skeletonContainer = canvasElement.querySelector('[data-testid="sf-cart-container"]');
        await expect(skeletonContainer).toBeInTheDocument();

        // Test cart title skeleton is present
        const titleSkeleton = canvasElement.querySelector('[data-testid="cart-title-skeleton"]');
        await expect(titleSkeleton).toBeInTheDocument();

        // Test product item skeleton is present
        const productItemSkeleton = canvasElement.querySelector('[data-testid="cart-product-item"]');
        await expect(productItemSkeleton).toBeInTheDocument();

        // Test order summary skeleton is present
        const orderSummarySkeleton = canvasElement.querySelector('[data-testid="cart-order-summary"]');
        await expect(orderSummarySkeleton).toBeInTheDocument();
    },
};

export const MobileView: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
        docs: {
            description: {
                story: `
CartSkeleton optimized for mobile devices:

### Mobile Features:
- **Stacked layout**: Items and summary stacked vertically
- **Mobile CTA**: Sticky bottom CTA section
- **Touch-friendly**: Appropriate spacing for mobile
- **Responsive skeleton**: Adapts to mobile screen size

### Use Cases:
- Mobile cart loading
- Touch device loading states
- Small screen optimization
                `,
            },
        },
    },
    play: async ({ canvasElement }) => {
        // Test skeleton container is present
        const skeletonContainer = canvasElement.querySelector('[data-testid="sf-cart-container"]');
        await expect(skeletonContainer).toBeInTheDocument();

        // Test mobile CTA skeleton is present
        const mobileCta = canvasElement.querySelector('[data-testid="cart-cta-mobile"]');
        await expect(mobileCta).toBeInTheDocument();
    },
};

export const DesktopView: Story = {
    parameters: {
        viewport: {
            defaultViewport: 'desktop',
        },
        docs: {
            description: {
                story: `
CartSkeleton optimized for desktop devices:

### Desktop Features:
- **Grid layout**: Items on left, summary on right
- **Desktop CTA**: CTA section in sidebar
- **Wide layout**: Optimized for larger screens
- **Full skeleton**: Complete desktop cart structure

### Use Cases:
- Desktop cart loading
- Large screen optimization
- Full cart page loading state
                `,
            },
        },
    },
    play: async ({ canvasElement }) => {
        // Test skeleton container is present
        const skeletonContainer = canvasElement.querySelector('[data-testid="sf-cart-container"]');
        await expect(skeletonContainer).toBeInTheDocument();

        // Test desktop CTA skeleton is present
        const desktopCta = canvasElement.querySelector('[data-testid="cart-cta-desktop"]');
        await expect(desktopCta).toBeInTheDocument();
    },
};
