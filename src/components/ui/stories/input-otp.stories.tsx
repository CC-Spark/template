import type { Meta, StoryObj } from '@storybook/react-vite';
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from '../input-otp';
import { Label } from '../label';
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
        <div className="space-y-2">
            <Label htmlFor="otp-input">Verification Code</Label>
            <InputOTP id="otp-input" maxLength={6} aria-label="Verification Code">
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
        </div>
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
        <div className="space-y-2">
            <Label htmlFor="otp-separator">Enter PIN</Label>
            <InputOTP id="otp-separator" maxLength={6} aria-label="Enter PIN">
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
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const input = canvasElement.querySelector('input');
        await expect(input).toBeInTheDocument();
    },
};

export const FourDigits: Story = {
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="otp-4digit">4-Digit PIN</Label>
            <InputOTP id="otp-4digit" maxLength={4} aria-label="4-Digit PIN">
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                </InputOTPGroup>
            </InputOTP>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const input = canvasElement.querySelector('input');
        await expect(input).toBeInTheDocument();
    },
};

export const Disabled: Story = {
    render: () => (
        <div className="space-y-2">
            <Label htmlFor="otp-disabled">Disabled Code</Label>
            <InputOTP id="otp-disabled" maxLength={6} disabled aria-label="Disabled Code">
                <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                </InputOTPGroup>
            </InputOTP>
        </div>
    ),
    play: async ({ canvasElement }) => {
        await waitForStorybookReady(canvasElement);
        const input = canvasElement.querySelector('input');
        await expect(input).toBeDisabled();
    },
};
