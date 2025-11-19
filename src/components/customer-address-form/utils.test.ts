import { describe, expect, it, vi } from 'vitest';
import { getStatesForCountry, getCountryName, getStateName, type CountryCode } from './utils';

// Mock uiStrings
vi.mock('@/temp-ui-string', () => ({
    default: {
        countries: {
            US: {
                name: 'United States',
                states: {
                    AL: 'Alabama',
                    CA: 'California',
                    NY: 'New York',
                    TX: 'Texas',
                },
            },
            CA: {
                name: 'Canada',
                states: {
                    AB: 'Alberta',
                    BC: 'British Columbia',
                    ON: 'Ontario',
                    QC: 'Quebec',
                },
            },
        },
    },
}));

describe('utils', () => {
    describe('getStatesForCountry', () => {
        it('should return states for a valid country code (US)', () => {
            const result = getStatesForCountry('US' as CountryCode);

            expect(result).toEqual([
                { code: 'AL', name: 'Alabama' },
                { code: 'CA', name: 'California' },
                { code: 'NY', name: 'New York' },
                { code: 'TX', name: 'Texas' },
            ]);
        });

        it('should return states for a valid country code (CA)', () => {
            const result = getStatesForCountry('CA' as CountryCode);

            expect(result).toEqual([
                { code: 'AB', name: 'Alberta' },
                { code: 'BC', name: 'British Columbia' },
                { code: 'ON', name: 'Ontario' },
                { code: 'QC', name: 'Quebec' },
            ]);
        });

        it('should return empty array for invalid country code', () => {
            const result = getStatesForCountry('XX' as CountryCode);

            expect(result).toEqual([]);
        });

        it('should return states in correct format with code and name', () => {
            const result = getStatesForCountry('US' as CountryCode);

            expect(result.length).toBeGreaterThan(0);
            result.forEach((state) => {
                expect(state).toHaveProperty('code');
                expect(state).toHaveProperty('name');
                expect(typeof state.code).toBe('string');
                expect(typeof state.name).toBe('string');
            });
        });
    });

    describe('getCountryName', () => {
        it('should return country name for valid country code (US)', () => {
            const result = getCountryName('US' as CountryCode);

            expect(result).toBe('United States');
        });

        it('should return country name for valid country code (CA)', () => {
            const result = getCountryName('CA' as CountryCode);

            expect(result).toBe('Canada');
        });

        it('should return country code for invalid country code', () => {
            const result = getCountryName('XX' as CountryCode);

            expect(result).toBe('XX');
        });
    });

    describe('getStateName', () => {
        it('should return state name for valid country and state code (US)', () => {
            const result = getStateName('US' as CountryCode, 'CA');

            expect(result).toBe('California');
        });

        it('should return state name for valid country and state code (CA)', () => {
            const result = getStateName('CA' as CountryCode, 'ON');

            expect(result).toBe('Ontario');
        });

        it('should return state name for different state codes', () => {
            expect(getStateName('US' as CountryCode, 'NY')).toBe('New York');
            expect(getStateName('US' as CountryCode, 'TX')).toBe('Texas');
            expect(getStateName('CA' as CountryCode, 'AB')).toBe('Alberta');
            expect(getStateName('CA' as CountryCode, 'QC')).toBe('Quebec');
        });

        it('should return state code as string for invalid state code with valid country', () => {
            const result = getStateName('US' as CountryCode, 'XX');

            expect(result).toBe('XX');
        });

        it('should return state code as string for invalid country', () => {
            const result = getStateName('XX' as CountryCode, 'CA');

            expect(result).toBe('CA');
        });

        it('should handle string state codes', () => {
            const result = getStateName('US' as CountryCode, 'CA' as string);

            expect(result).toBe('California');
        });

        it('should return state code when both country and state are invalid', () => {
            const result = getStateName('XX' as CountryCode, 'YY');

            expect(result).toBe('YY');
        });
    });
});
