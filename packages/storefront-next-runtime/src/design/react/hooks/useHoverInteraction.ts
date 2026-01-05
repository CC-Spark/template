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
import { useInteraction } from './useInteraction';

export interface HoverInteraction {
    hoveredComponentId: string | null;
    setHoveredComponent: (componentId: string | null) => void;
}

/**
 * Custom hook that manages component hover state and handles
 * client-host communication for hover events.
 *
 * @returns Hover state and interaction methods
 */
export function useHoverInteraction(): HoverInteraction {
    const { state: hoveredComponentId, setHoveredComponent } = useInteraction({
        initialState: null as string | null,
        eventHandlers: {
            ComponentHoveredIn: {
                handler: (event, setState) => setState(event.componentId),
            },
            ComponentHoveredOut: {
                handler: (_, setState) => setState(null),
            },
        },
        actions: (state, setState, clientApi) => ({
            setHoveredComponent: (componentId: string | null) => {
                if (state && componentId !== state) {
                    // Use the current hovered component for hover out
                    clientApi?.hoverOutOfComponent({
                        componentId: state,
                    });
                }

                if (componentId && componentId !== state) {
                    clientApi?.hoverInToComponent({ componentId });
                }

                setState(componentId);
            },
        }),
    });

    return {
        hoveredComponentId,
        setHoveredComponent,
    };
}
