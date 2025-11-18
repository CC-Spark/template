/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { ShopperBasketsV2 } from '@salesforce/storefront-next-runtime/scapi';

/**
 * Creates a mock basket with pickup items for testing.
 *
 * This utility function generates a realistic basket structure with shipments and product items
 * based on the provided pickup items. Items are automatically grouped by storeId into shipments.
 *
 * @param pickupItems - Array of pickup items to include in the basket. Each item should have
 *                      productId, inventoryId, and storeId. If empty or undefined, returns an empty basket.
 * @param overrides - Optional partial basket object to override default values
 * @returns A mock basket with the specified pickup items
 *
 * @example
 * ```ts
 * const basket = createMockBasketWithPickupItems([
 *   { productId: 'product-1', inventoryId: 'inventory-A', storeId: 'store-1' },
 *   { productId: 'product-2', inventoryId: 'inventory-B', storeId: 'store-2' },
 * ]);
 * ```
 */
export function createMockBasketWithPickupItems(
    pickupItems?: Array<{ productId: string; inventoryId: string; storeId: string }>,
    overrides?: Partial<ShopperBasketsV2.schemas['Basket']>
): ShopperBasketsV2.schemas['Basket'] {
    if (!pickupItems || pickupItems.length === 0) {
        return {
            basketId: 'basket-1',
            shipments: [],
            productItems: [],
            ...overrides,
        };
    }

    // Group items by storeId to create shipments
    const storeMap = new Map<string, string[]>();
    pickupItems.forEach((item) => {
        const existing = storeMap.get(item.storeId) || [];
        storeMap.set(item.storeId, [...existing, item.productId]);
    });

    const shipments: ShopperBasketsV2.schemas['Shipment'][] = [];
    const productItems: ShopperBasketsV2.schemas['ProductItem'][] = [];

    let shipmentIdCounter = 1;
    storeMap.forEach((productIds, storeId) => {
        const shipmentId = `shipment-${shipmentIdCounter++}`;
        shipments.push({
            shipmentId,
            c_fromStoreId: storeId,
        });

        pickupItems
            .filter((item) => productIds.includes(item.productId))
            .forEach((item) => {
                productItems.push({
                    productId: item.productId,
                    inventoryId: item.inventoryId,
                    shipmentId,
                    quantity: 1,
                    itemId: `item-${item.productId}`,
                });
            });
    });

    return {
        basketId: 'basket-1',
        shipments,
        productItems,
        ...overrides,
    };
}
