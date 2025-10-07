import { cva, type VariantProps } from 'class-variance-authority';

// Product Badge Variants
//
// Structural variants (productBadgesVariants): Container layout and positioning
// Semantic variants (productBadgeSemanticVariants): Color schemes for product states
// Used by ProductBadge wrapper component and src/config/product-badges.ts
const productBadgesVariants = cva('absolute top-2 left-2 z-10 flex flex-row gap-1 pointer-events-none', {
    variants: {
        variant: {
            default: '',
            compact: 'gap-0.5',
            stacked: 'flex-col gap-0.5',
        },
        size: {
            sm: 'gap-0.5',
            md: 'gap-1',
            lg: 'gap-1.5',
        },
    },
    defaultVariants: {
        variant: 'default',
        size: 'md',
    },
});

// Custom semantic variants for product badges
// These define the color schemes for different product states and are used
// by the ProductBadge wrapper component to apply semantic styling:
// - success: Green styling for "New" products
// - warning: Orange/yellow styling for "Sale" and "Best Seller" products
// - info: Blue styling for "Exclusive" products
export const productBadgeSemanticVariants = {
    success: 'border-transparent bg-success text-success-foreground [a&]:hover:bg-success/90',
    warning: 'border-transparent bg-warning text-warning-foreground [a&]:hover:bg-warning/90',
    info: 'border-transparent bg-info text-info-foreground [a&]:hover:bg-info/90',
} as const;

export { productBadgesVariants };
export type ProductBadgesVariantsProps = VariantProps<typeof productBadgesVariants>;
