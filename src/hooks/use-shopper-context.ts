import { useFetcher } from 'react-router';
import { useCallback } from 'react';
import { SHOPPER_CONTEXT_ACTION_NAME } from '@/lib/shopper-context-utils';

type UpdateShopperContextResponse = {
    success: boolean;
    message?: string;
    error?: string;
};

/**
 * Hook for updating shopper context from client components
 * Uses React Router's useFetcher to call client actions
 *
 * @returns Object with update functions and fetcher state
 */
export function useShopperContext() {
    const fetcher = useFetcher<UpdateShopperContextResponse>({ key: SHOPPER_CONTEXT_ACTION_NAME });

    /**
     * Update all qualifiers in shopper context from UI interaction
     * Supports customQualifiers, assignmentQualifiers, couponCodes, sourceCode, and other root-level qualifiers
     *
     * @param qualifiers - Object with qualifier key-value pairs to update (including sourceCode)
     * @throws Error if usid is not available (user not authenticated)
     */
    const updateQualifiers = useCallback(
        async (qualifiers: Record<string, string> = {}) => {
            const formData = new FormData();

            if (Object.keys(qualifiers).length > 0) {
                formData.set('qualifiers', JSON.stringify(qualifiers));
            }

            await fetcher.submit(formData, {
                method: 'PUT', // Always use PUT to update shopper context
                action: `/action/${SHOPPER_CONTEXT_ACTION_NAME}`,
            });
        },
        [fetcher]
    );

    return {
        updateQualifiers,
        isLoading: fetcher.state === 'submitting' || fetcher.state === 'loading',
        error: fetcher.data?.success === false ? new Error(fetcher.data.error || 'Unknown error') : null,
        success: fetcher.data?.success === true,
    };
}
