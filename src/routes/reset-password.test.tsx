/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import ResetPassword, { loader, action } from './reset-password';
import { resetPasswordWithToken } from '@/middlewares/auth.server';
import { isPasswordValid } from '@/lib/utils';
import { getTranslation } from '@/lib/i18next';

const { t } = getTranslation();

// Mock the auth middleware
vi.mock('@/middlewares/auth.server', () => ({
    resetPasswordWithToken: vi.fn(),
}));

// Mock utils
vi.mock('@/lib/utils', async () => {
    const actual = await vi.importActual('@/lib/utils');
    return {
        ...actual,
        isPasswordValid: vi.fn(),
    };
});

// Mock React Router hooks
vi.mock('react-router', async () => {
    const actual = await vi.importActual('react-router');
    return {
        ...actual,
        useActionData: vi.fn(),
    };
});

// Mock ResetPasswordForm component
vi.mock('@/components/reset-password-form', () => ({
    ResetPasswordForm: ({ error, token, email }: { error?: string; token: string; email: string }) => (
        <div data-testid="reset-password-form">
            <div data-testid="form-error">{error}</div>
            <div data-testid="form-token">{token}</div>
            <div data-testid="form-email">{email}</div>
        </div>
    ),
}));

// Helper to render with router
const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
};

const mockResetPasswordWithToken = vi.mocked(resetPasswordWithToken);
const mockIsPasswordValid = vi.mocked(isPasswordValid);

describe('reset-password route', () => {
    const mockContext = {
        get: vi.fn(),
        set: vi.fn(),
    } as any;

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('loader', () => {
        it('should return loader data when token and email are provided', () => {
            const mockRequest = new Request('http://localhost/reset-password?token=abc123&email=test@example.com');
            const args: LoaderFunctionArgs = {
                request: mockRequest,
                params: {},
                context: mockContext,
            };

            const result = loader(args);

            expect(result).toEqual({
                token: 'abc123',
                email: 'test@example.com',
            });
        });

        it('should redirect to forgot-password when token is missing', () => {
            const mockRequest = new Request('http://localhost/reset-password?email=test@example.com');
            const args: LoaderFunctionArgs = {
                request: mockRequest,
                params: {},
                context: mockContext,
            };

            const result = loader(args);

            // Check if it's a Response (redirect)
            expect(result).toBeInstanceOf(Response);
            if (result instanceof Response) {
                expect(result.status).toBe(302);
                expect(result.headers.get('Location')).toBe('/forgot-password');
            }
        });

        it('should redirect to forgot-password when email is missing', () => {
            const mockRequest = new Request('http://localhost/reset-password?token=abc123');
            const args: LoaderFunctionArgs = {
                request: mockRequest,
                params: {},
                context: mockContext,
            };

            const result = loader(args);

            // Check if it's a Response (redirect)
            expect(result).toBeInstanceOf(Response);
            if (result instanceof Response) {
                expect(result.status).toBe(302);
                expect(result.headers.get('Location')).toBe('/forgot-password');
            }
        });

        it('should redirect to forgot-password when both token and email are missing', () => {
            const mockRequest = new Request('http://localhost/reset-password');
            const args: LoaderFunctionArgs = {
                request: mockRequest,
                params: {},
                context: mockContext,
            };

            const result = loader(args);

            expect(result).toBeInstanceOf(Response);
            if (result instanceof Response) {
                expect(result.status).toBe(302);
                expect(result.headers.get('Location')).toBe('/forgot-password');
            }
        });
    });

    describe('action', () => {
        describe('validation errors', () => {
            it('should redirect to forgot-password when token is missing', async () => {
                const formData = new URLSearchParams();
                formData.append('email', 'test@example.com');
                formData.append('newPassword', 'Test123!');
                formData.append('confirmPassword', 'Test123!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                expect(result).toBeInstanceOf(Response);
                if (result instanceof Response) {
                    expect(result.status).toBe(302);
                    const location = result.headers.get('Location');
                    // Token is critical - redirect to forgot-password page with generic error
                    expect(location).toBe('/forgot-password');
                }
            });

            it('should return specific error when email is missing', async () => {
                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('newPassword', 'Test123!');
                formData.append('confirmPassword', 'Test123!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                // Returns error data, not redirect
                expect(result).toEqual({
                    error: t('signup:allFieldsRequired'),
                });
            });

            it('should return specific error when newPassword is missing', async () => {
                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('email', 'test@example.com');
                formData.append('confirmPassword', 'Test123!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                // Returns error data, not redirect
                expect(result).toEqual({
                    error: t('signup:allFieldsRequired'),
                });
            });

            it('should return specific error when confirmPassword is missing', async () => {
                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('email', 'test@example.com');
                formData.append('newPassword', 'Test123!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                // Returns error data, not redirect
                expect(result).toEqual({
                    error: t('signup:allFieldsRequired'),
                });
            });

            it('should return specific error when passwords do not match', async () => {
                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('email', 'test@example.com');
                formData.append('newPassword', 'Test123!');
                formData.append('confirmPassword', 'Different456!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                // Returns error data, not redirect
                expect(result).toEqual({
                    error: t('resetPassword:passwordsMustMatch'),
                });
            });

            it('should return specific error when password is not strong enough', async () => {
                mockIsPasswordValid.mockReturnValue(false);

                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('email', 'test@example.com');
                formData.append('newPassword', 'weak');
                formData.append('confirmPassword', 'weak');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                expect(mockIsPasswordValid).toHaveBeenCalledWith('weak');
                // Returns error data, not redirect
                expect(result).toEqual({
                    error: t('signup:passwordNotSecure'),
                });
            });
        });

        describe('successful password reset', () => {
            it('should redirect to login on successful password reset', async () => {
                mockIsPasswordValid.mockReturnValue(true);
                mockResetPasswordWithToken.mockResolvedValue(undefined);

                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('email', 'test@example.com');
                formData.append('newPassword', 'Test123!');
                formData.append('confirmPassword', 'Test123!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                expect(mockIsPasswordValid).toHaveBeenCalledWith('Test123!');
                expect(mockResetPasswordWithToken).toHaveBeenCalledWith(mockContext, {
                    email: 'test@example.com',
                    token: 'abc123',
                    newPassword: 'Test123!',
                });

                expect(result).toBeInstanceOf(Response);
                if (result instanceof Response) {
                    expect(result.status).toBe(302);
                    const location = result.headers.get('Location');
                    expect(location).toBe('/login');
                }
            });
        });

        describe('API errors', () => {
            it('should return generic error when password reset fails', async () => {
                mockIsPasswordValid.mockReturnValue(true);
                mockResetPasswordWithToken.mockRejectedValue(new Error('Invalid token'));

                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('email', 'test@example.com');
                formData.append('newPassword', 'Test123!');
                formData.append('confirmPassword', 'Test123!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                expect(mockResetPasswordWithToken).toHaveBeenCalled();
                // Returns error data, not redirect
                expect(result).toEqual({
                    error: t('errors:somethingWentWrong'),
                });
            });

            it('should not expose actual error message from API', async () => {
                mockIsPasswordValid.mockReturnValue(true);
                mockResetPasswordWithToken.mockRejectedValue(new Error('Token expired at 2025-01-01 12:00:00'));

                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('email', 'test@example.com');
                formData.append('newPassword', 'Test123!');
                formData.append('confirmPassword', 'Test123!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                // Should show generic error, not the actual token expiration error
                expect(result).toEqual({
                    error: t('errors:somethingWentWrong'),
                });
            });
        });

        describe('edge cases', () => {
            it('should redirect to forgot-password when token is empty string', async () => {
                const formData = new URLSearchParams();
                formData.append('token', '');
                formData.append('email', 'test@example.com');
                formData.append('newPassword', 'Test123!');
                formData.append('confirmPassword', 'Test123!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                expect(result).toBeInstanceOf(Response);
                if (result instanceof Response) {
                    const location = result.headers.get('Location');
                    // Empty token is treated as missing token - redirect with generic error
                    expect(location).toBe('/forgot-password');
                }
            });

            it('should handle empty newPassword with specific error', async () => {
                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('email', 'test@example.com');
                formData.append('newPassword', '');
                formData.append('confirmPassword', 'Test123!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                // Returns error data, not redirect
                expect(result).toEqual({
                    error: t('signup:allFieldsRequired'),
                });
            });

            it('should handle empty confirmPassword with specific error', async () => {
                const formData = new URLSearchParams();
                formData.append('token', 'abc123');
                formData.append('email', 'test@example.com');
                formData.append('newPassword', 'Test123!');
                formData.append('confirmPassword', '');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                // Returns error data, not redirect
                expect(result).toEqual({
                    error: t('signup:allFieldsRequired'),
                });
            });

            it('should return error data for validation failure with special characters', async () => {
                const formData = new URLSearchParams();
                formData.append('token', 'abc+123/xyz=');
                formData.append('email', 'test+user@example.com');
                formData.append('newPassword', 'Test123!');
                formData.append('confirmPassword', 'Different456!');

                const mockRequest = new Request('http://localhost/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: formData.toString(),
                });

                const args: ActionFunctionArgs = {
                    request: mockRequest,
                    params: {},
                    context: mockContext,
                };

                const result = await action(args);

                // Passwords don't match - should return error data
                expect(result).toEqual({
                    error: t('resetPassword:passwordsMustMatch'),
                });
            });
        });
    });

    describe('Component', () => {
        let mockUseActionData: ReturnType<typeof vi.fn>;

        beforeEach(async () => {
            const reactRouter = await import('react-router');
            mockUseActionData = vi.mocked(reactRouter.useActionData);
        });

        it('should render form with all required elements', () => {
            mockUseActionData.mockReturnValue(undefined);

            const loaderData = {
                token: 'test-token-123',
                email: 'test@example.com',
            };

            renderWithRouter(<ResetPassword loaderData={loaderData} />);

            // Title and subtitle
            expect(screen.getByText(t('resetPassword:title'))).toBeInTheDocument();
            const subtitle = t('resetPassword:subtitle') || 'Enter your new password below';
            expect(screen.getByText(subtitle)).toBeInTheDocument();

            // Form with correct props
            expect(screen.getByTestId('reset-password-form')).toBeInTheDocument();
            expect(screen.getByTestId('form-token')).toHaveTextContent('test-token-123');
            expect(screen.getByTestId('form-email')).toHaveTextContent('test@example.com');

            // No error by default
            const errorElement = screen.getByTestId('form-error');
            expect(errorElement).toBeEmptyDOMElement();
        });

        it('should pass error from actionData to ResetPasswordForm', () => {
            const errorMessage = 'Passwords must match';
            mockUseActionData.mockReturnValue({
                error: errorMessage,
            });

            const loaderData = {
                token: 'test-token',
                email: 'test@example.com',
            };

            renderWithRouter(<ResetPassword loaderData={loaderData} />);

            expect(screen.getByTestId('form-error')).toHaveTextContent(errorMessage);
        });

        it('should handle special characters in email and token', () => {
            mockUseActionData.mockReturnValue(undefined);

            // Test email with special characters
            const loaderDataEmail = {
                token: 'test-token',
                email: 'test+user@example.com',
            };

            const { unmount } = renderWithRouter(<ResetPassword loaderData={loaderDataEmail} />);
            expect(screen.getByTestId('form-email')).toHaveTextContent('test+user@example.com');
            unmount();

            // Test token with special characters
            const loaderDataToken = {
                token: 'test+token/123=',
                email: 'test@example.com',
            };

            renderWithRouter(<ResetPassword loaderData={loaderDataToken} />);
            expect(screen.getByTestId('form-token')).toHaveTextContent('test+token/123=');
        });
    });
});
