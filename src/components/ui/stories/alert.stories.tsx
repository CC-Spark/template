import type { Meta, StoryObj } from '@storybook/react-vite';
import { Alert, AlertTitle, AlertDescription } from '../alert';
import { AlertCircleIcon, CheckCircleIcon, InfoIcon } from 'lucide-react';
import { expect, within } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof Alert> = {
    title: 'UI/Alert',
    component: Alert,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A component for displaying important messages to users. Supports variants and can include icons, titles, and descriptions.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
    argTypes: {
        variant: {
            description: 'Visual style variant of the alert',
            control: 'select',
            options: ['default', 'destructive'],
        },
    },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
    render: () => (
        <Alert className="w-[400px]">
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>You can add components to your app using the cli.</AlertDescription>
        </Alert>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const title = canvas.getByText('Heads up!');
        await expect(title).toBeInTheDocument();

        const description = canvas.getByText(/you can add components/i);
        await expect(description).toBeInTheDocument();
    },
};

export const WithIcon: Story = {
    render: () => (
        <Alert className="w-[400px]">
            <InfoIcon />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>This alert includes an icon for better visual communication.</AlertDescription>
        </Alert>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const title = canvas.getByText('Information');
        await expect(title).toBeInTheDocument();
    },
};

export const Destructive: Story = {
    render: () => (
        <Alert variant="destructive" className="w-[400px]">
            <AlertCircleIcon />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Your session has expired. Please log in again.</AlertDescription>
        </Alert>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const title = canvas.getByText('Error');
        await expect(title).toBeInTheDocument();

        const description = canvas.getByText(/your session has expired/i);
        await expect(description).toBeInTheDocument();
    },
};

export const Success: Story = {
    render: () => (
        <Alert className="w-[400px]">
            <CheckCircleIcon />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Your changes have been saved successfully.</AlertDescription>
        </Alert>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const title = canvas.getByText('Success');
        await expect(title).toBeInTheDocument();
    },
};

export const DescriptionOnly: Story = {
    render: () => (
        <Alert className="w-[400px]">
            <AlertDescription>This alert only contains a description without a title.</AlertDescription>
        </Alert>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const canvas = within(canvasElement);

        const description = canvas.getByText(/this alert only contains/i);
        await expect(description).toBeInTheDocument();
    },
};
