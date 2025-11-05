import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import PasswordlessLoginForm from './passwordless-login-form';
import uiStrings from '@/temp-ui-string';

// Mock react-router
const mockNavigation = {
    state: 'idle' as 'idle' | 'submitting' | 'loading',
};

vi.mock('react-router', () => ({
    Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
    Link: ({ children, to, ...props }: any) => (
        <a href={to} {...props}>
            {children}
        </a>
    ),
    useNavigation: () => mockNavigation,
}));

describe('PasswordlessLoginForm', () => {
    const defaultProps = {
        isPasswordlessEnabled: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigation.state = 'idle';
    });

    describe('rendering', () => {
        test('renders form with all required elements', () => {
            render(<PasswordlessLoginForm {...defaultProps} />);

            // Email field
            const emailInput = screen.getByLabelText(uiStrings.login.emailLabel);
            expect(emailInput).toBeInTheDocument();
            expect(emailInput).toHaveAttribute('type', 'email');
            expect(emailInput).toHaveAttribute('name', 'email');

            // Submit button
            const submitButton = screen.getByRole('button', { name: uiStrings.login.sendLoginLink });
            expect(submitButton).toBeInTheDocument();
            expect(submitButton.tagName).toBe('BUTTON');

            // Forgot password link
            const forgotPasswordLink = screen.getByRole('link', { name: uiStrings.login.forgotPassword });
            expect(forgotPasswordLink).toBeInTheDocument();
            expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');

            // No error message by default
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        test('renders hidden fields correctly', () => {
            // Test without redirectPath
            const { container } = render(<PasswordlessLoginForm {...defaultProps} />);

            // loginMode is always present
            const loginModeInput = container.querySelector('input[name="loginMode"]');
            expect(loginModeInput).toBeInTheDocument();
            expect(loginModeInput).toHaveAttribute('type', 'hidden');
            expect(loginModeInput).toHaveValue('passwordless');

            // redirectPath is not present when not provided
            let redirectPathInput = container.querySelector('input[name="redirectPath"]');
            expect(redirectPathInput).not.toBeInTheDocument();

            // Test with redirectPath
            const redirectPath = '/account';
            const { container: containerWithRedirect } = render(
                <PasswordlessLoginForm {...defaultProps} redirectPath={redirectPath} />
            );

            // redirectPath is present when provided
            redirectPathInput = containerWithRedirect.querySelector('input[name="redirectPath"]');
            expect(redirectPathInput).toBeInTheDocument();
            expect(redirectPathInput).toHaveAttribute('type', 'hidden');
            expect(redirectPathInput).toHaveValue(redirectPath);
        });

        test('renders error message when error prop is provided', () => {
            const errorMessage = 'Failed to send login link';
            render(<PasswordlessLoginForm {...defaultProps} error={errorMessage} />);

            const errorElement = screen.getByText(errorMessage);
            expect(errorElement).toBeInTheDocument();
            expect(errorElement.closest('div')).toHaveClass('bg-destructive/10');
        });
    });

    describe('passwordless mode toggle', () => {
        test('renders password login link when passwordless is enabled', () => {
            render(<PasswordlessLoginForm {...defaultProps} isPasswordlessEnabled={true} />);

            const passwordLoginLink = screen.getByRole('link', { name: uiStrings.login.loginWithPassword });
            expect(passwordLoginLink).toBeInTheDocument();
            expect(passwordLoginLink).toHaveAttribute('href', '/login?mode=password');
        });

        test('does not render password login link when passwordless is disabled', () => {
            render(<PasswordlessLoginForm {...defaultProps} isPasswordlessEnabled={false} />);

            const passwordLoginLink = screen.queryByRole('link', { name: uiStrings.login.loginWithPassword });
            expect(passwordLoginLink).not.toBeInTheDocument();
        });
    });

    describe('email field interactions', () => {
        test('email field has correct attributes and accepts user input', async () => {
            const user = userEvent.setup();
            render(<PasswordlessLoginForm {...defaultProps} />);

            const emailInput = screen.getByLabelText(uiStrings.login.emailLabel);

            // Check attributes
            expect(emailInput).toHaveAttribute('placeholder', uiStrings.login.emailPlaceholder);
            expect(emailInput).toBeRequired();

            // Test user input
            await user.type(emailInput, 'test@example.com');
            expect(emailInput).toHaveValue('test@example.com');
        });
    });

    describe('form submission', () => {
        test('form has correct method and can be submitted with valid email', async () => {
            const user = userEvent.setup();
            const { container } = render(<PasswordlessLoginForm {...defaultProps} />);

            const form = container.querySelector('form');
            expect(form).toHaveAttribute('method', 'post');
            expect(form).toBeInTheDocument();

            // Fill in email and verify form data is ready for submission
            const emailInput = screen.getByLabelText(uiStrings.login.emailLabel);
            await user.type(emailInput, 'test@example.com');
            expect(emailInput).toHaveValue('test@example.com');
        });
    });

    describe('accessibility', () => {
        test('email field has proper accessibility attributes', () => {
            render(<PasswordlessLoginForm {...defaultProps} />);

            const emailInput = screen.getByLabelText(uiStrings.login.emailLabel);
            expect(emailInput).toHaveAttribute('autocomplete', 'email');
            expect(emailInput).toHaveAttribute('id', 'email');

            const emailLabel = screen.getByText(uiStrings.login.emailLabel);
            expect(emailLabel.tagName).toBe('LABEL');
            expect(emailLabel).toHaveAttribute('for', 'email');
        });

        test('links have descriptive text', () => {
            render(<PasswordlessLoginForm {...defaultProps} />);

            const forgotPasswordLink = screen.getByRole('link', { name: uiStrings.login.forgotPassword });
            expect(forgotPasswordLink).toHaveTextContent(uiStrings.login.forgotPassword);

            const passwordLoginLink = screen.getByRole('link', { name: uiStrings.login.loginWithPassword });
            expect(passwordLoginLink).toHaveTextContent(uiStrings.login.loginWithPassword);
        });
    });

    describe('edge cases', () => {
        test('handles special characters in email', async () => {
            const user = userEvent.setup();
            render(<PasswordlessLoginForm {...defaultProps} />);

            const emailInput = screen.getByLabelText(uiStrings.login.emailLabel);
            const specialEmail = 'test+user@example.com';

            await user.type(emailInput, specialEmail);

            expect(emailInput).toHaveValue(specialEmail);
        });

        test('handles empty or undefined redirectPath gracefully', () => {
            // Test with empty string
            const { container: containerEmpty } = render(<PasswordlessLoginForm {...defaultProps} redirectPath="" />);
            let redirectPathInput = containerEmpty.querySelector('input[name="redirectPath"]');
            expect(redirectPathInput).not.toBeInTheDocument();

            // Test with undefined
            const { container: containerUndefined } = render(
                <PasswordlessLoginForm {...defaultProps} redirectPath={undefined} />
            );
            redirectPathInput = containerUndefined.querySelector('input[name="redirectPath"]');
            expect(redirectPathInput).not.toBeInTheDocument();
        });

        test('handles error prop edge cases', () => {
            // Long error message
            const longError = 'A'.repeat(200);
            const { rerender } = render(<PasswordlessLoginForm {...defaultProps} error={longError} />);
            expect(screen.getByText(longError)).toBeInTheDocument();

            // Undefined error
            rerender(<PasswordlessLoginForm {...defaultProps} error={undefined} />);
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });

    describe('props combinations', () => {
        test('renders correctly with all props provided', () => {
            render(
                <PasswordlessLoginForm error="Test error" isPasswordlessEnabled={true} redirectPath="/account/orders" />
            );

            expect(screen.getByText('Test error')).toBeInTheDocument();
            expect(screen.getByRole('link', { name: uiStrings.login.loginWithPassword })).toBeInTheDocument();
            expect(screen.getByLabelText(uiStrings.login.emailLabel)).toBeInTheDocument();
        });

        test('renders correctly with minimal props', () => {
            render(<PasswordlessLoginForm isPasswordlessEnabled={false} />);

            expect(screen.getByLabelText(uiStrings.login.emailLabel)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: uiStrings.login.sendLoginLink })).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: uiStrings.login.loginWithPassword })).not.toBeInTheDocument();
        });
    });
});
