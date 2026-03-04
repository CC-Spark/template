/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use client';

import { useCallback } from 'react';
import { Link } from 'react-router';
import type { ShopperSearch } from '@salesforce/storefront-next-runtime/scapi';
import { createProductUrl, getImagesForColor } from '@/lib/product-utils';
import { useDynamicImageContext } from '@/providers/dynamic-image';
import { ProductImage } from './product-image';
import { useTranslation } from 'react-i18next';

interface ProductImageContainerProps {
    product: ShopperSearch.schemas['ProductSearchHit'];
    selectedColorValue?: string | null;
    className?: string;
    handleProductClick?: (product: ShopperSearch.schemas['ProductSearchHit']) => void;
    /** Image aspect ratio (width/height). If provided, calculates height based on viewport width. Defaults to 1 (square) */
    imgAspectRatio?: number;
}

const ProductImageContainer = ({
    product,
    selectedColorValue = null,
    className,
    handleProductClick,
    imgAspectRatio = 1,
}: ProductImageContainerProps) => {
    const { t } = useTranslation('product');
    // Get the product image for the selected color variant
    const currentImage = getImagesForColor(product, selectedColorValue, 'medium').at(0) ?? product.image;
    const currentImageUrl = currentImage?.disBaseLink || currentImage?.link;
    const imageAltFallback = product.productName || t('imageAlt') || 'Product Image';

    // Report the image URL to the dynamic image context, if available
    const imageContext = useDynamicImageContext();
    currentImageUrl && imageContext?.addSource(currentImageUrl);

    const handleClick = useCallback(() => {
        handleProductClick?.(product);
    }, [handleProductClick, product]);

    // Calculate height based on aspect ratio
    // imgAspectRatio = width / height, so height = width / imgAspectRatio
    // We use CSS calc with viewport units to compute height dynamically
    const heightStyle =
        imgAspectRatio !== 1
            ? {
                  // Use padding-bottom trick for aspect ratio, but calculate based on viewport width
                  // For responsive widths, we need to calculate height for each breakpoint
                  // Using aspect-ratio CSS property with calc for viewport-based calculation
                  aspectRatio: `${imgAspectRatio}`,
                  // Fallback: use padding-bottom percentage trick
                  paddingBottom: imgAspectRatio !== 1 ? `${(1 / imgAspectRatio) * 100}%` : undefined,
              }
            : {};

    return (
        <div
            className={`relative overflow-hidden rounded-lg bg-secondary/20 border-secondary flex flex-col ${
                imgAspectRatio === 1 ? 'aspect-square' : ''
            } ${className || ''}`}
            style={heightStyle}>
            {/* Product Image */}
            <Link
                to={createProductUrl(product.productId, selectedColorValue)}
                onClick={handleClick}
                className="block w-full h-full flex-1"
                aria-label={t('viewProductAriaLabel', { productName: imageAltFallback }) || imageAltFallback}>
                <ProductImage
                    src={currentImageUrl || ''}
                    alt={currentImage?.alt || imageAltFallback}
                    className="w-full h-full object-cover transition-all duration-200 group-hover:scale-105"
                    widths={imageContext?.widths}
                />
            </Link>
        </div>
    );
};

export { ProductImageContainer };
