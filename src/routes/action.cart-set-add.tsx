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
import { data, type ActionFunctionArgs } from 'react-router';
import { ApiError, type ShopperBasketsV2 } from '@salesforce/storefront-next-runtime/scapi';
import { getBasket, updateBasket } from '@/middlewares/basket.client';
import { extractResponseError } from '@/lib/utils';
import { createApiClients } from '@/lib/api-clients';
// @sfdc-extension-line SFDC_EXT_BOPIS
import { syncShipmentWithDeliveryOptionChange } from '@/extensions/bopis/lib/basket-utils';
import { getTranslation } from '@/lib/i18next';

async function addMultipleItemsToCart(
    context: ActionFunctionArgs['context'],
    productItems: Array<
        Pick<ShopperBasketsV2.schemas['ProductItem'], 'productId' | 'quantity' | 'inventoryId'> & {
            storeId?: string | null;
        }
    >
): Promise<{
    success: boolean;
    basket?: ShopperBasketsV2.schemas['Basket'];
    error?: string;
}> {
    const { t } = getTranslation();
    const basket = getBasket(context);
    const basketId = basket?.basketId;

    if (!basketId) {
        // This state should never happen as it would indicate that the basket middleware is broken
        return {
            success: false,
            error: t('errors:noBasketFound'),
        };
    }

    try {
        // Add all items to basket in a single API call
        const clients = createApiClients(context);
        const { data: updatedBasket } = await clients.shopperBasketsV2.addItemToBasket({
            params: {
                path: { basketId },
            },
            body: productItems.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                inventoryId: item.inventoryId,
            })),
        });

        let finalBasket = updatedBasket;

        // @sfdc-extension-block-start SFDC_EXT_BOPIS
        // Find the first item with both storeId and inventoryId (pickup item)
        const pickupItem = productItems.find((item) => item.storeId && item.inventoryId);

        // Update shipment with store information based on selected delivery option
        finalBasket = await syncShipmentWithDeliveryOptionChange(context, finalBasket, pickupItem);
        // @sfdc-extension-block-end SFDC_EXT_BOPIS

        // Update the basket storage
        updateBasket(context, finalBasket);

        return {
            success: true,
            basket: finalBasket,
        };
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                success: false,
                error: error.body?.detail || error.statusText,
            };
        }
        const { responseMessage } = await extractResponseError(error);
        return {
            success: false,
            error: responseMessage,
        };
    }
}

/**
 * Client action to add multiple items to the cart (for product sets).
 */
// eslint-disable-next-line custom/no-client-actions
export async function clientAction({ request, context }: ActionFunctionArgs) {
    const { t } = getTranslation();

    if (request.method !== 'POST') {
        throw new Response(t('product:methodNotAllowed'), { status: 405 });
    }

    try {
        const formData = await request.formData();
        const productItemsJson = formData.get('productItems') as string;

        if (!productItemsJson) {
            throw new Error(t('product:productItemsRequired'));
        }

        const productItems = JSON.parse(productItemsJson);
        const result = await addMultipleItemsToCart(context, productItems);

        return Response.json(result);
    } catch (error) {
        const { responseMessage, status_code } = await extractResponseError(error);
        return data(
            {
                success: false,
                error: responseMessage,
            },
            { status: Number(status_code) }
        );
    }
}
