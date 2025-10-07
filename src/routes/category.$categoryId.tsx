import { use } from 'react';
import { type ClientLoaderFunctionArgs, type LoaderFunctionArgs } from 'react-router';
import type { ShopperProductsTypes, ShopperSearchTypes } from 'commerce-sdk-isomorphic';
import createClient from '@/lib/scapi';
import { fetchSearchProducts } from '@/lib/api/search';
import { getAllQueryParams, getQueryParam, PRODUCT_SEARCH_QUERY_PARAMS } from '@/lib/query-params';
import { createPage, type RouteComponentProps } from '@/components/create-page';
import CategoryBreadcrumbs from '@/components/category-breadcrumbs';
import CategoryPagination from '@/components/category-pagination';
import CategoryRefinements from '@/components/category-refinements';
import CategorySkeleton from '@/components/category-skeleton';
import CategorySorting from '@/components/category-sorting';
import ProductGrid from '@/components/product-grid';

const limit = 24;

type CategoryPageData = {
    category: Promise<ShopperProductsTypes.Category>;
    searchResult: Promise<ShopperSearchTypes.ProductSearchResult>;
};

/**
 * Internal helper function that fetches category data and product search results.
 * This function handles the actual data fetching logic shared between server and client loaders.
 * @returns Promise that resolves to an object containing search results and category data
 */
function getPageData({ request, params, context }: LoaderFunctionArgs): CategoryPageData {
    const { searchParams } = new URL(request.url);
    const { categoryId = '' } = params;
    const offset = parseInt(getQueryParam(searchParams, PRODUCT_SEARCH_QUERY_PARAMS.OFFSET) || '0', 10);
    const sort = getQueryParam(searchParams, PRODUCT_SEARCH_QUERY_PARAMS.SORT);
    const refine = getAllQueryParams(searchParams, PRODUCT_SEARCH_QUERY_PARAMS.REFINE);

    return {
        searchResult: fetchSearchProducts(context, {
            categoryId,
            limit,
            offset,
            sort,
            refine,
        }),
        category: createClient(context).ShopperProducts.getCategory({
            parameters: {
                id: categoryId,
                levels: 0,
            },
        }),
    };
}

/**
 * Server-side loader function that fetches category data and product search results.
 * This function runs on the server during SSR and prepares data for the category page.
 * @returns Promise that resolves to an object containing the data promise
 */
export function loader(args: LoaderFunctionArgs) {
    return getPageData(args);
}

/**
 * Client-side loader function that handles data loading for client-side navigation.
 * This function ensures React Router doesn't block navigation by returning a POJO
 * with the promise data instead of a direct promise.
 * @returns Object containing the data promise to prevent navigation blocking
 */
export function clientLoader(args: ClientLoaderFunctionArgs) {
    return getPageData(args);
}

/**
 * Category view component that displays the category content.
 * This component receives loader data and renders the main category view including
 * breadcrumbs, product grid, refinements, and pagination controls.
 * @returns JSX element representing the category page layout
 */
// eslint-disable-next-line react-refresh/only-export-components
function CategoryView({ loaderData: { category, searchResult } }: RouteComponentProps<CategoryPageData>) {
    const categoryData = use(category);
    const searchResultData = use(searchResult);

    return (
        <div className="pb-16">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-4">
                    <CategoryBreadcrumbs category={categoryData} />
                </div>

                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h1 className="text-3xl font-bold text-foreground">
                        {categoryData?.name || categoryData.id} ({searchResultData.total})
                    </h1>

                    <div className="flex-shrink-0">
                        <CategorySorting result={searchResultData} />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <CategoryRefinements result={searchResultData} />
                    </div>

                    <div className="flex-grow">
                        <ProductGrid products={searchResultData.hits ?? []} />
                        {searchResultData.total > 1 && (
                            <div className="mt-10">
                                <CategoryPagination limit={limit} result={searchResultData} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Category page component that displays a product category with filtering, sorting, and pagination.
 * This component uses the createPage factory to handle Suspense patterns.
 * @returns JSX element representing the category page
 */
// eslint-disable-next-line react-refresh/only-export-components
export default createPage<CategoryPageData>({
    component: CategoryView,
    fallback: <CategorySkeleton />,
});
