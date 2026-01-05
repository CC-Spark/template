/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import type { LoaderFunctionArgs, ClientLoaderFunctionArgs } from 'react-router';
import { fetchSearchSuggestions } from '@/lib/api/search';
import { extractResponseError } from '@/lib/utils';
import { currencyContext } from '@/lib/currency';

async function getSearchSuggestionsData({
    request,
    context,
}: {
    request: Request;
    context: LoaderFunctionArgs['context'];
}) {
    const url = new URL(request.url);
    const q = url.searchParams.get('q') || '';
    const expandParam = url.searchParams.get('expand');
    const expand = expandParam ? (expandParam.split(',') as ('images' | 'prices')[]) : [];
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam && !isNaN(parseInt(limitParam, 10)) ? parseInt(limitParam, 10) : undefined;
    const includeEinsteinParam = url.searchParams.get('includeEinsteinSuggestedPhrases');
    const includeEinsteinSuggestedPhrases = includeEinsteinParam !== null ? includeEinsteinParam === 'true' : undefined;
    const currency = context.get(currencyContext) as string;

    try {
        const result = await fetchSearchSuggestions(context, {
            q,
            expand,
            limit,
            includeEinsteinSuggestedPhrases,
            currency,
        });
        return Response.json({ success: true, data: result });
    } catch (error) {
        const { responseMessage, status_code } = await extractResponseError(error as Error);
        return Response.json({ success: false, error: responseMessage }, { status: Number(status_code) });
    }
}

export function loader({ request, context }: LoaderFunctionArgs) {
    return getSearchSuggestionsData({ request, context });
}

// eslint-disable-next-line custom/no-client-loaders
export function clientLoader(args: ClientLoaderFunctionArgs) {
    return getSearchSuggestionsData(args);
}
