/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use client';

import { createContext, type PropsWithChildren, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import {
    type StoreLocatorStore,
    createStoreLocatorStore,
    readSelectedStoreIdCookie,
} from '@/extensions/store-locator/stores/store-locator-store';

export type StoreLocatorStoreApi = ReturnType<typeof createStoreLocatorStore>;

const StoreLocatorContext = createContext<StoreLocatorStoreApi | undefined>(undefined);

/**
 * StoreLocatorProvider
 *
 * Provides a scoped Zustand store instance for the store locator feature. Hydrates the
 * initially selected store id from a cookie scoped by site id.
 *
 * @param children - React subtree that needs access to store locator state
 * @returns ReactElement
 */
const StoreLocatorProvider = ({ children }: PropsWithChildren) => {
    const storeRef = useRef<StoreLocatorStoreApi | null>(null);
    if (storeRef.current === null) {
        // hydrate selected store id from cookie by site
        const initSelectedStoreId = readSelectedStoreIdCookie();
        storeRef.current = createStoreLocatorStore({ selectedStoreId: initSelectedStoreId });
    }

    return <StoreLocatorContext.Provider value={storeRef.current}>{children}</StoreLocatorContext.Provider>;
};

/**
 * useStoreLocator
 *
 * Selector-based hook to read from the store locator state within the provider.
 * Throws if used outside the provider.
 *
 * @param selector - Function selecting a slice of `StoreLocatorStore`
 * @returns The selected slice value
 *
 * @example
 * const selectedStoreId = useStoreLocator((s) => s.selectedStoreId);
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useStoreLocator = <T,>(selector: (store: StoreLocatorStore) => T) => {
    const context = useContext(StoreLocatorContext);
    if (!context) {
        throw new Error('useStoreLocator must be used within StoreLocatorProvider');
    }
    return useStore(context, selector);
};

export default StoreLocatorProvider;
