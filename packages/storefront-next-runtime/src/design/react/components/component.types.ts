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
import type React from 'react';

export interface RegionDesignMetadata {
    /**
     * The id of the component or region.
     */
    id: string;
    /**
     * The name of the component or region.
     */
    name?: string;
    /**
     * A list of component ids that are part of this region.
     */
    componentIds: string[];
    /**
     * A list of allowed component types in this region.
     */
    componentTypeInclusions: string[];
    /**
     * A list of forbidden component types in this region.
     */
    componentTypeExclusions: string[];
}

export interface ComponentDesignMetadata {
    /**
     * The id of the component or region.
     */
    id: string;
    /**
     * Whether the component is a fragment.
     */
    isFragment: boolean;
    /**
     * Whether the component is visible based on the current visiblity rules and context.
     */
    isVisible: boolean;
    /**
     * Whether the component has been localized in the current locale.
     */
    isLocalized: boolean;
    /**
     * The name of the component or region.
     */
    name?: string;
}

export type ComponentDecoratorProps<TProps> = React.PropsWithChildren<
    {
        designMetadata: ComponentDesignMetadata;
    } & TProps
>;

export type RegionDecoratorProps<TProps> = React.PropsWithChildren<
    {
        designMetadata: RegionDesignMetadata;
    } & TProps
>;
