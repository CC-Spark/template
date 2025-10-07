/// <reference types="vitest" />
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, type Plugin, loadEnv } from 'vite';
import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import devtoolsJson from 'vite-plugin-devtools-json';
import odysseyPlugin from '@salesforce/vite-plugin-odyssey';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * @see {@link https://vite.dev/config/}
 * @see {@link https://github.com/http-party/node-http-proxy?tab=readme-ov-file#modify-response}
 */
export default defineConfig(({ mode }) => {
    const environment = loadEnv(mode, __dirname);
    const target = `https://${environment.VITE_COMMERCE_API_SHORT_CODE}.api.commercecloud.salesforce.com`;

    return {
        define: {
            __DEV__: `${mode !== 'production'}`,
            __TEST__: `${mode === 'test'}`,
        },
        plugins: [
            transformRequireNodeFetch(),
            mode !== 'test' && reactRouter(),
            tailwindcss(),
            tsconfigPaths(),
            devtoolsJson(),
            odysseyPlugin(),
        ],
        resolve: {
            alias: {
                '@': resolve(__dirname, './src'),
                // Ensure the ESM version of the `commerce-sdk-isomorphic` gets picked up for server builds as well
                'commerce-sdk-isomorphic': resolve(__dirname, 'node_modules/commerce-sdk-isomorphic/lib/index.esm.js'),
            },
        },
        optimizeDeps: {
            include: ['react-router', 'react-router/internal/react-server-client'],
        },
        test: {
            // Force our `.env.default` file to be used for tests
            env: loadEnv('default', __dirname),
            globals: true,
            environment: 'jsdom',
            setupFiles: ['./vitest.setup.ts'],
            include: ['**/*.{test,spec}.{ts,tsx}'],
        },
        server: {
            proxy: {
                // Proxy Commerce Cloud API requests directly to your instance
                '/mobify/proxy/api': {
                    target,
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/mobify\/proxy\/api/, ''),
                    configure: (proxy, _options) => {
                        proxy.on('proxyReq', (proxyReq, req) => {
                            console.log(
                                '🔄 Proxying request:',
                                req.method,
                                req.url,
                                '→',
                                `${String(proxyReq.getHeader('host'))}${proxyReq.path}`
                            );
                        });
                        proxy.on('proxyRes', (proxyRes, req) => {
                            if (
                                typeof proxyRes.statusCode === 'number' &&
                                proxyRes.statusCode >= 200 &&
                                proxyRes.statusCode <= 399
                            ) {
                                console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
                            } else {
                                const body: Buffer[] = [];
                                proxyRes.on('data', (chunk: Buffer) => {
                                    body.push(chunk);
                                });
                                proxyRes.on('end', () => {
                                    console.log(
                                        '❌ Proxy error:',
                                        proxyRes.statusCode,
                                        req.url,
                                        Buffer.concat(body).toString()
                                    );
                                });
                            }
                        });
                        proxy.on('error', (err, req) => {
                            console.error('❌ Proxy error:', err.message, req.url);
                        });
                    },
                },
            },
        },
    };
});

/**
 * This is a silly plugin that's required to remove an invalid `require('node-fetch')` call
 * inside the `commerce-sdk-isomorphic` package.
 */
function transformRequireNodeFetch(): Plugin {
    return {
        name: 'transform-require-node-fetch',
        enforce: 'pre',
        transform(code: string, id: string) {
            if (!id.includes('node_modules/commerce-sdk-isomorphic/lib/index.esm.js')) {
                return;
            }
            const requirePattern = /return\s*require\(['"]node-fetch['"]\)\.default;/;
            const match = code.match(requirePattern);
            if (match) {
                return {
                    code: code.replace(requirePattern, 'return globalThis.fetch;'),
                    map: null,
                };
            }
        },
    };
}
