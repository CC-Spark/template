'use client';

import { createContext, type PropsWithChildren, useContext, useRef } from 'react';
import { useStore } from 'zustand';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import { type CategoryStore, createCategoryStore } from '@/stores/category-store';

export type CategoryStoreApi = ReturnType<typeof createCategoryStore>;

const CategoryStoreContext = createContext<CategoryStoreApi | undefined>(undefined);

const CategoryStoreProvider = ({
    children,
    initialValue,
}: PropsWithChildren<{
    initialValue?: Record<string, ShopperProductsTypes.Category>;
}>) => {
    const storeRef = useRef<CategoryStoreApi | null>(null);
    if (storeRef.current === null) {
        storeRef.current = createCategoryStore(initialValue ?? {});
    }

    return <CategoryStoreContext.Provider value={storeRef.current}>{children}</CategoryStoreContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCategoryStore = <T,>(selector: (store: CategoryStore) => T) => {
    const categoryStoreContext = useContext(CategoryStoreContext);
    if (!categoryStoreContext) {
        throw new Error('useCategoryStore must be used within CategoryStoreProvider');
    }
    return useStore(categoryStoreContext, selector);
};

export default CategoryStoreProvider;
