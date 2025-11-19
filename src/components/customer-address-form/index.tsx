import { z } from 'zod';

import uiStrings from '@/temp-ui-string';

import { canadianPostalCodeRegex, usPostalCodeRegex } from './constants';

// Customer address form validation schema
// eslint-disable-next-line react-refresh/only-export-components
export const customerAddressFormSchema = z
    .object({
        addressId: z.string().min(1, {
            message: uiStrings.errors.customer.addressIdRequired,
        }),
        firstName: z.string().min(1, {
            message: uiStrings.errors.customer.firstNameRequired,
        }),
        lastName: z.string().min(1, {
            message: uiStrings.errors.customer.lastNameRequired,
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
                    message: uiStrings.errors.validation.invalidPhoneNumber,
                }
            ),
        countryCode: z.enum(['US', 'CA'], {
            message: `${uiStrings.account.addressForm.countryLabel} is required`,
        }),
        address1: z.string().min(1, {
            message: uiStrings.errors.customer.addressLine1Required,
        }),
        address2: z.string().optional(),
        city: z.string().min(1, {
            message: uiStrings.errors.customer.cityRequired,
        }),
        stateCode: z.string().optional(),
        postalCode: z.string().min(1, {
            message: uiStrings.errors.customer.postalCodeRequired,
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
            message: uiStrings.account.addressForm.validation.stateRequired,
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
            message: uiStrings.errors.validation.invalidPostalCode,
            path: ['postalCode'],
        }
    );

// Export main component
export { CustomerAddressForm } from './form';

// Export sub-components
export { CustomerAddressFields } from './customer-address-fields';

// Export types
export { type CustomerAddressFormData, type CustomerAddressFormProps, type CustomerAddressFieldsProps } from './types';

// Export constants and types
export { COUNTRIES } from './constants';
// eslint-disable-next-line react-refresh/only-export-components
export { getStatesForCountry, getCountryName, getStateName } from './utils';

export type { CountryCode, StateCode } from './constants';

// Default export for backward compatibility
export { CustomerAddressForm as default } from './form';
