/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

import { forwardRef, useMemo, type ComponentProps } from 'react';
import type { ShopperProductsTypes, ShopperSearchTypes } from 'commerce-sdk-isomorphic';
import { Button } from '@/components/ui/button';
import { Typography } from '@/components/typography';
import { cn } from '@/lib/utils';
import { Swatch } from '@/components/swatches/swatch';
import { getColorValues, buildImageSwatchData, type SwatchData } from '@/lib/product-utils';

export type AttributeValue = {
    value: string;
    name: string;
    orderable?: boolean;
};

export type ProductAttribute = {
    id: string;
    name: string;
    values: AttributeValue[];
};

interface ProductAttributeSelectorProps extends ComponentProps<'div'> {
    product: ShopperProductsTypes.Product | ShopperSearchTypes.ProductSearchHit;
    attributes: ProductAttribute[];
    selected: Record<string, string>;
    onAttributeChange: (attributeId: string, value: string) => void;
    maxSwatches?: number;
    swatchSize?: 'sm' | 'md' | 'lg';
    interactionMode?: 'hover' | 'click-only'; // Controls how colors are selected on PLP and PDP
}

const ProductAttributeSelector = forwardRef<HTMLDivElement, ProductAttributeSelectorProps>(
    (
        {
            className,
            product,
            attributes,
            selected,
            onAttributeChange,
            maxSwatches = 8,
            swatchSize = 'md',
            interactionMode = 'click-only',
            ...props
        },
        ref
    ) => {
        // Extract swatch images from imageGroups with viewType: "swatch"
        const swatchImageGroups = useMemo(() => {
            if (!product) return [];
            return product.imageGroups?.filter((group) => group.viewType === 'swatch') || [];
        }, [product]);

        // Generate swatches for color attributes
        const colorSwatches = useMemo(() => {
            if (!product || !swatchImageGroups) return [];
            const productColorValues = getColorValues(product.variationAttributes);
            if (!productColorValues) return [];
            const imageSwatchData: Array<SwatchData> = [];
            const productColorMap = new Map<string, string>();
            // Build color mapping from product-level variationAttributes
            productColorValues.forEach((value) => {
                productColorMap.set(value.value, value.name || value.value);
            });
            try {
                // Extract swatch images from imageGroups with viewType: "swatch"
                if (swatchImageGroups) {
                    swatchImageGroups.forEach((imageGroup: ShopperProductsTypes.ImageGroup) => {
                        // Get color name and value from imageGroup variationAttributes
                        const imageGroupColorValues = getColorValues(imageGroup.variationAttributes);
                        if (!imageGroupColorValues) return [];
                        let colorName = '';
                        let colorValue = '';
                        if (imageGroupColorValues && imageGroupColorValues.length > 0) {
                            // Use the first color value (should only be one per image group)
                            const firstColorValue = imageGroupColorValues[0];
                            colorValue = firstColorValue.value;
                            colorName = firstColorValue.name || firstColorValue.value;

                            // Override with product-level color name if available
                            if (colorValue && productColorMap.has(colorValue)) {
                                colorName = productColorMap.get(colorValue) || colorName;
                            }
                        }
                        imageSwatchData.push(...buildImageSwatchData(imageGroup, colorValue, colorName));
                    });
                }
            } catch {
                // Silently handle swatch processing errors
            }

            return imageSwatchData;
            // other dependencies will be updated when product changes so they don't need to be included in the dependency array
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [product]);

        const renderColorAttribute = (attribute: ProductAttribute) => {
            const selectedColorValue = selected[attribute.id];
            const availableSwatches = colorSwatches.filter((swatch) =>
                attribute.values.some((value) => value.value === swatch.colorValue)
            );

            // Set selected state
            availableSwatches.forEach((swatch) => {
                swatch.isSelected = swatch.colorValue === selectedColorValue;
            });

            if (availableSwatches.length === 0) {
                // Fallback to non-color attribute style if no swatches available
                return renderNonColorAttribute(attribute);
            }

            const visibleSwatches = availableSwatches.slice(0, maxSwatches);
            const hasMore = availableSwatches.length > maxSwatches;

            // Get selected color name for display
            const selectedColorName = attribute.values.find((v) => v.value === selectedColorValue)?.name;
            const swatchGap = swatchSize === 'sm' ? 'gap-1' : swatchSize === 'md' ? 'gap-2' : 'gap-3';
            const swatchWidth = swatchSize === 'sm' ? 'w-4' : swatchSize === 'md' ? 'w-6' : 'w-8';
            return (
                <div key={attribute.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Typography variant="h3" className="text-sm font-medium text-foreground">
                            {attribute.name}: {selectedColorName || 'Select'}
                        </Typography>
                    </div>

                    <div className={cn('flex items-center gap-2', swatchGap)}>
                        {visibleSwatches.map((swatch) => {
                            const handleClick = () => onAttributeChange(attribute.id, swatch.colorValue);
                            const handleMouseEnter =
                                interactionMode === 'hover'
                                    ? () => onAttributeChange(attribute.id, swatch.colorValue)
                                    : () => {
                                          // Intentionally empty
                                      };

                            return (
                                <Swatch
                                    key={`${swatch.colorName}-${swatch.colorValue}-${swatch.imageUrl}`}
                                    imageUrl={swatch.imageUrl}
                                    alt={swatch.alt}
                                    size={swatchSize}
                                    isSelected={swatch.isSelected}
                                    onClick={handleClick}
                                    onMouseEnter={handleMouseEnter}
                                />
                            );
                        })}

                        {hasMore && (
                            <div
                                className={cn(
                                    'rounded-full bg-muted border-2 border-border flex items-center justify-center',
                                    swatchWidth
                                )}>
                                <Typography variant="small" className="text-xs text-muted-foreground font-medium">
                                    +{availableSwatches.length - maxSwatches}
                                </Typography>
                            </div>
                        )}
                    </div>
                </div>
            );
        };

        const renderNonColorAttribute = (attribute: ProductAttribute) => {
            const selectedValue = selected[attribute.id];
            const selectedValueName = attribute.values.find((v) => v.value === selectedValue)?.name;
            const availableValues = attribute.values || [];

            const renderNonColorAttributeButton = (value: AttributeValue) => {
                const isSelected = selectedValue === value.value;
                const isOrderable = value.orderable !== false;
                const idLower = attribute.id.toLowerCase();
                const isSizeAttribute = idLower.includes('size');

                return (
                    <Button
                        key={value.value}
                        onClick={() => isOrderable && onAttributeChange(attribute.id, value.value)}
                        variant={isSelected ? 'default' : 'outline'}
                        size="sm"
                        disabled={!isOrderable}
                        className={cn(
                            isSizeAttribute ? 'min-w-[3rem] h-10' : '',
                            !isOrderable ? 'opacity-50 cursor-not-allowed' : ''
                        )}>
                        {value.name}
                    </Button>
                );
            };

            return (
                <div key={attribute.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Typography variant="h3" className="text-sm font-medium text-foreground">
                            {attribute.name}
                        </Typography>
                        {selectedValueName && (
                            <Typography variant="small" className="text-sm text-muted-foreground">
                                {selectedValueName}
                            </Typography>
                        )}
                    </div>

                    <div className="flex flex-wrap gap-2">{availableValues.map(renderNonColorAttributeButton)}</div>
                </div>
            );
        };

        if (!attributes || attributes.length === 0) {
            return null;
        }

        return (
            <div ref={ref} className={cn('space-y-6', className)} {...props}>
                {attributes.map((attribute) => {
                    const isColorAttribute = attribute.id.toLowerCase() === 'color';

                    if (isColorAttribute) {
                        return renderColorAttribute(attribute);
                    } else {
                        return renderNonColorAttribute(attribute);
                    }
                })}
            </div>
        );
    }
);

ProductAttributeSelector.displayName = 'ProductAttributeSelector';

export default ProductAttributeSelector;
