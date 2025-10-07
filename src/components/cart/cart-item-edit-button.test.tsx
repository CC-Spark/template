// Testing libraries
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Components
import { CartItemEditButton } from './cart-item-edit-button';

// Utils
import uiStrings from '@/temp-ui-string';

describe('CartItemEditButton', () => {
    const mockProduct = {
        itemId: 'test-item-123',
        productId: 'test-product-456',
        name: 'Test Product',
        quantity: 2,
        price: 29.99,
        image: {
            alt: 'Test Product Image',
            src: 'test-image.jpg',
        },
    };

    const defaultProps = {
        product: mockProduct,
    };

    test('renders edit button with correct text and attributes', () => {
        render(<CartItemEditButton {...defaultProps} />);

        const editButton = screen.getByTestId('edit-item-test-item-123');
        expect(editButton).toHaveTextContent(uiStrings.actionCard.edit);
        expect(editButton).toHaveAttribute('title', uiStrings.actionCard.edit);
    });

    test('applies custom className to button', () => {
        const customClassName = 'custom-edit-button';
        render(<CartItemEditButton {...defaultProps} className={customClassName} />);

        const editButton = screen.getByTestId('edit-item-test-item-123');
        expect(editButton).toHaveClass(customClassName);
    });

    test('uses default empty className when not provided', () => {
        render(<CartItemEditButton {...defaultProps} />);

        // When className is not provided, it defaults to empty string
        // We can verify the button renders by getting it by testId
        screen.getByTestId('edit-item-test-item-123');
    });

    test('initially renders modal as closed', () => {
        render(<CartItemEditButton {...defaultProps} />);

        // Modal should not be visible initially
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText(uiStrings.editItem.title)).not.toBeInTheDocument();
    });

    test('opens modal when edit button is clicked', () => {
        render(<CartItemEditButton {...defaultProps} />);

        const editButton = screen.getByTestId('edit-item-test-item-123');
        fireEvent.click(editButton);

        // Modal should be visible after clicking edit button
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(uiStrings.editItem.title)).toBeInTheDocument();
    });

    test('passes correct product data to ProductViewModal', () => {
        render(<CartItemEditButton {...defaultProps} />);

        const editButton = screen.getByTestId('edit-item-test-item-123');
        fireEvent.click(editButton);

        // Verify product name is displayed in the modal
        expect(screen.getByText(mockProduct.name)).toBeInTheDocument();
    });

    test('closes modal when close button is clicked', () => {
        render(<CartItemEditButton {...defaultProps} />);

        // Open modal first
        const editButton = screen.getByTestId('edit-item-test-item-123');
        fireEvent.click(editButton);

        // Verify modal is open
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        // Close modal using the close button (X button)
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        // Modal should be closed
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('handles multiple open/close cycles correctly', () => {
        render(<CartItemEditButton {...defaultProps} />);

        const editButton = screen.getByTestId('edit-item-test-item-123');

        // First cycle
        fireEvent.click(editButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        let closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

        // Second cycle
        fireEvent.click(editButton);
        expect(screen.getByRole('dialog')).toBeInTheDocument();

        // Get fresh reference to close button
        closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
});
