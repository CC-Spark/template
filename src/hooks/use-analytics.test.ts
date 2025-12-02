/**
 * Analytics Hook Tests
 *
 * Tests the useAnalytics hook functionality including event tracking,
 * user context integration, and analytics provider integration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAnalytics } from './use-analytics';
import type { SessionData } from '@/lib/api/types';
import type { ShopperBasketsV2, ShopperProducts, ShopperSearch } from '@salesforce/storefront-next-runtime/scapi';

vi.mock('@/providers/auth', () => ({
    useAuth: vi.fn(),
}));

vi.mock('@/config', () => ({
    useConfig: vi.fn(),
}));

vi.mock('@salesforce/storefront-next-runtime/events', () => ({
    createEvent: vi.fn(),
    getEventMediator: vi.fn(),
}));

vi.mock('@/lib/adapters', () => ({
    getAllAdapters: vi.fn(),
}));

vi.mock('@/adapters', () => ({
    initializeEngagementAdapters: vi.fn(),
}));

vi.mock('@/lib/adapters/initialize-adapters', () => ({
    ensureAdaptersInitialized: vi.fn(),
}));

import { useAuth } from '@/providers/auth';
import { useConfig } from '@/config';
import { getAllAdapters } from '@/lib/adapters';
import { initializeEngagementAdapters } from '@/adapters';
import { createEvent, getEventMediator, type EventMediator } from '@salesforce/storefront-next-runtime/events';
import { ensureAdaptersInitialized } from '@/lib/adapters/initialize-adapters';

const mockAnalytics: EventMediator = {
    track: vi.fn(),
};

// Mock user
const mockAuth: SessionData = {
    access_token: 'test-token',
    refresh_token: 'test-refresh-token',
    usid: 'test-usid',
    customer_id: 'test-customer-id',
    idp_access_token: 'test-idp-token',
    userType: 'registered',
};

// Mock product data
const mockProduct: ShopperProducts.schemas['Product'] = {
    id: 'test-product-id',
    name: 'Test Product',
    type: {
        master: true,
    },
} as ShopperProducts.schemas['Product'];

// Mock cart item data
const mockCartItem: ShopperBasketsV2.schemas['ProductItem'] = {
    itemId: 'test-cart-item-id',
    productId: 'test-product-id',
    quantity: 2,
    price: 29.99,
    product: {} as Partial<ShopperProducts.schemas['Product']>,
} as ShopperBasketsV2.schemas['ProductItem'];

// Mock basket data
const mockBasket: ShopperBasketsV2.schemas['Basket'] = {
    basketId: 'test-basket-id',
    productSubTotal: 59.98,
    productItems: [mockCartItem],
} as ShopperBasketsV2.schemas['Basket'];

// Mock search result data
const mockSearchResult: ShopperSearch.schemas['ProductSearchHit'] = {
    productId: 'test-product-id',
    productName: 'Test Product',
    currency: 'USD',
    price: 29.99,
} as ShopperSearch.schemas['ProductSearchHit'];

describe('useAnalytics', () => {
    const mockConfig = {
        engagement: {
            adapters: {
                einstein: { enabled: true },
            },
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();

        // Setup default mocks
        vi.mocked(useConfig).mockReturnValue(mockConfig as any);
        vi.mocked(getAllAdapters).mockReturnValue([]);
        vi.mocked(initializeEngagementAdapters).mockResolvedValue(undefined);
        vi.mocked(ensureAdaptersInitialized).mockResolvedValue(undefined);
        vi.mocked(getEventMediator).mockReturnValue(mockAnalytics);
        vi.mocked(createEvent).mockImplementation(
            (eventType, data) =>
                ({
                    eventType,
                    ...data,
                }) as any
        );

        // Mock window.__APP_CONFIG__
        if (typeof window !== 'undefined') {
            (window as { __APP_CONFIG__?: unknown }).__APP_CONFIG__ = {
                engagement: {
                    adapters: {
                        einstein: { enabled: true },
                    },
                },
            };
        }
    });

    describe('trackViewPage', () => {
        it('should track page view for user', async () => {
            vi.mocked(useAuth).mockReturnValue(mockAuth);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackViewPage({ url: '/test-page' });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'view_page',
                    path: '/test-page',
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                })
            );
        });

        it('should handle undefined auth gracefully', async () => {
            vi.mocked(useAuth).mockReturnValue(undefined);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackViewPage({ url: '/test-page' });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'view_page',
                    path: '/test-page',
                    payload: {
                        userType: 'guest',
                        usid: undefined,
                    },
                })
            );
        });
    });

    describe('trackProductView', () => {
        it('should track product view with correct user context', async () => {
            vi.mocked(useAuth).mockReturnValue(mockAuth);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackViewProduct({ product: mockProduct });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'view_product',
                    product: mockProduct,
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                })
            );
        });
    });

    describe('trackCartItemAdd', () => {
        it('should track add to cart with cart items', async () => {
            vi.mocked(useAuth).mockReturnValue(mockAuth);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackCartItemAdd({ cartItems: [mockCartItem] });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'cart_item_add',
                    cartItems: [mockCartItem],
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                })
            );
        });
    });

    describe('trackCheckoutStart', () => {
        it('should track checkout start with basket data', async () => {
            vi.mocked(useAuth).mockReturnValue(mockAuth);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackCheckoutStart({ basket: mockBasket });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'checkout_start',
                    basket: mockBasket,
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                })
            );
        });
    });

    describe('trackSearch', () => {
        it('should track search with query and results', async () => {
            vi.mocked(useAuth).mockReturnValue(mockAuth);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackViewSearch({
                searchInputText: 'test search',
                searchResults: [mockSearchResult],
            });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'view_search',
                    searchInputText: 'test search',
                    searchResults: [mockSearchResult],
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                })
            );
        });
    });

    describe('trackCheckoutStep', () => {
        it('should track checkout step with step name, number, and basket', async () => {
            vi.mocked(useAuth).mockReturnValue(mockAuth);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackCheckoutStep({
                stepName: 'shipping',
                stepNumber: 1,
                basket: mockBasket,
            });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'checkout_step',
                    stepName: 'shipping',
                    stepNumber: 1,
                    basket: mockBasket,
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                })
            );
        });
    });

    describe('trackViewCategory', () => {
        it('should track category view with category and search results', async () => {
            const mockCategory: ShopperProducts.schemas['Category'] = {
                id: 'test-category-id',
                name: 'Test Category',
            } as ShopperProducts.schemas['Category'];

            vi.mocked(useAuth).mockReturnValue(mockAuth);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackViewCategory({
                category: mockCategory,
                searchResults: [mockSearchResult],
            });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'view_category',
                    category: mockCategory,
                    searchResults: [mockSearchResult],
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                })
            );
        });
    });

    describe('trackClickProductInCategory', () => {
        it('should track product click in category with category and product', async () => {
            const mockCategory: ShopperProducts.schemas['Category'] = {
                id: 'test-category-id',
                name: 'Test Category',
            } as ShopperProducts.schemas['Category'];

            vi.mocked(useAuth).mockReturnValue(mockAuth);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackClickProductInCategory({
                category: mockCategory,
                product: mockSearchResult,
            });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'click_product_in_category',
                    category: mockCategory,
                    product: mockSearchResult,
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                })
            );
        });
    });

    describe('trackClickProductInSearch', () => {
        it('should track product click in search with search text and product', async () => {
            vi.mocked(useAuth).mockReturnValue(mockAuth);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackClickProductInSearch({
                searchInputText: 'test search',
                product: mockSearchResult,
            });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    eventType: 'click_product_in_search',
                    searchInputText: 'test search',
                    product: mockSearchResult,
                    payload: {
                        userType: 'registered',
                        usid: 'test-usid',
                    },
                })
            );
        });
    });

    describe('user context handling', () => {
        it('should use guest as fallback when userType is undefined', async () => {
            const mockAuthWithUndefinedUserType = {
                ...mockAuth,
                userType: undefined,
            };

            vi.mocked(useAuth).mockReturnValue(mockAuthWithUndefinedUserType);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackViewPage({ url: '/test-page' });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: {
                        userType: 'guest',
                        usid: 'test-usid',
                    },
                })
            );
        });

        it('should handle undefined usid gracefully', async () => {
            const mockAuthWithUndefinedUsid = {
                ...mockAuth,
                usid: undefined,
            };

            vi.mocked(useAuth).mockReturnValue(mockAuthWithUndefinedUsid);

            const { result } = renderHook(() => useAnalytics());

            await result.current.trackViewPage({ url: '/test-page' });

            expect(mockAnalytics.track).toHaveBeenCalledWith(
                expect.objectContaining({
                    payload: {
                        userType: 'registered',
                        usid: undefined,
                    },
                })
            );
        });
    });
});
