'use client';

import { useState, useCallback, useMemo } from 'react';
import type { ShopperSearchTypes } from 'commerce-sdk-isomorphic';
import { ProductImageContainer } from '../product-image';
import ProductAttributeSelector from '../product-attribute-selector';

interface ProductTileProps {
    product: ShopperSearchTypes.ProductSearchHit;
    maxSwatches?: number;
    className?: string;
}

/**
 * Extracts the default color value from product image groups
 * @param product - The product to extract default color from
 * @returns The default color value or null if not found
 */
const getDefaultColor = (product: ShopperSearchTypes.ProductSearchHit): string | null => {
    if (!product.imageGroups) return null;

    // Find swatch image group
    const swatchGroup = product.imageGroups.find((group) => group.viewType === 'swatch');
    if (!swatchGroup?.images?.length) return null;

    // Get the first swatch's color value
    if (swatchGroup.variationAttributes) {
        for (const attr of swatchGroup.variationAttributes) {
            if (attr.id === 'color' && attr.values?.length) {
                return attr.values[0].value;
            }
        }
    }

    return null;
};

const ProductTile = ({ product, maxSwatches = 4, className }: ProductTileProps) => {
    const defaultColor = useMemo(() => getDefaultColor(product), [product]);

    const [currentDisplayColor, setCurrentDisplayColor] = useState<string | null>(defaultColor);

    // Convert product variation attributes to format expected by ProductAttributeSelector
    const colorAttributes = useMemo(() => {
        if (!product.variationAttributes) return [];

        return product.variationAttributes
            .filter((attr) => attr.id === 'color') // Only show color for PLP
            .map((attr) => ({
                id: attr.id,
                name: attr.name || 'Color',
                values: (attr.values || []).map((value) => ({
                    value: value.value,
                    name: value.name || String(value.value),
                    orderable: value.orderable,
                })),
            }));
    }, [product]);

    const handleAttributeChange = useCallback((attributeId: string, value: string) => {
        if (attributeId === 'color') {
            setCurrentDisplayColor(value);
        }
    }, []);

    return (
        <div className={className}>
            {/* Product Image Container with color-aware image */}
            <ProductImageContainer product={product} selectedColorValue={currentDisplayColor} />

            {/* Color Attribute Selector - Only show if color attributes exist */}
            {colorAttributes.length > 0 && (
                <ProductAttributeSelector
                    product={product}
                    attributes={colorAttributes}
                    selected={{ color: currentDisplayColor || '' }}
                    onAttributeChange={handleAttributeChange}
                    maxSwatches={maxSwatches}
                    swatchSize="sm"
                    interactionMode="hover"
                />
            )}
        </div>
    );
};

export { ProductTile };
