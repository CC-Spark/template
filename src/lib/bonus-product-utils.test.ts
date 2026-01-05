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

import { describe, it, expect } from 'vitest';
import type { ShopperBasketsTypes } from 'commerce-sdk-isomorphic';
import { getBonusProductCountsForPromotion, calculateMaxQuantityForBonusProduct } from './bonus-product-utils';

describe('bonus-product-utils', () => {
    describe('getBonusProductCountsForPromotion', () => {
        it('should return zero counts when basket is undefined', () => {
            const result = getBonusProductCountsForPromotion(undefined, 'promo-1');

            expect(result).toEqual({
                selectedBonusItems: 0,
                maxBonusItems: 0,
            });
        });

        it('should return zero counts when promotionId is empty', () => {
            const basket: ShopperBasketsTypes.Basket = {
                basketId: 'basket-1',
                bonusDiscountLineItems: [],
            };

            const result = getBonusProductCountsForPromotion(basket, '');

            expect(result).toEqual({
                selectedBonusItems: 0,
                maxBonusItems: 0,
            });
        });

        it('should calculate counts for single bonus discount line item', () => {
            const basket: ShopperBasketsV2.schemas['Basket'] = {
                basketId: 'basket-1',
                bonusDiscountLineItems: [
                    {
                        id: 'bonus-1',
                        promotionId: 'promo-1',
                        maxBonusItems: 3,
                    },
                ],
                productItems: [
                    {
                        itemId: 'item-1',
                        productId: 'bonus-product-1',
                        bonusProductLineItem: true,
                        bonusDiscountLineItemId: 'bonus-1',
                        quantity: 2,
                    },
                ],
            };

            const result = getBonusProductCountsForPromotion(basket, 'promo-1');

            expect(result).toEqual({
                selectedBonusItems: 2,
                maxBonusItems: 3,
            });
        });

        it('should sum counts across multiple bonus discount line items for same promotion', () => {
            const basket: ShopperBasketsV2.schemas['Basket'] = {
                basketId: 'basket-1',
                bonusDiscountLineItems: [
                    {
                        id: 'bonus-1',
                        promotionId: 'promo-1',
                        maxBonusItems: 3,
                    },
                    {
                        id: 'bonus-2',
                        promotionId: 'promo-1',
                        maxBonusItems: 2,
                    },
                ],
                productItems: [
                    {
                        itemId: 'item-1',
                        productId: 'bonus-product-1',
                        bonusProductLineItem: true,
                        bonusDiscountLineItemId: 'bonus-1',
                        quantity: 2,
                    },
                    {
                        itemId: 'item-2',
                        productId: 'bonus-product-2',
                        bonusProductLineItem: true,
                        bonusDiscountLineItemId: 'bonus-2',
                        quantity: 1,
                    },
                ],
            };

            const result = getBonusProductCountsForPromotion(basket, 'promo-1');

            expect(result).toEqual({
                selectedBonusItems: 3,
                maxBonusItems: 5,
            });
        });

        it('should ignore bonus items from different promotions', () => {
            const basket: ShopperBasketsV2.schemas['Basket'] = {
                basketId: 'basket-1',
                bonusDiscountLineItems: [
                    {
                        id: 'bonus-1',
                        promotionId: 'promo-1',
                        maxBonusItems: 3,
                    },
                    {
                        id: 'bonus-2',
                        promotionId: 'promo-2',
                        maxBonusItems: 2,
                    },
                ],
                productItems: [
                    {
                        itemId: 'item-1',
                        productId: 'bonus-product-1',
                        bonusProductLineItem: true,
                        bonusDiscountLineItemId: 'bonus-1',
                        quantity: 2,
                    },
                    {
                        itemId: 'item-2',
                        productId: 'bonus-product-2',
                        bonusProductLineItem: true,
                        bonusDiscountLineItemId: 'bonus-2',
                        quantity: 1,
                    },
                ],
            };

            const result = getBonusProductCountsForPromotion(basket, 'promo-1');

            expect(result).toEqual({
                selectedBonusItems: 2,
                maxBonusItems: 3,
            });
        });

        it('should handle basket with no product items', () => {
            const basket: ShopperBasketsV2.schemas['Basket'] = {
                basketId: 'basket-1',
                bonusDiscountLineItems: [
                    {
                        id: 'bonus-1',
                        promotionId: 'promo-1',
                        maxBonusItems: 3,
                    },
                ],
                productItems: [],
            };

            const result = getBonusProductCountsForPromotion(basket, 'promo-1');

            expect(result).toEqual({
                selectedBonusItems: 0,
                maxBonusItems: 3,
            });
        });

        it('should handle undefined maxBonusItems gracefully', () => {
            const basket: ShopperBasketsV2.schemas['Basket'] = {
                basketId: 'basket-1',
                bonusDiscountLineItems: [
                    {
                        id: 'bonus-1',
                        promotionId: 'promo-1',
                        maxBonusItems: undefined,
                    },
                ],
                productItems: [],
            };

            const result = getBonusProductCountsForPromotion(basket, 'promo-1');

            expect(result).toEqual({
                selectedBonusItems: 0,
                maxBonusItems: 0,
            });
        });
    });

    describe('calculateMaxQuantityForBonusProduct', () => {
        const mockBonusDiscountLineItems: ShopperBasketsTypes.BonusDiscountLineItem[] = [
            {
                id: 'bonus-slot-1',
                promotionId: 'promo-1',
                maxBonusItems: 5,
                bonusProducts: [
                    {
                        productId: 'bonus-product-1',
                        productName: 'Bonus Product 1',
                    },
                ],
            },
            {
                id: 'bonus-slot-2',
                promotionId: 'promo-2',
                maxBonusItems: 3,
                bonusProducts: [
                    {
                        productId: 'bonus-product-2',
                        productName: 'Bonus Product 2',
                    },
                ],
            },
        ];

        it('should return undefined for non-bonus products', () => {
            const productItem: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'regular-product',
                bonusProductLineItem: false,
                quantity: 1,
            };

            const result = calculateMaxQuantityForBonusProduct(productItem, [], mockBonusDiscountLineItems);

            expect(result).toBeUndefined();
        });

        it('should return undefined when bonusDiscountLineItemId is missing', () => {
            const productItem: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product',
                bonusProductLineItem: true,
                quantity: 1,
                // bonusDiscountLineItemId is missing
            };

            const result = calculateMaxQuantityForBonusProduct(productItem, [], mockBonusDiscountLineItems);

            expect(result).toBeUndefined();
        });

        it('should return undefined when itemId is missing', () => {
            const productItem: ShopperBasketsTypes.ProductItem = {
                // itemId is missing
                productId: 'bonus-product',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const result = calculateMaxQuantityForBonusProduct(productItem, [], mockBonusDiscountLineItems);

            expect(result).toBeUndefined();
        });

        it('should return undefined for auto bonus products (no bonusProducts array)', () => {
            const autoBonusDiscountLineItems: ShopperBasketsTypes.BonusDiscountLineItem[] = [
                {
                    id: 'bonus-slot-auto',
                    promotionId: 'promo-auto',
                    maxBonusItems: 1,
                    // No bonusProducts array = auto bonus
                },
            ];

            const productItem: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'auto-bonus-product',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-auto',
                quantity: 1,
            };

            const result = calculateMaxQuantityForBonusProduct(productItem, [], autoBonusDiscountLineItems);

            expect(result).toBeUndefined();
        });

        it('should return undefined when bonusDiscountLineItems is undefined', () => {
            const productItem: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const result = calculateMaxQuantityForBonusProduct(productItem, [], undefined);

            expect(result).toBeUndefined();
        });

        it('should return undefined when bonus discount line item not found', () => {
            const productItem: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'non-existent-slot',
                quantity: 1,
            };

            const result = calculateMaxQuantityForBonusProduct(productItem, [], mockBonusDiscountLineItems);

            expect(result).toBeUndefined();
        });

        it('should return undefined when maxBonusItems is missing from slot', () => {
            const bonusDiscountLineItems: ShopperBasketsTypes.BonusDiscountLineItem[] = [
                {
                    id: 'bonus-slot-1',
                    promotionId: 'promo-1',
                    maxBonusItems: undefined,
                    bonusProducts: [{ productId: 'bonus-product-1', productName: 'Bonus Product 1' }],
                },
            ];

            const productItem: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const result = calculateMaxQuantityForBonusProduct(productItem, [], bonusDiscountLineItems);

            expect(result).toBeUndefined();
        });

        it('should return max quantity when slot is empty (no other products)', () => {
            const productItem: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product-1',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const allProductItems = [productItem];

            const result = calculateMaxQuantityForBonusProduct(
                productItem,
                allProductItems,
                mockBonusDiscountLineItems
            );

            expect(result).toBe(5); // maxBonusItems for slot-1
        });

        it('should calculate max quantity excluding current product', () => {
            const productItem1: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product-1',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 2,
            };

            const productItem2: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-2',
                productId: 'bonus-product-2',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const allProductItems = [productItem1, productItem2];

            // For productItem1: max = 5 - 1 (item-2) = 4
            const result = calculateMaxQuantityForBonusProduct(
                productItem1,
                allProductItems,
                mockBonusDiscountLineItems
            );

            expect(result).toBe(4);
        });

        it('should return correct max when multiple products in same slot', () => {
            const productItem1: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product-1',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 2,
            };

            const productItem2: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-2',
                productId: 'bonus-product-2',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 2,
            };

            const allProductItems = [productItem1, productItem2];

            // For productItem1: max = 5 - 2 (item-2) = 3
            const result = calculateMaxQuantityForBonusProduct(
                productItem1,
                allProductItems,
                mockBonusDiscountLineItems
            );

            expect(result).toBe(3);
        });

        it('should return 0 when slot is full from other products', () => {
            const productItem1: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product-1',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const productItem2: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-2',
                productId: 'bonus-product-2',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 5, // Fills entire slot
            };

            const allProductItems = [productItem1, productItem2];

            // For productItem1: max = 5 - 5 (item-2) = 0
            const result = calculateMaxQuantityForBonusProduct(
                productItem1,
                allProductItems,
                mockBonusDiscountLineItems
            );

            expect(result).toBe(0);
        });

        it('should return 0 when slot is overfilled (edge case)', () => {
            const productItem1: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product-1',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const productItem2: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-2',
                productId: 'bonus-product-2',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 10, // Exceeds slot max
            };

            const allProductItems = [productItem1, productItem2];

            // For productItem1: max = Math.max(0, 5 - 10) = 0
            const result = calculateMaxQuantityForBonusProduct(
                productItem1,
                allProductItems,
                mockBonusDiscountLineItems
            );

            expect(result).toBe(0);
        });

        it('should ignore products from different slots', () => {
            const productItem1: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product-1',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 2,
            };

            const productItem2: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-2',
                productId: 'bonus-product-2',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-2', // Different slot
                quantity: 2,
            };

            const allProductItems = [productItem1, productItem2];

            // For productItem1: max = 5 - 0 (no other items in slot-1) = 5
            const result = calculateMaxQuantityForBonusProduct(
                productItem1,
                allProductItems,
                mockBonusDiscountLineItems
            );

            expect(result).toBe(5);
        });

        it('should handle undefined quantity in other products gracefully', () => {
            const productItem1: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product-1',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const productItem2: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-2',
                productId: 'bonus-product-2',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: undefined, // Treated as 0
            };

            const allProductItems = [productItem1, productItem2];

            // For productItem1: max = 5 - 0 (item-2 quantity is undefined) = 5
            const result = calculateMaxQuantityForBonusProduct(
                productItem1,
                allProductItems,
                mockBonusDiscountLineItems
            );

            expect(result).toBe(5);
        });

        it('should handle empty allProductItems array', () => {
            const productItem: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product-1',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const result = calculateMaxQuantityForBonusProduct(productItem, [], mockBonusDiscountLineItems);

            expect(result).toBe(5); // Full slot available
        });

        it('should correctly handle complex scenario with multiple products and slots', () => {
            const productItem1: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-1',
                productId: 'bonus-product-1',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const productItem2: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-2',
                productId: 'bonus-product-2',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 2,
            };

            const productItem3: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-3',
                productId: 'bonus-product-3',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-1',
                quantity: 1,
            };

            const productItem4: ShopperBasketsTypes.ProductItem = {
                itemId: 'item-4',
                productId: 'bonus-product-4',
                bonusProductLineItem: true,
                bonusDiscountLineItemId: 'bonus-slot-2', // Different slot
                quantity: 2,
            };

            const allProductItems = [productItem1, productItem2, productItem3, productItem4];

            // For productItem1 in slot-1: max = 5 - (2 + 1) = 2
            const result = calculateMaxQuantityForBonusProduct(
                productItem1,
                allProductItems,
                mockBonusDiscountLineItems
            );

            expect(result).toBe(2);
        });
    });
});
