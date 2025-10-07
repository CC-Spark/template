'use client';

import { useNavigation } from 'react-router';
import { Button } from '@/components/ui/button';
import uiStrings from '@/temp-ui-string';

interface LoginSubmitButtonProps {
    passwordless?: boolean;
}

export function LoginSubmitButton({ passwordless = false }: LoginSubmitButtonProps) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    return (
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    {passwordless ? uiStrings.login.sendingLoginLink : uiStrings.login.signingIn}
                </div>
            ) : passwordless ? (
                uiStrings.login.sendLoginLink
            ) : (
                uiStrings.login.signIn
            )}
        </Button>
    );
}
