'use client';

import { createContext, type PropsWithChildren, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import { type CheckoutStore, createCheckoutStore, type CheckoutStep } from '@/stores/checkout-store';

export type CheckoutStoreApi = ReturnType<typeof createCheckoutStore>;

const CheckoutStoreContext = createContext<CheckoutStoreApi | undefined>(undefined);

const CheckoutStoreProvider = ({ children, initialStep }: PropsWithChildren<{ initialStep?: CheckoutStep }>) => {
    const storeRef = useRef<CheckoutStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createCheckoutStore(initialStep ? { currentStep: initialStep } : undefined);
    }

    return <CheckoutStoreContext.Provider value={storeRef.current}>{children}</CheckoutStoreContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCheckoutStore = <T,>(selector: (store: CheckoutStore) => T) => {
    const checkoutStoreContext = useContext(CheckoutStoreContext);
    if (!checkoutStoreContext) {
        throw new Error('useCheckoutStore must be used within CheckoutStoreProvider');
    }
    return useStore(checkoutStoreContext, selector);
};

export default CheckoutStoreProvider;
