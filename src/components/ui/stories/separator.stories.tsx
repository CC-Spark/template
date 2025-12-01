import type { Meta, StoryObj } from '@storybook/react-vite';
import { Separator } from '../separator';
import { expect, within } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Separator> = {
    title: 'UI/Separator',
    component: Separator,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A visual separator component used to divide content into sections. Supports both horizontal and vertical orientations.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
    argTypes: {
        orientation: {
            description: 'Orientation of the separator',
            control: 'select',
            options: ['horizontal', 'vertical'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
    render: () => (
        <div className="w-[400px]">
            <div className="space-y-1">
                <h4 className="text-sm font-medium leading-none">Radix Primitives</h4>
                <p className="text-sm text-muted-foreground">An open-source UI component library.</p>
            </div>
            <Separator className="my-4" />
            <div className="flex h-5 items-center space-x-4 text-sm">
                <div>Blog</div>
                <Separator orientation="vertical" />
                <div>Docs</div>
                <Separator orientation="vertical" />
                <div>Source</div>
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const heading = canvas.getByText('Radix Primitives');
        await expect(heading).toBeInTheDocument();
    },
};

export const Horizontal: Story = {
    render: () => (
        <div className="w-[400px] space-y-4">
            <div>
                <h4 className="text-sm font-medium">Section 1</h4>
                <p className="text-sm text-muted-foreground">Content for section 1</p>
            </div>
            <Separator />
            <div>
                <h4 className="text-sm font-medium">Section 2</h4>
                <p className="text-sm text-muted-foreground">Content for section 2</p>
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const section1 = canvas.getByText('Section 1');
        await expect(section1).toBeInTheDocument();
    },
};

export const Vertical: Story = {
    render: () => (
        <div className="flex h-20 items-center space-x-4">
            <div>Left</div>
            <Separator orientation="vertical" />
            <div>Middle</div>
            <Separator orientation="vertical" />
            <div>Right</div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const left = canvas.getByText('Left');
        await expect(left).toBeInTheDocument();
    },
};
