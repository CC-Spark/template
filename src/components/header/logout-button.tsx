'use client';

import { Form, useNavigation } from 'react-router';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

export default function LogoutButton() {
    const navigation = useNavigation();
    const { t } = useTranslation('header');
    const isSubmitting = navigation.state === 'submitting' && navigation.formAction === '/logout';

    return (
        <Form method="post" action="/logout">
            <Button variant="outline" size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-1" />
                        {t('signingOut')}
                    </div>
                ) : (
                    t('signOut')
                )}
            </Button>
        </Form>
    );
}
