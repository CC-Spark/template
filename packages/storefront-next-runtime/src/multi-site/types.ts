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

import type { Cookie } from 'react-router';

export type Locale = {
    id: string;
    alias?: string;
    preferredCurrency: string;
};

export type Site = {
    id: string;
    name: string;
    alias?: string;
    supportedLocales: Locale[];
    supportedCurrencies: string[];
    defaultCurrency: string;
};

export type MultiSiteContext = {
    site: Site;
    locale: Locale;
    siteCookie: Cookie;
    localeCookie: Cookie;
};

/**
 * Configuration passed into the multi-site middleware
 * Configured by the consumer
 */
export type MultiSiteConfig = {
    sites: Site[];
    defaultSiteId: string;
    defaultLocale: string;
    siteDetectionConfig?: DetectionConfig;
    localeDetectionConfig?: DetectionConfig;
};

/**
 * Resolved settings used by site/locale resolution (all detection options have values).
 */
export type MultiSiteSettings = MultiSiteConfig & {
    siteDetectionConfig: Required<DetectionConfig>;
    localeDetectionConfig: Required<DetectionConfig>;
    siteCookie: Cookie;
    localeCookie: Cookie;
};

/** Detection method identifier (used for both site and locale detection) */
export type DetectionMethod = 'path' | 'querystring' | 'cookie' | 'header';

// Detection configuration type (all fields optional with sensible defaults)
export type DetectionConfig = {
    order: DetectionMethod[];
    lookupFromPathIndex?: number;
    lookupQuerystring?: string;
    lookupCookie?: string;
    lookupHeader?: string;
    caches?: Array<'cookie'>;
};
