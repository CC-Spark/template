import { type ReactElement, Suspense, use, useEffect } from 'react';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import { useShallow } from 'zustand/react/shallow';
import CategoryStoreProvider, { useCategoryStore } from '@/providers/category-store';
import NavigationDesktopContent from './desktop-content';
import NavigationDesktopSkeleton from './desktop.skeleton';

/**
 * This navigation component receives root categories with 1 level of depth from the server,
 * providing immediate access to first-level subcategories. Deeper subcategory levels
 * are fetched on-demand client-side when hovering over categories. This approach needs to
 * be enhanced in order to add some light-weight client-side state management.
 *
 * This optimized approach:
 * - Minimizes server-side data fetching (only essential navigation structure)
 * - Enables on-demand loading for deeper category trees
 * - Uses `commerce-sdk-isomorphic` for both server and client-side calls
 * - Eliminates heavy-weight third-party dependencies, e.g. react-query
 */
function NavigationDesktopView({
    category: rootCategory,
    resolve: subCategoriesPromise,
}: {
    category?: ShopperProductsTypes.Category;
    resolve?: Promise<ShopperProductsTypes.Category[]>;
}): ReactElement {
    const { updateCategory } = useCategoryStore(
        useShallow((state) => ({
            updateCategory: state.updateCategory,
        }))
    );

    useEffect(() => {
        // Prefill the categories store with the streamed subcategories
        void subCategoriesPromise?.then((subCategories: ShopperProductsTypes.Category[]) => {
            for (const subCategory of subCategories) {
                updateCategory(subCategory.id, subCategory);
            }
        });
    }, [subCategoriesPromise, updateCategory]);

    return (
        <>
            {rootCategory ? (
                <NavigationDesktopContent category={rootCategory} />
            ) : (
                <>TODO: Failed loading navigation categories.</>
            )}
        </>
    );
}

export default function NavigationDesktop({
    resolve: rootCategoryPromise,
    resolveSubs: subCategoriesPromise,
}: {
    resolve?: Promise<ShopperProductsTypes.Category>;
    resolveSubs?: Promise<ShopperProductsTypes.Category[]>;
}) {
    const data = rootCategoryPromise ? use(rootCategoryPromise) : undefined;
    return (
        <Suspense fallback={<NavigationDesktopSkeleton />}>
            <CategoryStoreProvider>
                <NavigationDesktopView category={data} resolve={subCategoriesPromise} />
            </CategoryStoreProvider>
        </Suspense>
    );
}
