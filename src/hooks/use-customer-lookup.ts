import { useState, useEffect } from 'react';
import { getCustomerLookupFromStorage, getLoginSuggestion } from '@/lib/customer-lookup-utils';

/**
 * Customer lookup result from the contact info submission
 */
export interface CustomerLookupResult {
    isRegistered: boolean;
    recommendation: 'guest' | 'login_suggested' | 'current_user';
    message?: string;
}

/**
 * Hook to access customer lookup results from session storage
 * This is populated when the user submits their email in the contact info step
 *
 * @returns CustomerLookupResult or null if not available
 */
export function useCustomerLookup(): CustomerLookupResult | null {
    const [lookupResult, setLookupResult] = useState<CustomerLookupResult | null>(null);

    useEffect(() => {
        const result = getCustomerLookupFromStorage();
        setLookupResult(result);
    }, []);

    return lookupResult;
}

/**
 * Hook to determine if the current customer should be prompted to login
 * Based on customer lookup results and current authentication state
 *
 * @returns Object with login suggestion state and message
 */
export function useLoginSuggestion(): {
    shouldSuggestLogin: boolean;
    message?: string;
    isCurrentUser: boolean;
} {
    const lookupResult = useCustomerLookup();
    return getLoginSuggestion(lookupResult);
}

// Re-export utility functions for convenience
export {
    clearCustomerLookup,
    saveCustomerLookupToStorage,
    isRegisteredCustomerLookup,
    isCurrentUserLookup,
} from '@/lib/customer-lookup-utils';
