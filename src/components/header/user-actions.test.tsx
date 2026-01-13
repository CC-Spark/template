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
import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { getTranslation } from '@/lib/i18next';
import UserActions from './user-actions';
import AuthProvider from '@/providers/auth';
import type { SessionData } from '@/lib/api/types';

const { t } = getTranslation();

const createTestWrapper = (component: React.ReactElement, session?: SessionData) => {
    const router = createMemoryRouter(
        [
            {
                path: '*',
                element: session ? <AuthProvider value={session}>{component}</AuthProvider> : component,
            },
        ],
        { initialEntries: ['/'] }
    );
    return <RouterProvider router={router} />;
};

describe('UserActions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Guest user', () => {
        test('renders Sign In icon button and does not render account icon or logout button', () => {
            const guestSession: SessionData = {
                userType: 'guest',
            };

            const { container } = render(createTestWrapper(<UserActions />, guestSession));

            // Should render Sign In icon link
            const signInLink = screen.getByRole('link', { name: t('header:signIn') });
            expect(signInLink).toBeInTheDocument();
            expect(signInLink).toHaveAttribute('href', '/login');

            // Should contain LogIn icon
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('size-6');

            // Should not render account icon or logout button
            expect(screen.queryByRole('link', { name: /my account/i })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
        });
    });

    describe('Authenticated user', () => {
        test('renders account icon link with correct styling and does not render Sign In link or logout button', () => {
            const registeredSession: SessionData = {
                userType: 'registered',
                customer_id: 'test-customer-1',
            };

            const { container } = render(createTestWrapper(<UserActions />, registeredSession));

            // Should render account icon link
            const accountLink = screen.getByRole('link', { name: t('account:myAccount') });
            expect(accountLink).toBeInTheDocument();
            expect(accountLink).toHaveAttribute('href', '/account');

            // Should contain User icon with correct size
            const icon = container.querySelector('svg');
            expect(icon).toBeInTheDocument();
            expect(icon).toHaveClass('size-6');

            // Should have correct button styling (Button with asChild renders as Link)
            expect(accountLink).toHaveClass('cursor-pointer');

            // Should not render Sign In link or logout button
            expect(screen.queryByRole('link', { name: t('header:signIn') })).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: /sign out/i })).not.toBeInTheDocument();
        });
    });

    describe('Authentication state edge cases', () => {
        test('renders Sign In icon button when session is undefined or incomplete', () => {
            // Test undefined session
            const { rerender, container } = render(createTestWrapper(<UserActions />));
            const signInLink = screen.getByRole('link', { name: t('header:signIn') });
            expect(signInLink).toBeInTheDocument();
            expect(container.querySelector('svg')).toBeInTheDocument();

            // Test incomplete session (registered but no customer_id)
            const incompleteSession: SessionData = {
                userType: 'registered',
            };
            rerender(createTestWrapper(<UserActions />, incompleteSession));
            expect(screen.getByRole('link', { name: t('header:signIn') })).toBeInTheDocument();
            expect(screen.queryByRole('link', { name: /my account/i })).not.toBeInTheDocument();
        });
    });
});
