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
import { transformPage } from './transform';
import { validateRule } from '../validate-rule';
import type { QualifierContext, PageManifest } from '../types';
import type { ShopperExperience } from '@/scapi-client/types';

/**
 * Context required for page processing. Contains the shopper's runtime
 * qualifiers and the component-level visibility rules from the page manifest.
 */
export interface PageProcessorContext {
    /** The shopper's active qualifiers (campaigns, customer groups), or `null` if not resolved. */
    qualifiers: QualifierContext | null;
    /** Component visibility rule definitions extracted from the page layout. */
    componentInfo: PageManifest['componentInfo'];
}

/**
 * Filters a page's components based on their visibility rules. Traverses the
 * page tree using the visitor pattern and removes any component whose
 * visibility rules do not pass against the shopper's qualifier context.
 *
 * A component is visible if **any** of its visibility rules pass (OR logic).
 * If a component has rules and none of them pass, it is removed. Components
 * without rules are always included.
 *
 * @param page - The page to process.
 * @param context - The processing context with qualifier data and visibility rules.
 * @returns A new page with invisible components filtered out.
 *
 * @example
 * ```ts
 * import { processPage } from '@salesforce/storefront-next-runtime/design/data';
 *
 * const page = {
 *     id: 'homepage',
 *     typeId: 'storePage',
 *     regions: [{
 *         id: 'main',
 *         components: [
 *             { id: 'public-banner', typeId: 'commerce_assets.heroBanner', regions: [] },
 *             { id: 'loyalty-offer', typeId: 'commerce_assets.promoTile', regions: [] },
 *         ],
 *     }],
 * };
 *
 * // The "loyalty-offer" component requires the shopper to be in "loyalty-members"
 * const componentInfo = {
 *     'public-banner': { visibilityRules: [], hasVisibilityRules: false },
 *     'loyalty-offer': {
 *         visibilityRules: [{ customerGroups: ['loyalty-members'] }],
 *         hasVisibilityRules: true,
 *     },
 * };
 *
 * // Guest shopper — not in any customer group
 * const filtered = processPage(page, {
 *     qualifiers: { customerGroups: {}, campaignQualifiers: {} },
 *     componentInfo,
 * });
 * // filtered.regions[0].components has only "public-banner"
 * // "loyalty-offer" was removed because the shopper isn't a loyalty member
 * ```
 */
export function processPage(
    page: ShopperExperience.schemas['Page'],
    processorContext: PageProcessorContext
): ShopperExperience.schemas['Page'] {
    return transformPage(page, {
        visitComponent(ctx) {
            const componentInfo = processorContext.componentInfo[ctx.node.id];

            // If this component and any of it's children don't have visibility rules,
            // we can skip processing them and just return the node.
            if (componentInfo?.hasVisibilityRules) {
                const visibilityRules = componentInfo.visibilityRules ?? [];

                // Visibility rules use OR logic: the component is visible
                // if ANY rule passes. Only remove it when it has its own
                // rules and none of them pass.
                if (visibilityRules.length > 0) {
                    const anyRulePassed = visibilityRules.some((rule) =>
                        validateRule(rule, processorContext.qualifiers)
                    );

                    if (!anyRulePassed) {
                        return null;
                    }
                }

                // Either no own rules (children have rules) or a rule
                // passed — keep traversing the tree.
                return {
                    ...ctx.node,
                    regions: ctx.visitRegions(ctx.node.regions),
                };
            }

            return ctx.node;
        },
    }) as ShopperExperience.schemas['Page'];
}
