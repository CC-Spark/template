import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../input-otp';
import { expect, userEvent } from 'storybook/test';
import { waitForStorybookReady } from '@storybook/test-utils';

const meta: Meta<typeof InputOTP> = {
    title: 'UI/InputOTP',
    component: InputOTP,
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component:
                    'A one-time password input component. Useful for verification codes, PINs, and other numeric or alphanumeric inputs.',
            },
        },
    },
    tags: ['autodocs', 'interaction'],
    argTypes: {
        maxLength: {
            description: 'Maximum length of the OTP',
            control: 'number',
        },
        disabled: {
            description: 'Whether the input is disabled',
            control: 'boolean',
        },
    },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
    render: () => (
        <InputOTP maxLength={6}>
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </InputOTP>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);

        const input = canvasElement.querySelector('input');
        await expect(input).toBeInTheDocument();

        if (input) {
            await userEvent.type(input, '123456');
        }
    },
};

export const WithSeparator: Story = {
    render: () => (
        <InputOTP maxLength={6}>
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </InputOTP>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const input = canvasElement.querySelector('input');
        await expect(input).toBeInTheDocument();
    },
};

export const FourDigits: Story = {
    render: () => (
        <InputOTP maxLength={4}>
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
            </InputOTPGroup>
        </InputOTP>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const input = canvasElement.querySelector('input');
        await expect(input).toBeInTheDocument();
    },
};

export const Disabled: Story = {
    render: () => (
        <InputOTP maxLength={6} disabled>
            <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
            </InputOTPGroup>
        </InputOTP>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const input = canvasElement.querySelector('input');
        await expect(input).toBeDisabled();
    },
};
