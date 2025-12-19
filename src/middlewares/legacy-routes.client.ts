import type { DataStrategyResult, MiddlewareFunction } from 'react-router';
import { appConfigContext } from '@/config';

/**
 * Client-side middleware that intercepts navigation to legacy routes and forces a full page navigation.
 *
 * This middleware runs before any loaders or components render, checking if the current
 * navigation target is a configured legacy route. If so, it triggers a full page navigation
 * to let the CDN/server handle routing to the legacy backend (e.g., SFRA, SiteGenesis).
 *
 * Configuration:
 * Set `site.hybrid.legacyRoutes` in your config to define which routes should trigger redirects.
 *
 * Example:
 * ```
 * site: {
 *   hybrid: {
 *     enabled: true,
 *     legacyRoutes: ['/checkout', '/account/orders']
 *   }
 * }
 * ```
 *
 * Flow:
 * 1. User clicks <Link to="/checkout">
 * 2. React Router begins client-side navigation
 * 3. This middleware checks if /checkout is in legacyRoutes
 * 4. If yes → adds ?redirected=1 and navigates → server/CDN handles routing
 * 5. If no → continue normal client-side navigation
 */

const legacyRoutesMiddleware: MiddlewareFunction<Record<string, DataStrategyResult>> = async (
    { request, context },
    next
) => {
    // Only run on client-side
    if (typeof window === 'undefined') {
        return next();
    }
    const config = context.get(appConfigContext);
    const enabled = config?.site?.hybrid?.enabled ?? false;
    const legacyRoutes = config?.site?.hybrid?.legacyRoutes;

    // If hybrid mode is disabled or no legacy routes configured, skip
    if (!enabled || !legacyRoutes || legacyRoutes.length === 0) {
        return next();
    }

    const url = new URL(request.url);
    const pathname = url.pathname;
    const hasRedirected = url.searchParams.get('redirected') === '1';

    // If already redirected once, let React Router handle it (will show 404 or error boundary)
    if (hasRedirected) {
        return next();
    }

    const isLegacyRoute = legacyRoutes.some((legacyRoute) => pathname === legacyRoute);

    if (isLegacyRoute) {
        // Add redirected=1 to prevent infinite loops
        url.searchParams.set('redirected', '1');

        // Force a full page navigation to hit the server/CDN
        // The CDN routing rules or server middleware will handle routing to the legacy backend
        window.location.href = url.toString();

        // Return empty result to prevent further processing
        // (though navigation will interrupt execution anyway)
        return {};
    }

    // Not a legacy route, continue with normal client-side navigation
    return next();
};

export default legacyRoutesMiddleware;
