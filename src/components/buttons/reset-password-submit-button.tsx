'use client';

import { useNavigation } from 'react-router';
import { Button } from '@/components/ui/button';
import uiStrings from '@/temp-ui-string';

export function ResetPasswordSubmitButton() {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === 'submitting';

    return (
        <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    {uiStrings.resetPassword.sendingEmail}
                </div>
            ) : (
                uiStrings.resetPassword.resetButton
            )}
        </Button>
    );
}
