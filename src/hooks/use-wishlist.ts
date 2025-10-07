'use client';

import { useCallback } from 'react';
import type { ShopperSearchTypes } from 'commerce-sdk-isomorphic';
import { useWishlistStore } from '@/stores/wishlist-store';

/**
 * Hook for wishlist functionality using Zustand store for state management.
 */
export const useWishlist = () => {
    const items = useWishlistStore((state) => state.items);
    const toggleItem = useWishlistStore((state) => state.toggleItem);

    const isItemInWishlist = useCallback(
        (product: ShopperSearchTypes.ProductSearchHit, variant?: ShopperSearchTypes.ProductSearchHit) => {
            const productId = variant?.productId || product.productId;
            return items.has(productId);
        },
        [items]
    );

    const toggleWishlist = useCallback(
        async (product: ShopperSearchTypes.ProductSearchHit, variant?: ShopperSearchTypes.ProductSearchHit) => {
            const productId = variant?.productId || product.productId;
            toggleItem(productId);

            // TODO: Implement actual toggle wishlist API call. Promise.resolve used to mimic future async behavior.
            await Promise.resolve();
        },
        [toggleItem]
    );

    return {
        wishlist: Array.from(items),
        isLoading: false,
        isItemInWishlist,
        toggleWishlist,
    };
};
