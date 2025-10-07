// React
import type { ReactElement } from 'react';

// Third-party
import { Link } from 'react-router';
import { Lock } from 'lucide-react';

// Commerce SDK
import type { ShopperBasketsTypes, ShopperProductsTypes } from 'commerce-sdk-isomorphic';

// Components
import { Button } from '@/components/ui/button';
import { VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon } from '@/components/icons';
import OrderSummary from '@/components/order-summary';

// Utils
import uiStrings from '@/temp-ui-string';

/**
 * Checkout Action component that renders the checkout button and payment method icons.
 *
 * This component provides the main checkout action for the cart, including:
 * - A prominent "Proceed to Checkout" button with secure checkout icon
 * - Payment method icons (Visa, Mastercard, Amex, Discover) for trust signals
 *
 * @returns {ReactElement} The checkout action section with button and payment icons
 */
function CheckoutAction(): ReactElement {
    return (
        <>
            <Button asChild className="w-full sm:w-[95%] lg:w-full mt-6 sm:mt-6 lg:mt-2 mb-4">
                <Link to="/checkout">
                    {uiStrings.cart.checkout.proceedToCheckout}
                    <Lock className="ml-2 w-4 h-4" aria-label={uiStrings.cart.checkout.secure} />
                </Link>
            </Button>

            <div className="flex justify-center">
                <VisaIcon width={40} height={32} className="mr-2" />
                <MastercardIcon width={40} height={32} className="mr-2" />
                <AmexIcon width={40} height={32} className="mr-2" />
                <DiscoverIcon width={40} height={32} className="mr-2" />
            </div>
        </>
    );
}

/**
 * Props for the CartSummarySection component
 *
 * @interface CartSummarySectionProps
 * @property {ShopperBasketsTypes.Basket} basket - The current shopping basket containing items and totals
 * @property {boolean} isDesktop - Whether the component is being rendered on desktop viewport
 * @property {Record<string, ShopperProductsTypes.Product>} [productMap] - Optional product ID to product
 *   details mapping
 */
interface CartSummarySectionProps {
    basket: ShopperBasketsTypes.Basket;
    isDesktop: boolean;
    productMap?: Record<string, ShopperProductsTypes.Product>;
}

/**
 * CartSummarySection component that renders the order summary and checkout actions
 *
 * This component adapts its layout based on the viewport:
 * - **Desktop**: Shows full order summary with promo code form and checkout CTA
 * - **Mobile**: Shows a sticky bottom checkout section for easy access
 *
 * The component integrates with the OrderSummary component to display:
 * - Basket totals and line items
 * - Promo code application functionality
 * - Secure checkout button with payment method trust signals
 *
 * Used by CartContent component (see cart-content.tsx for usage example)
 *
 * @param props - Component props
 * @returns JSX element representing the cart summary section with responsive layout
 */
export default function CartSummarySection({ basket, isDesktop, productMap }: CartSummarySectionProps): ReactElement {
    if (isDesktop) {
        return (
            <div className="space-y-4">
                <OrderSummary
                    basket={basket}
                    showCartItems={false}
                    isEstimate={true}
                    productMap={productMap}
                    showPromoCodeForm={true}
                />
                <div className="hidden lg:block">
                    <CheckoutAction />
                </div>
            </div>
        );
    }

    // Mobile sticky version
    return (
        <div
            className="h-32 sticky bottom-0 bg-background flex items-center flex-col lg:hidden"
            data-testid="mobile-checkout-container">
            <CheckoutAction />
        </div>
    );
}
