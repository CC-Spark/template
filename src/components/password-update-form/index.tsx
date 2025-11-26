import type { TFunction } from 'i18next';
import { z } from 'zod';

/**
 * Factory function to create password update validation schema with i18next translations.
 * Returns a schema at runtime to avoid race conditions where t() would be called
 * before i18next is initialized, causing validation messages to show as keys instead of translated text.
 *
 * Note: confirmPassword is a "virtual" field used only for validation, not included in submission.
 *
 * @example const schema = createPasswordUpdateFormSchema(t);
 */
// eslint-disable-next-line react-refresh/only-export-components
export const createPasswordUpdateFormSchema = (t: TFunction) => {
    // TODO: add namespace to TFunction
    return z
        .object({
            currentPassword: z.string().min(1, {
                message: t('account:password.validation.currentPasswordRequired'),
            }),
            password: z.string().min(8, {
                message: t('account:password.validation.passwordTooShort'),
            }),
            confirmPassword: z.string().min(1, {
                message: t('account:password.validation.confirmPasswordRequired'),
            }),
        })
        .refine((data) => data.password === data.confirmPassword, {
            message: t('account:password.validation.passwordsDoNotMatch'),
            path: ['confirmPassword'],
        });
};

// Type export
export type PasswordUpdateFormData = z.infer<ReturnType<typeof createPasswordUpdateFormSchema>>;

// Export main component
export { PasswordUpdateForm } from './form';

// Export sub-components
export { PasswordUpdateFields } from './password-update-fields';

// Export types
export {
    type PasswordUpdateSubmissionData,
    type PasswordUpdateFormProps,
    type PasswordUpdateFieldsProps,
    type PasswordUpdateFetcherData,
} from './types';

// Default export for backward compatibility
export { PasswordUpdateForm as default } from './form';
