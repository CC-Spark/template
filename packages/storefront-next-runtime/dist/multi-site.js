import { createContext, createCookie } from "react-router";

//#region src/multi-site/utils.ts
/**
* Extract a string value from the URL path segment at the given index.
*/
function lookupFromPath(pathname, pathIndex) {
	const pathSegments = pathname.split("/").filter(Boolean);
	if (pathSegments.length <= pathIndex) return null;
	return pathSegments[pathIndex];
}
/**
* Detect a string value from cookie using the given cookie parser.
*
* Returns a promise that resolves to the cookie value.
*/
async function readCookieFromRequest(request, cookie) {
	const cookies = request.headers.get("Cookie");
	if (!cookies) return null;
	return await cookie.parse(cookies);
}

//#endregion
//#region src/multi-site/site-detection.ts
/**
* Detect site reference from cookie.
*/
async function readSiteFromCookie(request, cookie) {
	return readCookieFromRequest(request, cookie);
}
/**
* Get site object using the site id or alias
* 1. Check siteIdentifier against each site's alias; if matched, return that site.
* 2. Else check against each site's id; if matched, return that site.
* 3. If no match, return null.
*/
function getSiteFromIdOrAlias(siteIdentifier, sites) {
	if (!siteIdentifier) return null;
	return sites.find((site) => site.alias === siteIdentifier || site.id === siteIdentifier) ?? null;
}
/**
* Resolve site using the configured detection order.
* Returns the first valid site from the first source that yields a valid value.
*/
async function resolveSite(request, settings) {
	const { sites, defaultSiteId, siteDetectionConfig, siteCookie } = settings;
	const requestUrl = new URL(request.url);
	const resolvers = {
		path: () => Promise.resolve(lookupFromPath(requestUrl.pathname, siteDetectionConfig.lookupFromPathIndex)),
		querystring: () => Promise.resolve(requestUrl.searchParams.get(siteDetectionConfig.lookupQuerystring)),
		header: () => Promise.resolve(request.headers.get(siteDetectionConfig.lookupHeader)),
		cookie: async () => readSiteFromCookie(request, siteCookie)
	};
	for (const method of siteDetectionConfig.order) {
		const resolvedSite = getSiteFromIdOrAlias(await resolvers[method]?.(), sites);
		if (resolvedSite) return resolvedSite;
	}
	const site = getSiteFromIdOrAlias(defaultSiteId, sites);
	if (!site) throw new Error(`Default site ${defaultSiteId} not found.`);
	return site;
}

//#endregion
//#region src/multi-site/configs.ts
/**
* Default site detection configuration
*/
const DEFAULT_SITE_DETECTION = {
	order: [
		"path",
		"querystring",
		"cookie",
		"header"
	],
	lookupFromPathIndex: 0,
	lookupQuerystring: "site",
	lookupCookie: "site_id",
	lookupHeader: "X-Site-Id",
	caches: ["cookie"]
};
/**
* Default locale detection configuration
*/
const DEFAULT_LOCALE_DETECTION = {
	order: [
		"path",
		"querystring",
		"cookie",
		"header"
	],
	lookupFromPathIndex: 1,
	lookupQuerystring: "lng",
	lookupCookie: "lng",
	lookupHeader: "Accept-Language",
	caches: ["cookie"]
};

//#endregion
//#region src/multi-site/cookies.ts
/**
* Cookie options for multi-site cookies
*/
const COOKIE_OPTIONS = {
	path: "/",
	sameSite: "lax",
	secure: process.env.NODE_ENV === "production",
	httpOnly: true
};
/**
* Creates a cookie instance with the given name.
*
* @param name - Cookie name
* @returns Cookie instance configured with multi-site options
*/
function createMultiSiteCookie(name) {
	return createCookie(name, COOKIE_OPTIONS);
}
/**
* WeakMap to pass resolved locale from multi-site middleware to i18next's findLocale.
* WeakMap allows garbage collection when requests are done.
* This is necessary because findLocale() only receives the Request object, not the router context.
*/
const requestToLocaleMap = /* @__PURE__ */ new WeakMap();

//#endregion
//#region src/multi-site/locale-detection.ts
/**
* Read locale from cookie.
*/
async function readLocaleFromCookie(request, cookie) {
	return readCookieFromRequest(request, cookie);
}
/**
* Get locale object using the locale id or alias.
* 1. Check localeIdOrAlias against each locale's alias; if matched, return that locale.
* 2. Else check against each locale's id; if matched, return that locale.
* 3. If no match, return null (caller should use defaultLocale).
*
* @param localeIdentifier - The locale id or alias to get the locale from. Null is allowed because this may come from
* extrenal sources such as cookies, headers, or query parameters.
* @param locales - The list of locales to search through.
* @returns The locale object if found, otherwise null.
*/
function getLocaleFromIdOrAlias(localeIdentifier, locales) {
	if (!localeIdentifier) return null;
	return locales.find((locale) => locale.alias === localeIdentifier || locale.id === localeIdentifier) ?? null;
}
/**
* Resolve locale using the configured detection order.
* Returns the first valid locale from the first source that yields a valid value.
*/
async function resolveLocale(request, settings, site) {
	const { defaultLocale, localeDetectionConfig, localeCookie } = settings;
	const { supportedLocales } = site;
	let locale = null;
	const requestUrl = new URL(request.url);
	const resolvers = {
		path: () => Promise.resolve(lookupFromPath(requestUrl.pathname, localeDetectionConfig.lookupFromPathIndex)),
		querystring: () => Promise.resolve(requestUrl.searchParams.get(localeDetectionConfig.lookupQuerystring)),
		header: () => Promise.resolve(request.headers.get(localeDetectionConfig.lookupHeader)),
		cookie: async () => readLocaleFromCookie(request, localeCookie)
	};
	for (const method of localeDetectionConfig.order) {
		const resolvedLocale = getLocaleFromIdOrAlias(await resolvers[method]?.(), supportedLocales);
		if (resolvedLocale) return resolvedLocale;
	}
	if (!locale) locale = getLocaleFromIdOrAlias(defaultLocale, supportedLocales);
	if (!locale) throw new Error(`Default locale ${defaultLocale} not found in the list of supported locales for site ${site.id}.`);
	return locale;
}

//#endregion
//#region src/multi-site/middleware.ts
const multiSiteContext = createContext(null);
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
function getMultiSiteCookies(context) {
	const multiSite = context.get(multiSiteContext);
	if (!multiSite) return null;
	return {
		siteCookie: multiSite.siteCookie,
		localeCookie: multiSite.localeCookie
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
async function shouldSetCookies(request, response, settings) {
	const cacheSite = settings.siteDetectionConfig.caches?.includes("cookie");
	const cacheLocale = settings.localeDetectionConfig.caches?.includes("cookie");
	if (!cacheSite && !cacheLocale) return {
		shouldSetSiteCookie: false,
		shouldSetLocaleCookie: false
	};
	const requestCookieHeader = request.headers.get("Cookie");
	const [existingSiteCookie, existingLocaleCookie] = await Promise.all([settings.siteCookie.parse(requestCookieHeader), settings.localeCookie.parse(requestCookieHeader)]);
	const responseSetCookies = response.headers.getSetCookie?.() || [];
	const isSettingSiteCookieInResponse = responseSetCookies.some((cookie) => cookie.startsWith(`${settings.siteCookie.name}=`));
	const isSettingLocaleCookieInResponse = responseSetCookies.some((cookie) => cookie.startsWith(`${settings.localeCookie.name}=`));
	return {
		shouldSetSiteCookie: cacheSite && !existingSiteCookie && !isSettingSiteCookieInResponse,
		shouldSetLocaleCookie: cacheLocale && !existingLocaleCookie && !isSettingLocaleCookieInResponse
	};
}
/**
* Creates a multi-site middleware that resolves the current site from
* the request (path, cookie, header, query, or default) and stores the
* result in the router context.
*
* Does not import or read from app config context; the consumer supplies config.
*/
function createMultiSiteMiddleware(config) {
	const siteDetectionConfig = {
		...DEFAULT_SITE_DETECTION,
		...config.siteDetectionConfig
	};
	const localeDetectionConfig = {
		...DEFAULT_LOCALE_DETECTION,
		...config.localeDetectionConfig
	};
	const siteCookie = createMultiSiteCookie(siteDetectionConfig.lookupCookie);
	const localeCookie = createMultiSiteCookie(localeDetectionConfig.lookupCookie);
	const settings = {
		...config,
		siteDetectionConfig,
		localeDetectionConfig,
		siteCookie,
		localeCookie
	};
	const multiSiteMiddleware = async ({ request, context }, next) => {
		const site = await resolveSite(request, settings);
		const locale = await resolveLocale(request, settings, site);
		context.set(multiSiteContext, {
			site,
			locale,
			siteCookie: settings.siteCookie,
			localeCookie: settings.localeCookie
		});
		requestToLocaleMap.set(request, locale.id);
		const response = await next();
		const { shouldSetSiteCookie, shouldSetLocaleCookie } = await shouldSetCookies(request, response, settings);
		if (!shouldSetSiteCookie && !shouldSetLocaleCookie) return response;
		const [siteSetCookie, localeSetCookie] = await Promise.all([shouldSetSiteCookie ? settings.siteCookie.serialize(site.id, { path: "/" }) : Promise.resolve(null), shouldSetLocaleCookie ? settings.localeCookie.serialize(locale.id, { path: "/" }) : Promise.resolve(null)]);
		if (siteSetCookie) response.headers.append("Set-Cookie", siteSetCookie);
		if (localeSetCookie) response.headers.append("Set-Cookie", localeSetCookie);
		return response;
	};
	return multiSiteMiddleware;
}

//#endregion
export { createMultiSiteMiddleware, getMultiSiteCookies, multiSiteContext, requestToLocaleMap };
//# sourceMappingURL=multi-site.js.map