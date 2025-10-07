import { useMemo } from 'react';
import { useSearchParams } from 'react-router';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';

interface UseSelectedVariationsParams {
    product: ShopperProductsTypes.Product;
    isChildProduct?: boolean;
}

/**
 * Hook to get currently selected variation values from URL parameters with fallback to product defaults.
 *
 * @param params - Configuration object
 * @param params.product - Product containing variation attributes and optional default variationValues
 * @param params.isChildProduct - Whether this product is a child product (part of set/bundle, default: false)
 * @returns Object of selected variations with attribute IDs as keys
 *
 * @example
 * // URL: /?color=NAVYWL&someOtherParam=ignored
 * const product = {
 *   variationAttributes: [
 *     { id: 'color', name: 'Color', values: [...] },
 *     { id: 'size', name: 'Size', values: [...] }
 *   ]
 * }
 *
 * const selections = useSelectedVariations({ product });
 * // Returns: { color: 'NAVYWL', size: '040' }
 * // Note: 'someOtherParam' is ignored because it's not a variation attribute and
 * default val will be used if url param for that attribute does not exist
 *
 * @example
 * // URL: / (no selections, no defaults)
 * const masterProduct = { variationAttributes: [...] }
 * const selections = useSelectedVariations({ product: masterProduct });
 * // Returns: {}
 * // Note: Empty object when no variations are selected and no defaults
 *
 * @example
 * // Bundle/Set product with nested URL parameters
 * // URL: /?bundle123=color%3DRED%26size%3DL&otherParam=value
 * const bundleProduct = { id: 'bundle123', variationAttributes: [...] }
 * const selections = useSelectedVariations({ product: bundleProduct, isChildProduct: true });
 * // Returns: { color: 'RED', size: 'L' }
 * // Note: Extracts and decodes nested parameters for bundle/set products
 */
export const useSelectedVariations = ({ product, isChildProduct = false }: UseSelectedVariationsParams) => {
    const [searchParams] = useSearchParams();

    return useMemo(() => {
        if (!product.variationAttributes) return {};

        let params: URLSearchParams;

        if (isChildProduct) {
            // For child products (bundle/set): params are nested like ?productId=color%3DRED%26size%3DL
            const productParamsString = searchParams.get(product.id) || '';
            params = new URLSearchParams(productParamsString);
        } else {
            // For regular products: use global URL params directly like ?color=RED&size=L
            params = searchParams;
        }

        // Build object of currently selected variation values from URL parameters with fallback to defaults
        // URL parameters and the product's default variationValues (for variant products)
        return product.variationAttributes.reduce(
            (selections, attribute) => {
                // First priority: Get the value from URL params for this specific variation attribute
                // For example: if attribute.id is 'color', look for ?color=NAVYWL in URL
                const urlValue = params.get(attribute.id);

                // Second priority: Fall back to product's default variationValues (for variant products)
                // For example: product.variationValues = { color: 'CHARCWL', size: '036', width: 'S' }
                const defaultValue = product.variationValues?.[attribute.id];

                // Use URL value if available, otherwise use default, otherwise skip this attribute
                const value = urlValue || defaultValue;

                // This keeps the returned object clean - no undefined/null values
                return value ? { ...selections, [attribute.id]: value } : selections;
            },
            {} as Record<string, string>
        );
    }, [product, searchParams, isChildProduct]);
};
