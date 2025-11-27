import type { Meta, StoryObj } from '@storybook/react-vite';
import { Checkbox } from '../checkbox';
import { Label } from '../label';
import { expect, within, userEvent } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Checkbox> = {
    title: 'UI/Checkbox',
    component: Checkbox,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A control that allows the user to toggle between checked and unchecked states. Built with Radix UI Checkbox primitives.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
    argTypes: {
        checked: {
            description: 'Whether the checkbox is checked',
            control: 'boolean',
        },
        disabled: {
            description: 'Whether the checkbox is disabled',
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
    render: () => (
        <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms">Accept terms and conditions</Label>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const checkbox = canvas.getByRole('checkbox');
        await expect(checkbox).toBeInTheDocument();
        await expect(checkbox).not.toBeChecked();

        await userEvent.click(checkbox);
        await expect(checkbox).toBeChecked();
    },
};

export const Checked: Story = {
    render: () => (
        <div className="flex items-center space-x-2">
            <Checkbox id="checked" checked />
            <Label htmlFor="checked">Already checked</Label>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const checkbox = canvas.getByRole('checkbox');
        await expect(checkbox).toBeChecked();
    },
};

export const Disabled: Story = {
    render: () => (
        <div className="flex items-center space-x-2">
            <Checkbox id="disabled" disabled />
            <Label htmlFor="disabled">Disabled checkbox</Label>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const checkbox = canvas.getByRole('checkbox');
        await expect(checkbox).toBeDisabled();
    },
};

export const Group: Story = {
    render: () => (
        <div className="space-y-3">
            <div className="flex items-center space-x-2">
                <Checkbox id="item1" />
                <Label htmlFor="item1">Item 1</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="item2" />
                <Label htmlFor="item2">Item 2</Label>
            </div>
            <div className="flex items-center space-x-2">
                <Checkbox id="item3" />
                <Label htmlFor="item3">Item 3</Label>
            </div>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const checkboxes = canvas.getAllByRole('checkbox');
        await expect(checkboxes).toHaveLength(3);

        await userEvent.click(checkboxes[0]);
        await expect(checkboxes[0]).toBeChecked();
    },
};
