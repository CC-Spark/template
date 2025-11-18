import { z } from 'zod';

/**
 * Schema for cart item update (variant and/or quantity) form data
 * Used when updating an existing cart item - supports both quantity changes and variant changes
 */
export const cartItemUpdateSchema = z.object({
    itemId: z.string().min(1, 'Item ID is required').trim(),
    productId: z.string().trim().optional(), // Optional - only needed when changing variant
    quantity: z
        .string()
        .min(1, 'Quantity is required')
        .transform((val) => {
            const parsed = Number(val);
            if (isNaN(parsed)) {
                throw new Error('Quantity must be a valid number');
            }
            return parsed;
        })
        .pipe(z.number().min(1, 'Quantity must be at least 1')),
});

/**
 * Parses FormData into cart item update data object
 * @param formData - FormData from cart item update form submission
 * @returns Parsed cart item update data
 */
export const parseCartItemUpdateFromFormData = (formData: FormData) => {
    return {
        itemId: formData.get('itemId')?.toString() || '',
        productId: formData.get('productId')?.toString() || undefined,
        quantity: formData.get('quantity')?.toString() || '',
    };
};

/**
 * Schema for pickup store update form data
 * Used when changing the pickup store for all pickup items in the basket
 */
export const pickupStoreUpdateSchema = z.object({
    storeId: z.string().min(1, 'Store ID is required').trim(),
    inventoryId: z.string().min(1, 'Inventory ID is required').trim(),
    storeName: z.string().trim().optional(),
});

/**
 * Parses FormData into pickup store update data object
 * @param formData - FormData from pickup store update form submission
 * @returns Parsed pickup store update data
 */
export const parsePickupStoreUpdateFromFormData = (formData: FormData) => {
    return {
        storeId: formData.get('storeId')?.toString() || '',
        inventoryId: formData.get('inventoryId')?.toString() || '',
        storeName: formData.get('storeName')?.toString() || undefined,
    };
};

// Type exports
export type CartItemUpdateData = z.infer<typeof cartItemUpdateSchema>;
export type PickupStoreUpdateData = z.infer<typeof pickupStoreUpdateSchema>;
