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
import { type ReactElement, useMemo } from 'react';
import { Link } from 'react-router';
import { useAuth } from '@/providers/auth';
import LogoutButton from './logout-button';
import { useTranslation } from 'react-i18next';

export default function UserActions(): ReactElement {
    const session = useAuth();
    const { t } = useTranslation('header');
    const isAuthenticated = useMemo(() => {
        // Check if user is authenticated (has valid token and is registered)
        return session?.userType === 'registered' && session?.customer_id;
    }, [session]);

    if (isAuthenticated) {
        return (
            <div className="flex items-center space-x-2">
                <Link
                    to="/account"
                    className="text-sm text-muted-foreground hidden sm:inline hover:text-foreground transition-colors">
                    {t('welcomeBack')}
                </Link>
                <LogoutButton />
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2">
            <Link
                to="/login"
                className="inline-flex items-center px-3 py-1.5 border border-border text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring">
                {t('signIn')}
            </Link>
        </div>
    );
}
