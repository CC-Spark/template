import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarImage, AvatarFallback } from '../avatar';
import { expect } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Avatar> = {
    title: 'UI/Avatar',
    component: Avatar,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'An image element with a fallback for representing the user. Built with Radix UI Avatar primitives.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
    render: () => (
        <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const avatar = canvasElement.querySelector('[data-slot="avatar"]');
        await expect(avatar).toBeInTheDocument();
    },
};

export const WithFallback: Story = {
    render: () => (
        <Avatar>
            <AvatarImage src="https://invalid-url.com/avatar.png" alt="User" />
            <AvatarFallback>JD</AvatarFallback>
        </Avatar>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const fallback = canvasElement.querySelector('[data-slot="avatar-fallback"]');
        await expect(fallback).toBeInTheDocument();
    },
};

export const FallbackOnly: Story = {
    render: () => (
        <Avatar>
            <AvatarFallback>AB</AvatarFallback>
        </Avatar>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const fallback = canvasElement.querySelector('[data-slot="avatar-fallback"]');
        await expect(fallback).toBeInTheDocument();
    },
};

export const Large: Story = {
    render: () => (
        <Avatar className="size-16">
            <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
            <AvatarFallback>CN</AvatarFallback>
        </Avatar>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const avatar = canvasElement.querySelector('[data-slot="avatar"]');
        await expect(avatar).toBeInTheDocument();
    },
};

export const Group: Story = {
    render: () => (
        <div className="flex -space-x-2">
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User 1" />
                <AvatarFallback>U1</AvatarFallback>
            </Avatar>
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User 2" />
                <AvatarFallback>U2</AvatarFallback>
            </Avatar>
            <Avatar>
                <AvatarImage src="https://github.com/shadcn.png" alt="User 3" />
                <AvatarFallback>U3</AvatarFallback>
            </Avatar>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const avatars = canvasElement.querySelectorAll('[data-slot="avatar"]');
        await expect(avatars.length).toBeGreaterThanOrEqual(3);
    },
};
