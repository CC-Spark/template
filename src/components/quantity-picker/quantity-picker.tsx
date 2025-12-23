/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

// React
import { type ReactElement } from 'react';

// Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// Hooks
import { useQuantityPicker } from '@/hooks/use-quantity-picker';

// Utils
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

// Constants

interface QuantityPickerProps {
    /** Current quantity value as string */
    value: string;
    /** Callback when quantity changes */
    onChange: (stringValue: string, numberValue: number) => void;
    /** Callback when input loses focus */
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    /** Minimum quantity allowed */
    min?: number;
    /** Maximum quantity allowed (for bonus products, etc.) */
    max?: number;
    /** Product name for accessibility */
    productName?: string;
    /** Whether the picker is disabled */
    disabled?: boolean;
}

/**
 * QuantityPicker - A shadcn/ui implementation based on Chakra UI's NumberInput
 *
 * This component provides a mobile-first quantity selector with:
 * - Increment/decrement buttons
 * - Direct input field
 * - Keyboard navigation support
 * - Accessibility features
 * - Focus management
 * - Auto-correction of invalid values on blur (when no custom onBlur handler is provided)
 */
export default function QuantityPicker({
    value,
    onChange,
    onBlur,
    min = 0,
    max,
    productName,
    disabled = false,
}: QuantityPickerProps): ReactElement {
    const { t: tQuantity } = useTranslation('quantitySelector');
    const { t: tCommon } = useTranslation('common');

    const {
        inputValue,
        inputRef,
        isDecrementDisabled,
        isIncrementDisabled,
        handleIncrement,
        handleDecrement,
        handleInputChange,
        handleInputFocus,
        handleInputBlur,
        handleKeyDown,
    } = useQuantityPicker({
        value,
        onChange,
        onBlur,
        min,
        max,
    });

    return (
        <div className="flex items-center space-x-1">
            {/* Decrement Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={disabled || isDecrementDisabled}
                className="h-8 w-8 p-0"
                aria-label={tQuantity('decreaseQuantityForProduct', { productName: productName || tCommon('product') })}
                data-testid="quantity-decrement">
                <span className="text-sm">−</span>
            </Button>

            {/* Input Field */}
            <Input
                ref={inputRef}
                type="number"
                min={min}
                max={max}
                step={1}
                value={inputValue}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                className={cn(
                    'h-8 w-11 text-center text-sm',
                    '[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none'
                )}
                aria-label={tQuantity('quantity')}
            />

            {/* Increment Button */}
            <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={disabled || isIncrementDisabled}
                className="h-8 w-8 p-0"
                aria-label={tQuantity('increaseQuantityForProduct', { productName: productName || tCommon('product') })}
                data-testid="quantity-increment">
                <span className="text-sm">+</span>
            </Button>
        </div>
    );
}
