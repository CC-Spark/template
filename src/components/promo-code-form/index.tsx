import { z } from 'zod';
import type { TFunction } from 'i18next';

/**
 * Factory function to create promo code validation schema with i18next translations.
 * Returns a schema at runtime to avoid race conditions where t() would be called
 * before i18next is initialized, causing validation messages to show as keys instead of translated text.
 *
 * @example const schema = createPromoCodeFormSchema(t);
 */
// eslint-disable-next-line react-refresh/only-export-components
export const createPromoCodeFormSchema = (t: TFunction) => {
    return z.object({
        code: z.string().min(2, {
            message: t('cart:promoCode.validation.minLength'),
        }),
    });
};

// Type export
export type PromoCodeFormData = z.infer<ReturnType<typeof createPromoCodeFormSchema>>;

// Export main component
export { PromoCodeForm } from './form';

// Export sub-components
export { PromoCodeFields } from './promo-code-field';

// Export types
export { type PromoCodeFormProps, type PromoCodeFieldsProps, type PromoCodeFetcherData } from './types';

// Default export for backward compatibility
export { PromoCodeForm as default } from './form';
