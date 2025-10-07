/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

// Components
import QuantityPicker from './quantity-picker';

// Mock the useQuantityPicker hook
vi.mock('@/hooks/use-quantity-picker', () => ({
    useQuantityPicker: vi.fn(),
}));

const mockUseQuantityPicker = vi.mocked(await import('@/hooks/use-quantity-picker')).useQuantityPicker;

const defaultProps = {
    value: '2',
    onChange: vi.fn(),
    min: 0,
    productName: 'Test Product',
};

describe('QuantityPicker', () => {
    beforeEach(() => {
        vi.clearAllMocks();

        // Default mock implementation
        mockUseQuantityPicker.mockReturnValue({
            inputValue: '2',
            inputRef: { current: null },
            isDecrementDisabled: false,
            isFocused: false,
            handleIncrement: vi.fn(),
            handleDecrement: vi.fn(),
            handleInputChange: vi.fn(),
            handleInputFocus: vi.fn(),
            handleInputBlur: vi.fn(),
            handleKeyDown: vi.fn(),
        });
    });

    describe('Basic Rendering', () => {
        test('should render quantity picker with all elements', () => {
            render(<QuantityPicker {...defaultProps} />);

            expect(screen.getByTestId('quantity-decrement')).toBeInTheDocument();
            expect(screen.getByTestId('quantity-increment')).toBeInTheDocument();
            expect(screen.getByDisplayValue('2')).toBeInTheDocument();
        });

        test('should pass correct props to useQuantityPicker hook', () => {
            render(<QuantityPicker {...defaultProps} />);

            expect(mockUseQuantityPicker).toHaveBeenCalledWith({
                value: '2',
                onChange: defaultProps.onChange,
                onBlur: undefined,
                min: 0,
            });
        });

        test('should pass onBlur when provided', () => {
            const onBlur = vi.fn();
            render(<QuantityPicker {...defaultProps} onBlur={onBlur} />);

            expect(mockUseQuantityPicker).toHaveBeenCalledWith({
                value: '2',
                onChange: defaultProps.onChange,
                onBlur,
                min: 0,
            });
        });

        test('should use default min value when not provided', () => {
            render(<QuantityPicker value="2" onChange={vi.fn()} />);

            expect(mockUseQuantityPicker).toHaveBeenCalledWith({
                value: '2',
                onChange: expect.any(Function),
                onBlur: undefined,
                min: 0,
            });
        });
    });

    describe('Button Functionality', () => {
        test('should call handleDecrement when decrement button is clicked', async () => {
            const mockHandleDecrement = vi.fn();
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '2',
                inputRef: { current: null },
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: mockHandleDecrement,
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker {...defaultProps} />);

            await userEvent.click(screen.getByTestId('quantity-decrement'));
            expect(mockHandleDecrement).toHaveBeenCalledTimes(1);
        });

        test('should call handleIncrement when increment button is clicked', async () => {
            const mockHandleIncrement = vi.fn();
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '2',
                inputRef: { current: null },
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: mockHandleIncrement,
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker {...defaultProps} />);

            await userEvent.click(screen.getByTestId('quantity-increment'));
            expect(mockHandleIncrement).toHaveBeenCalledTimes(1);
        });

        test('should disable decrement button when isDecrementDisabled is true', () => {
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '2',
                inputRef: { current: null },
                isDecrementDisabled: true,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker {...defaultProps} />);

            const decrementButton = screen.getByTestId('quantity-decrement');
            expect(decrementButton).toBeDisabled();
        });

        test('should not disable increment button', () => {
            render(<QuantityPicker {...defaultProps} />);

            const incrementButton = screen.getByTestId('quantity-increment');
            expect(incrementButton).not.toBeDisabled();
        });
    });

    describe('Input Functionality', () => {
        test('should display input value from hook', () => {
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '5',
                inputRef: { current: null },
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker {...defaultProps} />);

            expect(screen.getByDisplayValue('5')).toBeInTheDocument();
        });

        test('should call handleInputChange when input value changes', async () => {
            const mockHandleInputChange = vi.fn();
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '2',
                inputRef: { current: null },
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: mockHandleInputChange,
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker {...defaultProps} />);

            const input = screen.getByDisplayValue('2');
            await userEvent.type(input, '3');

            expect(mockHandleInputChange).toHaveBeenCalled();
        });

        test('should call handleInputFocus when input is focused', async () => {
            const mockHandleInputFocus = vi.fn();
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '2',
                inputRef: { current: null },
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: mockHandleInputFocus,
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker {...defaultProps} />);

            const input = screen.getByDisplayValue('2');
            await userEvent.click(input);

            expect(mockHandleInputFocus).toHaveBeenCalled();
        });

        test('should call handleInputBlur when input loses focus', async () => {
            const mockHandleInputBlur = vi.fn();
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '2',
                inputRef: { current: null },
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: mockHandleInputBlur,
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker {...defaultProps} />);

            const input = screen.getByDisplayValue('2');
            await userEvent.click(input);
            await userEvent.tab();

            expect(mockHandleInputBlur).toHaveBeenCalled();
        });

        test('should call handleKeyDown when key is pressed', async () => {
            const mockHandleKeyDown = vi.fn();
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '2',
                inputRef: { current: null },
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: mockHandleKeyDown,
            });

            render(<QuantityPicker {...defaultProps} />);

            const input = screen.getByDisplayValue('2');
            await userEvent.type(input, '{enter}');

            expect(mockHandleKeyDown).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        test('should have correct aria-labels for buttons', () => {
            render(<QuantityPicker {...defaultProps} />);

            const decrementButton = screen.getByTestId('quantity-decrement');
            const incrementButton = screen.getByTestId('quantity-increment');

            expect(decrementButton).toHaveAttribute('aria-label', 'Decrement Quantity for Test Product');
            expect(incrementButton).toHaveAttribute('aria-label', 'Increment Quantity for Test Product');
        });

        test('should use default product name when not provided', () => {
            render(<QuantityPicker value="2" onChange={vi.fn()} />);

            const decrementButton = screen.getByTestId('quantity-decrement');
            const incrementButton = screen.getByTestId('quantity-increment');

            expect(decrementButton).toHaveAttribute('aria-label', 'Decrement Quantity for the product');
            expect(incrementButton).toHaveAttribute('aria-label', 'Increment Quantity for the product');
        });

        test('should have correct aria-label for input', () => {
            render(<QuantityPicker {...defaultProps} />);

            const input = screen.getByDisplayValue('2');
            expect(input).toHaveAttribute('aria-label', 'Quantity:');
        });

        test('should have correct input attributes', () => {
            render(<QuantityPicker {...defaultProps} min={1} />);

            const input = screen.getByDisplayValue('2');
            expect(input).toHaveAttribute('type', 'number');
            expect(input).toHaveAttribute('min', '1');
            expect(input).toHaveAttribute('step', '1');
        });
    });

    describe('Button Content', () => {
        test('should display correct symbols in buttons', () => {
            render(<QuantityPicker {...defaultProps} />);

            const decrementButton = screen.getByTestId('quantity-decrement');
            const incrementButton = screen.getByTestId('quantity-increment');

            expect(decrementButton).toHaveTextContent('−');
            expect(incrementButton).toHaveTextContent('+');
        });
    });

    describe('Edge Cases', () => {
        test('should handle string value', () => {
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '',
                inputRef: { current: null },
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker value="" onChange={vi.fn()} />);

            expect(screen.getByDisplayValue('')).toBeInTheDocument();
        });

        test('should handle zero value', () => {
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '0',
                inputRef: { current: null },
                isDecrementDisabled: true,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker value="0" onChange={vi.fn()} min={0} />);

            expect(screen.getByDisplayValue('0')).toBeInTheDocument();
            expect(screen.getByTestId('quantity-decrement')).toBeDisabled();
        });

        test('should handle negative min value', () => {
            render(<QuantityPicker value="2" onChange={vi.fn()} min={-5} />);

            expect(mockUseQuantityPicker).toHaveBeenCalledWith({
                value: '2',
                onChange: expect.any(Function),
                onBlur: undefined,
                min: -5,
            });
        });

        test('should handle large values', () => {
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '999999',
                inputRef: { current: null },
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker value="999999" onChange={vi.fn()} />);

            expect(screen.getByDisplayValue('999999')).toBeInTheDocument();
        });
    });

    describe('Ref Handling', () => {
        test('should pass inputRef to input element', () => {
            const mockRef = { current: null };
            mockUseQuantityPicker.mockReturnValue({
                inputValue: '2',
                inputRef: mockRef,
                isDecrementDisabled: false,
                isFocused: false,
                handleIncrement: vi.fn(),
                handleDecrement: vi.fn(),
                handleInputChange: vi.fn(),
                handleInputFocus: vi.fn(),
                handleInputBlur: vi.fn(),
                handleKeyDown: vi.fn(),
            });

            render(<QuantityPicker {...defaultProps} />);

            const input = screen.getByDisplayValue('2');
            expect(input).toBeInTheDocument();
            // Note: We can't directly test ref assignment in jsdom, but we can verify the component renders
        });
    });
});
