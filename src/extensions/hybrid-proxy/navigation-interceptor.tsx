import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { isProxyPath } from './config';

/**
 * A client-side component that listens for navigation changes.
 * If the user navigates to a path that is configured to be proxied,
 * this component forces a full page reload so that the request
 * goes to the server (and hits the Hybrid Proxy middleware) instead
 * of being handled by the client-side router.
 */
export function HybridProxyNavigationInterceptor() {
    const location = useLocation();

    useEffect(() => {
        if (isProxyPath(location.pathname)) {
            // We are on a client-side route that should be proxied by the server.
            // Force a hard reload to hit the server middleware.
            window.location.reload();
        }
    }, [location]);

    return null;
}
