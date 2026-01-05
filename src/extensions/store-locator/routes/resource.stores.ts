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
/** @sfdc-extension-file SFDC_EXT_STORE_LOCATOR */
import { type ClientLoaderFunctionArgs, data, type LoaderFunctionArgs } from 'react-router';
import type { ShopperStores } from '@salesforce/storefront-next-runtime/scapi';
import { extractResponseError } from '@/lib/utils';
import { createApiClients } from '@/lib/api-clients';

/**
 * Client resource to search for stores
 * @returns Result of searchStores API
 */
export async function searchStores(context: LoaderFunctionArgs['context'], request: Request) {
    try {
        const url = new URL(request.url);
        const mode = url.searchParams.get('mode') ?? 'input';
        const countryCode = url.searchParams.get('countryCode') ?? undefined;
        const postalCode = url.searchParams.get('postalCode') ?? undefined;
        const latitude = url.searchParams.get('latitude');
        const longitude = url.searchParams.get('longitude');
        const maxDistance = url.searchParams.get('maxDistance');
        const distanceUnit = url.searchParams.get('distanceUnit') ?? 'km';
        const limit = url.searchParams.get('limit');

        const clients = createApiClients(context);

        const queryParams: Omit<ShopperStores.operations['searchStores']['parameters']['query'], 'siteId'> =
            mode === 'device'
                ? {
                      latitude: latitude ? Number(latitude) : undefined,
                      longitude: longitude ? Number(longitude) : undefined,
                      maxDistance: maxDistance ? Number(maxDistance) : undefined,
                      distanceUnit: distanceUnit as 'mi' | 'km',
                      limit: limit ? Number(limit) : undefined,
                  }
                : {
                      countryCode,
                      postalCode,
                      maxDistance: maxDistance ? Number(maxDistance) : undefined,
                      distanceUnit: distanceUnit as 'mi' | 'km',
                      limit: limit ? Number(limit) : undefined,
                  };

        const { data: stores } = await clients.shopperStores.searchStores({
            params: {
                query: queryParams,
            },
        });

        return Response.json({
            success: true,
            stores,
        });
    } catch (error) {
        const { responseMessage, status_code } = await extractResponseError(error as Error);
        return data(
            {
                success: false,
                error: responseMessage,
            },
            { status: Number(status_code) }
        );
    }
}

export function loader({ request, context }: LoaderFunctionArgs) {
    return searchStores(context, request);
}

// eslint-disable-next-line custom/no-client-loaders
export function clientLoader({ request, context }: ClientLoaderFunctionArgs) {
    return searchStores(context, request);
}
