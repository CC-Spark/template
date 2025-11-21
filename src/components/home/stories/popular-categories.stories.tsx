import type { Meta, StoryObj } from '@storybook/react-vite';
import { PopularCategories } from '../popular-categories';
import { action } from 'storybook/actions';
import { useEffect, useRef, type ReactNode, type ReactElement } from 'react';
import { expect, within } from 'storybook/test';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
// @ts-expect-error Mock data file is JavaScript
import { mockCategory } from '@/components/__mocks__/mock-data';

function PopularCategoriesStoryHarness({ children }: { children: ReactNode }): ReactElement {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const logNavigate = action('popular-categories-navigate');
        const logClick = action('popular-categories-click');

        const handleClick = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (!target || !root.contains(target)) return;

            const link = target.closest('a[href]');
            if (link) {
                const href = link.getAttribute('href') || '';
                const text = link.textContent?.trim() || '';
                event.preventDefault();
                logNavigate({ href, text });
                logClick({ href, text });
                return;
            }

            const button = target.closest('button');
            if (button) {
                const label = button.textContent?.trim() || button.getAttribute('aria-label') || '';
                logClick({ label });
            }
        };

        root.addEventListener('click', handleClick, true);

        return () => {
            root.removeEventListener('click', handleClick, true);
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
}

// Create mock categories based on mockCategory structure
const createMockCategories = (): ShopperProductsTypes.Category[] => {
    const baseCategory = mockCategory as ShopperProductsTypes.Category;
    return [
        {
            ...baseCategory,
            id: 'mens-accessories-ties',
            name: 'Ties',
            pageDescription: "Shop Mens's Ties for all occasions including business or casual",
        },
        {
            ...baseCategory,
            id: 'womens-clothing-dresses',
            name: 'Dresses',
            pageDescription: "Shop the latest women's dresses for all occasions",
        },
        {
            ...baseCategory,
            id: 'electronics',
            name: 'Electronics',
            pageDescription: 'Latest electronics and gadgets',
        },
        {
            ...baseCategory,
            id: 'home-garden',
            name: 'Home & Garden',
            pageDescription: 'Everything for your home and garden',
        },
    ];
};

const meta: Meta<typeof PopularCategories> = {
    title: 'HOME/Popular Categories',
    component: PopularCategories,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
Popular Categories component that displays a grid of category cards.

### Features:
- Responsive grid layout
- Category cards with images, titles, and descriptions
- Shop Now buttons
- Suspense and loading states
                `,
            },
        },
    },
    decorators: [
        (Story) => (
            <PopularCategoriesStoryHarness>
                <div className="bg-background">
                    <Story />
                </div>
            </PopularCategoriesStoryHarness>
        ),
    ],
    argTypes: {
        categoriesPromise: {
            description: 'Promise that resolves to an array of categories',
            control: false,
        },
        paddingX: {
            description: 'Horizontal padding classes',
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj<typeof PopularCategories>;

export const Default: Story = {
    render: () => <PopularCategories categoriesPromise={Promise.resolve(createMockCategories())} />,
    parameters: {
        docs: {
            description: {
                story: 'Standard popular categories component displaying 4 example category cards.',
            },
        },
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Wait for categories to load (Suspense/Await)
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check for category cards (they should be rendered by ContentCard)
        const categoryCards = await canvas.findAllByRole('link', { name: /shop now/i }, { timeout: 5000 });
        await expect(categoryCards.length).toBeGreaterThan(0);
    },
};

export const Loading: Story = {
    args: {
        categoriesPromise: new Promise(() => {
            // Never resolves to show loading state
        }),
    },
    parameters: {
        docs: {
            description: {
                story: 'Popular categories in loading state.',
            },
        },
    },
    play: async ({ canvasElement }) => {
        // Check for skeleton elements
        const skeletons = canvasElement.querySelectorAll('[class*="animate-pulse"], [class*="skeleton"]');
        await expect(skeletons.length).toBeGreaterThan(0);
    },
};
