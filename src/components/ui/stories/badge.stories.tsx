import type { Meta, StoryObj } from '@storybook/react-vite';
import { Badge } from '../badge';
import { expect, within, userEvent } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Badge> = {
    title: 'UI/Badge',
    component: Badge,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Displays a badge or a component that looks like a badge. Useful for labels, status indicators, and tags.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
    argTypes: {
        variant: {
            description: 'Visual style variant of the badge',
            control: 'select',
            options: ['default', 'secondary', 'destructive', 'outline'],
        },
        asChild: {
            description: 'Render as a child component using Radix UI Slot',
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {
    args: {
        children: 'Badge',
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const badge = canvas.getByText('Badge');
        await expect(badge).toBeInTheDocument();
    },
};

export const Secondary: Story = {
    args: {
        children: 'Secondary',
        variant: 'secondary',
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const badge = canvas.getByText('Secondary');
        await expect(badge).toBeInTheDocument();
    },
};

export const Destructive: Story = {
    args: {
        children: 'Destructive',
        variant: 'destructive',
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const badge = canvas.getByText('Destructive');
        await expect(badge).toBeInTheDocument();
    },
};

export const Outline: Story = {
    args: {
        children: 'Outline',
        variant: 'outline',
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const badge = canvas.getByText('Outline');
        await expect(badge).toBeInTheDocument();
    },
};

export const AsLink: Story = {
    render: (props) => (
        <Badge asChild {...props}>
            <a href="#" onClick={(e) => e.preventDefault()}>
                Link Badge
            </a>
        </Badge>
    ),
    args: {
        variant: 'default',
    },
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const link = canvas.getByRole('link', { name: /link badge/i });
        await expect(link).toBeInTheDocument();
        await userEvent.click(link);
    },
};
