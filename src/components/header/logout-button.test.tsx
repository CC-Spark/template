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
import { getTranslation } from '@/lib/i18next';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import LogoutButton from './logout-button';
// Mock react-router
const mockNavigation = {
    state: 'idle' as 'idle' | 'submitting' | 'loading',
    formAction: undefined as string | undefined,
};

vi.mock('react-router', async (importOriginal) => {
    const actual = (await importOriginal()) as any;
    return {
        ...actual,
        Form: ({ children, ...props }: { children: React.ReactNode; method: string; action: string }) => (
            <form {...props}>{children}</form>
        ),
        useNavigation: () => mockNavigation,
    };
});

describe('LogoutButton', () => {
    const { t } = getTranslation();

    beforeEach(() => {
        vi.clearAllMocks();
        // Reset to default state
        mockNavigation.state = 'idle';
        mockNavigation.formAction = undefined;
    });

    describe('idle state', () => {
        test('renders sign out button when not submitting', () => {
            render(<LogoutButton />);

            const button = screen.getByRole('button', { name: t('header:signOut') });
            expect(button).toBeInTheDocument();
            expect(button).toHaveAttribute('type', 'submit');
            expect(button).not.toBeDisabled();
        });

        test('renders form with correct method and action', () => {
            const { container } = render(<LogoutButton />);

            const form = container.querySelector('form');
            expect(form).toBeInTheDocument();
            expect(form).toHaveAttribute('method', 'post');
            expect(form).toHaveAttribute('action', '/logout');
        });
    });

    describe('submitting state', () => {
        test('shows signing out text when submitting to /logout', () => {
            mockNavigation.state = 'submitting';
            mockNavigation.formAction = '/logout';

            render(<LogoutButton />);

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent(t('header:signingOut'));
        });

        test('disables button when submitting to /logout', () => {
            mockNavigation.state = 'submitting';
            mockNavigation.formAction = '/logout';

            render(<LogoutButton />);

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });

        test('renders spinner element when submitting to /logout', () => {
            mockNavigation.state = 'submitting';
            mockNavigation.formAction = '/logout';

            const { container } = render(<LogoutButton />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).toBeInTheDocument();
        });

        test('does not disable button when submitting to different action', () => {
            mockNavigation.state = 'submitting';
            mockNavigation.formAction = '/other-action';

            render(<LogoutButton />);

            const button = screen.getByRole('button');
            expect(button).not.toBeDisabled();
            expect(button).toHaveTextContent(t('header:signOut'));
        });

        test('does not show spinner when submitting to different action', () => {
            mockNavigation.state = 'submitting';
            mockNavigation.formAction = '/other-action';

            const { container } = render(<LogoutButton />);

            const spinner = container.querySelector('.animate-spin');
            expect(spinner).not.toBeInTheDocument();
        });
    });

    describe('accessibility', () => {
        test('button text changes appropriately for screen readers', () => {
            const { rerender } = render(<LogoutButton />);

            let button = screen.getByRole('button', { name: t('header:signOut') });
            expect(button).toBeInTheDocument();

            mockNavigation.state = 'submitting';
            mockNavigation.formAction = '/logout';
            rerender(<LogoutButton />);

            // When submitting, the button text includes "Signing out..."
            button = screen.getByRole('button');
            expect(button).toHaveAccessibleName(expect.stringContaining(t('header:signingOut')));
        });

        test('button is focusable when not disabled', () => {
            render(<LogoutButton />);

            const button = screen.getByRole('button');
            expect(button).not.toHaveAttribute('disabled');
        });

        test('button is not focusable when disabled', () => {
            mockNavigation.state = 'submitting';
            mockNavigation.formAction = '/logout';

            render(<LogoutButton />);

            const button = screen.getByRole('button');
            expect(button).toBeDisabled();
        });
    });

    describe('button behavior', () => {
        test('only shows loading state for matching formAction', () => {
            const formActions = ['/logout', '/login', '/signup', '/update-profile'];

            formActions.forEach((action) => {
                mockNavigation.state = 'submitting';
                mockNavigation.formAction = action;

                const { rerender } = render(<LogoutButton />);

                const button = screen.getByRole('button');

                if (action === '/logout') {
                    expect(button).toBeDisabled();
                    expect(button).toHaveTextContent(t('header:signingOut'));
                } else {
                    expect(button).not.toBeDisabled();
                    expect(button).toHaveTextContent(t('header:signOut'));
                }

                rerender(<div />); // Clean up for next iteration
            });
        });
    });
});
