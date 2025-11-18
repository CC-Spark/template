import type { Meta, StoryObj } from '@storybook/react-vite';
import HomeSkeleton from '../skeleton';
import { action } from 'storybook/actions';
import { useEffect, useRef, type ReactNode, type ReactElement } from 'react';
import { expect } from 'storybook/test';

function SkeletonStoryHarness({ children }: { children: ReactNode }): ReactElement {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const logSkeletonRender = action('skeleton-render');
        const logSkeletonInteraction = action('skeleton-interaction');

        // Log when component renders
        logSkeletonRender({});

        const handleClick = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (!target || !root.contains(target)) return;

            const skeleton = target.closest('[class*="animate-pulse"], [class*="skeleton"]');
            if (skeleton) {
                const label = target.getAttribute('data-testid') || target.className || 'skeleton-element';
                logSkeletonInteraction({ element: label, type: 'click' });
            }
        };

        root.addEventListener('click', handleClick, true);

        return () => {
            root.removeEventListener('click', handleClick, true);
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
}

const meta: Meta<typeof HomeSkeleton> = {
    title: 'HOME/Skeleton',
    component: HomeSkeleton,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'fullscreen',
        docs: {
            description: {
                component: `
Home Skeleton component that displays loading placeholders for the home page.

### Features:
- Hero section skeleton
- Featured products skeleton
- Features section skeleton
- Help section skeleton
- Animated pulse effect
                `,
            },
        },
    },
    decorators: [
        (Story) => (
            <SkeletonStoryHarness>
                <div className="bg-background">
                    <Story />
                </div>
            </SkeletonStoryHarness>
        ),
    ],
};

export default meta;
type Story = StoryObj<typeof HomeSkeleton>;

export const Default: Story = {
    render: () => <HomeSkeleton />,
    parameters: {
        docs: {
            story: `
Default home skeleton component displaying all loading placeholders.

### Features:
- Hero section skeleton
- Featured products skeleton
- Features section skeleton
- Help section skeleton
            `,
        },
    },
    play: async ({ canvasElement }) => {
        // Check for skeleton elements (they have animate-pulse class)
        const skeletons = canvasElement.querySelectorAll('[class*="animate-pulse"]');
        await expect(skeletons.length).toBeGreaterThan(0);

        // Check for skeleton placeholders
        const skeletonElements = canvasElement.querySelectorAll('[class*="bg-muted"]');
        await expect(skeletonElements.length).toBeGreaterThan(0);
    },
};

export const MobileView: Story = {
    render: () => <HomeSkeleton />,
    parameters: {
        viewport: {
            defaultViewport: 'mobile1',
        },
        docs: {
            story: `
Home skeleton on mobile viewport.

### Features:
- Responsive skeleton layout
- Mobile-optimized spacing
            `,
        },
    },
    play: async ({ canvasElement }) => {
        // Check for skeleton elements
        const skeletons = canvasElement.querySelectorAll('[class*="animate-pulse"]');
        await expect(skeletons.length).toBeGreaterThan(0);
    },
};
