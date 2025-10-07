import { useCallback, useMemo } from 'react';
import type { ShopperSearchTypes } from 'commerce-sdk-isomorphic';
import { PRODUCT_BADGE_DETAILS, type BadgeDetail } from '../config/product-badges';

interface UseProductBadgesProps {
    product: ShopperSearchTypes.ProductSearchHit;
    badgeDetails?: BadgeDetail[];
    maxBadges?: number;
}

export const useProductBadges = ({
    product,
    badgeDetails = PRODUCT_BADGE_DETAILS,
    maxBadges = 3,
}: UseProductBadgesProps) => {
    // Helper function to check if a property should show a badge
    const shouldShowBadge = useCallback((value: unknown): boolean => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            return value === 'true' || value === '1' || value.toLowerCase() === 'yes';
        }
        if (typeof value === 'number') return value === 1;
        return false;
    }, []);

    const badges = useMemo(() => {
        if (!product) return [];

        const activeBadges: BadgeDetail[] = [];

        // Check representedProduct properties (where c_isSale is located)
        if (product.representedProduct) {
            badgeDetails.forEach((badge) => {
                const propertyValue = (product.representedProduct as Record<string, unknown>)[badge.propertyName];
                if (shouldShowBadge(propertyValue)) {
                    activeBadges.push(badge);
                }
            });
        }

        // Check custom properties as fallback
        if (product.customProperties && Array.isArray(product.customProperties)) {
            badgeDetails.forEach((badge) => {
                // Skip if badge already found in representedProduct
                if (activeBadges.find((b) => b.propertyName === badge.propertyName)) {
                    return;
                }

                const customProp = product.customProperties?.find(
                    (prop: { id?: string; value?: unknown }) =>
                        prop.id === badge.propertyName || prop.id?.toLowerCase() === badge.propertyName.toLowerCase()
                );

                if (customProp && shouldShowBadge(customProp.value)) {
                    activeBadges.push(badge);
                }
            });
        }

        // Check promotions for sale badge (if not already found)
        if (product.promotions && product.promotions.length > 0) {
            const saleBadge = badgeDetails.find((badge) => badge.propertyName === 'c_isSale');
            if (saleBadge && !activeBadges.find((badge) => badge.propertyName === 'c_isSale')) {
                activeBadges.push(saleBadge);
            }
        }

        // Check if product is out of stock
        if (product.inStock === false) {
            const outOfStockBadge = badgeDetails.find((badge) => badge.propertyName === 'c_isOutOfStock');
            if (outOfStockBadge && !activeBadges.find((badge) => badge.propertyName === 'c_isOutOfStock')) {
                activeBadges.push(outOfStockBadge);
            }
        }

        // Sort by priority (higher priority first)
        return activeBadges.sort((a, b) => (b.priority || 0) - (a.priority || 0)).slice(0, maxBadges);
    }, [product, badgeDetails, maxBadges, shouldShowBadge]);

    return {
        badges,
        hasBadges: badges.length > 0,
    };
};
