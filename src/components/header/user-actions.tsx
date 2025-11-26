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
