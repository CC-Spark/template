import { z } from 'zod';

import uiStrings from '@/temp-ui-string';

// Promo code form validation schema
// eslint-disable-next-line react-refresh/only-export-components
export const promoCodeFormSchema = z.object({
    code: z.string().min(2, {
        message: uiStrings.cart.promoCode.validation.minLength,
    }),
});

// Export main component
export { PromoCodeForm } from './form';

// Export sub-components
export { PromoCodeFields } from './promo-code-field';

// Export types
export {
    type PromoCodeFormData,
    type PromoCodeFormProps,
    type PromoCodeFieldsProps,
    type PromoCodeFetcherData,
} from './types';

// Default export for backward compatibility
export { PromoCodeForm as default } from './form';
