import { createProxyMiddleware, type RequestHandler } from 'http-proxy-middleware';
import { HYBRID_PROXY_CONFIG, isProxyPath, getProxyPathConfig } from '../config';

/**
 * Creates a proxy middleware that forwards requests to an SFRA/SiteGenesis instance
 */
export function createHybridProxyMiddleware(siteId: string, locale: string): RequestHandler {
    const { enabled, sfccOrigin, getRewritePrefix } = HYBRID_PROXY_CONFIG;
    // Use configured prefix generator or fallback to SFRA default
    const hybridPrefix = getRewritePrefix ? getRewritePrefix(siteId, locale) : `/s/${siteId}/${locale}`;

    if (!enabled || !sfccOrigin) {
        return (req, res, next) => next();
    }

    const proxy = createProxyMiddleware({
        target: sfccOrigin,
        changeOrigin: true,
        secure: false,
        autoRewrite: true, // Rewrites the Location header in redirects to match the proxy
        cookieDomainRewrite: { '*': '' }, // Rewrites cookie domain to match the proxy
        pathFilter: (path) => isProxyPath(path),
        on: {
            proxyReq: (proxyReq) => {
                // Ensure Origin header is set to the SFRA/SiteGenesis origin to avoid CORS issues
                proxyReq.setHeader('origin', sfccOrigin);
                // Tell SFRA/SiteGenesis that the original request was HTTPS (prevents infinite http->https redirects)
                proxyReq.setHeader('x-forwarded-proto', 'https');
            },
            proxyRes: (proxyRes, req) => {
                // Rewrite https to http for localhost redirects
                if (proxyRes.headers.location) {
                    const location = proxyRes.headers.location;
                    const isClientHttps = req.socket?.encrypted;

                    if (location.startsWith('https://') && !isClientHttps) {
                        proxyRes.headers.location = location.replace('https://', 'http://');
                    }
                }
            },
        },
    });

    return (req, res, next) => {
        // Explicitly handle "needsPrefix" paths by redirecting the browser
        const config = getProxyPathConfig(req.path);
        if (config?.needsPrefix) {
            const redirectPath = `${hybridPrefix}${req.path}`;
            if (req.path !== redirectPath) {
                res.redirect(redirectPath);
                return;
            }
        }

        return proxy(req, res, next);
    };
}
