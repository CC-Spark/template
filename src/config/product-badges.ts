/**
 * Product Badge Configuration
 *
 * Defines badge properties, color mappings, and helper functions for product badges.
 * Semantic variants are defined in @/components/product-badges/product-badge-variants.ts
 */

export interface BadgeDetail {
    propertyName: string;
    label: string;
    color: 'green' | 'yellow' | 'orange' | 'purple' | 'red' | 'blue' | 'pink';
    priority?: number; // Higher number = higher priority (shown first)
}

/**
 * Default badge configuration for product cards
 *
 * Defines product badges with property names, labels, colors, and display priority.
 */
export const PRODUCT_BADGE_DETAILS: BadgeDetail[] = [
    {
        propertyName: 'c_isNew',
        label: 'New',
        color: 'green',
        priority: 1,
    },
    {
        propertyName: 'c_isSale',
        label: 'Sale',
        color: 'orange',
        priority: 2,
    },
    {
        propertyName: 'c_isLimited',
        label: 'Limited',
        color: 'purple',
        priority: 3,
    },
    {
        propertyName: 'c_isExclusive',
        label: 'Exclusive',
        color: 'blue',
        priority: 4,
    },
    {
        propertyName: 'c_isTrending',
        label: 'Trending',
        color: 'pink',
        priority: 5,
    },
    {
        propertyName: 'c_isBestSeller',
        label: 'Best Seller',
        color: 'yellow',
        priority: 6,
    },
    {
        propertyName: 'c_isOutOfStock',
        label: 'Out of Stock',
        color: 'red',
        priority: 7,
    },
];

/**
 * Maps badge colors to semantic variants
 *
 * Color → Variant mapping:
 * - green → success (New products)
 * - orange/yellow → warning (Sale, Best Seller)
 * - blue → info (Exclusive)
 * - purple → secondary (Limited)
 * - red → destructive (Out of Stock)
 * - pink → default (Trending)
 */
export const BADGE_VARIANTS = {
    green: 'success', // Success green for NEW
    orange: 'warning', // Warning orange for SALE
    yellow: 'warning', // Warning yellow
    purple: 'secondary', // Secondary purple
    red: 'destructive', // Destructive red
    blue: 'info', // Info blue
    pink: 'default', // Default (primary) for accent
} as const;

// Type for badge variants
export type BadgeVariant = (typeof BADGE_VARIANTS)[keyof typeof BADGE_VARIANTS];

/**
 * Gets badge variant from color
 */
export const getBadgeVariant = (color: BadgeDetail['color']): BadgeVariant => {
    return BADGE_VARIANTS[color];
};
