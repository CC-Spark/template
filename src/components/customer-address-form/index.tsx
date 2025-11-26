import { z } from 'zod';
import type { TFunction } from 'i18next';

import { canadianPostalCodeRegex, usPostalCodeRegex } from './constants';

/**
 * Factory function to create customer address validation schema with i18next translations.
 * Returns a schema at runtime to avoid race conditions where t() would be called
 * before i18next is initialized, causing validation messages to show as keys instead of translated text.
 *
 * @example const schema = createCustomerAddressFormSchema(t);
 */
// eslint-disable-next-line react-refresh/only-export-components
export const createCustomerAddressFormSchema = (t: TFunction<['errors', 'account']>) => {
    return z
        .object({
            addressId: z.string().min(1, {
                message: t('errors:customer.addressIdRequired'),
            }),
            firstName: z.string().min(1, {
                message: t('errors:customer.firstNameRequired'),
            }),
            lastName: z.string().min(1, {
                message: t('errors:customer.lastNameRequired'),
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
                        message: t('errors:validation.invalidPhoneNumber'),
                    }
                ),
            countryCode: z.enum(['US', 'CA'], {
                message: `${t('account:addressForm.countryLabel')} is required`,
            }),
            address1: z.string().min(1, {
                message: t('errors:customer.addressLine1Required'),
            }),
            address2: z.string().optional(),
            city: z.string().min(1, {
                message: t('errors:customer.cityRequired'),
            }),
            stateCode: z.string().optional(),
            postalCode: z.string().min(1, {
                message: t('errors:customer.postalCodeRequired'),
            }),
            preferred: z.boolean().optional().default(false),
        })
        .refine(
            (data) => {
                // For US and CA, stateCode is required
                if (data.countryCode === 'US' || data.countryCode === 'CA') {
                    return !!data.stateCode && data.stateCode.trim() !== '';
                }
                return true;
            },
            {
                message: t('account:addressForm.validation.stateRequired'),
                path: ['stateCode'],
            }
        )
        .refine(
            (data) => {
                // Validate postal code format based on country
                if (data.countryCode === 'US') {
                    return usPostalCodeRegex.test(data.postalCode);
                }
                if (data.countryCode === 'CA') {
                    return canadianPostalCodeRegex.test(data.postalCode);
                }
                return true;
            },
            {
                message: t('errors:validation.invalidPostalCode'),
                path: ['postalCode'],
            }
        );
};

// Type export
export type CustomerAddressFormData = z.infer<ReturnType<typeof createCustomerAddressFormSchema>>;

// Export main component
export { CustomerAddressForm } from './form';

// Export sub-components
export { CustomerAddressFields } from './customer-address-fields';

// Export types
export { type CustomerAddressFormProps, type CustomerAddressFieldsProps } from './types';

// Export constants and types
// eslint-disable-next-line react-refresh/only-export-components
export { COUNTRY_CODES } from './constants';
// eslint-disable-next-line react-refresh/only-export-components
export { getStatesForCountry, getCountryName, getStateName } from './utils';

export type { CountryCode, StateCode } from './constants';

// Default export for backward compatibility
export { CustomerAddressForm as default } from './form';
