// React
import type { ReactElement } from 'react';

// Commerce SDK
import {
    type ShopperBasketsTypes,
    type ShopperProductsTypes,
    type ShopperPromotionsTypes,
} from 'commerce-sdk-isomorphic';

// Components
import ProductItemsList from '@/components/product-items-list';
import { RemoveItemButtonWithConfirmation } from '@/components/buttons/remove-item-button-with-confirmation';
import { CartItemEditButton } from '@/components/cart/cart-item-edit-button';
import CartEmpty from './cart-empty';
import CartSummarySection from './cart-summary-section';
import CartTitle from './cart-title';

/**
 * Props for the CartContent component
 *
 * @interface CartContentProps
 * @property {ShopperBasketsTypes.Basket | undefined} basket - The basket data from the loader
 * @property {Record<string, ShopperProductsTypes.Product>} [productMap] - Optional item ID to product mapping
 * @property {Record<string, ShopperPromotionsTypes.Promotion>} [promotionMap] - Optional promotion ID to promotion mapping
 */
interface CartContentProps {
    basket: ShopperBasketsTypes.Basket | undefined;
    productMap: Record<string, ShopperProductsTypes.Product>;
    promotionMap?: Record<string, ShopperPromotionsTypes.Promotion>;
}

/**
 * CartContent component that displays the shopping cart with items or empty state
 *
 * Features:
 * - Conditional rendering: Empty cart state when no items, full cart when items exist
 * - Responsive layout: Desktop grid (66% items, 33% summary) with mobile CTA section
 * - Component composition: Orchestrates CartTitle, ProductItemsList, and CartSummarySection
 * - Data integration: Accepts basket, product mappings, and promotion mappings
 * - Mobile optimization: Separate mobile checkout section for better UX
 * - Accessibility: Proper semantic structure with test identifiers
 *
 * @param props - Component props
 * @returns JSX element representing the cart content
 */
export default function CartContent({ basket, productMap, promotionMap }: CartContentProps): ReactElement {
    // Check if cart is empty using the basket prop from loader data
    if (!basket?.productItems?.length) {
        return <CartEmpty isRegistered={false} />;
    }

    const productItems = basket?.productItems || [];

    // Render prop function for cart-specific secondary actions
    const cartSecondaryActions = (product: ShopperBasketsTypes.ProductItem & Partial<ShopperProductsTypes.Product>) => {
        // Return undefined if no itemId - this will hide the buttons in the UI
        if (!product.itemId) return undefined;

        return (
            <div className="flex gap-2">
                <RemoveItemButtonWithConfirmation itemId={product.itemId} className="pl-0" />
                <CartItemEditButton product={product} className="pl-0" />
            </div>
        );
    };

    return (
        <div className="bg-muted flex-1" data-testid="sf-cart-container">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:py-14">
                <div className="space-y-24">
                    <div className="space-y-4">
                        <CartTitle basket={basket} />
                        <div className="grid grid-cols-1 lg:grid-cols-[66%_1fr] gap-10 xl:gap-20">
                            <div>
                                <ProductItemsList
                                    promotionMap={promotionMap}
                                    productItems={productItems}
                                    productMap={productMap}
                                    secondaryActions={cartSecondaryActions}
                                />
                            </div>
                            <div>
                                <CartSummarySection basket={basket} isDesktop={true} productMap={productMap} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile CTA */}
            <CartSummarySection basket={basket} isDesktop={false} productMap={productMap} />
        </div>
    );
}
