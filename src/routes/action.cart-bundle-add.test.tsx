/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { clientAction } from './action.cart-bundle-add';
import { getBasket } from '@/middlewares/basket.client';
import { createApiClients } from '@/lib/api-clients';
import { getConfig } from '@/config';
import type { ShopperProducts } from '@salesforce/storefront-next-runtime/scapi';

vi.mock('@/middlewares/basket.client');
vi.mock('@/lib/api-clients');
vi.mock('@/config');
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        data: (body: any, init?: ResponseInit) => Response.json(body, init),
    };
});

describe('action.cart-bundle-add', () => {
    const mockBasket = {
        basketId: 'test-basket-123',
        productItems: [],
    };

    const mockUpdatedBasket = {
        basketId: 'test-basket-123',
        productItems: [
            {
                productId: 'bundle-123',
                quantity: 1,
                bundledProductItems: [
                    { itemId: 'item-1', productId: 'standard-product-1', quantity: 1 },
                    { itemId: 'item-2', productId: 'variant-product-1', quantity: 2 },
                ],
            },
        ],
    };

    const mockConfig = {
        commerce: {
            api: {
                organizationId: 'test-org',
                siteId: 'test-site',
            },
        },
    };

    const mockClients = {
        shopperBasketsV2: {
            addItemToBasket: vi.fn(),
            updateItemsInBasket: vi.fn(),
            getBasket: vi.fn(),
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getBasket).mockReturnValue(mockBasket);
        vi.mocked(createApiClients).mockReturnValue(mockClients as any);
        vi.mocked(getConfig).mockReturnValue(mockConfig as any);
    });

    describe('clientAction', () => {
        test('adds bundle with standard products to cart', async () => {
            const bundleItem = { productId: 'bundle-123', quantity: 1 };
            const childSelections = [
                {
                    product: { id: 'standard-product-1' } as ShopperProducts.schemas['Product'],
                    quantity: 1,
                },
                {
                    product: { id: 'standard-product-2' } as ShopperProducts.schemas['Product'],
                    quantity: 1,
                },
            ];

            mockClients.shopperBasketsV2.addItemToBasket.mockResolvedValue({ data: mockUpdatedBasket });
            mockClients.shopperBasketsV2.updateItemsInBasket.mockResolvedValue({ data: mockUpdatedBasket });
            mockClients.shopperBasketsV2.getBasket.mockResolvedValue({ data: mockUpdatedBasket });

            const formData = new FormData();
            formData.append('bundleItem', JSON.stringify(bundleItem));
            formData.append('childSelections', JSON.stringify(childSelections));

            const request = new Request('http://localhost/action/cart-bundle-add', {
                method: 'POST',
                body: formData,
            });

            const response = await clientAction({
                request,
                context: {} as any,
                params: {},
            });

            const result = await response.json();
            expect(result.success).toBe(true);
            expect(mockClients.shopperBasketsV2.addItemToBasket).toHaveBeenCalled();
        });

        test('adds bundle with variant products to cart', async () => {
            const bundleItem = { productId: 'bundle-123', quantity: 1 };
            const childSelections = [
                {
                    product: { id: 'master-product-1' } as ShopperProducts.schemas['Product'],
                    variant: { productId: 'variant-123' } as ShopperProducts.schemas['Variant'],
                    quantity: 1,
                },
                {
                    product: { id: 'master-product-2' } as ShopperProducts.schemas['Product'],
                    variant: { productId: 'variant-456' } as ShopperProducts.schemas['Variant'],
                    quantity: 2,
                },
            ];

            mockClients.shopperBasketsV2.addItemToBasket.mockResolvedValue({ data: mockUpdatedBasket });
            mockClients.shopperBasketsV2.updateItemsInBasket.mockResolvedValue({ data: mockUpdatedBasket });
            mockClients.shopperBasketsV2.getBasket.mockResolvedValue({ data: mockUpdatedBasket });

            const formData = new FormData();
            formData.append('bundleItem', JSON.stringify(bundleItem));
            formData.append('childSelections', JSON.stringify(childSelections));

            const request = new Request('http://localhost/action/cart-bundle-add', {
                method: 'POST',
                body: formData,
            });

            const response = await clientAction({
                request,
                context: {} as any,
                params: {},
            });

            const result = await response.json();
            expect(result.success).toBe(true);
        });

        test('adds bundle with mix of standard and variant products', async () => {
            const bundleItem = { productId: 'bundle-123', quantity: 2 };
            const childSelections = [
                {
                    product: { id: 'standard-product-1' } as ShopperProducts.schemas['Product'],
                    quantity: 1,
                },
                {
                    product: { id: 'master-product-1' } as ShopperProducts.schemas['Product'],
                    variant: { productId: 'variant-123' } as ShopperProducts.schemas['Variant'],
                    quantity: 2,
                },
            ];

            mockClients.shopperBasketsV2.addItemToBasket.mockResolvedValue({ data: mockUpdatedBasket });
            mockClients.shopperBasketsV2.updateItemsInBasket.mockResolvedValue({ data: mockUpdatedBasket });
            mockClients.shopperBasketsV2.getBasket.mockResolvedValue({ data: mockUpdatedBasket });

            const formData = new FormData();
            formData.append('bundleItem', JSON.stringify(bundleItem));
            formData.append('childSelections', JSON.stringify(childSelections));

            const request = new Request('http://localhost/action/cart-bundle-add', {
                method: 'POST',
                body: formData,
            });

            const response = await clientAction({
                request,
                context: {} as any,
                params: {},
            });

            const result = await response.json();
            expect(result.success).toBe(true);
            // The server action extracts productId and quantity from ProductSelectionValues
            expect(mockClients.shopperBasketsV2.addItemToBasket).toHaveBeenCalledWith({
                params: {
                    path: { basketId: 'test-basket-123' },
                },
                body: [
                    {
                        productId: 'bundle-123',
                        quantity: 2,
                        inventoryId: undefined,
                        bundledProductItems: [
                            { productId: 'standard-product-1', quantity: 1 },
                            { productId: 'variant-123', quantity: 2 },
                        ],
                    },
                ],
            });
        });

        test('returns error when bundle data is missing', async () => {
            const formData = new FormData();

            const request = new Request('http://localhost/action/cart-bundle-add', {
                method: 'POST',
                body: formData,
            });

            const response = await clientAction({
                request,
                context: {} as any,
                params: {},
            });

            const result = await response.json();
            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('returns error for non-POST requests', async () => {
            const request = new Request('http://localhost/action/cart-bundle-add', {
                method: 'GET',
            });

            await expect(
                clientAction({
                    request,
                    context: {} as any,
                    params: {},
                })
            ).rejects.toThrow();
        });
    });
});
