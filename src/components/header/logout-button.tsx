'use client';

import { Form, useNavigation } from 'react-router';
import { Button } from '@/components/ui/button';
import uiStrings from '@/temp-ui-string';

export default function LogoutButton() {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting' && navigation.formAction === '/logout';

    return (
        <Form method="post" action="/logout">
            <Button variant="outline" size="sm" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                    <div className="flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-2 border-current border-t-transparent mr-1" />
                        {uiStrings.header.signingOut}
                    </div>
                ) : (
                    uiStrings.header.signOut
                )}
            </Button>
        </Form>
    );
}
