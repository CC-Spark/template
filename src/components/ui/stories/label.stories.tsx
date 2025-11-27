import type { Meta, StoryObj } from '@storybook/react-vite';
import { Label } from '../label';
import { expect, within } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Label> = {
    title: 'UI/Label',
    component: Label,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'Renders an accessible label associated with controls. Built with Radix UI Label primitives for proper accessibility.',
            },
        },
    },
    tags: ['autodocs'],
    argTypes: {
        htmlFor: {
            description: 'Associates the label with a form control',
            control: 'text',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Label>;

export const Default: Story = {
    render: () => <Label>Email</Label>,
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const label = canvas.getByText('Email');
        await expect(label).toBeInTheDocument();
    },
};

export const WithInput: Story = {
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <input id="email" type="email" placeholder="Enter your email" className="border rounded px-3 py-2" />
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const label = canvas.getByText('Email');
        await expect(label).toBeInTheDocument();

        const input = canvas.getByLabelText('Email');
        await expect(input).toBeInTheDocument();
    },
};

export const WithCheckbox: Story = {
    render: () => (
        <div className="flex items-center space-x-2">
            <input type="checkbox" id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const label = canvas.getByText('Accept terms and conditions');
        await expect(label).toBeInTheDocument();
    },
};

export const Required: Story = {
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
            </Label>
            <input id="name" type="text" placeholder="Enter your name" className="border rounded px-3 py-2" />
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);
        const label = canvas.getByText(/name/i);
        await expect(label).toBeInTheDocument();
    },
};
