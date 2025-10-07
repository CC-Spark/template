import { use } from 'react';
import type { ClientLoaderFunction, ClientLoaderFunctionArgs, LoaderFunction, LoaderFunctionArgs } from 'react-router';
import type { ShopperSearchTypes } from 'commerce-sdk-isomorphic';
import { fetchSearchProducts } from '@/lib/api/search';
import createPage, { type RouteComponentProps } from '@/components/create-page';
import ProductGrid from '@/components/product-grid';
import CategoryRefinements from '@/components/category-refinements';
import CategorySorting from '@/components/category-sorting';
import CategoryPagination from '@/components/category-pagination';
import CategorySkeleton from '@/components/category-skeleton';

const limit = 24;

type SearchPageData = {
    searchTerm: string;
    searchResult: Promise<ShopperSearchTypes.ProductSearchResult>;
};

function getPageData({ request, context }: LoaderFunctionArgs): SearchPageData {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0', 10);
    const q = searchParams.get('q') ?? '';
    const sort = searchParams.get('sort') ?? '';
    const refine = searchParams.getAll('refine');
    return {
        searchTerm: q,
        searchResult: fetchSearchProducts(context, {
            q,
            limit,
            offset,
            sort,
            refine,
        }),
    };
}

export const loader: LoaderFunction = (
    args: LoaderFunctionArgs
): {
    searchTerm: string;
    searchResult: Promise<ShopperSearchTypes.ProductSearchResult>;
} => {
    return getPageData(args);
};

export const clientLoader: ClientLoaderFunction = (
    args: ClientLoaderFunctionArgs
): {
    searchTerm: string;
    searchResult: Promise<ShopperSearchTypes.ProductSearchResult>;
} => {
    return getPageData(args);
};

// eslint-disable-next-line react-refresh/only-export-components
function SearchView({
    loaderData: { searchTerm, searchResult: searchResultPromise },
}: RouteComponentProps<SearchPageData>) {
    const searchResult = use(searchResultPromise);
    return (
        <div className="pb-16">
            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <p>Search Results for</p>
                        <h1 className="text-3xl font-bold text-foreground">
                            {searchTerm} ({searchResult.total})
                        </h1>
                    </div>

                    <div className="flex-shrink-0">
                        <CategorySorting result={searchResult} />
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="hidden lg:block w-64 flex-shrink-0">
                        <CategoryRefinements result={searchResult} />
                    </div>

                    <div className="flex-grow">
                        <ProductGrid products={searchResult.hits ?? []} />

                        {searchResult.total > 1 && (
                            <div className="mt-10">
                                <CategoryPagination limit={limit} result={searchResult} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export default createPage<SearchPageData>({
    component: SearchView,
    fallback: <CategorySkeleton />,
});
