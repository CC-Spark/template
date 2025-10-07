// Utils
import uiStrings from '@/temp-ui-string';

/**
 * Debounce delay for cart quantity updates in milliseconds
 *
 * This delay prevents excessive API calls when users rapidly change quantities
 * in the cart quantity selector components.
 */
export const CART_QUANTITY_DEBOUNCE_DELAY = 750;

/**
 * Default configuration object for remove item button functionality
 *
 * This configuration is used by RemoveItemButtonWithConfirmation component
 * and referenced by cart-content components for consistent remove item behavior.
 *
 * @see {@link RemoveItemButtonWithConfirmation} - Component that uses this configuration
 * @see {@link CartContent} - Cart component that references this configuration
 */
export const defaultButtonRemoveConfig = {
    action: '/action/remove-cart-item',
    confirmDescription: uiStrings.cart.removeItemConfirmDescription,
} as const;
