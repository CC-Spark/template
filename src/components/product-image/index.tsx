'use client';

import { useCallback } from 'react';
import { Link } from 'react-router';
import type { ShopperSearchTypes } from 'commerce-sdk-isomorphic';
import { createProductUrl } from '@/lib/product-utils';
import { ProductBadges } from '../product-badges';
import { WishlistButton } from '@/components/buttons/wishlist-button';
import { Button } from '@/components/ui/button';
import { DynamicImage } from '@/components/dynamic-image';

interface ProductImageContainerProps {
    product: ShopperSearchTypes.ProductSearchHit;
    selectedColorValue?: string | null;
    className?: string;
}

const ProductImageContainer = ({ product, selectedColorValue = null, className }: ProductImageContainerProps) => {
    // Get the product image for the selected color variant
    const getProductImageForColor = useCallback(
        (colorValue: string | null) => {
            if (!colorValue || !product.imageGroups) return product.image?.disBaseLink ?? product.image?.link;

            // Look for the main product image for this color variant
            for (const imageGroup of product.imageGroups) {
                if (imageGroup.viewType === 'large' || imageGroup.viewType === 'medium' || !imageGroup.viewType) {
                    if (imageGroup.variationAttributes && Array.isArray(imageGroup.variationAttributes)) {
                        for (const attr of imageGroup.variationAttributes) {
                            if (attr.id === 'color' && attr.values && Array.isArray(attr.values)) {
                                for (const value of attr.values) {
                                    if (
                                        value.value === colorValue &&
                                        imageGroup.images &&
                                        imageGroup.images.length > 0
                                    ) {
                                        return imageGroup.images[0].disBaseLink ?? imageGroup.images[0].link;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return product.image?.disBaseLink ?? product.image?.link;
        },
        [product]
    );

    const currentImageUrl = getProductImageForColor(selectedColorValue);

    return (
        <div
            className={`relative aspect-square overflow-hidden rounded-lg bg-secondary/20 mb-4 border-secondary ${className || ''}`}>
            {/* Product Image */}
            <Link
                to={createProductUrl(product.productId, selectedColorValue)}
                className="block w-full h-full"
                aria-label={`View ${product.productName}`}>
                <DynamicImage
                    src={`${currentImageUrl}[?sw={width}&q=60]`}
                    alt={product.productName}
                    className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
                    loading="lazy"
                    widths={[
                        // Each product image can take up the full 50% of the screen width
                        '50vw', // base <= 479px
                        '50vw', // sm >= 480px ; <= 767px
                        // Due to the search refinements panel (fixed 280px), the product images
                        // grid doesn't consume the entire screen. The smaller the images get,
                        // the more this extra panel impacts the calculation of the responsive
                        // image dimensions. Thus, to prevent over-fetching, we define smaller
                        // dimensions than the column definitions might suggest. Due to large
                        // margins it's also fine to floor the values.
                        '15vw', // 15vw is generally a good fit for sizes `md` and above:
                        // md >= 768px ; <= 991px | 280px consume ~28-36% of the entire screen | 4 image columns on ~2/3 of the screen ==> ~16vw
                        // lg >= 992px ; <= 1279px | 280px consume ~22-28% of the entire screen | 5 image columns on ~3/4 of the screen ==> ~15vw
                        // xl >= 1280px ; <= 1535px | 280px consume ~18-22% of the entire screen | 5 image columns on ~4/5 of the screen ==> ~16vw
                        // 2xl >= 1536px | 280px consume less than 18% of the screen | 5 image columns on ~5/6 of the screen ==> ~16vw
                    ]}
                />
            </Link>

            {/* Product Badges */}
            <ProductBadges product={product} maxBadges={3} />

            {/* Wishlist Button */}
            <WishlistButton product={product} size="md" />

            {/* Select Variant Button */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-4/5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button asChild variant="secondary" className="w-full">
                    <Link to={createProductUrl(product.productId, selectedColorValue)} className="text-sm font-medium">
                        Select Variant
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export { ProductImageContainer };
