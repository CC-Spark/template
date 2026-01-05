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
import type { ComponentDecoratorProps } from './component.types';
import { DesignComponent } from './DesignComponent';
import { usePageDesignerMode } from '../core/PageDesignerProvider';

/**
 * Creates a higher-order component that wraps React components with design-time functionality.
 * In design mode, adds visual indicators, selection handling, and host communication.
 * In normal mode, renders the component unchanged for optimal performance.
 *
 * @template TProps - The props type of the component being decorated
 * @param Component - The React component to wrap with design functionality
 * @returns A new component with design-time capabilities
 */
export function createReactComponentDesignDecorator<TProps>(
    Component: React.ComponentType<TProps>
): (props: ComponentDecoratorProps<TProps>) => React.JSX.Element {
    return function DesignDecoratedComponent(props: ComponentDecoratorProps<TProps>) {
        const { designMetadata, children, ...componentProps } = props;

        // Only use design context if in design mode
        const { isDesignMode } = usePageDesignerMode();

        return isDesignMode ? (
            <DesignComponent designMetadata={designMetadata}>
                <Component {...(componentProps as unknown as TProps)}>{children}</Component>
            </DesignComponent>
        ) : (
            <Component {...(componentProps as unknown as TProps)}>{children}</Component>
        );
    };
}
