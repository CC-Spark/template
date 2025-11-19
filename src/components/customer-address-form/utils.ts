import uiStrings from '@/temp-ui-string';

import { type CountryCode, type StateCode } from './constants';

// Get states/provinces for a specific country
export function getStatesForCountry(countryCode: CountryCode): Array<{ code: string; name: string }> {
    const country = uiStrings.countries[countryCode];
    if (!country) return [];

    return Object.entries(country.states).map(([code, name]) => ({
        code,
        name,
    }));
}

// Get country name
export function getCountryName(countryCode: CountryCode): string {
    return uiStrings.countries[countryCode]?.name || countryCode;
}

// Get state/province name
export function getStateName<T extends CountryCode>(countryCode: T, stateCode: StateCode<T> | string): string {
    const country = uiStrings.countries[countryCode];
    if (!country) return String(stateCode);

    // Type assertion needed because TypeScript can't narrow the union type
    const states = country.states as Record<string, string>;
    return states[String(stateCode)] || String(stateCode);
}
