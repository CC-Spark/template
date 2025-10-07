// Testing libraries
import { describe, test, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Components
import { ProductViewModal } from './index';

// Utils
import uiStrings from '@/temp-ui-string';

// Types
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';

describe('ProductViewModal', () => {
    // TODO: Replace with mock product fixture W-19720073
    const mockProduct: ShopperProductsTypes.Product = {
        id: 'test-product-123',
        name: 'Test Product Name',
    } as ShopperProductsTypes.Product;

    const defaultProps = {
        open: true,
        onOpenChange: vi.fn(),
        product: mockProduct,
    };

    test('renders modal when open is true', () => {
        render(<ProductViewModal {...defaultProps} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(uiStrings.editItem.title)).toBeInTheDocument();
    });

    test('does not render modal when open is false', () => {
        render(<ProductViewModal {...defaultProps} open={false} />);

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.queryByText(uiStrings.editItem.title)).not.toBeInTheDocument();
    });

    test('displays product name in modal content', () => {
        render(<ProductViewModal {...defaultProps} />);

        expect(screen.getByText(mockProduct.name as string)).toBeInTheDocument();
    });

    test('calls onOpenChange when modal is closed', () => {
        const mockOnOpenChange = vi.fn();
        render(<ProductViewModal {...defaultProps} onOpenChange={mockOnOpenChange} />);

        // Find and click the close button
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    test('displays correct dialog title', () => {
        render(<ProductViewModal {...defaultProps} />);

        expect(screen.getByText(uiStrings.editItem.title)).toBeInTheDocument();
    });

    test('maintains accessibility with proper ARIA attributes', () => {
        render(<ProductViewModal {...defaultProps} />);

        const dialog = screen.getByRole('dialog');
        expect(dialog).toBeInTheDocument();

        // Check for dialog title
        const title = screen.getByText(uiStrings.editItem.title);
        expect(title).toBeInTheDocument();
    });
});
