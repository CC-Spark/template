import { getTranslation } from '@/lib/i18next';

const { t } = getTranslation();
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import StandardLoginForm from './standard-login-form';
// Mock react-router
const mockNavigation = {
    state: 'idle' as 'idle' | 'submitting' | 'loading',
};

vi.mock('react-router', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        Form: ({ children, ...props }: any) => <form {...props}>{children}</form>,
        Link: ({ children, to, ...props }: any) => (
            <a href={to} {...props}>
                {children}
            </a>
        ),
        useNavigation: () => mockNavigation,
    };
});

describe('StandardLoginForm', () => {
    const defaultProps = {
        isPasswordlessEnabled: true,
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockNavigation.state = 'idle';
    });

    describe('rendering', () => {
        test('renders form with all required elements', () => {
            const { container } = render(<StandardLoginForm {...defaultProps} />);

            // Email field
            const emailInput = screen.getByLabelText(t('login:emailLabel'));
            expect(emailInput).toBeInTheDocument();
            expect(emailInput).toHaveAttribute('type', 'email');
            expect(emailInput).toHaveAttribute('name', 'email');
            expect(emailInput).toHaveAttribute('id', 'email');
            expect(emailInput).toHaveAttribute('placeholder', t('login:emailPlaceholder'));
            expect(emailInput).toHaveAttribute('autocomplete', 'email');
            expect(emailInput).toBeRequired();

            // Password field
            const passwordInput = screen.getByLabelText(t('login:passwordLabel'));
            expect(passwordInput).toBeInTheDocument();
            expect(passwordInput).toHaveAttribute('type', 'password');
            expect(passwordInput).toHaveAttribute('name', 'password');
            expect(passwordInput).toHaveAttribute('id', 'password');
            expect(passwordInput).toHaveAttribute('placeholder', t('login:passwordPlaceholder'));
            expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
            expect(passwordInput).toBeRequired();

            // Submit button
            const submitButton = screen.getByRole('button', { name: t('login:signIn') });
            expect(submitButton).toBeInTheDocument();

            // Links
            const forgotPasswordLink = screen.getByRole('link', { name: t('login:forgotPassword') });
            expect(forgotPasswordLink).toBeInTheDocument();
            expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password');
            expect(forgotPasswordLink).toHaveClass('text-primary', 'hover:text-primary/80');

            const signUpLink = screen.getByRole('link', { name: t('login:signUp') });
            expect(signUpLink).toBeInTheDocument();
            expect(signUpLink).toHaveAttribute('href', '/signup');

            const passwordlessLink = screen.getByRole('link', { name: t('login:loginWithoutPassword') });
            expect(passwordlessLink).toBeInTheDocument();
            expect(passwordlessLink).toHaveAttribute('href', '/login?mode=passwordless');
            expect(passwordlessLink).toHaveClass('text-primary', 'hover:text-primary/80');

            // Hidden loginMode field
            const loginModeInput = container.querySelector('input[name="loginMode"]');
            expect(loginModeInput).toBeInTheDocument();
            expect(loginModeInput).toHaveValue('password');
            expect(loginModeInput).toHaveAttribute('type', 'hidden');

            // Form structure
            const form = container.querySelector('form');
            expect(form).toHaveAttribute('method', 'post');
            expect(form).toHaveClass('space-y-6');

            // No error by default
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });

        test('renders error message when error prop is provided', () => {
            const errorMessage = 'Invalid credentials';
            render(<StandardLoginForm {...defaultProps} error={errorMessage} />);

            const errorElement = screen.getByText(errorMessage);
            expect(errorElement).toBeInTheDocument();
            expect(errorElement.closest('div')).toHaveClass(
                'bg-destructive/10',
                'border',
                'border-destructive/20',
                'text-destructive'
            );
        });
    });

    describe('form field interactions', () => {
        test('accepts user input in email and password fields', async () => {
            const user = userEvent.setup();
            render(<StandardLoginForm {...defaultProps} />);

            const emailInput = screen.getByLabelText(t('login:emailLabel'));
            const passwordInput = screen.getByLabelText(t('login:passwordLabel'));

            // Type in email field
            await user.type(emailInput, 'test@example.com');
            expect(emailInput).toHaveValue('test@example.com');

            // Type in password field
            await user.type(passwordInput, 'SecurePass123!');
            expect(passwordInput).toHaveValue('SecurePass123!');

            // Test special characters in email
            await user.clear(emailInput);
            const specialEmail = 'test+user@example.com';
            await user.type(emailInput, specialEmail);
            expect(emailInput).toHaveValue(specialEmail);
        });
    });

    describe('passwordless mode toggle', () => {
        test('conditionally renders passwordless login link', () => {
            // With passwordless enabled
            const { rerender } = render(<StandardLoginForm isPasswordlessEnabled={true} />);
            let passwordlessLink: HTMLElement | null = screen.getByRole('link', {
                name: t('login:loginWithoutPassword'),
            });
            expect(passwordlessLink).toBeInTheDocument();
            expect(passwordlessLink).toHaveAttribute('href', '/login?mode=passwordless');

            // Without passwordless enabled
            rerender(<StandardLoginForm isPasswordlessEnabled={false} />);
            passwordlessLink = screen.queryByRole('link', { name: t('login:loginWithoutPassword') });
            expect(passwordlessLink).not.toBeInTheDocument();
        });
    });

    describe('edge cases', () => {
        test('handles error prop variations', () => {
            // Long error message
            const longError = 'A'.repeat(200);
            const { rerender } = render(<StandardLoginForm {...defaultProps} error={longError} />);
            expect(screen.getByText(longError)).toBeInTheDocument();

            // Undefined error
            rerender(<StandardLoginForm {...defaultProps} error={undefined} />);
            expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        });
    });
});
