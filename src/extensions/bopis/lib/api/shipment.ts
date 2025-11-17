/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { RouterContextProvider } from 'react-router';
import type { ShopperBasketsV2 } from '@salesforce/storefront-next-runtime/scapi';
import { createApiClients } from '@/lib/api-clients';
import { getConfig } from '@/config';

/**
 * Update shipment custom attributes for pickup
 * Sets c_fromStoreId and c_isStorePickup on the shipment
 *
 * @param context - Router context
 * @param basketId - Basket ID
 * @param shipmentId - Shipment ID (defaults to 'me')
 * @param storeId - Store ID for pickup
 * @returns Updated basket
 */
export async function updateShipmentForPickup(
    context: Readonly<RouterContextProvider>,
    basketId: string,
    shipmentId: string = 'me',
    storeId: string
): Promise<ShopperBasketsV2.schemas['Basket']> {
    const config = getConfig(context);
    const clients = createApiClients(context);

    // Update shipment with custom attributes
    const { data: updatedBasket } = await clients.shopperBasketsV2.updateShipmentForBasket({
        params: {
            path: {
                organizationId: config.commerce.api.organizationId,
                basketId,
                shipmentId,
            },
            query: {
                siteId: config.commerce.api.siteId,
            },
        },
        body: {
            shipmentId,
            c_fromStoreId: storeId,
        },
    });

    return updatedBasket;
}
