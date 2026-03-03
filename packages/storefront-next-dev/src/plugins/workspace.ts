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
import type { Plugin } from 'vite';

/**
 * Vite plugin that automatically configures workspace-specific settings when
 * SCAPI_PROXY_HOST is set. This includes:
 * - Disabling DIS (Dynamic Imaging Service) via PUBLIC__app__images__enableDis
 * - Adding dev server proxy rules for image paths (/dw/image, /on/demandware.static)
 * - Allowing all hosts for the dev server (workspace proxies use dynamic hostnames)
 *
 * Environment variables:
 * - `SCAPI_PROXY_HOST` — (Required) Base URL of the SCAPI proxy in workspace environments.
 *    Enables workspace mode when set. Used as the proxy target for SCAPI requests and,
 *    if JWEB_TARGET is not set, for static asset/image paths.
 *    Example: `http://scw:25010`
 * - `JWEB_TARGET` — (Optional) Separate proxy target for JWeb static asset paths
 *    (`/dw/image`, `/on/demandware.static`). Falls back to SCAPI_PROXY_HOST if not set.
 *    Example: `http://jweb:8080`
 * - `PUBLIC__app__images__enableDis` — (Auto-set) Set to `'false'` when SCAPI_PROXY_HOST
 *    is present, unless already explicitly configured. Controls whether the template
 *    uses DIS for image format conversion and responsive srcsets.
 */
export const workspacePlugin = (): Plugin => {
    return {
        name: 'storefront-next-workspace',
        config(_, { mode }) {
            const scapiProxyHost = process.env.SCAPI_PROXY_HOST;
            if (!scapiProxyHost) return;

            // Disable DIS (Dynamic Imaging Service) in workspace environments.
            // Workspace JWeb doesn't support DIS, so the template handles all
            // DIS-related behavior changes based on this single flag.
            // Only set if not already explicitly configured.
            process.env.PUBLIC__app__images__enableDis ??= 'false';

            // Dev server proxy config (only in development mode)
            if (mode !== 'development') return;
            const jwebTarget = process.env.JWEB_TARGET;
            return {
                server: {
                    allowedHosts: true as const,
                    proxy: Object.fromEntries(
                        ['/dw/image', '/on/demandware.static'].map((path) => [
                            path,
                            { target: jwebTarget || scapiProxyHost, changeOrigin: true, secure: false },
                        ])
                    ),
                },
            };
        },
    };
};
