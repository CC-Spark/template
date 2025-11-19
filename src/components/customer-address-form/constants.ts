import uiStrings from '@/temp-ui-string';

// Type for country code
export type CountryCode = keyof typeof uiStrings.countries;

// Type for state/province code
export type StateCode<T extends CountryCode> = keyof (typeof uiStrings.countries)[T]['states'];

// Get countries list
export const COUNTRIES = Object.entries(uiStrings.countries).map(([code, data]) => ({
    code: code as CountryCode,
    name: data.name,
}));

// US Postal Code validation (5 digits or 5+4 format)
export const usPostalCodeRegex = /^\d{5}(-\d{4})?$/;

// Canadian Postal Code validation (A1A 1A1 format)
export const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;
