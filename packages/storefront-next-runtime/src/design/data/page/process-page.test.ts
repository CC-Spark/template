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
import { describe, test, expect } from 'vitest';
import { processPage, type PageProcessorContext } from './process-page';
import type { ShopperExperience } from '@/scapi-client/types';

type Page = ShopperExperience.schemas['Page'];
type Component = ShopperExperience.schemas['Component'];

const makeComponent = (id: string, overrides: Partial<Component> = {}) => ({
    id,
    typeId: `type.${id}`,
    regions: [] as ShopperExperience.schemas['Region'][],
    ...overrides,
});

const makeRegion = (id: string, components: ShopperExperience.schemas['Component'][] = []) => ({
    id,
    components,
});

const makePage = (regions: ShopperExperience.schemas['Region'][] = []): Page => ({
    id: 'test-page',
    typeId: 'storePage',
    regions,
});

describe('processPage', () => {
    describe('visibility rules', () => {
        test('keeps components without visibility rules', () => {
            const page = makePage([makeRegion('main', [makeComponent('banner')])]);
            const context: PageProcessorContext = {
                qualifiers: null,
                componentInfo: {
                    banner: {
                        visibilityRules: [],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            expect(result.regions?.[0].components).toHaveLength(1);
            expect(result.regions?.[0].components?.[0].id).toBe('banner');
        });

        test('removes components whose visibility rules fail', () => {
            const page = makePage([makeRegion('main', [makeComponent('public-banner'), makeComponent('vip-offer')])]);

            const context: PageProcessorContext = {
                qualifiers: { customerGroups: {}, campaignQualifiers: {} },
                componentInfo: {
                    'public-banner': {
                        visibilityRules: [],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                    'vip-offer': {
                        visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            expect(result.regions?.[0].components?.map((c) => c.id)).toEqual(['public-banner']);
        });

        test('keeps components whose visibility rules pass', () => {
            const page = makePage([makeRegion('main', [makeComponent('vip-offer')])]);

            const context: PageProcessorContext = {
                qualifiers: { customerGroups: { vip: true }, campaignQualifiers: {} },
                componentInfo: {
                    'vip-offer': {
                        visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            expect(result.regions?.[0].components).toHaveLength(1);
        });

        test('keeps component when any visibility rule passes (OR logic)', () => {
            const page = makePage([makeRegion('main', [makeComponent('promo')])]);

            const context: PageProcessorContext = {
                qualifiers: {
                    customerGroups: { vip: true },
                    campaignQualifiers: {},
                },
                componentInfo: {
                    promo: {
                        visibilityRules: [
                            { isActiveForLocale: true, customerGroups: ['vip'] },
                            {
                                isActiveForLocale: true,
                                campaignQualifiers: [{ campaignId: 'sale', promotionId: 'discount' }],
                            },
                        ],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            expect(result.regions?.[0].components).toHaveLength(1);
            expect(result.regions?.[0].components?.[0].id).toBe('promo');
        });

        test('removes component when all visibility rules fail', () => {
            const page = makePage([makeRegion('main', [makeComponent('promo')])]);

            const context: PageProcessorContext = {
                qualifiers: {
                    customerGroups: {},
                    campaignQualifiers: {},
                },
                componentInfo: {
                    promo: {
                        visibilityRules: [
                            { isActiveForLocale: true, customerGroups: ['vip'] },
                            {
                                isActiveForLocale: true,
                                campaignQualifiers: [{ campaignId: 'sale', promotionId: 'discount' }],
                            },
                        ],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            expect(result.regions?.[0].components).toHaveLength(0);
        });
    });

    describe('descendant traversal', () => {
        test('traverses children when hasAnyDescendantVisibilityRules is true', () => {
            const page = makePage([
                makeRegion('main', [
                    makeComponent('container', {
                        regions: [makeRegion('inner', [makeComponent('nested-vip')])],
                    }),
                ]),
            ]);

            const context: PageProcessorContext = {
                qualifiers: { customerGroups: {}, campaignQualifiers: {} },
                componentInfo: {
                    container: {
                        visibilityRules: [],
                        hasAnyDescendantVisibilityRules: true,
                        hasAnyDescendantDataBindings: false,
                    },
                    'nested-vip': {
                        visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            const container = result.regions?.[0].components?.[0];
            expect(container?.id).toBe('container');
            expect(container?.regions?.[0].components).toHaveLength(0);
        });

        test('traverses children when hasAnyDescendantDataBindings is true', () => {
            const page = makePage([
                makeRegion('main', [
                    makeComponent('container', {
                        regions: [
                            makeRegion('inner', [
                                makeComponent('bound-child', {
                                    data: { heading: 'Fallback' } as unknown as Component['data'],
                                    custom: {
                                        dataBinding: {
                                            expressions: { heading: 'content_asset.title' },
                                            contexts: [{ type: 'content_asset', id: 'asset-1' }],
                                        },
                                    } as unknown as Component['custom'],
                                }),
                            ]),
                        ],
                    }),
                ]),
            ]);

            const context: PageProcessorContext = {
                qualifiers: {
                    customerGroups: {},
                    campaignQualifiers: {},
                    dataBindings: {
                        content_asset: { 'asset-1': { title: 'Resolved Title' } },
                    },
                },
                componentInfo: {
                    container: {
                        visibilityRules: [],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: true,
                    },
                    'bound-child': {
                        visibilityRules: [],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            const child = result.regions?.[0].components?.[0].regions?.[0].components?.[0];
            expect((child?.data as Record<string, unknown>).heading).toBe('Resolved Title');
        });

        test('traverses children when component is not in componentInfo', () => {
            const page = makePage([
                makeRegion('main', [
                    makeComponent('unknown-container', {
                        regions: [makeRegion('inner', [makeComponent('nested-vip')])],
                    }),
                ]),
            ]);

            const context: PageProcessorContext = {
                qualifiers: { customerGroups: {}, campaignQualifiers: {} },
                componentInfo: {
                    'nested-vip': {
                        visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            const container = result.regions?.[0].components?.[0];
            expect(container?.id).toBe('unknown-container');
            expect(container?.regions?.[0].components).toHaveLength(0);
        });

        test('skips traversal when both descendant flags are false', () => {
            const page = makePage([
                makeRegion('main', [
                    makeComponent('container', {
                        regions: [makeRegion('inner', [makeComponent('child')])],
                    }),
                ]),
            ]);

            const context: PageProcessorContext = {
                qualifiers: null,
                componentInfo: {
                    container: {
                        visibilityRules: [],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                    child: {
                        visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            const container = result.regions?.[0].components?.[0];
            // Child is preserved because the container's descendants were not traversed
            expect(container?.regions?.[0].components).toHaveLength(1);
        });
    });

    describe('data binding resolution', () => {
        test('resolves data binding expressions on components', () => {
            const page = makePage([
                makeRegion('main', [
                    makeComponent('banner', {
                        data: { heading: 'Fallback' } as unknown as Component['data'],
                        custom: {
                            dataBinding: {
                                expressions: { heading: 'content_asset.title' },
                                contexts: [{ type: 'content_asset', id: 'asset-1' }],
                            },
                        } as unknown as Component['custom'],
                    }),
                ]),
            ]);

            const context: PageProcessorContext = {
                qualifiers: {
                    customerGroups: {},
                    campaignQualifiers: {},
                    dataBindings: {
                        content_asset: { 'asset-1': { title: 'Winter Sale' } },
                    },
                },
                componentInfo: {
                    banner: {
                        visibilityRules: [],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            const data = result.regions?.[0].components?.[0].data as Record<string, unknown>;
            expect(data.heading).toBe('Winter Sale');
        });

        test('leaves components unchanged when no dataBindings are provided', () => {
            const page = makePage([
                makeRegion('main', [
                    makeComponent('banner', {
                        data: { heading: 'Static' } as unknown as Component['data'],
                    }),
                ]),
            ]);

            const context: PageProcessorContext = {
                qualifiers: null,
                componentInfo: {
                    banner: {
                        visibilityRules: [],
                        hasAnyDescendantVisibilityRules: false,
                        hasAnyDescendantDataBindings: false,
                    },
                },
            };

            const result = processPage(page, context);
            const data = result.regions?.[0].components?.[0].data as Record<string, unknown>;
            expect(data.heading).toBe('Static');
        });
    });

    test('handles page with no regions', () => {
        const page = makePage();
        const context: PageProcessorContext = {
            qualifiers: null,
            componentInfo: {},
        };

        const result = processPage(page, context);
        expect(result.regions).toEqual([]);
    });

    test('handles components not in componentInfo', () => {
        const page = makePage([makeRegion('main', [makeComponent('unknown')])]);
        const context: PageProcessorContext = {
            qualifiers: null,
            componentInfo: {},
        };

        const result = processPage(page, context);
        expect(result.regions?.[0].components).toHaveLength(1);
    });

    test('does not mutate the original page object', () => {
        const innerComponent = makeComponent('nested-vip');
        const innerRegion = makeRegion('inner', [innerComponent]);
        const container = makeComponent('container', { regions: [innerRegion] });
        const mainRegion = makeRegion('main', [container]);
        const page = makePage([mainRegion]);

        const context: PageProcessorContext = {
            qualifiers: { customerGroups: {}, campaignQualifiers: {} },
            componentInfo: {
                container: {
                    visibilityRules: [],
                    hasAnyDescendantVisibilityRules: true,
                    hasAnyDescendantDataBindings: false,
                },
                'nested-vip': {
                    visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                    hasAnyDescendantVisibilityRules: false,
                    hasAnyDescendantDataBindings: false,
                },
            },
        };

        const result = processPage(page, context);

        // The nested-vip component should be filtered from the result
        expect(result.regions?.[0].components?.[0].regions?.[0].components).toHaveLength(0);

        // The original page should still have the nested-vip component
        expect(page.regions?.[0].components?.[0].regions?.[0].components).toHaveLength(1);
        expect(page.regions?.[0].components?.[0].regions?.[0].components?.[0].id).toBe('nested-vip');
    });
});
