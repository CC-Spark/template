import type { RouterContextProvider } from 'react-router';
import type { ShopperBasketsV2 } from '@salesforce/storefront-next-runtime/scapi';
import { createApiClients } from '@/lib/api-clients';

/**
 * Get available shipping methods for a shipment using the Commerce API
 * This follows the PWA Kit pattern for fetching real shipping methods
 */
export async function getShippingMethodsForShipment(
    context: Readonly<RouterContextProvider>,
    basketId: string,
    shipmentId: string = 'me'
): Promise<ShopperBasketsV2.schemas['ShippingMethodResult']> {
    const clients = createApiClients(context);
    const { data } = await clients.shopperBasketsV2.getShippingMethodsForShipment({
        params: {
            path: {
                basketId,
                shipmentId,
            },
        },
    });
    return data;
}
