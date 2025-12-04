import { fetchCategories } from '@/lib/api/categories';
import type { LoaderFunctionArgs } from 'react-router';

const dataLoader = async (args: { componentData: unknown; context: LoaderFunctionArgs['context'] }) => {
    const { componentData, context: routeContext } = args;

    // Extract parentId from component data, default to 'root'
    const parentId = ((componentData as Record<string, unknown>)?.parentId as string) || 'root';

    return fetchCategories(routeContext, parentId, 1);
};

export const loader = {
    server: dataLoader,
    client: dataLoader,
};
