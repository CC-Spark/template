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
import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { getTranslation } from '@/lib/i18next';

const { t } = getTranslation();

// Components
import CartEmpty from './cart-empty';

// Utils
// Mock the Link component from react-router
vi.mock('react-router', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        Link: ({ children, to, ...props }: { children: React.ReactNode; to: string; [key: string]: unknown }) => (
            <a href={to} {...props}>
                {children}
            </a>
        ),
    };
});

describe('CartEmpty', () => {
    describe('Basic Rendering', () => {
        test('renders empty cart with all required elements', () => {
            render(<CartEmpty />);

            // Check for container with correct test id
            const container = screen.getByTestId('sf-cart-empty');
            expect(container).toBeInTheDocument();

            // Check for shopping cart icon
            const cartIcon = document.querySelector('svg[class*="lucide-shopping-cart"]');
            expect(cartIcon).toBeInTheDocument();

            // Check for empty cart title
            expect(screen.getByText(t('cart:empty.title'))).toBeInTheDocument();

            // Check for continue shopping button
            expect(screen.getByText(t('cart:empty.continueShopping'))).toBeInTheDocument();
        });
    });

    describe('User Registration States', () => {
        test('renders guest message and sign in button for unregistered users', () => {
            render(<CartEmpty isRegistered={false} />);

            expect(screen.getByText(t('cart:empty.guestMessage'))).toBeInTheDocument();
            expect(screen.getByText(t('cart:empty.signIn'))).toBeInTheDocument();

            // Check for User icon
            const userIcon = document.querySelector('svg[class*="lucide-user"]');
            expect(userIcon).toBeInTheDocument();
        });

        test('renders registered message and hides sign in button for registered users', () => {
            render(<CartEmpty isRegistered={true} />);

            expect(screen.getByText(t('cart:empty.registeredMessage'))).toBeInTheDocument();
            expect(screen.queryByText(t('cart:empty.signIn'))).not.toBeInTheDocument();

            // Should not have User icon
            const userIcon = document.querySelector('svg[class*="lucide-user"]');
            expect(userIcon).not.toBeInTheDocument();
        });
    });

    describe('Action Buttons', () => {
        test('continue shopping button links to home page', () => {
            render(<CartEmpty />);

            const continueShoppingLink = screen.getByText(t('cart:empty.continueShopping')).closest('a');
            expect(continueShoppingLink).toHaveAttribute('href', '/');
        });

        test('sign in button links to account page with user icon for guest users', () => {
            render(<CartEmpty isRegistered={false} />);

            const signInLink = screen.getByText(t('cart:empty.signIn')).closest('a');
            expect(signInLink).toHaveAttribute('href', '/account');

            // Check that User icon is present within the sign in button
            const userIcon = signInLink?.querySelector('svg[class*="lucide-user"]');
            expect(userIcon).toBeInTheDocument();
        });
    });
});
