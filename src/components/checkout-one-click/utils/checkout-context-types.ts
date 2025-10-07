import { createContext } from 'react';
import type { CheckoutStep, CHECKOUT_STEPS } from '@/stores/checkout-store';
import type { ShopperCustomersTypes } from 'commerce-sdk-isomorphic';

export interface CustomerProfile {
    customer?: ShopperCustomersTypes.Customer;
    addresses: ShopperCustomersTypes.CustomerAddress[];
    paymentInstruments: ShopperCustomersTypes.CustomerPaymentInstrument[];
    preferredShippingAddress?: ShopperCustomersTypes.CustomerAddress;
    preferredBillingAddress?: ShopperCustomersTypes.CustomerAddress;
}

export interface CheckoutContextValue {
    step: CheckoutStep;
    computedStep: CheckoutStep;
    editingStep: CheckoutStep | null;
    STEPS: typeof CHECKOUT_STEPS;
    customerProfile?: CustomerProfile;
    goToNextStep: () => void;
    goToStep: (step: CheckoutStep) => void;
    exitEditMode: () => void;
    markShippingOptionsCompleted: () => void;
}

export const CheckoutContext = createContext<CheckoutContextValue | null>(null);
