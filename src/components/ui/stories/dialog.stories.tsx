import type { Meta, StoryObj } from '@storybook/react-vite';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '../dialog';
import { Button } from '../button';
import { expect, within, userEvent } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Dialog> = {
    title: 'UI/Dialog',
    component: Dialog,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A window overlaid on either the primary window or another dialog window, rendering the content underneath inert. Built with Radix UI Dialog primitives.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Are you absolutely sure?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. This will permanently delete your account and remove your data
                        from our servers.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Continue</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger = canvas.getByRole('button', { name: /open dialog/i });
        await expect(trigger).toBeInTheDocument();

        await userEvent.click(trigger);

        const documentBody = within(document.body);
        const title = await documentBody.findByText(/are you absolutely sure/i, {}, { timeout: 5000 });
        await expect(title).toBeInTheDocument();

        const cancelButton = await documentBody.findByRole('button', { name: /cancel/i }, { timeout: 5000 });
        await userEvent.click(cancelButton);
    },
};

export const WithoutCloseButton: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Open Dialog</Button>
            </DialogTrigger>
            <DialogContent showCloseButton={false}>
                <DialogHeader>
                    <DialogTitle>Dialog without close button</DialogTitle>
                    <DialogDescription>This dialog does not have a close button in the header.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Confirm</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger = canvas.getByRole('button', { name: /open dialog/i });
        await userEvent.click(trigger);

        const documentBody = within(document.body);
        const title = await documentBody.findByText(/dialog without close button/i, {}, { timeout: 5000 });
        await expect(title).toBeInTheDocument();
    },
};

export const Simple: Story = {
    render: () => (
        <Dialog>
            <DialogTrigger asChild>
                <Button>Open Simple Dialog</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Simple Dialog</DialogTitle>
                    <DialogDescription>This is a simple dialog with minimal content.</DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const trigger = canvas.getByRole('button', { name: /open simple dialog/i });
        await userEvent.click(trigger);

        const documentBody = within(document.body);
        const title = await documentBody.findByRole('heading', { name: /simple dialog/i }, { timeout: 5000 });
        await expect(title).toBeInTheDocument();
    },
};
