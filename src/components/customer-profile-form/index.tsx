import type { TFunction } from 'i18next';
import { z } from 'zod';

/**
 * Factory function to create customer profile validation schema with i18next translations.
 * Returns a schema at runtime to avoid race conditions where t() would be called
 * before i18next is initialized, causing validation messages to show as keys instead of translated text.
 *
 * @example const schema = createCustomerProfileFormSchema(t);
 */
// eslint-disable-next-line react-refresh/only-export-components
export const createCustomerProfileFormSchema = (t: TFunction) => {
    return z.object({
        firstName: z.string().min(1, {
            message: t('account:profile.validation.firstNameRequired'),
        }),
        lastName: z.string().min(1, {
            message: t('account:profile.validation.lastNameRequired'),
        }),
        email: z
            .string()
            .min(1, {
                message: t('account:profile.validation.emailRequired'),
            })
            .email({
                message: t('account:profile.validation.emailInvalid'),
            }),
        phone: z
            .string()
            .optional()
            .refine(
                (value) => {
                    if (!value || value.trim() === '') return true; // Allow empty phone
                    // Basic phone validation - can be enhanced
                    const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
                    return phoneRegex.test(value.replace(/[\s\-()]/g, ''));
                },
                {
                    message: t('account:profile.validation.phoneInvalid'),
                }
            ),
    });
};

// Type export
export type CustomerProfileFormData = z.infer<ReturnType<typeof createCustomerProfileFormSchema>>;

// Export main component
export { CustomerProfileForm } from './form';

// Export sub-components
export { CustomerProfileFields } from './customer-profile-fields';

// Export types
export {
    type CustomerProfileFormProps,
    type CustomerProfileFieldsProps,
    type CustomerProfileFetcherData,
} from './types';

// Default export for backward compatibility
export { CustomerProfileForm as default } from './form';
