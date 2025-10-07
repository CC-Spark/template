/**
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import type { ShopperBasketsTypes } from 'commerce-sdk-isomorphic';

// Generic response types for actions
export interface ActionResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

// Specific response types for common actions
export interface BasketActionResponse extends ActionResponse {
    basket?: ShopperBasketsTypes.Basket;
}

// Utility functions for creating standardized responses
export const createSuccessResponse = <T>(data: T): ActionResponse<T> => ({
    success: true,
    data,
});

export const createErrorResponse = (error: string): ActionResponse => ({
    success: false,
    error,
});

export const createBasketSuccessResponse = (basket: ShopperBasketsTypes.Basket): BasketActionResponse => ({
    success: true,
    basket,
});

export const createBasketErrorResponse = (error: string): BasketActionResponse => ({
    success: false,
    error,
});
