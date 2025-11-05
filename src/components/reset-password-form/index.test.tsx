import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { ResetPasswordForm } from './index';
import uiStrings from '@/temp-ui-string';
import { isPasswordValid } from '@/lib/utils';

// Mock react-router
const mockNavigation = {
    state: 'idle' as 'idle' | 'submitting' | 'loading',
};

vi.mock('react-router', () => ({
    Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    useNavigation: () => mockNavigation,
}));

// Mock the utils module for password validation
vi.mock('@/lib/utils', async () => {
    const actual = await vi.importActual('@/lib/utils');
    return {
        ...actual,
        isPasswordValid: vi.fn(),
        validatePassword: vi.fn(),
    };
});

// Mock PasswordRequirement component to simplify testing
vi.mock('@/components/password-requirements', () => ({
    PasswordRequirement: ({ password }: { password: string }) => (
        <div data-testid="password-requirements">Password requirements for: {password}</div>
    ),
}));

describe('ResetPasswordForm', () => {
    const defaultProps = {
        token: 'test-token-123',
        email: 'test@example.com',
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigation.state = 'idle';
        // Set default mock for password validation
        vi.mocked(isPasswordValid).mockReturnValue(false);
    });

    describe('rendering', () => {
        test('renders form with all required elements', () => {
            const { container } = render(<ResetPasswordForm {...defaultProps} />);

            // Email display (disabled)
            const emailInput = screen.getByLabelText(
                uiStrings.resetPassword.emailLabel || uiStrings.signup.form.emailLabel
            );
            expect(emailInput).toBeInTheDocument();
            expect(emailInput).toHaveValue(defaultProps.email);
            expect(emailInput).toBeDisabled();

            // Password fields
            expect(
                screen.getByLabelText(uiStrings.resetPassword.newPasswordLabel || uiStrings.signup.form.passwordLabel)
            ).toBeInTheDocument();
            expect(
                screen.getByLabelText(
                    uiStrings.resetPassword.confirmPasswordLabel || uiStrings.signup.form.confirmPasswordLabel
                )
            ).toBeInTheDocument();

            // Submit button
            expect(
                screen.getByRole('button', { name: uiStrings.resetPassword.resetPasswordButton })
            ).toBeInTheDocument();

            // Hidden fields
            const tokenInput = container.querySelector('input[name="token"]');
            const emailHidden = container.querySelector('input[name="email"]');
            expect(tokenInput).toBeInTheDocument();
            expect(tokenInput).toHaveValue(defaultProps.token);
            expect(tokenInput).toHaveAttribute('type', 'hidden');
            expect(emailHidden).toBeInTheDocument();
            expect(emailHidden).toHaveValue(defaultProps.email);
            expect(emailHidden).toHaveAttribute('type', 'hidden');

            // PasswordRequirements component
            expect(screen.getByTestId('password-requirements')).toBeInTheDocument();

            // No error by default
            expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
        });

        test('renders error message when error prop is provided', () => {
            const errorMessage = 'Invalid reset token';
            render(<ResetPasswordForm {...defaultProps} error={errorMessage} />);

            expect(screen.getByText(errorMessage)).toBeInTheDocument();
            expect(screen.getByText(errorMessage).closest('div')).toHaveClass('bg-destructive/10');
        });
    });

    describe('password field interactions', () => {
        test('accepts user input in password fields', async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm {...defaultProps} />);

            const passwordInput = screen.getByLabelText(
                uiStrings.resetPassword.newPasswordLabel || uiStrings.signup.form.passwordLabel
            );
            const confirmPasswordInput = screen.getByLabelText(
                uiStrings.resetPassword.confirmPasswordLabel || uiStrings.signup.form.confirmPasswordLabel
            );

            await user.type(passwordInput, 'Test123!');
            expect(passwordInput).toHaveValue('Test123!');

            await user.type(confirmPasswordInput, 'Test123!');
            expect(confirmPasswordInput).toHaveValue('Test123!');
        });

        test('handles password mismatch validation', async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm {...defaultProps} />);

            const passwordInput = screen.getByLabelText(
                uiStrings.resetPassword.newPasswordLabel || uiStrings.signup.form.passwordLabel
            );
            const confirmPasswordInput = screen.getByLabelText(
                uiStrings.resetPassword.confirmPasswordLabel || uiStrings.signup.form.confirmPasswordLabel
            );

            // Test mismatch - should show error and set aria-invalid
            await user.type(passwordInput, 'Test123!');
            await user.type(confirmPasswordInput, 'Different456!');

            await waitFor(() => {
                expect(screen.getByText(uiStrings.signup.passwordsDoNotMatch)).toBeInTheDocument();
                expect(confirmPasswordInput).toHaveAttribute('aria-invalid', 'true');
            });

            // Clear and test matching passwords - should not show error
            await user.clear(confirmPasswordInput);
            await user.type(confirmPasswordInput, 'Test123!');

            expect(screen.queryByText(uiStrings.signup.passwordsDoNotMatch)).not.toBeInTheDocument();
        });
    });

    describe('password requirements', () => {
        test('passes password value to PasswordRequirements component', async () => {
            const user = userEvent.setup();
            render(<ResetPasswordForm {...defaultProps} />);

            const passwordInput = screen.getByLabelText(
                uiStrings.resetPassword.newPasswordLabel || uiStrings.signup.form.passwordLabel
            );

            await user.type(passwordInput, 'Test123!');

            await waitFor(() => {
                expect(screen.getByTestId('password-requirements')).toHaveTextContent(
                    'Password requirements for: Test123!'
                );
            });
        });
    });

    describe('form submission', () => {
        test('validates form and controls submit button state', async () => {
            const user = userEvent.setup();
            const { container } = render(<ResetPasswordForm {...defaultProps} />);

            // Form should have POST method
            const form = container.querySelector('form');
            expect(form).toHaveAttribute('method', 'POST');

            // Submit button should be disabled when form is invalid
            let submitButton = screen.getByRole('button', { name: uiStrings.resetPassword.resetPasswordButton });
            expect(submitButton).toBeDisabled();

            // Enable the form by mocking valid password
            vi.mocked(isPasswordValid).mockReturnValue(true);

            const passwordInput = screen.getByLabelText(
                uiStrings.resetPassword.newPasswordLabel || uiStrings.signup.form.passwordLabel
            );
            const confirmPasswordInput = screen.getByLabelText(
                uiStrings.resetPassword.confirmPasswordLabel || uiStrings.signup.form.confirmPasswordLabel
            );

            // Type matching valid passwords
            await user.type(passwordInput, 'Test123!');
            await user.type(confirmPasswordInput, 'Test123!');

            // Submit button should be enabled when form is valid
            await waitFor(() => {
                submitButton = screen.getByRole('button', { name: uiStrings.resetPassword.resetPasswordButton });
                expect(submitButton).not.toBeDisabled();
            });
        });
    });

    describe('accessibility', () => {
        test('form fields have proper accessibility attributes', () => {
            render(<ResetPasswordForm {...defaultProps} />);

            const passwordInput = screen.getByLabelText(
                uiStrings.resetPassword.newPasswordLabel || uiStrings.signup.form.passwordLabel
            );
            const confirmPasswordInput = screen.getByLabelText(
                uiStrings.resetPassword.confirmPasswordLabel || uiStrings.signup.form.confirmPasswordLabel
            );
            const emailInput = screen.getByLabelText(
                uiStrings.resetPassword.emailLabel || uiStrings.signup.form.emailLabel
            );

            // Password fields
            expect(passwordInput).toHaveAttribute('type', 'password');
            expect(passwordInput).toHaveAttribute('autocomplete', 'new-password');
            expect(passwordInput).toBeRequired();

            expect(confirmPasswordInput).toHaveAttribute('type', 'password');
            expect(confirmPasswordInput).toHaveAttribute('autocomplete', 'new-password');
            expect(confirmPasswordInput).toBeRequired();

            // Email field
            expect(emailInput).toHaveAttribute('type', 'email');
        });
    });

    describe('edge cases', () => {
        test('handles empty and special values gracefully', () => {
            // Empty token
            const { container, rerender } = render(<ResetPasswordForm {...defaultProps} token="" />);
            const tokenInput = container.querySelector('input[name="token"]');
            expect(tokenInput).toHaveValue('');

            // Empty email
            rerender(<ResetPasswordForm {...defaultProps} email="" />);
            let emailDisplay = screen.getByLabelText(
                uiStrings.resetPassword.emailLabel || uiStrings.signup.form.emailLabel
            );
            expect(emailDisplay).toHaveValue('');
            const emailHidden = container.querySelector('input[name="email"]');
            expect(emailHidden).toHaveValue('');

            // Special characters in email
            const specialEmail = 'test+user@example.com';
            rerender(<ResetPasswordForm {...defaultProps} email={specialEmail} />);
            emailDisplay = screen.getByLabelText(
                uiStrings.resetPassword.emailLabel || uiStrings.signup.form.emailLabel
            );
            expect(emailDisplay).toHaveValue(specialEmail);

            // Long error message
            const longError = 'A'.repeat(500);
            rerender(<ResetPasswordForm {...defaultProps} error={longError} />);
            expect(screen.getByText(longError)).toBeInTheDocument();
        });
    });

    describe('UI strings fallbacks', () => {
        test('uses fallback strings when resetPassword strings are not available', () => {
            // This tests that the component can fall back to signup strings
            render(<ResetPasswordForm {...defaultProps} />);

            // The component should still render even if some strings are missing
            expect(screen.getByRole('button')).toBeInTheDocument();
        });
    });
});
