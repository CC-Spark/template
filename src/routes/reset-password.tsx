import type { ReactElement } from 'react';
import { redirect, useActionData, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { Card } from '@/components/ui/card';
import { ResetPasswordForm } from '@/components/reset-password-form';
import uiStrings from '@/temp-ui-string';
import { resetPasswordWithToken } from '@/middlewares/auth.server';
import { isPasswordValid } from '@/lib/utils';

type ResetPasswordLoaderData = {
    token: string;
    email: string;
};

type ResetPasswordActionData = {
    error?: string;
};

// eslint-disable-next-line react-refresh/only-export-components,custom/no-universal-loaders
export function loader({ request }: LoaderFunctionArgs): ResetPasswordLoaderData | Response {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    if (!token || !email) {
        return redirect('/forgot-password');
    }

    return {
        token,
        email,
    };
}

// Server action required for authentication - password reset must be handled
// server-side to maintain security and proper integration with SFCC's authentication system
// eslint-disable-next-line react-refresh/only-export-components, custom/no-server-actions
export async function action({ request, context }: ActionFunctionArgs): Promise<ResetPasswordActionData | Response> {
    const formData = await request.formData();
    const token = formData.get('token')?.toString();
    const email = formData.get('email')?.toString();
    const newPassword = formData.get('newPassword')?.toString();
    const confirmPassword = formData.get('confirmPassword')?.toString();

    // Separate validation for token - critical security field
    if (!token) {
        return redirect('/forgot-password');
    }

    if (!email || !newPassword || !confirmPassword) {
        return { error: uiStrings.signup.allFieldsRequired };
    }

    if (newPassword !== confirmPassword) {
        return { error: uiStrings.resetPassword.passwordsMustMatch };
    }

    if (!isPasswordValid(newPassword)) {
        return { error: uiStrings.signup.passwordNotSecure };
    }

    try {
        // Reset the password
        await resetPasswordWithToken(context, {
            email,
            token,
            newPassword,
        });

        // Password reset successful - redirect to login
        return redirect('/login');
    } catch {
        // Show generic error message to avoid exposing token validation errors (security)
        // This matches PWA Kit behavior
        return { error: uiStrings.errors.somethingWentWrong };
    }
}

export default function ResetPassword({ loaderData }: { loaderData: ResetPasswordLoaderData }): ReactElement {
    const { token, email } = loaderData;
    const actionData = useActionData<ResetPasswordActionData>();

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        {uiStrings.resetPassword.title}
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        {uiStrings.resetPassword.subtitle || 'Enter your new password below'}
                    </p>
                </div>

                <Card className="p-8">
                    <ResetPasswordForm error={actionData?.error} token={token} email={email} />
                </Card>
            </div>
        </div>
    );
}
