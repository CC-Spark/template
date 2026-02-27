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

import { createContext, type MiddlewareFunction, type RouterContextProvider } from 'react-router';
import { resolveSite } from './site-detection';
import type { MultiSiteConfig, MultiSiteContext, MultiSiteSettings } from './types';
import { DEFAULT_SITE_DETECTION, DEFAULT_LOCALE_DETECTION } from './configs';
import { createMultiSiteCookie, requestToLocaleMap } from './cookies';
import { resolveLocale } from './locale-detection';

export const multiSiteContext = createContext<MultiSiteContext | null>(null);

type MiddlewareArgs = { request: Request; context: Readonly<RouterContextProvider> };

/**
 * Helper function to get multi-site cookies from router context.
 * Useful in server actions and loaders that need to read/set cookies.
 *
 * @param context - Router context provider
 * @returns Object with siteCookie and localeCookie instances, or null if context not set
 *
 * @example
 * ```typescript
 * export const action: ActionFunction = async ({ request, context }) => {
 *     const cookies = getMultiSiteCookies(context);
 *     if (cookies) {
 *         const cookieHeader = await cookies.localeCookie.serialize(locale);
 *         // ... use cookieHeader
 *     }
 * };
 * ```
 */
export function getMultiSiteCookies(context: Readonly<RouterContextProvider>) {
    const multiSite = context.get(multiSiteContext);
    if (!multiSite) return null;
    return {
        siteCookie: multiSite.siteCookie,
        localeCookie: multiSite.localeCookie,
    };
}

/**
 * Helper function to determine if cookies should be set based on:
 * 1. Whether caching is enabled for each cookie type
 * 2. Whether cookies already exist in the incoming request
 * 3. Whether cookies were already set by actions/loaders in the response
 *
 * @param request - Incoming request
 * @param response - Response from next()
 * @param settings - Multi-site settings with cookie instances and detection config
 * @returns Object with shouldSetSiteCookie and shouldSetLocaleCookie booleans
 */
async function shouldSetCookies(
    request: Request,
    response: Response,
    settings: MultiSiteSettings
): Promise<{ shouldSetSiteCookie: boolean; shouldSetLocaleCookie: boolean }> {
    const cacheSite = settings.siteDetectionConfig.caches?.includes('cookie');
    const cacheLocale = settings.localeDetectionConfig.caches?.includes('cookie');

    // Early return if no cookie caching is enabled
    if (!cacheSite && !cacheLocale) {
        return { shouldSetSiteCookie: false, shouldSetLocaleCookie: false };
    }

    // Check if cookies already exist in the incoming request
    // If cookies already exist, we don't need to set them here
    const requestCookieHeader = request.headers.get('Cookie');
    const [existingSiteCookie, existingLocaleCookie] = await Promise.all([
        settings.siteCookie.parse(requestCookieHeader),
        settings.localeCookie.parse(requestCookieHeader),
    ]);

    // Check if cookies were already set by actions/loaders
    // If they were then we don't want to override them
    const responseSetCookies = response.headers.getSetCookie?.() || [];
    const isSettingSiteCookieInResponse = responseSetCookies.some((cookie) =>
        cookie.startsWith(`${settings.siteCookie.name}=`)
    );
    const isSettingLocaleCookieInResponse = responseSetCookies.some((cookie) =>
        cookie.startsWith(`${settings.localeCookie.name}=`)
    );

    // Only set cookies if they don't exist in request AND weren't set in response
    // In other words, we create the cookies if they are not initialized
    // Othewise, rely only actions to update the cookies
    return {
        shouldSetSiteCookie: cacheSite && !existingSiteCookie && !isSettingSiteCookieInResponse,
        shouldSetLocaleCookie: cacheLocale && !existingLocaleCookie && !isSettingLocaleCookieInResponse,
    };
}

/**
 * Creates a multi-site middleware that resolves the current site from
 * the request (path, cookie, header, query, or default) and stores the
 * result in the router context.
 *
 * Does not import or read from app config context; the consumer supplies config.
 */
export function createMultiSiteMiddleware(config: MultiSiteConfig): MiddlewareFunction<Response> {
    // Merge config with defaults so every detection option has a value
    const siteDetectionConfig: MultiSiteSettings['siteDetectionConfig'] = {
        ...DEFAULT_SITE_DETECTION,
        ...config.siteDetectionConfig,
    };
    const localeDetectionConfig: MultiSiteSettings['localeDetectionConfig'] = {
        ...DEFAULT_LOCALE_DETECTION,
        ...config.localeDetectionConfig,
    };

    // Create cookies based on configured names
    const siteCookie = createMultiSiteCookie(siteDetectionConfig.lookupCookie);
    const localeCookie = createMultiSiteCookie(localeDetectionConfig.lookupCookie);

    const settings: MultiSiteSettings = {
        ...config,
        siteDetectionConfig,
        localeDetectionConfig,
        siteCookie,
        localeCookie,
    };

    const multiSiteMiddleware: MiddlewareFunction<Response> = async (
        { request, context }: MiddlewareArgs,
        next: () => Promise<Response>
    ): Promise<Response> => {
        const site = await resolveSite(request, settings);
        const locale = await resolveLocale(request, settings, site);

        // Store full Site, Locale, and Cookie objects in context for downstream middlewares (currency, loaders, etc.)
        context.set(multiSiteContext, {
            site,
            locale,
            siteCookie: settings.siteCookie,
            localeCookie: settings.localeCookie,
        });

        // Store locale in a WeakMap so i18next's findLocale can access it
        // This is necessary because findLocale only receives Request and cannot access the router context
        requestToLocaleMap.set(request, locale.id);

        const response = await next();

        // Determine if cookies should be set
        const { shouldSetSiteCookie, shouldSetLocaleCookie } = await shouldSetCookies(request, response, settings);

        // Early return if no cookies need to be set
        if (!shouldSetSiteCookie && !shouldSetLocaleCookie) {
            return response;
        }

        const [siteSetCookie, localeSetCookie] = await Promise.all([
            shouldSetSiteCookie ? settings.siteCookie.serialize(site.id, { path: '/' }) : Promise.resolve(null),
            shouldSetLocaleCookie ? settings.localeCookie.serialize(locale.id, { path: '/' }) : Promise.resolve(null),
        ]);

        if (siteSetCookie) response.headers.append('Set-Cookie', siteSetCookie);
        if (localeSetCookie) response.headers.append('Set-Cookie', localeSetCookie);

        return response;
    };

    return multiSiteMiddleware;
}
