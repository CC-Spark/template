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
import { initReactI18next } from 'react-i18next';
import { createI18nextMiddleware } from 'remix-i18next/middleware';
import { type MiddlewareFunction } from 'react-router';
import resources from '@/locales'; // Import translations from all of your locales - SERVER ONLY
import 'i18next';
import { i18nextContext } from '@/lib/i18next';
import { requestToLocaleMap } from '@salesforce/storefront-next-runtime/multi-site';

const [originalI18nextMiddleware, getLocale, getInstance] = createI18nextMiddleware({
    // Read the locale from the multi-site middleware via WeakMap
    detection: {
        // Use only custom detection as implemented by findLocale - bypass all built-in detection methods
        order: ['custom'],
        // Read the locale resolved by multi-site middleware
        // Multi-site stores the locale ID in a WeakMap keyed by the Request object
        // eslint-disable-next-line @typescript-eslint/require-await
        findLocale: async (request: Request) => {
            const localeId = requestToLocaleMap.get(request);
            return localeId ?? null;
        },
        // The following properties are not used in the detection process but are required by i18next
        // TODO: is there a way to call getConfig here? I can't see a way to pass in the router context.
        fallbackLanguage: 'en-GB',
        supportedLanguages: ['it-IT', 'en-GB'], // Your supported languages, the fallback should be LAST
    },
    i18next: {
        resources,
        interpolation: {
            escapeValue: false,
            format: (value, format) => {
                if (format === 'number' && typeof value === 'number') {
                    return value.toLocaleString();
                }
                return value;
            },
        },
    }, // Translations from all of your locales
    plugins: [initReactI18next], // Plugins you may need, like react-i18next
});

const i18nextMiddleware: MiddlewareFunction<Response> = async (args, next) => {
    // Store bound accessor functions in context (bound to args.context)
    // These will be called AFTER originalI18nextMiddleware sets up i18next
    args.context.set(i18nextContext, {
        getLocale: () => getLocale(args.context),
        getI18nextInstance: () => getInstance(args.context),
    });

    return originalI18nextMiddleware(args, next);
};

export { i18nextMiddleware };

// This adds type-safety to the `t` function throughout the application
declare module 'i18next' {
    interface CustomTypeOptions {
        resources: (typeof resources)['en-GB']; // Use `en-GB` as source of truth for the types
    }
}
