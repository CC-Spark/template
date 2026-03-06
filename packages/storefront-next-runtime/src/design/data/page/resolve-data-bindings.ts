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
import type { QualifierContext, ResolvedDataBinding } from '../types';
import type { ShopperExperience } from '@/scapi-client/types';

/**
 * Data binding metadata attached to a component instance. Stored in the
 * component's `custom.dataBinding` field by ECOM when the author binds a
 * data source to the component in Page Designer.
 */
export interface ComponentDataBinding {
    /** Maps attribute names to expression strings (e.g. `"content_asset.body"`). */
    expressions: Record<string, string>;
    /** The data contexts bound to this component, identifying the records to resolve against. */
    contexts: DataBindingContext[];
}

/**
 * A data context reference on a component instance, identifying a specific
 * record from a data provider.
 */
export interface DataBindingContext {
    /** The data provider type (e.g. `"content_asset"`). */
    type: string;
    /** The record identifier (e.g. a content asset UUID). */
    id: string;
}

/**
 * Pattern matching bare expressions: `type.field`.
 */
const BARE_EXPRESSION_PATTERN = /^(\w+)\.(\w+)$/;

/**
 * Parses a binding expression string into its provider type and field name.
 * Supports the bare `type.field` format.
 *
 * @param expression - The expression string to parse.
 * @returns The parsed type and field, or `null` if the expression is invalid.
 *
 * @example
 * ```ts
 * parseExpression('content_asset.title');  // { type: 'content_asset', field: 'title' }
 * parseExpression('invalid');              // null
 * ```
 */
export function parseExpression(expression: string): { type: string; field: string } | null {
    const match = expression.trim().match(BARE_EXPRESSION_PATTERN);
    if (match) {
        return { type: match[1], field: match[2] };
    }

    return null;
}

/**
 * Resolves a single binding expression against the component's data contexts
 * and the resolved data bindings from context resolution.
 *
 * Returns the resolved field value, or an empty string if the expression is
 * invalid, the matching context or record is not found, or the field does not
 * exist on the resolved record.
 *
 * @param expression - The expression string (e.g. `"content_asset.body"`).
 * @param contexts - The component's data binding contexts.
 * @param dataBindings - The resolved data bindings from {@link QualifierContext}.
 * @returns The resolved value, or `''` if resolution fails.
 */
export function resolveExpression(
    expression: string,
    contexts: DataBindingContext[],
    dataBindings: NonNullable<QualifierContext['dataBindings']>
): unknown {
    const parsed = parseExpression(expression);
    if (!parsed) return '';

    const context = contexts.find((c) => c.type === parsed.type);
    if (!context) return '';

    const record: ResolvedDataBinding | undefined = dataBindings[context.type]?.[context.id];
    if (!record) return '';

    return record[parsed.field] ?? '';
}

/**
 * Extracts the {@link ComponentDataBinding} metadata from a component's
 * `custom` field. Returns `undefined` if the component has no data binding
 * configuration.
 */
function getDataBinding(component: ShopperExperience.schemas['Component']): ComponentDataBinding | undefined {
    const custom = component.custom as Record<string, unknown> | undefined;
    return custom?.dataBinding as ComponentDataBinding | undefined;
}

/**
 * Resolves data binding expressions for a single component. Replaces attribute
 * values in the component's `data` with the resolved values from context
 * resolution. Attributes without a matching expression are preserved as-is.
 * When an expression cannot be resolved, the attribute value is set to an
 * empty string.
 *
 * Returns the component unchanged if it has no data binding metadata or if
 * `dataBindings` is `undefined`.
 *
 * @param component - The component to resolve data bindings for.
 * @param dataBindings - The resolved data bindings from {@link QualifierContext}, or `undefined` if no bindings were resolved.
 * @returns The component with resolved attribute values, or the original component if no bindings apply.
 *
 * @example
 * ```ts
 * import { resolveComponentDataBindings } from '@salesforce/storefront-next-runtime/design/data';
 *
 * const component = {
 *     id: 'banner',
 *     typeId: 'commerce_assets.contentBanner',
 *     data: { heading: 'Fallback Title', body: 'Fallback Body' },
 *     custom: {
 *         dataBinding: {
 *             expressions: {
 *                 heading: 'content_asset.title',
 *                 body: 'content_asset.body',
 *             },
 *             contexts: [{ type: 'content_asset', id: 'winter-sale-uuid' }],
 *         },
 *     },
 *     regions: [],
 * };
 *
 * const dataBindings = {
 *     content_asset: {
 *         'winter-sale-uuid': {
 *             title: 'Winter Sale',
 *             body: '<div>Free Shipping on all orders!</div>',
 *         },
 *     },
 * };
 *
 * const resolved = resolveComponentDataBindings(component, dataBindings);
 * // resolved.data.heading === 'Winter Sale'
 * // resolved.data.body === '<div>Free Shipping on all orders!</div>'
 * ```
 */
export function resolveComponentDataBindings(
    component: ShopperExperience.schemas['Component'],
    dataBindings: QualifierContext['dataBindings']
): ShopperExperience.schemas['Component'] {
    if (!dataBindings) {
        return component;
    }

    const binding = getDataBinding(component);
    if (!binding?.contexts?.length) return component;

    const expressionEntries = Object.entries(binding.expressions ?? {});
    if (expressionEntries.length === 0) return component;

    const resolvedData: Record<string, unknown> = {
        ...(component.data as Record<string, unknown> | undefined),
    };

    for (const [attrName, expression] of expressionEntries) {
        resolvedData[attrName] = resolveExpression(expression, binding.contexts, dataBindings);
    }

    return {
        ...component,
        data: resolvedData as typeof component.data,
    };
}
