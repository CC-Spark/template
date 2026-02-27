import * as react_router0 from "react-router";
import { Cookie, MiddlewareFunction, RouterContextProvider } from "react-router";

//#region src/multi-site/types.d.ts

type Locale = {
  id: string;
  alias?: string;
  preferredCurrency: string;
};
type Site = {
  id: string;
  name: string;
  alias?: string;
  supportedLocales: Locale[];
  supportedCurrencies: string[];
  defaultCurrency: string;
};
type MultiSiteContext = {
  site: Site;
  locale: Locale;
  siteCookie: Cookie;
  localeCookie: Cookie;
};
/**
 * Configuration passed into the multi-site middleware
 * Configured by the consumer
 */
type MultiSiteConfig = {
  sites: Site[];
  defaultSiteId: string;
  defaultLocale: string;
  siteDetectionConfig?: DetectionConfig;
  localeDetectionConfig?: DetectionConfig;
};
/** Detection method identifier (used for both site and locale detection) */
type DetectionMethod = 'path' | 'querystring' | 'cookie' | 'header';
type DetectionConfig = {
  order: DetectionMethod[];
  lookupFromPathIndex?: number;
  lookupQuerystring?: string;
  lookupCookie?: string;
  lookupHeader?: string;
  caches?: Array<'cookie'>;
};
//#endregion
//#region src/multi-site/middleware.d.ts
declare const multiSiteContext: react_router0.RouterContext<MultiSiteContext | null>;
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
declare function getMultiSiteCookies(context: Readonly<RouterContextProvider>): {
  siteCookie: react_router0.Cookie;
  localeCookie: react_router0.Cookie;
} | null;
/**
 * Creates a multi-site middleware that resolves the current site from
 * the request (path, cookie, header, query, or default) and stores the
 * result in the router context.
 *
 * Does not import or read from app config context; the consumer supplies config.
 */
declare function createMultiSiteMiddleware(config: MultiSiteConfig): MiddlewareFunction<Response>;
//#endregion
//#region src/multi-site/cookies.d.ts
/**
 * WeakMap to pass resolved locale from multi-site middleware to i18next's findLocale.
 * WeakMap allows garbage collection when requests are done.
 * This is necessary because findLocale() only receives the Request object, not the router context.
 */
declare const requestToLocaleMap: WeakMap<Request, string>;
//#endregion
export { type DetectionConfig, type Locale, type MultiSiteConfig, type MultiSiteContext, type Site, createMultiSiteMiddleware, getMultiSiteCookies, multiSiteContext, requestToLocaleMap };
//# sourceMappingURL=multi-site.d.ts.map