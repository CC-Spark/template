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
import type { ReactElement, PropsWithChildren } from 'react';
import { Link, useLocation } from 'react-router';
import Search from './search';
import CartBadge from './cart-badge';
import UserActions from './user-actions/user-actions';
import { useTranslation } from 'react-i18next';
import logo from '/images/logo.svg';
import { UITarget } from '@/targets/ui-target';

export default function Header({ children }: PropsWithChildren): ReactElement {
    const { t } = useTranslation('header');
    const location = useLocation();

    return (
        <header className="bg-header-background text-header-foreground border-b border-border sticky top-0 z-50 relative [--header-height:theme(spacing.16)]">
            <div className="px-4 lg:px-9">
                {/* Top row: Logo left, Icons right */}
                <div className="flex items-center gap-x-4 lg:gap-x-6 h-16">
                    {/* Logo - color swapped by theme via --header-logo-filter in app.css */}
                    <Link to="/" className="flex-shrink-0 flex items-center" data-testid="header-logo">
                        <img
                            src={logo}
                            alt={t('logoAlt')}
                            className="h-3 lg:h-4 w-auto [filter:var(--header-logo-filter)]"
                        />
                    </Link>

                    {/* Navigation Menu - desktop only, next to logo */}
                    <div className="hidden lg:flex items-center">{children}</div>

                    {/* Spacer - takes remaining space */}
                    <div className="flex-1" />

                    {/* Search - desktop only */}
                    <div className="hidden lg:block" data-testid="header-search-desktop">
                        <Search key={`${location.pathname}${location.search}`} />
                    </div>

                    {/* Icons group - includes mobile hamburger */}
                    <div className="flex items-center space-x-2">
                        <UITarget targetId="header.before.cart" />
                        <UserActions />
                        <CartBadge />
                        <div className="lg:hidden">{children}</div>
                    </div>
                </div>

                {/* Mobile search - second row */}
                <div className="pb-4 lg:hidden" data-testid="header-search-mobile">
                    <Search key={`${location.pathname}${location.search}`} />
                </div>
            </div>
        </header>
    );
}
