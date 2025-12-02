import { useAuth } from '@/providers/auth';
import type { ShopperBasketsV2, ShopperProducts, ShopperSearch } from '@salesforce/storefront-next-runtime/scapi';
import { createEvent, getEventMediator, type EventMediator } from '@salesforce/storefront-next-runtime/events';
import { useConfig, type AppConfig } from '@/config';
import { ensureAdaptersInitialized } from '@/lib/adapters/initialize-adapters';
import { getAllAdapters } from '@/lib/adapters';

/**
 * Ensures adapters are initialized and returns the event mediator
 *
 * @param appConfig - The application configuration needed to initialize adapters
 * @returns EventMediator instance or undefined if not available
 */
async function getInitializedMediator(appConfig: AppConfig): Promise<EventMediator | undefined> {
    await ensureAdaptersInitialized(appConfig);
    return getEventMediator(getAllAdapters);
}

/**
 * Analytics hook provides tracking functions
 */
export const useAnalytics = () => {
    const auth = useAuth();
    const appConfig = useConfig();

    // On the server, return empty functions
    if (typeof window === 'undefined') {
        /* eslint-disable @typescript-eslint/no-empty-function */
        return {
            trackViewPage: () => {},
            trackViewProduct: () => {},
            trackCartItemAdd: () => {},
            trackCheckoutStart: () => {},
            trackCheckoutStep: () => {},
            trackViewSearch: () => {},
            trackViewCategory: () => {},
            trackClickProductInCategory: () => {},
            trackClickProductInSearch: () => {},
        };
        /* eslint-enable @typescript-eslint/no-empty-function */
    }

    /**
     * Tracks a page view event
     *
     * Page view events are sent automatically by the PageViewTracker component but this
     * function is provided for manual firing of page views.
     */
    const trackViewPage = async (data: { url: string }) => {
        const mediator = await getInitializedMediator(appConfig);
        if (!mediator) {
            return;
        }
        const event = createEvent('view_page', {
            path: data.url,
            payload: {
                userType: auth?.userType ?? 'guest',
                usid: auth?.usid,
            },
        });
        return void mediator.track(event);
    };

    /**
     * Track a product view
     */
    const trackViewProduct = async (data: { product: ShopperProducts.schemas['Product'] }) => {
        const mediator = await getInitializedMediator(appConfig);
        if (!mediator) {
            return;
        }
        const event = createEvent('view_product', {
            product: data.product,
            payload: {
                userType: auth?.userType ?? 'guest',
                usid: auth?.usid,
            },
        });
        return void mediator.track(event);
    };

    /**
     * Track add to cart
     */
    const trackCartItemAdd = async (data: { cartItems: ShopperBasketsV2.schemas['ProductItem'][] }) => {
        const mediator = await getInitializedMediator(appConfig);
        if (!mediator) {
            return;
        }
        const event = createEvent('cart_item_add', {
            cartItems: data.cartItems,
            payload: {
                userType: auth?.userType ?? 'guest',
                usid: auth?.usid,
            },
        });
        return void mediator.track(event);
    };

    /**
     * Track start of checkout process
     */
    const trackCheckoutStart = async (data: { basket: ShopperBasketsV2.schemas['Basket'] }) => {
        const mediator = await getInitializedMediator(appConfig);
        if (!mediator) {
            return;
        }
        const event = createEvent('checkout_start', {
            basket: data.basket,
            payload: {
                userType: auth?.userType ?? 'guest',
                usid: auth?.usid,
            },
        });
        return void mediator.track(event);
    };

    /**
     * Track start of given checkout step
     */
    const trackCheckoutStep = async (data: {
        stepName: string;
        stepNumber: number;
        basket: ShopperBasketsV2.schemas['Basket'];
    }) => {
        const mediator = await getInitializedMediator(appConfig);
        if (!mediator) {
            return;
        }
        const event = createEvent('checkout_step', {
            stepName: data.stepName,
            stepNumber: data.stepNumber,
            basket: data.basket,
            payload: {
                userType: auth?.userType ?? 'guest',
                usid: auth?.usid,
            },
        });
        return void mediator.track(event);
    };

    /**
     * Track search
     */
    const trackViewSearch = async (data: {
        searchInputText: string;
        searchResults: ShopperSearch.schemas['ProductSearchHit'][];
    }) => {
        const mediator = await getInitializedMediator(appConfig);
        if (!mediator) {
            return;
        }
        const event = createEvent('view_search', {
            searchInputText: data.searchInputText,
            searchResults: data.searchResults,
            payload: {
                userType: auth?.userType ?? 'guest',
                usid: auth?.usid,
            },
        });
        return void mediator.track(event);
    };

    /**
     * Track category view
     */
    const trackViewCategory = async (data: {
        category: ShopperProducts.schemas['Category'];
        searchResults: ShopperSearch.schemas['ProductSearchHit'][];
    }) => {
        const mediator = await getInitializedMediator(appConfig);
        if (!mediator) {
            return;
        }
        const event = createEvent('view_category', {
            category: data.category,
            searchResults: data.searchResults,
            payload: {
                userType: auth?.userType ?? 'guest',
                usid: auth?.usid,
            },
        });
        return void mediator.track(event);
    };

    /**
     * Track click on a product in a category
     */
    const trackClickProductInCategory = async (data: {
        category: ShopperProducts.schemas['Category'];
        product: ShopperSearch.schemas['ProductSearchHit'];
    }) => {
        const mediator = await getInitializedMediator(appConfig);
        if (!mediator) {
            return;
        }
        const event = createEvent('click_product_in_category', {
            category: data.category,
            product: data.product,
            payload: {
                userType: auth?.userType ?? 'guest',
                usid: auth?.usid,
            },
        });
        return void mediator.track(event);
    };

    /**
     * Track click on a product in a search
     */
    const trackClickProductInSearch = async (data: {
        searchInputText: string;
        product: ShopperSearch.schemas['ProductSearchHit'];
    }) => {
        const mediator = await getInitializedMediator(appConfig);
        if (!mediator) {
            return;
        }
        const event = createEvent('click_product_in_search', {
            searchInputText: data.searchInputText,
            product: data.product,
            payload: {
                userType: auth?.userType ?? 'guest',
                usid: auth?.usid,
            },
        });
        return void mediator.track(event);
    };

    return {
        trackViewPage,
        trackViewProduct,
        trackCartItemAdd,
        trackCheckoutStart,
        trackCheckoutStep,
        trackViewSearch,
        trackViewCategory,
        trackClickProductInCategory,
        trackClickProductInSearch,
    };
};
