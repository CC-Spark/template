import type { Meta, StoryObj } from '@storybook/react-vite';
import { AspectRatio } from '../aspect-ratio';
import { expect } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof AspectRatio> = {
    title: 'UI/AspectRatio',
    component: AspectRatio,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Displays content within a desired ratio. Useful for responsive images, videos, and other media. Built with Radix UI Aspect Ratio primitives.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
    argTypes: {
        ratio: {
            description: 'Aspect ratio (width/height)',
            control: 'number',
        },
    },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

export const Default: Story = {
    render: () => (
        <AspectRatio ratio={16 / 9} className="bg-muted w-[400px]">
            <div className="flex items-center justify-center h-full text-muted-foreground">16:9</div>
        </AspectRatio>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const aspectRatio = canvasElement.querySelector('[data-slot="aspect-ratio"]');
        await expect(aspectRatio).toBeInTheDocument();
    },
};

export const Square: Story = {
    render: () => (
        <AspectRatio ratio={1} className="bg-muted w-[300px]">
            <div className="flex items-center justify-center h-full text-muted-foreground">1:1</div>
        </AspectRatio>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const aspectRatio = canvasElement.querySelector('[data-slot="aspect-ratio"]');
        await expect(aspectRatio).toBeInTheDocument();
    },
};

export const Portrait: Story = {
    render: () => (
        <AspectRatio ratio={3 / 4} className="bg-muted w-[200px]">
            <div className="flex items-center justify-center h-full text-muted-foreground">3:4</div>
        </AspectRatio>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const aspectRatio = canvasElement.querySelector('[data-slot="aspect-ratio"]');
        await expect(aspectRatio).toBeInTheDocument();
    },
};

export const WithImage: Story = {
    render: () => (
        <AspectRatio ratio={16 / 9} className="bg-muted w-[400px] overflow-hidden rounded-lg">
            <img
                src="https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80"
                alt="Photo"
                className="h-full w-full object-cover"
            />
        </AspectRatio>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const img = canvasElement.querySelector('img');
        await expect(img).toBeInTheDocument();
    },
};
