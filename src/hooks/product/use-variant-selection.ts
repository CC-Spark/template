/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import { getDisplayVariationValues } from '@/lib/product-utils';

interface UseVariantSelectionProps {
    product: ShopperProductsTypes.Product;
    onVariantChange?: (variant: ShopperProductsTypes.Variant) => void;
}

export function useVariantSelection({ product, onVariantChange }: UseVariantSelectionProps) {
    const [searchParams, setSearchParams] = useSearchParams();
    const getInitialAttributes = useCallback((prod: ShopperProductsTypes.Product) => {
        const initial: Record<string, string> = {};
        const colorAttribute = prod?.variationAttributes?.find(
            (attr: ShopperProductsTypes.VariationAttribute) => attr.id === 'color'
        );
        const firstColorValue = colorAttribute?.values?.[0]?.value;
        if (firstColorValue) {
            initial.color = String(firstColorValue);
        }
        return initial;
    }, []);

    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>(() =>
        getInitialAttributes(product)
    );

    // Get the raw variation attributes from the product
    const variationAttributes = useMemo(() => product?.variationAttributes ?? [], [product]);
    const variants = useMemo(() => product?.variants ?? [], [product]);

    // Get display values for selected attributes
    const displayValues = useMemo(
        () => getDisplayVariationValues(variationAttributes, selectedAttributes),
        [variationAttributes, selectedAttributes]
    );

    // Get initial variant from URL params
    const initialVariantId = searchParams.get('pid');

    // Find current variant based on selected attributes or URL param
    const currentVariant = useMemo(() => {
        // First try to find by URL param
        if (initialVariantId) {
            const urlVariant = variants.find((v) => v.productId === initialVariantId);
            if (urlVariant) return urlVariant;
        }

        // Then try to find by selected attributes
        if (Object.keys(selectedAttributes).length === variationAttributes.length) {
            return variants.find((variant) => {
                return variationAttributes.every((attr: ShopperProductsTypes.VariationAttribute) => {
                    const selectedValue = selectedAttributes[attr.id];
                    const variantValue = variant.variationValues?.[attr.id];
                    return selectedValue === variantValue;
                });
            });
        }

        return null;
    }, [selectedAttributes, variants, variationAttributes, initialVariantId]);

    // Initialize selected attributes from current variant
    useEffect(() => {
        if (currentVariant && currentVariant.variationValues) {
            const initialAttributes: Record<string, string> = {};
            variationAttributes.forEach((attr: ShopperProductsTypes.VariationAttribute) => {
                const value = currentVariant.variationValues?.[attr.id];
                if (value) {
                    initialAttributes[attr.id] = value;
                }
            });
            setSelectedAttributes(initialAttributes);
        }
    }, [currentVariant, variationAttributes]);

    // Handle attribute selection
    const handleAttributeChange = useCallback((attributeId: string, value: string) => {
        setSelectedAttributes((prev) => ({
            ...prev,
            [attributeId]: value,
        }));
    }, []);

    // Update URL when variant changes
    useEffect(() => {
        if (product?.id && currentVariant && currentVariant.productId !== product.id) {
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('pid', currentVariant.productId);
            setSearchParams(newSearchParams, { replace: true });
        }
    }, [currentVariant, product, searchParams, setSearchParams]);

    // Notify parent of variant changes
    useEffect(() => {
        if (onVariantChange) {
            onVariantChange(currentVariant as ShopperProductsTypes.Variant);
        }
    }, [currentVariant, onVariantChange]);

    // Check if all required attributes are selected
    const isVariantFullySelected = useMemo(() => {
        return (
            variationAttributes.length === 0 || Object.keys(selectedAttributes).length === variationAttributes.length
        );
    }, [selectedAttributes, variationAttributes]);

    // Get available values for each attribute based on current selections
    const getAvailableValues = useCallback(
        (attributeId: string) => {
            const attribute = variationAttributes.find(
                (attr: ShopperProductsTypes.VariationAttribute) => attr.id === attributeId
            );
            if (!attribute?.values) return [];

            // If this is the only unselected attribute, filter based on other selections
            const otherSelections = Object.fromEntries(
                Object.entries(selectedAttributes).filter(([key]) => key !== attributeId)
            );

            if (Object.keys(otherSelections).length === 0) {
                // No other selections, return all values
                return attribute.values;
            }

            // Filter values based on available variants
            const availableValues = attribute.values.filter((value: ShopperProductsTypes.VariationAttributeValue) => {
                const testSelection = { ...otherSelections, [attributeId]: value.value };

                return variants.some((variant) => {
                    return variationAttributes.every((attr: ShopperProductsTypes.VariationAttribute) => {
                        const selectedValue = testSelection[attr.id];
                        const variantValue = variant.variationValues?.[attr.id];
                        return !selectedValue || selectedValue === variantValue;
                    });
                });
            });

            return availableValues;
        },
        [selectedAttributes, variants, variationAttributes]
    );

    // Reset selection
    const resetSelection = useCallback(() => {
        setSelectedAttributes({});
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete('pid');
        setSearchParams(newSearchParams, { replace: true });
    }, [searchParams, setSearchParams]);

    return {
        // State
        selectedAttributes,
        currentVariant,
        isVariantFullySelected,
        variationAttributes,
        displayValues,

        // Actions
        handleAttributeChange,
        getAvailableValues,
        resetSelection,

        // Utils
        isAttributeSelected: (attributeId: string) => !!selectedAttributes[attributeId],
        getSelectedValue: (attributeId: string) => selectedAttributes[attributeId],
        getSelectedValueName: (attributeId: string) => {
            const attribute = variationAttributes.find(
                (attr: ShopperProductsTypes.VariationAttribute) => attr.id === attributeId
            );
            const selectedValue = selectedAttributes[attributeId];
            return attribute?.values?.find(
                (v: ShopperProductsTypes.VariationAttributeValue) => v.value === selectedValue
            )?.name;
        },
        getDisplayValue: (attributeId: string) => {
            const attribute = variationAttributes.find(
                (attr: ShopperProductsTypes.VariationAttribute) => attr.id === attributeId
            );
            const selectedValue = selectedAttributes[attributeId];
            return attribute?.values?.find(
                (v: ShopperProductsTypes.VariationAttributeValue) => v.value === selectedValue
            )?.name;
        },
        getDisplayValues: () => displayValues,
    };
}
