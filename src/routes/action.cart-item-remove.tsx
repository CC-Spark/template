/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type { ClientActionFunctionArgs } from 'react-router';
import { ApiError, type ShopperBasketsV2 } from '@salesforce/storefront-next-runtime/scapi';
import { getBasket, updateBasket } from '@/middlewares/basket.client';
import { extractResponseError } from '@/lib/utils';
import { createApiClients } from '@/lib/api-clients';
import { getTranslation } from '@/lib/i18next';

/**
 * Client action for removing an item from the shopping cart
 *
 * This action handles the removal of a specific item from the user's shopping basket.
 * It performs the following operations:
 * - Validates the request method (POST only)
 * - Extracts the itemId from form data
 * - Validates required parameters (itemId and basketId)
 * - Calls the Commerce Cloud API to remove the item
 * - Returns success/error response with appropriate messaging
 *
 * The action integrates with:
 * - Auth and basket middlewares for session and basket management
 * - Shopper Baskets API for cart operations
 * - Error handling utilities for consistent error responses
 *
 * Used by cart components for item removal functionality (see cart-content.tsx for usage example)
 *
 * @returns Promise resolving to success/error response object
 * @returns success - Boolean indicating if the operation was successful
 * @returns basket - Updated basket object (on success)
 * @returns error - Error message string (on failure)
 *
 * @throws Response with 405 status if request method is not POST
 * @throws Error if item ID is missing or invalid
 * @throws Error if no basket is found in the session
 *
 * @example
 * ```tsx
 * // Form submission will trigger this action
 * <form method="POST" action="/action/remove-cart-item">
 *   <input name="itemId" value="item-123" />
 *   <button type="submit">Remove Item</button>
 * </form>
 * ```
 */
export async function clientAction({ request, context }: ClientActionFunctionArgs): Promise<{
    success: boolean;
    basket?: ShopperBasketsV2.schemas['Basket'];
    error?: string;
}> {
    const { t } = getTranslation();

    if (request.method !== 'POST') {
        throw new Response(t('errors:methodNotAllowed'), { status: 405 });
    }

    const { basketId } = getBasket(context);
    if (!basketId) {
        return {
            success: false,
            error: t('errors:noBasketFound'),
        };
    }

    try {
        const formData = await request.formData();
        const itemId = formData.get('itemId') as string;
        if (!itemId) {
            return {
                success: false,
                error: t('cart:itemIdRequired'),
            };
        }

        const clients = createApiClients(context);
        const { data: updatedBasket } = await clients.shopperBasketsV2.removeItemFromBasket({
            params: {
                path: {
                    basketId,
                    itemId,
                },
            },
        });

        // Update the basket cache to reflect the changes
        updateBasket(context, updatedBasket);

        return { success: true, basket: updatedBasket };
    } catch (error) {
        if (error instanceof ApiError) {
            return {
                success: false,
                error: error.body?.detail || error.statusText,
            };
        }
        const { responseMessage } = await extractResponseError(error as Error);
        return {
            success: false,
            error: responseMessage,
        };
    }
}
