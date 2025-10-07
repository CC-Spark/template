/**
 * Custom hook to get completed steps for the timeline
 */

import { useContext } from 'react';
import { CheckoutContext } from '@/components/checkout-one-click/utils/checkout-context-types';
import { useBasket } from '@/providers/basket';
import { getCompletedSteps } from '@/components/checkout-one-click/utils/checkout-utils';

export function useCompletedSteps() {
    const context = useContext(CheckoutContext);
    const basket = useBasket();

    if (!context) {
        throw new Error('useCompletedSteps must be used within a CheckoutOneClickProvider');
    }

    return getCompletedSteps(basket, context.step);
}
