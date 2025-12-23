/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { ShopperBasketsTypes } from 'commerce-sdk-isomorphic';
import { isBonusProduct, getBonusProductType } from './product-utils';

/**
 * Calculate bonus product counts for a specific promotion from basket data.
 *
 * This function counts how many bonus products have been selected for a promotion
 * by looking at basket.productItems (NOT bonusDiscountLineItems.bonusProducts).
 *
 * Based on PWA Kit's getBonusProductCountsForPromotion implementation.
 *
 * @param basket - The current basket/cart object
 * @param promotionId - The promotion ID to calculate counts for
 * @returns Object with selectedBonusItems and maxBonusItems counts
 */
export function getBonusProductCountsForPromotion(
    basket: ShopperBasketsTypes.Basket | undefined,
    promotionId: string
): { selectedBonusItems: number; maxBonusItems: number } {
    if (!basket || !promotionId) {
        return { selectedBonusItems: 0, maxBonusItems: 0 };
    }

    // Find all bonus discount line items for this promotion
    const promotionBonusItems = basket.bonusDiscountLineItems?.filter((item) => item.promotionId === promotionId) || [];

    // Sum up max items for this promotion
    const maxBonusItems = promotionBonusItems.reduce((sum, item) => sum + (item.maxBonusItems || 0), 0);

    // Get all bonusDiscountLineItemIds for this promotion
    const promotionBonusLineItemIds = promotionBonusItems.map((item) => item.id).filter(Boolean);

    // Count selected items for this promotion by looking at basket.productItems
    // Filter for items that are:
    // 1. Marked as bonus products (bonusProductLineItem: true)
    // 2. Linked to this promotion's bonusDiscountLineItemIds
    const selectedBonusItems = (basket.productItems || [])
        .filter(
            (item) =>
                item.bonusProductLineItem && promotionBonusLineItemIds.includes(item.bonusDiscountLineItemId || '')
        )
        .reduce((sum, item) => sum + (item.quantity || 0), 0);

    return { selectedBonusItems, maxBonusItems };
}

/**
 * Calculate the maximum quantity allowed for a specific bonus product item.
 *
 * This function handles the complex logic for determining how many more units
 * of a bonus product can be added to the cart, considering:
 * - The max items allowed in the bonus discount slot
 * - Other bonus products already selected in the same slot
 * - Whether the bonus product is choice-based or auto-added
 *
 * Only applies to choice-based bonus products (not auto-added ones).
 *
 * @param productItem - The specific bonus product item to calculate max quantity for
 * @param allProductItems - All product items currently in the basket
 * @param bonusDiscountLineItems - Bonus discount line items from the basket
 * @returns Maximum quantity allowed for this product, or undefined if not a choice-based bonus product
 *
 * @example
 * ```typescript
 * const maxQty = calculateMaxQuantityForBonusProduct(
 *   productItem,
 *   basket.productItems,
 *   basket.bonusDiscountLineItems
 * );
 * // Returns: 3 (if slot allows 5 items and 2 are already selected)
 * ```
 */
export function calculateMaxQuantityForBonusProduct(
    productItem: ShopperBasketsTypes.ProductItem,
    allProductItems: ShopperBasketsTypes.ProductItem[],
    bonusDiscountLineItems?: ShopperBasketsTypes.BonusDiscountLineItem[]
): number | undefined {
    // Early returns for non-bonus or invalid products
    if (!isBonusProduct(productItem) || !productItem.bonusDiscountLineItemId || !productItem.itemId) {
        return undefined;
    }

    // Only calculate max for choice-based bonus products
    const bonusProductType = getBonusProductType(productItem, bonusDiscountLineItems);
    if (bonusProductType !== 'choice') {
        return undefined;
    }

    // Find the bonus discount line item for this product
    const bonusDiscountLineItem = bonusDiscountLineItems?.find(
        (item) => item.id === productItem.bonusDiscountLineItemId
    );

    if (!bonusDiscountLineItem?.maxBonusItems) {
        return undefined;
    }

    // Count already selected bonus products in this slot (excluding current product)
    const alreadySelectedQuantity = allProductItems
        .filter(
            (item) =>
                item.bonusDiscountLineItemId === productItem.bonusDiscountLineItemId &&
                item.itemId !== productItem.itemId
        )
        .reduce((sum, item) => sum + (item.quantity || 0), 0);

    // Calculate available max quantity
    const maxQuantity = Math.max(0, bonusDiscountLineItem.maxBonusItems - alreadySelectedQuantity);

    return maxQuantity;
}
