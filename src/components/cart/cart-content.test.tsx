// Testing libraries
import { describe, test, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// React Router
import { createRoutesStub } from 'react-router';

// Components
import CartContent from './cart-content';

// Utils
import uiStrings from '@/temp-ui-string';

const renderCartContent = (props: React.ComponentProps<typeof CartContent>) => {
    const Stub = createRoutesStub([
        {
            path: '/cart',
            Component: () => <CartContent {...props} />,
        },
    ]);

    return render(<Stub initialEntries={['/cart']} />);
};

describe('CartContent', () => {
    const mockBasket = {
        basketId: 'test-basket-id',
        productItems: [
            { itemId: 'item-1', quantity: 2, productId: 'product-1' },
            { itemId: 'item-2', quantity: 1, productId: 'product-2' },
        ],
    };

    const mockProductMap = {
        'item-1': { id: 'product-1', name: 'Product 1' },
        'item-2': { id: 'product-2', name: 'Product 2' },
    };

    const mockPromotionMap = {
        'promo-1': { id: 'promo-1', name: 'Promotion 1' },
    };

    test('renders empty cart for 0 product items', () => {
        // Test empty product items array
        const emptyBasket = { ...mockBasket, productItems: [] };
        renderCartContent({ basket: emptyBasket, productMap: mockProductMap });

        expect(screen.getByTestId('sf-cart-empty')).toBeInTheDocument();
        expect(screen.getByText(uiStrings.cart.empty.title)).toBeInTheDocument();
        expect(screen.getByText(uiStrings.cart.empty.guestMessage)).toBeInTheDocument();
        expect(screen.getByText(uiStrings.cart.empty.continueShopping)).toBeInTheDocument();
        expect(screen.getByText(uiStrings.cart.empty.signIn)).toBeInTheDocument();
        expect(screen.queryByTestId('sf-cart-container')).not.toBeInTheDocument();
    });

    test('renders empty cart when basket is undefined', () => {
        renderCartContent({ basket: undefined, productMap: mockProductMap });

        expect(screen.getByTestId('sf-cart-empty')).toBeInTheDocument();
        expect(screen.getByText(uiStrings.cart.empty.title)).toBeInTheDocument();
    });

    test('renders cart content with proper structure when basket has items', () => {
        renderCartContent({ basket: mockBasket, productMap: mockProductMap, promotionMap: mockPromotionMap });

        // Verify main container
        expect(screen.getByTestId('sf-cart-container')).toBeInTheDocument();
        expect(screen.queryByTestId('sf-cart-empty')).not.toBeInTheDocument();

        // Verify cart title is rendered (it's an h1 with "Cart (3 items)" text)
        expect(screen.getByText('Cart (3 items)')).toBeInTheDocument();

        // Verify product items are rendered (they have individual test IDs)
        expect(screen.getByTestId('sf-product-item-product-1')).toBeInTheDocument();
        expect(screen.getByTestId('sf-product-item-product-2')).toBeInTheDocument();
    });

    test('handles missing promotionMap prop gracefully', () => {
        renderCartContent({ basket: mockBasket, productMap: mockProductMap });

        // Verify that the cart container is still rendered even without promotionMap
        expect(screen.getByTestId('sf-cart-container')).toBeInTheDocument();

        // Verify product items are still rendered
        expect(screen.getByTestId('sf-product-item-product-1')).toBeInTheDocument();
        expect(screen.getByTestId('sf-product-item-product-2')).toBeInTheDocument();
    });

    describe('CartItemEditButton Integration', () => {
        test('renders edit buttons for each cart item', () => {
            renderCartContent({ basket: mockBasket, productMap: mockProductMap });

            // Verify edit buttons are rendered for each item
            expect(screen.getByTestId('edit-item-item-1')).toBeInTheDocument();
            expect(screen.getByTestId('edit-item-item-2')).toBeInTheDocument();

            // Verify edit buttons have correct text
            const editButtons = screen.getAllByText(uiStrings.actionCard.edit);
            expect(editButtons).toHaveLength(2);
        });

        test('applies correct className to edit buttons', () => {
            renderCartContent({ basket: mockBasket, productMap: mockProductMap });

            const editButton1 = screen.getByTestId('edit-item-item-1');
            const editButton2 = screen.getByTestId('edit-item-item-2');

            // Verify both edit buttons have the "pl-0" className
            expect(editButton1).toHaveClass('pl-0');
            expect(editButton2).toHaveClass('pl-0');
        });

        test('opens product modal when edit button is clicked', () => {
            renderCartContent({ basket: mockBasket, productMap: mockProductMap });

            // Initially, modal should not be visible
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

            // Click the first edit button
            const editButton1 = screen.getByTestId('edit-item-item-1');
            fireEvent.click(editButton1);

            // Modal should be visible after clicking edit button
            expect(screen.getByRole('dialog')).toBeInTheDocument();
            expect(screen.getByText(uiStrings.editItem.title)).toBeInTheDocument();
        });

        test('can close modal using close button', () => {
            renderCartContent({ basket: mockBasket, productMap: mockProductMap });

            // Open modal first
            const editButton1 = screen.getByTestId('edit-item-item-1');
            fireEvent.click(editButton1);

            // Verify modal is open
            expect(screen.getByRole('dialog')).toBeInTheDocument();

            // Close modal using the close button
            const closeButton = screen.getByRole('button', { name: /close/i });
            fireEvent.click(closeButton);

            // Modal should be closed
            expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        });

        test('does not render edit buttons when product has no itemId', () => {
            const basketWithoutItemIds = {
                ...mockBasket,
                productItems: [
                    { quantity: 2, productId: 'product-1' }, // No itemId
                    { itemId: 'item-2', quantity: 1, productId: 'product-2' }, // Has itemId
                ],
            };

            renderCartContent({ basket: basketWithoutItemIds, productMap: mockProductMap });

            // Only the item with itemId should have an edit button
            expect(screen.queryByTestId('edit-item-item-1')).not.toBeInTheDocument();
            expect(screen.getByTestId('edit-item-item-2')).toBeInTheDocument();
        });
    });
});
