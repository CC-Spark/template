import type { Meta, StoryObj } from '@storybook/react-vite';
import { Skeleton } from '../skeleton';
import { expect } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Skeleton> = {
    title: 'UI/Skeleton',
    component: Skeleton,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Use to show a placeholder while content is loading. Provides a pulsing animation to indicate loading state.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
    render: () => <Skeleton className="h-4 w-[250px]" />,
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const skeleton = canvasElement.querySelector('.animate-pulse');
        await expect(skeleton).toBeInTheDocument();
    },
};

export const Circle: Story = {
    render: () => <Skeleton className="h-12 w-12 rounded-full" />,
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const skeleton = canvasElement.querySelector('.animate-pulse');
        await expect(skeleton).toBeInTheDocument();
    },
};

export const Card: Story = {
    render: () => (
        <div className="flex items-center space-x-4 w-[400px]">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const skeletons = canvasElement.querySelectorAll('.animate-pulse');
        await expect(skeletons.length).toBeGreaterThan(0);
    },
};

export const Article: Story = {
    render: () => (
        <div className="space-y-4 w-[400px]">
            <Skeleton className="h-8 w-[300px]" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[200px]" />
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const skeletons = canvasElement.querySelectorAll('.animate-pulse');
        await expect(skeletons.length).toBeGreaterThan(0);
    },
};

export const Avatar: Story = {
    render: () => (
        <div className="flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[150px]" />
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const skeletons = canvasElement.querySelectorAll('.animate-pulse');
        await expect(skeletons.length).toBeGreaterThan(0);
    },
};
