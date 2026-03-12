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

import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { createConfigWrapper, mockBuildConfig, mockConfig } from './context-provider-utils';
import React from 'react';

vi.mock('@salesforce/storefront-next-runtime/config', async (importOriginal) => {
    const original = await importOriginal<Record<string, unknown>>();
    return {
        ...original,
        ConfigProvider: ({ children, config }: { children: React.ReactNode; config: any }) => {
            return React.createElement(
                'div',
                {
                    'data-testid': 'config-provider',
                    'data-config': JSON.stringify(config),
                },
                children
            );
        },
    };
});

describe('context-provider-utils', () => {
    describe('mockBuildConfig', () => {
        it('has correct structure', () => {
            expect(mockBuildConfig).toHaveProperty('metadata');
            expect(mockBuildConfig).toHaveProperty('runtime');
            expect(mockBuildConfig).toHaveProperty('app');
            expect(mockBuildConfig.app).toHaveProperty('performance');
            expect(mockBuildConfig.app).toHaveProperty('development');
        });

        it('has correct metadata', () => {
            expect(mockBuildConfig.metadata.projectName).toBe('Test Project');
            expect(mockBuildConfig.metadata.projectSlug).toBe('test-project');
        });

        it('has correct commerce configuration', () => {
            expect(mockBuildConfig.app.commerce.api.clientId).toBe('test-client');
            expect(mockBuildConfig.app.commerce.api.organizationId).toBe('test-org');
            expect(mockBuildConfig.app.commerce.api.siteId).toBe('test-site');
        });

        it('has correct site configuration', () => {
            // config now allows multi site set up. Here we check the first site in the least
            // it is required to have at least on proper site config in the array
            expect(mockBuildConfig.app.commerce.sites[0].defaultLocale).toBe('en-GB');
            expect(mockBuildConfig.app.commerce.sites[0].defaultCurrency).toBe('GBP');
            expect(mockBuildConfig.app.features.guestCheckout).toBe(true);
        });

        it('has correct global configuration', () => {
            expect(mockBuildConfig.app.global.branding.name).toBe('Test Store');
            expect(mockBuildConfig.app.search.products.hits.limit).toBe(24);
            expect(mockBuildConfig.app.global.badges).toHaveLength(2);
        });

        it('has correct images configuration', () => {
            expect(mockBuildConfig.app.images).toEqual({
                host: 'https://edge.disstg.commercecloud.salesforce.com',
                quality: 70,
                formats: ['webp'],
                fallbackFormat: 'jpg',
            });
        });

        it('has correct links configuration', () => {
            expect(mockBuildConfig.app.links).toEqual({
                preconnect: ['https://edge.disstg.commercecloud.salesforce.com'],
            });
        });

        it('has correct performance configuration', () => {
            expect(mockBuildConfig.app.performance.caching).toEqual({
                apiCacheTtl: 300,
                staticAssetCacheTtl: 31536000,
            });
            expect(mockBuildConfig.app.performance.metrics).toEqual({
                serverPerformanceMetricsEnabled: true,
                serverTimingHeaderEnabled: false,
                clientPerformanceMetricsEnabled: true,
            });
        });

        it('has correct development configuration', () => {
            expect(mockBuildConfig.app.development.enableDevtools).toBe(true);
            expect(mockBuildConfig.app.development.hotReload).toBe(true);
            expect(mockBuildConfig.app.development.strictMode).toBe(true);
        });
    });

    describe('mockConfig', () => {
        it('is created from mockBuildConfig app section', () => {
            expect(mockConfig).toEqual(mockBuildConfig.app);
        });
    });

    describe('createConfigWrapper', () => {
        it('creates a wrapper component without overrides', () => {
            const TestComponent = () => React.createElement('div', { 'data-testid': 'test-component' }, 'Test');
            const ConfigWrapper = createConfigWrapper();

            const { container } = render(React.createElement(ConfigWrapper, null, React.createElement(TestComponent)));

            expect(container.querySelector('[data-testid="config-provider"]')).toBeInTheDocument();
            expect(container.querySelector('[data-testid="test-component"]')).toBeInTheDocument();
        });

        it('creates a wrapper component with overrides', () => {
            const TestComponent = () => React.createElement('div', { 'data-testid': 'test-component' }, 'Test');
            const ConfigWrapper = createConfigWrapper({
                app: {
                    ...mockBuildConfig.app,
                    features: {
                        passwordlessLogin: {
                            enabled: true,
                            mode: 'email' as const,
                            callbackUri: '/callback',
                            landingUri: '/account',
                        },
                        resetPassword: {
                            mode: 'email' as const,
                            callbackUri: '/reset-callback',
                            landingUri: '/reset-landing',
                        },
                        socialLogin: { enabled: false, callbackUri: '/callback', providers: [] },
                        socialShare: { enabled: false, providers: [] },
                        guestCheckout: false,
                        shopperContext: { enabled: false },
                        googleCloudAPI: { apiKey: '' },
                    },
                    defaultSiteId: 'RefArchGlobal',
                    commerce: {
                        ...mockBuildConfig.app.commerce,
                        sites: [
                            {
                                id: 'RefArch',
                                cookies: {
                                    domain: undefined,
                                },
                                defaultLocale: 'fr-FR',
                                defaultCurrency: 'EUR',
                                supportedLocales: [
                                    { id: 'en-US', preferredCurrency: 'USD' },
                                    { id: 'fr-FR', preferredCurrency: 'EUR' },
                                ],
                                supportedCurrencies: ['EUR', 'USD'],
                            },
                        ],
                    },
                },
            });

            const { container } = render(React.createElement(ConfigWrapper, null, React.createElement(TestComponent)));

            const configProvider = container.querySelector('[data-testid="config-provider"]');
            expect(configProvider).toBeInTheDocument();

            const configData = JSON.parse(configProvider?.getAttribute('data-config') || '{}');
            expect(configData.commerce.sites[0].defaultLocale).toBe('fr-FR');
            expect(configData.commerce.sites[0].defaultCurrency).toBe('EUR');
            expect(configData.features.passwordlessLogin.enabled).toBe(true);
            expect(configData.features.socialLogin.enabled).toBe(false);
            expect(configData.features.guestCheckout).toBe(false);
        });

        it('merges overrides with base config', () => {
            const TestComponent = () => React.createElement('div', { 'data-testid': 'test-component' }, 'Test');
            const ConfigWrapper = createConfigWrapper({
                app: {
                    ...mockBuildConfig.app,
                    global: {
                        branding: {
                            name: 'Custom Store',
                            logoAlt: 'Custom Logo',
                        },
                        productListing: {
                            defaultProductTileImgAspectRatio: 1,
                        },
                        inventory: { lowStockThreshold: 5 },
                        carousel: {
                            defaultItemCount: 4,
                        },
                        badges: [],
                        skeleton: {
                            thumbnails: 4,
                            colorVariants: 3,
                            sizeVariants: 3,
                            accordionSections: 3,
                            defaultItemCount: 4,
                        },
                        recommendations: {
                            search_limit: {
                                youMightLike: 5,
                                completeLook: 5,
                                recentlyViewed: 5,
                            },
                            types: {
                                'you-may-also-like': {
                                    enabled: false,
                                    priority: 1,
                                    sort: 'relevance',
                                    titleKey: 'recommendations.youMayAlsoLike',
                                },
                                'complete-the-look': {
                                    enabled: false,
                                    priority: 2,
                                    sort: 'relevance',
                                    titleKey: 'recommendations.completeTheLook',
                                },
                                'recently-viewed': {
                                    enabled: false,
                                    priority: 3,
                                    sort: 'relevance',
                                    titleKey: 'recommendations.recentlyViewed',
                                },
                            },
                        },
                    },
                },
            });

            const { container } = render(React.createElement(ConfigWrapper, null, React.createElement(TestComponent)));

            const configProvider = container.querySelector('[data-testid="config-provider"]');
            const configData = JSON.parse(configProvider?.getAttribute('data-config') || '{}');

            // Overridden values
            expect(configData.global.branding.name).toBe('Custom Store');
            expect(configData.global.branding.logoAlt).toBe('Custom Logo');

            // Non-overridden values should remain
            expect(configData.commerce.sites[0].defaultLocale).toBe('en-GB');
            expect(configData.commerce.api.clientId).toBe('test-client');
        });

        it('handles nested overrides correctly', () => {
            const TestComponent = () => React.createElement('div', { 'data-testid': 'test-component' }, 'Test');
            const ConfigWrapper = createConfigWrapper({
                app: {
                    ...mockBuildConfig.app,
                    pages: {
                        ...mockBuildConfig.app.pages,
                        cart: {
                            ...mockBuildConfig.app.pages.cart,
                            quantityUpdateDebounce: 1000,
                            enableRemoveConfirmation: false,
                        },
                    },
                },
            });

            const { container } = render(React.createElement(ConfigWrapper, null, React.createElement(TestComponent)));

            const configProvider = container.querySelector('[data-testid="config-provider"]');
            const configData = JSON.parse(configProvider?.getAttribute('data-config') || '{}');

            // Overridden values
            expect(configData.pages.cart.quantityUpdateDebounce).toBe(1000);
            expect(configData.pages.cart.enableRemoveConfirmation).toBe(false);

            // Other cart values should remain
            expect(configData.pages.cart.maxQuantityPerItem).toBe(999);
            expect(configData.pages.cart.enableSaveForLater).toBe(false);
        });

        it('handles empty overrides', () => {
            const TestComponent = () => React.createElement('div', { 'data-testid': 'test-component' }, 'Test');
            const ConfigWrapper = createConfigWrapper({});

            const { container } = render(React.createElement(ConfigWrapper, null, React.createElement(TestComponent)));

            const configProvider = container.querySelector('[data-testid="config-provider"]');
            const configData = JSON.parse(configProvider?.getAttribute('data-config') || '{}');

            expect(configData).toEqual(mockBuildConfig.app);
        });

        it('handles undefined overrides', () => {
            const TestComponent = () => React.createElement('div', { 'data-testid': 'test-component' }, 'Test');
            const ConfigWrapper = createConfigWrapper(undefined);

            const { container } = render(React.createElement(ConfigWrapper, null, React.createElement(TestComponent)));

            const configProvider = container.querySelector('[data-testid="config-provider"]');
            const configData = JSON.parse(configProvider?.getAttribute('data-config') || '{}');

            expect(configData).toEqual(mockBuildConfig.app);
        });
    });
});
