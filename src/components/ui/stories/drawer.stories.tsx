import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from '../drawer';
import { Button } from '../button';
import { expect, within, userEvent } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Drawer> = {
    title: 'UI/Drawer',
    component: Drawer,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A drawer component that slides in from the edge of the screen. Built with Vaul drawer library. Supports multiple directions (top, bottom, left, right).',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
    render: () => (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline">Open Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Are you absolutely sure?</DrawerTitle>
                    <DrawerDescription>This action cannot be undone.</DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                    <p>This is the drawer content area.</p>
                </div>
                <DrawerFooter>
                    <Button>Submit</Button>
                    <DrawerClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DrawerClose>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger = canvas.getByRole('button', { name: /open drawer/i });
        await expect(trigger).toBeInTheDocument();

        await userEvent.click(trigger);

        const documentBody = within(document.body);
        const title = await documentBody.findByText(/are you absolutely sure/i, {}, { timeout: 5000 });
        await expect(title).toBeInTheDocument();
    },
};

export const Bottom: Story = {
    render: () => (
        <Drawer>
            <DrawerTrigger asChild>
                <Button variant="outline">Open Bottom Drawer</Button>
            </DrawerTrigger>
            <DrawerContent>
                <DrawerHeader>
                    <DrawerTitle>Bottom Drawer</DrawerTitle>
                    <DrawerDescription>This drawer slides in from the bottom.</DrawerDescription>
                </DrawerHeader>
                <div className="p-4">
                    <p>Content goes here.</p>
                </div>
            </DrawerContent>
        </Drawer>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger = canvas.getByRole('button', { name: /open bottom drawer/i });
        await userEvent.click(trigger);

        const title = await canvas.findByText(/bottom drawer/i, {}, { timeout: 5000 });
        await expect(title).toBeInTheDocument();
    },
};
