/**
 * Custom hook to access customer profile data from checkout context
 */

import { useContext } from 'react';
import { CheckoutContext } from '@/components/checkout-one-click/utils/checkout-context-types';

export function useCustomerProfile() {
    const context = useContext(CheckoutContext);
    if (!context) {
        throw new Error('useCustomerProfile must be used within a CheckoutOneClickProvider');
    }
    return context.customerProfile;
}
