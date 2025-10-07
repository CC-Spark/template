/**
 * Customer lookup utility functions
 * Pure functions for managing customer lookup data and session storage
 */
import type { CustomerLookupResult } from '@/hooks/use-customer-lookup';

/**
 * Clear customer lookup results from session storage
 * Useful when starting a new checkout session or logging out
 */
export function clearCustomerLookup(): void {
    if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('customerLookupResult');
    }
}

/**
 * Get customer lookup result from session storage
 * @returns CustomerLookupResult or null if not available or invalid
 */
export function getCustomerLookupFromStorage(): CustomerLookupResult | null {
    if (typeof sessionStorage === 'undefined') {
        return null;
    }

    try {
        const stored = sessionStorage.getItem('customerLookupResult');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch {
        // Failed to parse customer lookup result, ignore silently
    }

    return null;
}

/**
 * Save customer lookup result to session storage
 * @param result - Customer lookup result to save
 */
export function saveCustomerLookupToStorage(result: CustomerLookupResult): void {
    if (typeof sessionStorage !== 'undefined') {
        try {
            sessionStorage.setItem('customerLookupResult', JSON.stringify(result));
        } catch {
            // Failed to save to session storage, ignore silently
        }
    }
}

/**
 * Determine if login should be suggested based on customer lookup result
 * @param lookupResult - Customer lookup result
 * @returns Object with login suggestion state
 */
export function getLoginSuggestion(lookupResult: CustomerLookupResult | null): {
    shouldSuggestLogin: boolean;
    message?: string;
    isCurrentUser: boolean;
} {
    if (!lookupResult) {
        return {
            shouldSuggestLogin: false,
            isCurrentUser: false,
        };
    }

    return {
        shouldSuggestLogin: lookupResult.recommendation === 'login_suggested',
        message: lookupResult.message,
        isCurrentUser: lookupResult.recommendation === 'current_user',
    };
}

/**
 * Check if customer lookup result indicates a registered user
 * @param lookupResult - Customer lookup result
 * @returns true if the customer is registered
 */
export function isRegisteredCustomerLookup(lookupResult: CustomerLookupResult | null): boolean {
    return lookupResult?.isRegistered === true;
}

/**
 * Check if customer lookup result indicates the current logged-in user
 * @param lookupResult - Customer lookup result
 * @returns true if this is the current user's email
 */
export function isCurrentUserLookup(lookupResult: CustomerLookupResult | null): boolean {
    return lookupResult?.recommendation === 'current_user';
}
