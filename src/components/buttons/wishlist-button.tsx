'use client';

import { useCallback, useMemo } from 'react';
import type { ShopperSearchTypes } from 'commerce-sdk-isomorphic';
import { HeartIcon } from '../icons';
import { useWishlist } from '@/hooks/use-wishlist';

interface WishlistButtonProps {
    product: ShopperSearchTypes.ProductSearchHit;
    variant?: ShopperSearchTypes.ProductSearchHit;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const WishlistButton = ({ product, variant, size = 'md', className }: WishlistButtonProps) => {
    const { isItemInWishlist, toggleWishlist, isLoading } = useWishlist();

    const isInWishlist = useMemo(() => isItemInWishlist(product, variant), [isItemInWishlist, product, variant]);

    const handleWishlistToggle = useCallback(async () => {
        await toggleWishlist(product, variant);
    }, [product, variant, toggleWishlist]);

    return (
        <HeartIcon
            isFilled={isInWishlist}
            disabled={isLoading}
            onClick={() => void handleWishlistToggle()}
            size={size}
            className={className}
        />
    );
};

export { WishlistButton };
