import { createStore } from 'zustand/vanilla';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';

type CategoryStoreState = {
    categories: Record<string, ShopperProductsTypes.Category>;
};

type CategoryStoreActions = {
    updateCategory: (
        categoryId: string,

        nextData:
            | ShopperProductsTypes.Category
            | ((currentData: ShopperProductsTypes.Category) => ShopperProductsTypes.Category)
    ) => void;
};

export type CategoryStore = CategoryStoreState & CategoryStoreActions;

const defaultState: CategoryStoreState['categories'] = {};

/**
 * Creates a `zustand` store to hold information about the currently loaded/stored categories.
 * @see {@link https://zustand.docs.pmnd.rs/guides/nextjs}
 */
export const createCategoryStore = (initState: CategoryStoreState['categories'] = defaultState) => {
    return createStore<CategoryStore>()((set) => ({
        categories: {
            ...initState,
        },
        updateCategory: (
            categoryId: string,
            nextData:
                | ShopperProductsTypes.Category
                | ((currentData: ShopperProductsTypes.Category) => ShopperProductsTypes.Category)
        ): void => {
            set((state: CategoryStore) => ({
                categories: {
                    ...state.categories,
                    [categoryId]: typeof nextData === 'function' ? nextData(state.categories[categoryId]) : nextData,
                },
            }));
        },
    }));
};
