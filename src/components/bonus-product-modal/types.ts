/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export interface BonusDiscountSlot {
    id: string;
    maxBonusItems: number;
    bonusProductsSelected?: number;
}

export interface BonusProductModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    productId: string;
    productName: string;
    promotionId: string;
    bonusDiscountLineItemId: string;
    bonusDiscountSlots: BonusDiscountSlot[];
    maxQuantity: number;
}
