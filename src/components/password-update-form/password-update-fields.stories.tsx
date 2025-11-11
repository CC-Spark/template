/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import { useEffect, useRef, type ReactNode, type ReactElement } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { action } from 'storybook/actions';
import { expect, within, userEvent } from 'storybook/test';
import { Form } from '@/components/ui/form';
import { PasswordUpdateFields } from './password-update-fields';
import { passwordUpdateFormSchema } from './index';
import type { PasswordUpdateFormData, PasswordUpdateFetcherData } from './types';
import type { ScapiFetcher } from '@/hooks/use-scapi-fetcher';
import uiStrings from '@/temp-ui-string';

function ActionLogger({ children }: { children: ReactNode }): ReactElement {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const logInput = action('form-input');
        const logInputValue = action('form-input-value');
        const logSubmit = action('form-submit');
        const logCancel = action('form-cancel');

        const isInsideHarness = (element: Element) => root.contains(element);

        const deriveLabel = (element: HTMLElement): string => {
            const ariaLabel = element.getAttribute('aria-label')?.trim();
            if (ariaLabel) return ariaLabel;

            if (element instanceof HTMLElement) {
                const label = element.closest('label');
                if (label) {
                    const labelText = label.textContent?.replace(/\s+/g, ' ').trim();
                    if (labelText) return labelText;
                }
            }

            if (element instanceof HTMLInputElement) {
                const placeholder = element.placeholder?.trim();
                if (placeholder) return placeholder;
            }

            const testId = element.getAttribute('data-testid')?.trim();
            return testId ?? '';
        };

        const handleChange = (event: Event) => {
            const target = event.target;
            if (!(target instanceof HTMLInputElement) || !isInsideHarness(target)) return;

            const label = deriveLabel(target);
            if (!label) return;

            logInput({ label });
            logInputValue({ label, value: target.value });
        };

        const handleSubmit = (event: SubmitEvent) => {
            const form = event.target;
            if (!(form instanceof HTMLFormElement) || !isInsideHarness(form)) return;

            event.preventDefault();
            event.stopImmediatePropagation?.();

            logSubmit({});
        };

        const handleClick = (event: MouseEvent) => {
            const target = event.target;
            if (!(target instanceof HTMLElement) || !isInsideHarness(target)) return;

            if (target instanceof HTMLButtonElement && target.type === 'button') {
                const label = deriveLabel(target);
                if (label && label.toLowerCase().includes('cancel')) {
                    logCancel({});
                }
            }
        };

        root.addEventListener('change', handleChange, true);
        root.addEventListener('submit', handleSubmit, true);
        root.addEventListener('click', handleClick, true);

        return () => {
            root.removeEventListener('change', handleChange, true);
            root.removeEventListener('submit', handleSubmit, true);
            root.removeEventListener('click', handleClick, true);
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
}

// Helper function to create a mock fetcher
function createMockFetcher<TData = unknown>(
    initialState: 'idle' | 'loading' | 'submitting' = 'idle',
    initialData?: TData,
    initialSuccess: boolean = false,
    initialErrors?: string[]
): ScapiFetcher<TData> {
    return {
        state: initialState,
        data: initialData,
        success: initialSuccess,
        errors: initialErrors,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        load: async () => {},
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        submit: async () => {},
        formAction: undefined,
        formData: undefined,
        formEncType: 'application/x-www-form-urlencoded',
        formMethod: 'GET',
        formTarget: undefined,
        text: undefined,
        json: undefined,
        Form: undefined as unknown,
        // eslint-disable-next-line @typescript-eslint/no-empty-function
        unstable_reset: () => {},
        type: 'init',
    } as unknown as ScapiFetcher<TData>;
}

/**
 * PasswordUpdateFields component that renders the form fields for changing password.
 */
const meta: Meta<typeof PasswordUpdateFields> = {
    title: 'ACCOUNT/Password Update Form/Password Update Fields',
    component: PasswordUpdateFields,
    tags: ['autodocs', 'interaction'],
    parameters: {
        layout: 'centered',
        docs: {
            description: {
                component: `
The Password Update Fields component renders the form fields for changing user password.

**Features:**
- Current password field
- New password field
- Confirm password field
- Password requirements indicator
- Submit and cancel buttons
- Form validation feedback
                `,
            },
        },
    },
    decorators: [
        (Story) => (
            <ActionLogger>
                <div className="p-8 max-w-2xl">
                    <Story />
                </div>
            </ActionLogger>
        ),
    ],
    argTypes: {
        form: {
            description: 'React Hook Form instance for managing form state and validation',
            control: false,
        },
        updateFetcher: {
            description: 'React Router fetcher for handling password update requests',
            control: false,
        },
        onCancel: {
            description: 'Optional callback function to handle cancel action',
            action: 'cancel',
        },
    },
};

export default meta;
type Story = StoryObj<typeof PasswordUpdateFields>;

/**
 * Default fields with empty form
 */
export const Default: Story = {
    render: function DefaultStory() {
        const form = useForm<PasswordUpdateFormData>({
            resolver: zodResolver(passwordUpdateFormSchema),
            defaultValues: {
                currentPassword: '',
                password: '',
                confirmPassword: '',
            },
        });

        const updateFetcher = createMockFetcher<PasswordUpdateFetcherData>('idle');

        const handleSubmit = form.handleSubmit(() => {
            // Form submission handled by story
        });

        return (
            <Form {...form}>
                <form onSubmit={(e) => void handleSubmit(e)} data-testid="password-update-fields-form">
                    <PasswordUpdateFields form={form} updateFetcher={updateFetcher} />
                </form>
            </Form>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Verify form fields are present
        const currentPasswordInput = canvas.getByPlaceholderText(uiStrings.account.password.currentPasswordPlaceholder);
        await expect(currentPasswordInput).toBeInTheDocument();

        const passwordInput = canvas.getByPlaceholderText(uiStrings.account.password.newPasswordPlaceholder);
        await expect(passwordInput).toBeInTheDocument();

        const confirmPasswordInput = canvas.getByPlaceholderText(uiStrings.account.password.confirmPasswordPlaceholder);
        await expect(confirmPasswordInput).toBeInTheDocument();

        // Verify submit button
        const submitButton = canvas.getByRole('button', { name: uiStrings.account.password.saveButton });
        await expect(submitButton).toBeInTheDocument();
    },
};

/**
 * Fields with initial values
 */
export const WithInitialValues: Story = {
    render: function WithInitialValuesStory() {
        const form = useForm<PasswordUpdateFormData>({
            resolver: zodResolver(passwordUpdateFormSchema),
            defaultValues: {
                currentPassword: 'OldPassword123',
                password: 'NewPassword123!',
                confirmPassword: 'NewPassword123!',
            },
        });

        const updateFetcher = createMockFetcher<PasswordUpdateFetcherData>('idle');

        const handleSubmit = form.handleSubmit(() => {
            // Form submission handled by story
        });

        return (
            <Form {...form}>
                <form onSubmit={(e) => void handleSubmit(e)} data-testid="password-update-fields-form">
                    <PasswordUpdateFields form={form} updateFetcher={updateFetcher} />
                </form>
            </Form>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Verify form fields are populated
        const currentPasswordInput = canvas.getByDisplayValue('OldPassword123');
        await expect(currentPasswordInput).toBeInTheDocument();

        // Use placeholder to get password field (since password and confirmPassword have same value)
        const passwordInput = canvas.getByPlaceholderText(uiStrings.account.password.newPasswordPlaceholder);
        await expect(passwordInput).toBeInTheDocument();
        await expect(passwordInput).toHaveValue('NewPassword123!');

        // Verify confirm password field
        const confirmPasswordInput = canvas.getByPlaceholderText(uiStrings.account.password.confirmPasswordPlaceholder);
        await expect(confirmPasswordInput).toBeInTheDocument();
        await expect(confirmPasswordInput).toHaveValue('NewPassword123!');
    },
};

/**
 * Fields with cancel button
 */
export const WithCancelButton: Story = {
    render: function WithCancelButtonStory() {
        const form = useForm<PasswordUpdateFormData>({
            resolver: zodResolver(passwordUpdateFormSchema),
            defaultValues: {
                currentPassword: '',
                password: '',
                confirmPassword: '',
            },
        });

        const updateFetcher = createMockFetcher<PasswordUpdateFetcherData>('idle');

        const handleSubmit = form.handleSubmit(() => {
            // Form submission handled by story
        });

        // eslint-disable-next-line @typescript-eslint/no-empty-function
        const handleCancel = () => {};

        return (
            <Form {...form}>
                <form onSubmit={(e) => void handleSubmit(e)} data-testid="password-update-fields-form">
                    <PasswordUpdateFields form={form} updateFetcher={updateFetcher} onCancel={handleCancel} />
                </form>
            </Form>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Verify cancel button is present
        const cancelButton = canvas.getByRole('button', { name: uiStrings.account.password.cancelButton });
        await expect(cancelButton).toBeInTheDocument();
    },
};

/**
 * Fields in submitting state
 */
export const Submitting: Story = {
    render: function SubmittingStory() {
        const form = useForm<PasswordUpdateFormData>({
            resolver: zodResolver(passwordUpdateFormSchema),
            defaultValues: {
                currentPassword: 'OldPassword123',
                password: 'NewPassword123!',
                confirmPassword: 'NewPassword123!',
            },
        });

        const updateFetcher = createMockFetcher<PasswordUpdateFetcherData>('submitting');

        const handleSubmit = form.handleSubmit(() => {
            // Form submission handled by story
        });

        return (
            <Form {...form}>
                <form onSubmit={(e) => void handleSubmit(e)} data-testid="password-update-fields-form">
                    <PasswordUpdateFields form={form} updateFetcher={updateFetcher} />
                </form>
            </Form>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Verify submit button is disabled during submission
        const submitButton = canvas.getByRole('button', { name: 'Saving...' });
        await expect(submitButton).toBeInTheDocument();
        await expect(submitButton).toBeDisabled();
    },
};

/**
 * Interactive fields with user input
 */
export const Interactive: Story = {
    render: function InteractiveStory() {
        const form = useForm<PasswordUpdateFormData>({
            resolver: zodResolver(passwordUpdateFormSchema),
            defaultValues: {
                currentPassword: '',
                password: '',
                confirmPassword: '',
            },
        });

        const updateFetcher = createMockFetcher<PasswordUpdateFetcherData>('idle');

        const handleSubmit = form.handleSubmit(() => {
            // Form submission handled by story
        });

        return (
            <Form {...form}>
                <form onSubmit={(e) => void handleSubmit(e)} data-testid="password-update-fields-form">
                    <PasswordUpdateFields form={form} updateFetcher={updateFetcher} />
                </form>
            </Form>
        );
    },
    play: async ({ canvasElement }) => {
        const canvas = within(canvasElement);

        // Interact with form fields
        const currentPasswordInput = canvas.getByPlaceholderText(uiStrings.account.password.currentPasswordPlaceholder);
        await userEvent.type(currentPasswordInput, 'OldPassword123');
        await expect(currentPasswordInput).toHaveValue('OldPassword123');

        const passwordInput = canvas.getByPlaceholderText(uiStrings.account.password.newPasswordPlaceholder);
        await userEvent.type(passwordInput, 'NewPassword123!');
        await expect(passwordInput).toHaveValue('NewPassword123!');

        const confirmPasswordInput = canvas.getByPlaceholderText(uiStrings.account.password.confirmPasswordPlaceholder);
        await userEvent.type(confirmPasswordInput, 'NewPassword123!');
        await expect(confirmPasswordInput).toHaveValue('NewPassword123!');
    },
};
