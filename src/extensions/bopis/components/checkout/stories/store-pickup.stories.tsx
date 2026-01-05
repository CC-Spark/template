/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, within } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';
import { useEffect, useRef, Suspense, type ReactElement, type ReactNode } from 'react';
import { action } from 'storybook/actions';
import StorePickup from '../store-pickup';
import PickupProvider from '@/extensions/bopis/context/pickup-context';
import BasketProvider from '@/providers/basket';
import CheckoutProvider from '@/components/checkout/utils/checkout-context';

// Create a pre-resolved promise to avoid async client component issues
const resolvedShippingDefaultSet = Promise.resolve(undefined);
import { createMockBasketWithPickupItems, createMockStore } from '@/extensions/bopis/tests/__mocks__/basket';
import type { ShopperStores } from '@salesforce/storefront-next-runtime/scapi';

function ActionLogger({ children }: { children: ReactNode }): ReactElement {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const logClick = action('interaction');

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target || !root.contains(target)) return;

            // Prevent navigation on links
            const link = target.closest('a');
            if (link) {
                event.preventDefault();
                const href = link.getAttribute('href');
                logClick({ type: 'click', element: 'link', href, label: link.textContent?.trim() });
                return;
            }

            // Try to find a meaningful element to log
            const element = target.closest('button, [role="button"]');
            if (element) {
                const label =
                    element.textContent?.trim() || element.getAttribute('aria-label') || element.tagName.toLowerCase();
                logClick({ type: 'click', element: element.tagName.toLowerCase(), label });
            }
        };

        root.addEventListener('click', handleClick, true);

        return () => {
            root.removeEventListener('click', handleClick, true);
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
}

const storeId = 'store-1';
const inventoryId = 'inventory-1';
const mockStore: ShopperStores.schemas['Store'] = createMockStore(storeId, inventoryId, {
    name: 'Downtown Store',
    address1: '123 Main Street',
    city: 'San Francisco',
    stateCode: 'CA',
    postalCode: '94102',
    phone: '415-555-1234',
    email: 'downtown@example.com',
});
const mockBasket = createMockBasketWithPickupItems([{ productId: 'product-1', inventoryId, storeId }]);
const mockPickupStores = new Map([[storeId, mockStore]]);

const meta: Meta<typeof StorePickup> = {
    title: 'Extensions/BOPIS/StorePickup',
    component: StorePickup,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: `
The StorePickup component displays store information for pickup orders on the checkout page.

## Features

- **Store Details Display**: Shows store name, address, phone, email, and hours
- **Compact Layout**: Uses compact address format with store name inline
- **Mobile Optimized**: Always shows vertical layout for better mobile experience
- **Integration**: Integrates with StoreDetails component from store-locator extension

## Usage

This component is used in the checkout flow to show customers where they can pick up their order.
                `,
            },
        },
    },
    decorators: [
        (Story: React.ComponentType) => (
            <BasketProvider value={mockBasket}>
                <CheckoutProvider customerProfile={undefined} shippingDefaultSet={resolvedShippingDefaultSet}>
                    <PickupProvider initialPickupStores={mockPickupStores}>
                        <Suspense fallback={<div>Loading...</div>}>
                            <ActionLogger>
                                <Story />
                            </ActionLogger>
                        </Suspense>
                    </PickupProvider>
                </CheckoutProvider>
            </BasketProvider>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    parameters: {
        docs: {
            description: {
                story: `
Default store pickup display showing all store information including:
- Store name and address
- Distance from customer location
- Store hours
- Phone number
- Email address

The component displays in a card format with a clear title.
                `,
            },
        },
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        // Wait for and verify store pickup card is rendered using data-slot attribute
        const { waitFor } = await import('@testing-library/react');
        await waitFor(
            () => {
                const card = canvasElement.querySelector('[data-slot="card"]');
                expect(card).toBeInTheDocument();
            },
            { timeout: 5000 }
        );

        // Verify store details are present
        const storeName = await canvas.findByText(/downtown store/i, {}, { timeout: 5000 });
        await expect(storeName).toBeInTheDocument();
    },
};

export const MobileLayout: Story = {
    parameters: {
        docs: {
            description: {
                story: `
Store pickup component optimized for mobile devices. Shows:
- Vertical layout for better mobile viewing
- Compact address format
- Touch-friendly spacing

The component automatically adapts for mobile screens.
                `,
            },
        },
    },
    globals: {
        viewport: 'mobile2',
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);

        // Wait for and verify store pickup card is rendered using data-slot attribute
        const { waitFor } = await import('@testing-library/react');
        await waitFor(
            () => {
                const card = canvasElement.querySelector('[data-slot="card"]');
                expect(card).toBeInTheDocument();
            },
            { timeout: 5000 }
        );
    },
};

export const DesktopLayout: Story = {
    parameters: {
        docs: {
            description: {
                story: `
Store pickup component for desktop devices. Shows:
- Card layout with proper spacing
- All store information clearly displayed
- Desktop-optimized layout

The component provides a clean, readable layout for desktop screens.
                `,
            },
        },
    },
    globals: {
        viewport: 'desktop',
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        // Wait for and verify store pickup card is rendered using data-slot attribute
        const { waitFor } = await import('@testing-library/react');
        await waitFor(
            () => {
                const card = canvasElement.querySelector('[data-slot="card"]');
                expect(card).toBeInTheDocument();
            },
            { timeout: 5000 }
        );

        // Verify store name is present
        const storeName = await canvas.findByText(/downtown store/i, {}, { timeout: 5000 });
        await expect(storeName).toBeInTheDocument();
    },
};
