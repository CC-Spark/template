import type { RequestHandler } from 'express';
/** @sfdc-extension-line SFDC_EXT_HYBRID_PROXY */
import { createHybridProxyMiddleware } from '@/extensions/hybrid-proxy/server/middleware';
/** @sfdc-extension-line SFDC_EXT_HYBRID_PROXY */
import { cookieCaptureMiddleware } from '@/extensions/hybrid-proxy/server/cookie-capture';
import config from '@/config/server';

/**
 * Registry for custom server middlewares.
 * This allows for the injection of middleware from extensions.
 * This setup enables extensions, such as hybrid-proxy, to integrate their own Express middlewares by adding them to an array.
 * This approach keeps the core server logic clean and easy to upgrade.
 */
export const customMiddlewares: RequestHandler[] = [
    /** @sfdc-extension-block-start SFDC_EXT_HYBRID_PROXY */
    // Cookie capture must run before other middlewares to wrap the request
    cookieCaptureMiddleware,
    createHybridProxyMiddleware(config.app.commerce.api.siteId, config.app.site.locale),
    /** @sfdc-extension-block-end SFDC_EXT_HYBRID_PROXY */
];
