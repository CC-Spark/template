import { use, type ReactElement } from 'react';
import type { ClientLoaderFunctionArgs } from 'react-router';
import { getBasket } from '@/middlewares/basket.client';
import { getShippingMethodsForShipment } from '@/lib/api/shipping-methods';
import { getAuth as getAuthClient } from '@/middlewares/auth.client';
import { getCustomerProfileForCheckout, isRegisteredCustomer } from '@/lib/api/customer';
import {
    initializeBasketForReturningCustomer,
    shouldPrefillBasket,
} from '@/components/checkout-one-click/utils/checkout-utils';
import createPage, { type RouteComponentProps } from '@/components/create-page';
import CheckoutFormPage from '@/components/checkout-one-click/checkout-form-page';
import CheckoutOneClickProvider from '@/components/checkout-one-click/utils/checkout-context';
import Loading from '@/components/loading';
import type { ShopperBasketsTypes, ShopperCustomersTypes } from 'commerce-sdk-isomorphic';
import type { CustomerProfile } from '@/components/checkout-one-click/utils/checkout-context-types';

/**
 * Data structure returned by checkout loader functions
 * Contains promises that are resolved in the main component
 */
type CheckoutPageData = {
    shippingMethods?: Promise<ShopperBasketsTypes.ShippingMethodResult>;
    customerProfile?: Promise<{
        customer?: ShopperCustomersTypes.Customer;
        addresses: ShopperCustomersTypes.CustomerAddress[];
        paymentInstruments: ShopperCustomersTypes.CustomerPaymentInstrument[];
        preferredShippingAddress?: ShopperCustomersTypes.CustomerAddress;
        preferredBillingAddress?: ShopperCustomersTypes.CustomerAddress;
    } | null>;
    isRegisteredCustomer?: boolean;
};

function getPageData({ context }: { context: Readonly<ClientLoaderFunctionArgs['context']> }): CheckoutPageData {
    // Get current basket
    const basket = getBasket(context);

    let shippingMethodsPromise: Promise<ShopperBasketsTypes.ShippingMethodResult> | undefined;
    let customerProfilePromise: Promise<CustomerProfile | null> | undefined;

    // Only fetch shipping methods if we have a basket with shipping address
    // (This means user is at shipping options step or beyond)
    if (basket?.basketId && basket.shipments?.[0]?.shippingAddress) {
        shippingMethodsPromise = getShippingMethodsForShipment(context, basket.basketId);
    }

    // Check if user is a registered customer and fetch their profile
    // Use proper function that checks userType === 'registered', not just presence of customer_id
    // This prevents treating auto-registered guest users as fully registered customers
    const userIsRegistered = isRegisteredCustomer(context);
    const session = getAuthClient(context);

    if (userIsRegistered && session.customer_id) {
        customerProfilePromise = getCustomerProfileForCheckout(context, session.customer_id)
            .then(async (profile) => {
                // Prefill basket for returning customers with complete profiles
                // Wait for prefill to complete before step computation
                if (profile && shouldPrefillBasket(basket, profile)) {
                    try {
                        await initializeBasketForReturningCustomer(context, profile);
                    } catch {
                        // Prefill failed, but continue with checkout
                        // Step computation will work with existing basket state
                    }
                }
                return profile;
            })
            .catch((_error) => {
                // Customer profile fetch failed in loader, treating as guest
                // If customer profile fails, clear the invalid auth data immediately
                // This is a fallback in case the customer.ts clearing doesn't work
                if (typeof window !== 'undefined') {
                    // Clear cookies and storage in browser
                    document.cookie = '__sfdc_auth=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/';
                    localStorage.removeItem('__sfdc_auth');
                    sessionStorage.clear();
                }
                return null; // Return null to indicate guest user
            });
    }

    return {
        shippingMethods: shippingMethodsPromise,
        customerProfile: customerProfilePromise,
        isRegisteredCustomer: userIsRegistered,
    };
}

/**
 * Client-side loader function for checkout route
 *
 * This loader function handles checkout data loading on the client side:
 * - Retrieves basket data from the basket middleware (requires localStorage access)
 * - Fetches customer profile and auth data (requires browser-specific APIs)
 * - Handles basket prefill for returning customers
 * - Returns promises for async data loading
 * @returns CheckoutPageData with basket, customer profile, and shipping methods
 * TODO: Implement server loader to have the checkout page take part in the SSR phase
 */
// TODO: Implement server loader to have the checkout page take part in the SSR phase
// eslint-disable-next-line react-refresh/only-export-components,custom/no-universal-loaders
export const clientLoader = ({ context }: ClientLoaderFunctionArgs): CheckoutPageData => {
    return getPageData({ context });
};

/**
 * Hydrate fallback component displayed during client-side hydration
 *
 * This component is shown when the checkout route gets called/rendered directly on the server
 * during the hydration process, providing a loading state while the client-side data loads.
 *
 * @returns JSX element representing the checkout loading state
 */
export function HydrateFallback() {
    return <Loading />;
}

/**
 * Checkout route component that displays the checkout page
 *
 * This component serves as the main checkout page route that:
 * - Receives customer profile data promises from the loader function for registered users
 * - Uses React's use() hook to resolve the promises within Suspense boundaries
 * - Provides checkout context to child components with customer data
 * - Uses CheckoutFormPage for checkout functionality with prefill
 *
 * @param props - Component props with loader data including customer profile promises
 * @returns JSX element representing the checkout page
 */
function Checkout({ loaderData }: RouteComponentProps<CheckoutPageData>): ReactElement {
    // Resolve all promises at the main component level (following category page pattern)
    const resolvedProfile = loaderData.customerProfile ? use(loaderData.customerProfile) : undefined;
    // Convert null to undefined for the context type
    const customerProfile = resolvedProfile === null ? undefined : resolvedProfile;

    // Resolve shipping methods promise if it exists
    const shippingMethods = loaderData.shippingMethods ? use(loaderData.shippingMethods) : undefined;

    return (
        <CheckoutOneClickProvider customerProfile={customerProfile}>
            <CheckoutFormPage shippingMethods={shippingMethods} />
        </CheckoutOneClickProvider>
    );
}

/**
 * Checkout page component with loading fallback
 *
 * This creates a page component that wraps the Checkout component with a loading fallback.
 * The createPage utility provides consistent loading states and error handling.
 *
 * @returns Page component with checkout functionality and loading states
 */
// eslint-disable-next-line react-refresh/only-export-components
export default createPage<CheckoutPageData>({
    component: Checkout,
    fallback: <Loading />,
});
