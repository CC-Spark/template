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
import { data, type ActionFunction } from 'react-router';
import { getMultiSiteCookies } from '@salesforce/storefront-next-runtime/multi-site';

/**
 * Server action to set the locale cookie
 * This ensures the cookie is properly serialized using the same cookie object
 * that the server middleware uses to parse it
 *
 * Note: This MUST be a server action (not clientAction) because we need to set
 * the Set-Cookie HTTP header, which can only be done server-side.
 */
export const action: ActionFunction = async ({ request, context }) => {
    const formData = await request.formData();
    const locale = formData.get('locale') as string;

    if (!locale) {
        // The form data is missing the locale. This is a client error so we return a 400 response.
        throw new Response('Locale is required', { status: 400 });
    }

    // Get cookies from multi-site middleware context
    const cookies = getMultiSiteCookies(context);
    if (!cookies) {
        // If the site and locale cookies weren't initialized in the multi-site middleware, this is a server error
        // so we return a 500 response.
        throw new Response('Site and locale cookies were not initialized', { status: 500 });
    }

    // Set the cookie using the same cookie object that the middleware uses
    const cookieHeader = await cookies.localeCookie.serialize(locale);

    // Return success without redirecting (useFetcher expects a response)
    return data(
        { success: true },
        {
            headers: {
                'Set-Cookie': cookieHeader,
            },
        }
    );
};
