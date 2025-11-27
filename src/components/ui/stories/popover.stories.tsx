import type { Meta, StoryObj } from '@storybook/react-vite';
import { Popover, PopoverContent, PopoverTrigger } from '../popover';
import { Button } from '../button';
import { expect, within, userEvent } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Popover> = {
    title: 'UI/Popover',
    component: Popover,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Displays rich content in a portal, triggered by a button. Built with Radix UI Popover primitives.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
    render: () => (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">Open Popover</Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="space-y-2">
                    <h4 className="font-medium leading-none">Dimensions</h4>
                    <p className="text-sm text-muted-foreground">Set the dimensions for the layer.</p>
                </div>
            </PopoverContent>
        </Popover>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger = canvas.getByRole('button', { name: /open popover/i });
        await expect(trigger).toBeInTheDocument();

        await userEvent.click(trigger);

        const documentBody = within(document.body);
        const heading = await documentBody.findByText('Dimensions', {}, { timeout: 5000 });
        await expect(heading).toBeInTheDocument();
    },
};
export const Simple: Story = {
    render: () => (
        <Popover>
            <PopoverTrigger asChild>
                <Button>Click me</Button>
            </PopoverTrigger>
            <PopoverContent>
                <p>This is a simple popover with just text content.</p>
            </PopoverContent>
        </Popover>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger = canvas.getByRole('button', { name: /click me/i });
        await userEvent.click(trigger);

        const documentBody = within(document.body);
        const content = await documentBody.findByText(/this is a simple popover/i, {}, { timeout: 5000 });
        await expect(content).toBeInTheDocument();
    },
};

export const WithForm: Story = {
    render: () => (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline">Open Form</Button>
            </PopoverTrigger>
            <PopoverContent>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium">Settings</h4>
                        <p className="text-sm text-muted-foreground">Configure your preferences.</p>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Width</label>
                        <input type="number" placeholder="100" className="w-full border rounded px-2 py-1" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Height</label>
                        <input type="number" placeholder="100" className="w-full border rounded px-2 py-1" />
                    </div>
                    <Button className="w-full">Apply</Button>
                </div>
            </PopoverContent>
        </Popover>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger = canvas.getByRole('button', { name: /open form/i });
        await userEvent.click(trigger);

        const documentBody = within(document.body);
        const heading = await documentBody.findByText('Settings', {}, { timeout: 5000 });
        await expect(heading).toBeInTheDocument();
    },
};
