/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

// React
import { type ReactElement, useCallback, useState } from 'react';

// Components
import QuantityPicker from '@/components/quantity-picker/quantity-picker';
import { Typography } from '@/components/typography';
import { Label } from '@/components/ui/label';

// Utils
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ProductQuantityPickerProps {
    /** Current quantity value as string */
    value: string;
    /** Callback when quantity changes */
    onChange: (quantity: number) => void;
    /** Custom className for styling */
    className?: string;
    /** Stock level for displaying stock message */
    stockLevel?: number;
    /** Whether the product is out of stock */
    isOutOfStock?: boolean;
    /** Product name for inventory messages */
    productName?: string;
    /** Whether the picker is disabled */
    disabled?: boolean;
    /** Whether this is a bundle product */
    isBundle?: boolean;
    /** Maximum quantity allowed (for bonus products, etc.) */
    maxQuantity?: number;
}

/**
 * Product-specific quantity picker wrapper
 *
 * This component wraps the base QuantityPicker with product-specific logic:
 * - No API integration (simple state management)
 * - Stock level warnings and validation
 * - Product context for error messages
 * - Optimized for product page usage
 */
export default function ProductQuantityPicker({
    value,
    onChange,
    className,
    stockLevel,
    isOutOfStock,
    productName,
    disabled = false,
    isBundle = false,
    maxQuantity,
}: ProductQuantityPickerProps): ReactElement {
    const [quantity, setQuantity] = useState<string>(value);
    const { t: tQuantity } = useTranslation('quantitySelector');
    const { t: tProduct } = useTranslation('product');
    const { t: tCommon } = useTranslation('common');

    // Handle quantity change - let QuantityPicker handle validation with min=1
    const handleQuantityChange = useCallback(
        (stringValue: string, numberValue: number) => {
            if (numberValue >= 0) {
                onChange(numberValue);
                setQuantity(stringValue);
            }
        },
        [onChange]
    );

    // Generate inventory message based on stock status
    const getInventoryMessage = () => {
        // Priority 1: Out of stock message
        if (isOutOfStock) {
            return tProduct('outOfStock', { productName: productName || tCommon('product') });
        }

        // Priority 2: Check if stockLevel < quantity
        const currentQuantity = parseInt(quantity, 10) || 0;
        if (stockLevel !== undefined && stockLevel > 0 && stockLevel < currentQuantity) {
            if (isBundle) {
                return tQuantity('onlyLeftForProduct', {
                    stockLevel: stockLevel.toString(),
                    productName: productName || tCommon('product'),
                });
            } else {
                return tQuantity('onlyLeft', { stockLevel: stockLevel.toString() });
            }
        }

        return null;
    };

    const inventoryMessage = getInventoryMessage();

    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor="quantity" className="text-foreground">
                {tQuantity('quantity')}
            </Label>
            <QuantityPicker
                value={quantity}
                min={1}
                max={maxQuantity}
                onChange={handleQuantityChange}
                productName={productName}
                disabled={disabled}
            />
            {/* Inventory message */}
            {inventoryMessage && (
                <Typography variant="small" className="text-destructive font-medium" role="alert" aria-live="polite">
                    {inventoryMessage}
                </Typography>
            )}
        </div>
    );
}
