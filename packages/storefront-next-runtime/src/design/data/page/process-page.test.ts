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

const makeComponent = (id: string, regions: ShopperExperience.schemas['Region'][] = []) => ({
    id,
    typeId: `type.${id}`,
    regions,
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
    test('keeps components without visibility rules', () => {
        const page = makePage([makeRegion('main', [makeComponent('banner')])]);
        const context: PageProcessorContext = {
            qualifiers: null,
            componentInfo: {
                banner: { visibilityRules: [], hasVisibilityRules: false },
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
                'public-banner': { visibilityRules: [], hasVisibilityRules: false },
                'vip-offer': {
                    visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                    hasVisibilityRules: true,
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
                    hasVisibilityRules: true,
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
                    hasVisibilityRules: true,
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
                    hasVisibilityRules: true,
                },
            },
        };

        const result = processPage(page, context);
        expect(result.regions?.[0].components).toHaveLength(0);
    });

    test('traverses nested components with hasVisibilityRules', () => {
        const page = makePage([
            makeRegion('main', [makeComponent('container', [makeRegion('inner', [makeComponent('nested-vip')])])]),
        ]);

        const context: PageProcessorContext = {
            qualifiers: { customerGroups: {}, campaignQualifiers: {} },
            componentInfo: {
                container: { visibilityRules: [], hasVisibilityRules: true },
                'nested-vip': {
                    visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                    hasVisibilityRules: true,
                },
            },
        };

        const result = processPage(page, context);
        const container = result.regions?.[0].components?.[0];
        expect(container?.id).toBe('container');
        expect(container?.regions?.[0].components).toHaveLength(0);
    });

    test('skips traversal for components with hasVisibilityRules: false', () => {
        const page = makePage([
            makeRegion('main', [makeComponent('container', [makeRegion('inner', [makeComponent('child')])])]),
        ]);

        const context: PageProcessorContext = {
            qualifiers: null,
            componentInfo: {
                container: { visibilityRules: [], hasVisibilityRules: false },
                child: {
                    visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                    hasVisibilityRules: true,
                },
            },
        };

        const result = processPage(page, context);
        const container = result.regions?.[0].components?.[0];
        expect(container?.regions?.[0].components).toHaveLength(1);
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
        const container = makeComponent('container', [innerRegion]);
        const mainRegion = makeRegion('main', [container]);
        const page = makePage([mainRegion]);

        const context: PageProcessorContext = {
            qualifiers: { customerGroups: {}, campaignQualifiers: {} },
            componentInfo: {
                container: { visibilityRules: [], hasVisibilityRules: true },
                'nested-vip': {
                    visibilityRules: [{ isActiveForLocale: true, customerGroups: ['vip'] }],
                    hasVisibilityRules: true,
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
