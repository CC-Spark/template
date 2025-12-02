import type { LoaderFunctionArgs } from 'react-router';
import type { ShopperProducts } from '@salesforce/storefront-next-runtime/scapi';
import { createApiClients } from '@/lib/api-clients';

export const fetchCategory = (
    context: LoaderFunctionArgs['context'],
    id: string,
    levels: ShopperProducts.operations['getCategory']['parameters']['query']['levels'] = 0
): Promise<ShopperProducts.schemas['Category']> => {
    const clients = createApiClients(context);

    return clients.shopperProducts
        .getCategory({
            params: {
                path: {
                    id,
                },
                query: {
                    levels,
                },
            },
        })
        .then(({ data }) => data);
};

export const fetchCategories = async (
    context: LoaderFunctionArgs['context'],
    parentId: string = 'root',
    levels: ShopperProducts.operations['getCategories']['parameters']['query']['levels'] = 1
): Promise<ShopperProducts.schemas['Category'][]> => {
    const parentCategory = await fetchCategory(context, parentId, levels);
    return parentCategory.categories || [];
};
