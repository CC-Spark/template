/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

// React
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from 'react';

interface UseQuantityPickerProps {
    /** Current quantity value as string */
    value: string;
    /** Callback when quantity changes */
    onChange: (stringValue: string, numberValue: number) => void;
    /** Callback when input loses focus */
    onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
    /** Minimum quantity allowed */
    min?: number;
}

interface UseQuantityPickerReturn {
    /** Current input value as string */
    inputValue: string;
    /** Whether the input is currently focused */
    isFocused: boolean;
    /** Reference to the input element */
    inputRef: RefObject<HTMLInputElement | null>;
    /** Whether the decrement button should be disabled */
    isDecrementDisabled: boolean;
    /** Handle increment button click */
    handleIncrement: () => void;
    /** Handle decrement button click */
    handleDecrement: () => void;
    /** Handle input value change */
    handleInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    /** Handle input focus */
    handleInputFocus: (event: React.FocusEvent<HTMLInputElement>) => void;
    /** Handle input blur */
    handleInputBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
    /** Handle keyboard navigation and input filtering */
    handleKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

/**
 * Custom hook for managing quantity picker input behavior and state.
 *
 * This hook provides:
 * - Input value synchronization with external value prop
 * - Increment/decrement logic with minimum value constraints
 * - Input validation (integers only)
 * - Focus management and text selection
 * - Keyboard navigation support
 * - Auto-correction of invalid values on blur (only when no custom onBlur handler is provided)
 *
 * @param props - Hook configuration
 * @returns Object containing state and handlers for quantity picker
 *
 * @example
 * ```tsx
 * const {
 *   inputValue,
 *   isFocused,
 *   inputRef,
 *   isDecrementDisabled,
 *   handleIncrement,
 *   handleDecrement,
 *   handleInputChange,
 *   handleInputFocus,
 *   handleInputBlur,
 *   handleKeyDown
 * } = useQuantityPicker({
 *   value: 2,
 *   onChange: (stringValue, numberValue) => console.log(stringValue, numberValue),
 *   min: 0
 * });
 * ```
 */
export function useQuantityPicker({
    value,
    onChange,
    onBlur,
    min = 0,
}: UseQuantityPickerProps): UseQuantityPickerReturn {
    const [inputValue, setInputValue] = useState(value);
    const [isFocused, setIsFocused] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Sync input value with prop changes
    useEffect(() => {
        if (!isFocused) {
            setInputValue(value);
        }
    }, [value, isFocused]);

    // Handle increment button
    const handleIncrement = useCallback(() => {
        const currentValue = parseInt(value, 10) || 0;
        const newValue = currentValue + 1;

        if (newValue !== currentValue) {
            // Force input value update immediately for button clicks
            setInputValue(newValue.toString());
            onChange(newValue.toString(), newValue);
        }
    }, [value, onChange]);

    // Handle decrement button
    const handleDecrement = useCallback(() => {
        const currentValue = parseInt(value, 10) || 0;
        const newValue = Math.max(currentValue - 1, min);

        if (newValue !== currentValue) {
            // Force input value update immediately for button clicks
            setInputValue(newValue.toString());
            onChange(newValue.toString(), newValue);
        }
    }, [value, min, onChange]);

    // Handle input change - only allow integers
    const handleInputChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const newValue = event.target.value;

            // Only allow digits and empty string
            if (newValue === '' || /^\d+$/.test(newValue)) {
                setInputValue(newValue);

                if (newValue === '') {
                    // Allow empty input for user to clear and type new value
                    onChange(newValue, 0);
                } else {
                    // Parse as integer
                    const numValue = parseInt(newValue, 10);
                    onChange(newValue, numValue);
                }
            }
        },
        [onChange]
    );

    // Handle input focus
    const handleInputFocus = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
        setIsFocused(true);
        // Select all text when focused (useful for mobile)
        event.target.select();
    }, []);

    // Handle input blur
    const handleInputBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);

            // Call custom onBlur handler first (if provided)
            onBlur?.(event);

            // Auto-correct invalid values to minimum only if no custom onBlur handler
            // This allows custom handlers to override the auto-correction behavior
            if (!onBlur) {
                const numValue = parseInt(inputValue, 10);
                if (isNaN(numValue) || numValue < min) {
                    // Reset to minimum if invalid or below minimum
                    const clampedValue = min;
                    setInputValue(clampedValue.toString());
                    onChange(clampedValue.toString(), clampedValue);
                }
            }
        },
        [inputValue, min, onChange, onBlur]
    );

    // Handle keyboard navigation and input filtering
    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            // Allow navigation and control keys
            const allowedKeys = [
                'Backspace',
                'Delete',
                'Tab',
                'Escape',
                'Enter',
                'ArrowLeft',
                'ArrowRight',
                'ArrowUp',
                'ArrowDown',
                'Home',
                'End',
                'PageUp',
                'PageDown',
            ];

            // Allow digits (0-9)
            const isDigit = /^[0-9]$/.test(event.key);

            // Allow Ctrl/Cmd combinations (copy, paste, select all, etc.)
            const isCtrlCmd = event.ctrlKey || event.metaKey;

            // Block non-integer characters
            if (!allowedKeys.includes(event.key) && !isDigit && !isCtrlCmd) {
                event.preventDefault();
                return;
            }

            switch (event.key) {
                case 'ArrowUp':
                    event.preventDefault();
                    handleIncrement();
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    handleDecrement();
                    break;
                case 'Enter':
                    // Allow enter to trigger increment when focused on input
                    if (event.target === inputRef.current) {
                        event.preventDefault();
                        // Trigger increment for enter on input
                        handleIncrement();
                    }
                    break;
            }
        },
        [handleIncrement, handleDecrement]
    );

    // Memoize decrement button disabled state to prevent unnecessary re-renders
    const isDecrementDisabled = useMemo(() => {
        const currentValue = parseInt(value, 10) || 0;
        return value !== '' && value !== '0' && currentValue === 1;
    }, [value]);

    return {
        inputValue,
        isFocused,
        inputRef,
        isDecrementDisabled,
        handleIncrement,
        handleDecrement,
        handleInputChange,
        handleInputFocus,
        handleInputBlur,
        handleKeyDown,
    };
}
