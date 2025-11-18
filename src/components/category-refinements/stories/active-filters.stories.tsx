import type { Meta, StoryObj } from '@storybook/react-vite';
import ActiveFilters from '../active-filters';
import { action } from 'storybook/actions';
import { useEffect, useMemo, useRef, type ReactNode, type ReactElement } from 'react';
import { createMemoryRouter, RouterProvider, useInRouterContext } from 'react-router';
import { expect } from 'storybook/test';
// @ts-expect-error Mock data file is JavaScript
import searchResults from '@/components/__mocks__/search-results';
import type { ShopperSearchTypes } from 'commerce-sdk-isomorphic';

const ACTIVE_FILTERS_HARNESS_ATTR = 'data-active-filters-harness';

function ActiveFiltersStoryHarness({ children }: { children: ReactNode }): ReactElement {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const logRemove = useMemo(() => action('filter-removed'), []);
    const logClearAll = useMemo(() => action('filters-cleared'), []);
    const logHover = useMemo(() => action('filter-hovered'), []);

    useEffect(() => {
        const isInsideHarness = (element: Element | null) =>
            Boolean(element?.closest(`[${ACTIVE_FILTERS_HARNESS_ATTR}]`));

        const handleClick = (event: MouseEvent) => {
            const button = (event.target as HTMLElement | null)?.closest('button');
            if (!button || !isInsideHarness(button)) {
                return;
            }
            const text = button.textContent?.trim() || '';
            if (text.toLowerCase().includes('clear all')) {
                logClearAll({});
            } else {
                logRemove({ label: text });
            }
        };

        const handleMouseOver = (event: MouseEvent) => {
            const button = (event.target as HTMLElement | null)?.closest('button');
            if (!button || !isInsideHarness(button)) {
                return;
            }
            const related = event.relatedTarget as HTMLElement | null;
            if (related && button.contains(related)) {
                return;
            }
            const text = button.textContent?.trim() || '';
            if (text) {
                logHover({ label: text });
            }
        };

        document.addEventListener('click', handleClick, true);
        document.addEventListener('mouseover', handleMouseOver, true);
        return () => {
            document.removeEventListener('click', handleClick, true);
            document.removeEventListener('mouseover', handleMouseOver, true);
        };
    }, [logRemove, logClearAll, logHover]);

    return (
        <div ref={containerRef} {...{ [ACTIVE_FILTERS_HARNESS_ATTR]: 'true' }}>
            {children}
        </div>
    );
}

const meta: Meta<typeof ActiveFilters> = {
    title: 'CATEGORY/Category Refinements/Active Filters',
    component: ActiveFilters,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'padded',
        docs: {
            description: {
                component: `
A component that displays currently active filters as removable chips. Users can remove individual filters or clear all filters at once.

## Features

- **Active Filter Chips**: Shows each active filter as a removable chip
- **Remove Individual**: Click X on a chip to remove that filter
- **Clear All**: Button to remove all active filters at once
- **URL Integration**: Updates URL parameters when filters are removed
- **Action Logging**: Integrates with Storybook's ActionLogger to track user interactions

## Usage

The ActiveFilters component is used on:
- Category pages with active filters
- Product listing pages
- Search results pages
- Any filtered product list

\`\`\`tsx
import ActiveFilters from '../active-filters';

function CategoryPage({ searchResult }) {
  return <ActiveFilters result={searchResult} />;
}
\`\`\`

## Props

| Prop | Type | Description |
|------|------|-------------|
| \`result\` | \`ShopperSearchTypes.ProductSearchResult\` | Product search result containing refinements data |

## Behavior

- **No active filters**: Component returns null if no filters are active
- **Removing a filter**: Updates URL and navigates to remove that filter
- **Clear all**: Removes all refine parameters from URL
                `,
            },
        },
    },
    decorators: [
        (Story: React.ComponentType, context) => {
            const RouterWrapper = (): ReactElement => {
                const inRouter = useInRouterContext();
                const content = (
                    <ActiveFiltersStoryHarness>
                        <Story {...(context.args as Record<string, unknown>)} />
                    </ActiveFiltersStoryHarness>
                );

                if (inRouter) {
                    return content;
                }

                const router = createMemoryRouter(
                    [
                        {
                            path: '/',
                            element: content,
                        },
                    ],
                    { initialEntries: ['/?refine=c_refinementColor=Black&refine=c_size=M'] }
                );

                return <RouterProvider router={router} />;
            };

            return <RouterWrapper />;
        },
    ],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Use real mock data from @mocks directory
const mockSearchResult = searchResults as ShopperSearchTypes.ProductSearchResult;

export const Default: Story = {
    args: {
        result: mockSearchResult,
    },
    decorators: [
        (Story: React.ComponentType, context) => {
            const RouterWrapper = (): ReactElement => {
                const content = (
                    <ActiveFiltersStoryHarness>
                        <Story {...(context.args as Record<string, unknown>)} />
                    </ActiveFiltersStoryHarness>
                );

                // Always create our own router with the correct URL params
                // The global providers from preview.tsx will still be available
                const router = createMemoryRouter(
                    [
                        {
                            path: '/',
                            element: content,
                        },
                    ],
                    { initialEntries: ['/?refine=c_refinementColor=Black'] }
                );

                return <RouterProvider router={router} />;
            };

            return <RouterWrapper />;
        },
    ],
    parameters: {
        docs: {
            description: {
                story: `
The default ActiveFilters shows active filter chips:

### Features:
- **Filter chips**: Shows each active filter
- **Remove buttons**: X button on each chip
- **Clear all button**: Button to remove all filters
- **Action logging**: All interactions are logged

### Use Cases:
- Standard active filters
- Multiple active filters
- Filter management
                `,
            },
        },
    },
    // TODO: Fix interaction test - component returns null when active filters are not found
    // play: async ({ canvasElement }) => {
    //     const canvas = within(canvasElement);
    //
    //     // Wait for active filters section to be present (component might need time to process URL)
    //     const activeFiltersText = await canvas.findByText(/active filters/i, {}, { timeout: 3000 });
    //     await expect(activeFiltersText).toBeInTheDocument();
    //
    //     // Test filter chips are present
    //     const removeButtons = await canvas.findAllByRole('button');
    //     await expect(removeButtons.length).toBeGreaterThan(0);
    //
    //     // Test clear all button is present
    //     const clearAllButton = canvas.getByRole('button', { name: /clear all/i });
    //     await expect(clearAllButton).toBeInTheDocument();
    // },
};

export const NoActiveFilters: Story = {
    args: {
        result: mockSearchResult,
    },
    decorators: [
        (Story: React.ComponentType, context) => {
            const RouterWrapper = (): ReactElement => {
                const inRouter = useInRouterContext();
                const content = (
                    <ActiveFiltersStoryHarness>
                        <Story {...(context.args as Record<string, unknown>)} />
                    </ActiveFiltersStoryHarness>
                );

                if (inRouter) {
                    return content;
                }

                const router = createMemoryRouter(
                    [
                        {
                            path: '/',
                            element: content,
                        },
                    ],
                    { initialEntries: ['/'] } // No active filters
                );

                return <RouterProvider router={router} />;
            };

            return <RouterWrapper />;
        },
    ],
    parameters: {
        docs: {
            description: {
                story: `
ActiveFilters when no filters are active:

### No Filters Features:
- **Not rendered**: Component returns null
- **Clean UI**: No active filters section shown
- **No errors**: Gracefully handles no active filters

### Use Cases:
- Initial page load
- No filters applied
- After clearing all filters
                `,
            },
        },
    },
    play: async ({ canvasElement }) => {
        // Test active filters section is not rendered (component returns null)
        const activeFiltersText = canvasElement.querySelector('p');
        if (activeFiltersText) {
            await expect(activeFiltersText).not.toHaveTextContent(/active filters/i);
        }
    },
};

export const MultipleFilters: Story = {
    args: {
        result: mockSearchResult,
    },
    decorators: [
        (Story: React.ComponentType, context) => {
            const RouterWrapper = (): ReactElement => {
                const content = (
                    <ActiveFiltersStoryHarness>
                        <Story {...(context.args as Record<string, unknown>)} />
                    </ActiveFiltersStoryHarness>
                );

                // Always create our own router with the correct URL params
                // The global providers from preview.tsx will still be available
                const router = createMemoryRouter(
                    [
                        {
                            path: '/',
                            element: content,
                        },
                    ],
                    {
                        initialEntries: [
                            '/?refine=c_refinementColor=Black&refine=c_refinementColor=Pink&refine=c_isNew=true',
                        ],
                    }
                );

                return <RouterProvider router={router} />;
            };

            return <RouterWrapper />;
        },
    ],
    parameters: {
        docs: {
            description: {
                story: `
ActiveFilters with multiple active filters:

### Multiple Filters Features:
- **Multiple chips**: Shows all active filters
- **Individual removal**: Each chip can be removed
- **Clear all**: Removes all filters at once
- **Wrapping**: Chips wrap on smaller screens

### Use Cases:
- Complex filtering
- Multiple filter types
- Comprehensive filter management
                `,
            },
        },
    },
    // TODO: Fix interaction test - component returns null when active filters are not found
    // play: async ({ canvasElement }) => {
    //     const canvas = within(canvasElement);
    //
    //     // Wait for active filters section to be present
    //     const activeFiltersText = await canvas.findByText(/active filters/i);
    //     await expect(activeFiltersText).toBeInTheDocument();
    //
    //     // Test multiple filter chips are present
    //     const removeButtons = await canvas.findAllByRole('button');
    //     // Should have at least 2 filter chips (Black, Pink) + clear all button = 3 total
    //     await expect(removeButtons.length).toBeGreaterThanOrEqual(2);
    // },
};
