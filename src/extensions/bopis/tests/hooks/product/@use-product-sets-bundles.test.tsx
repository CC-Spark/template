/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { useProductSetsBundles } from '@/hooks/product/use-product-sets-bundles';
import type { ShopperProducts } from '@salesforce/storefront-next-runtime/scapi';

// Mock useFetcher for useScapiFetcher
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useFetcher: vi.fn(() => ({
            data: null,
            state: 'idle',
            submit: vi.fn(),
            load: vi.fn(),
        })),
    };
});

// Mock useBulkChildProductInventory
vi.mock('@/hooks/product/use-bulk-child-product-inventory', () => ({
    useBulkChildProductInventory: vi.fn(() => ({
        enrichedSelections: [],
        isLoading: false,
    })),
}));

// Mock pickup context
vi.mock('@/extensions/bopis/context/pickup-context', () => ({
    usePickup: vi.fn(() => ({
        pickupBasketItems: new Set(),
    })),
}));

// Mock inventory utils
vi.mock('@/lib/inventory-utils', () => ({
    isStoreOutOfStock: vi.fn(() => false),
    isSiteOutOfStock: vi.fn(() => false),
}));

// Create a wrapper with RouterProvider
const wrapper = ({ children }: { children: React.ReactNode }) => {
    const router = createMemoryRouter(
        [
            {
                path: '*',
                element: children,
            },
        ],
        {
            initialEntries: ['/'],
        }
    );

    return <RouterProvider router={router} />;
};

describe('useProductSetsBundles - BOPIS', () => {
    const createMockProduct = (
        type: 'set' | 'bundle',
        childProducts: any[] = []
    ): ShopperProducts.schemas['Product'] => ({
        id: 'parent-product-123',
        name: 'Test Product',
        type: type === 'set' ? { set: true } : { bundle: true },
        setProducts: type === 'set' ? childProducts : undefined,
        bundledProducts:
            type === 'bundle'
                ? childProducts.map((p) => ({ id: p.id, product: p, quantity: p.quantity || 1 }))
                : undefined,
    });

    const createStandardProduct = (id: string): ShopperProducts.schemas['Product'] => ({
        id,
        name: `Standard Product ${id}`,
        type: { item: true },
        product: { id, name: `Standard Product ${id}` },
    });

    describe('bundleStockLevel and bundleOutOfStock', () => {
        test('returns undefined for sets', () => {
            const child1 = createStandardProduct('child-1');
            const product = createMockProduct('set', [child1]);

            const { result } = renderHook(() => useProductSetsBundles({ product }), { wrapper });

            expect(result.current.bundleStockLevel).toBeUndefined();
            expect(result.current.bundleOutOfStock).toBeUndefined();
        });

        test('returns bundle stock level from site inventory', () => {
            const child1 = createStandardProduct('child-1');
            const product = createMockProduct('bundle', [child1]);
            product.inventory = { id: 'bundle-inv', stockLevel: 15, ats: 15, orderable: true };

            const { result } = renderHook(() => useProductSetsBundles({ product }), { wrapper });

            expect(result.current.bundleStockLevel).toBe(15);
            expect(result.current.bundleOutOfStock).toBe(false);
        });

        test('returns bundle stock level from store inventory when pickup selected', async () => {
            const child1 = createStandardProduct('child-1');
            const product = createMockProduct('bundle', [child1]);
            product.inventory = { id: 'bundle-inv', stockLevel: 10, ats: 10, orderable: true };
            product.inventories = [{ id: 'store-1', stockLevel: 5, orderable: true }];

            // Mock usePickup context to return pickup selected
            const pickupModule = await import('@/extensions/bopis/context/pickup-context');
            vi.spyOn(pickupModule, 'usePickup').mockReturnValue({
                pickupBasketItems: new Set(['parent-product-123']),
            } as never);

            const { result } = renderHook(
                () =>
                    useProductSetsBundles({
                        product,
                        selectedStoreInventoryId: 'store-1',
                    }),
                { wrapper }
            );

            // Should use store inventory when pickup is selected
            expect(result.current.bundleStockLevel).toBe(5);
        });

        test('returns true when bundle is completely out of stock', () => {
            const child1 = createStandardProduct('child-1');
            const product = createMockProduct('bundle', [child1]);
            product.inventory = { id: 'bundle-inv', stockLevel: 0, ats: 0, orderable: false };

            const { result } = renderHook(() => useProductSetsBundles({ product }), { wrapper });

            expect(result.current.bundleOutOfStock).toBe(true);
        });
    });

    describe('isCompletelyOutOfStock', () => {
        test('returns true when both site and store are out of stock', async () => {
            const child1 = createStandardProduct('child-1');
            const product = createMockProduct('set', [child1]);
            product.inventory = { id: 'inv-1', stockLevel: 0, ats: 0, orderable: false };
            product.inventories = [{ id: 'store-1', stockLevel: 0, orderable: false }];

            // Mock inventory utils to return out of stock
            const inventoryUtilsModule = await import('@/lib/inventory-utils');
            vi.spyOn(inventoryUtilsModule, 'isStoreOutOfStock').mockReturnValue(true);
            vi.spyOn(inventoryUtilsModule, 'isSiteOutOfStock').mockReturnValue(true);

            const { result } = renderHook(
                () =>
                    useProductSetsBundles({
                        product,
                        selectedStoreInventoryId: 'store-1',
                    }),
                { wrapper }
            );

            expect(result.current.isCompletelyOutOfStock).toBe(true);
        });
    });
});
