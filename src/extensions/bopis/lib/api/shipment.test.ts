/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { describe, test, expect, vi, beforeEach } from 'vitest';
import { updateShipmentForPickup } from './shipment';
import type { ShopperBasketsV2 } from '@salesforce/storefront-next-runtime/scapi';
import type { RouterContextProvider } from 'react-router';

// Mock createApiClients and getConfig
vi.mock('@/lib/api-clients', () => ({
    createApiClients: vi.fn(),
}));

vi.mock('@/config', () => ({
    getConfig: vi.fn(),
}));

describe('Shipment API utilities', () => {
    const mockContext = {
        get: vi.fn(),
        set: vi.fn(),
    } as unknown as RouterContextProvider;

    const mockConfig = {
        commerce: {
            api: {
                organizationId: 'test-org',
                siteId: 'test-site',
            },
        },
    };

    describe('updateShipmentForPickup', () => {
        beforeEach(async () => {
            vi.clearAllMocks();
            const { getConfig } = await import('@/config');
            vi.mocked(getConfig).mockReturnValue(mockConfig as any);
        });

        test('should update shipment with c_fromStoreId', async () => {
            const mockBasket: Partial<ShopperBasketsV2.schemas['Basket']> = {
                basketId: 'test-basket',
                shipments: [
                    {
                        shipmentId: 'me',
                        c_fromStoreId: 'store-123',
                    },
                ],
            };

            const mockUpdateShipmentForBasket = vi.fn().mockResolvedValue({ data: mockBasket });

            const { createApiClients } = await import('@/lib/api-clients');
            vi.mocked(createApiClients).mockReturnValue({
                shopperBasketsV2: {
                    updateShipmentForBasket: mockUpdateShipmentForBasket,
                },
            } as any);

            const result = await updateShipmentForPickup(mockContext, 'test-basket', 'me', 'store-123');

            expect(mockUpdateShipmentForBasket).toHaveBeenCalledWith({
                params: {
                    path: {
                        organizationId: 'test-org',
                        basketId: 'test-basket',
                        shipmentId: 'me',
                    },
                    query: {
                        siteId: 'test-site',
                    },
                },
                body: {
                    shipmentId: 'me',
                    c_fromStoreId: 'store-123',
                },
            });
            expect(result).toEqual(mockBasket);
        });

        test('should use default shipmentId "me"', async () => {
            const mockBasket: Partial<ShopperBasketsV2.schemas['Basket']> = {
                basketId: 'test-basket',
            };

            const mockUpdateShipmentForBasket = vi.fn().mockResolvedValue({ data: mockBasket });

            const { createApiClients } = await import('@/lib/api-clients');
            vi.mocked(createApiClients).mockReturnValue({
                shopperBasketsV2: {
                    updateShipmentForBasket: mockUpdateShipmentForBasket,
                },
            } as any);

            await updateShipmentForPickup(mockContext, 'test-basket', undefined, 'store-456');

            expect(mockUpdateShipmentForBasket).toHaveBeenCalledWith({
                params: {
                    path: {
                        organizationId: 'test-org',
                        basketId: 'test-basket',
                        shipmentId: 'me',
                    },
                    query: {
                        siteId: 'test-site',
                    },
                },
                body: {
                    shipmentId: 'me',
                    c_fromStoreId: 'store-456',
                },
            });
        });

        test('should handle API errors', async () => {
            const mockError = new Error('API Error');
            const mockUpdateShipmentForBasket = vi.fn().mockRejectedValue(mockError);

            const { createApiClients } = await import('@/lib/api-clients');
            vi.mocked(createApiClients).mockReturnValue({
                shopperBasketsV2: {
                    updateShipmentForBasket: mockUpdateShipmentForBasket,
                },
            } as any);

            await expect(updateShipmentForPickup(mockContext, 'test-basket', 'me', 'store-123')).rejects.toThrow(
                'API Error'
            );
        });
    });
});
