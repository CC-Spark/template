import type { ReactElement } from 'react';
import { redirect, Form, Link, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResetPasswordSubmitButton } from '@/components/buttons/reset-password-submit-button';
import uiStrings from '@/temp-ui-string';

// services
import { getPasswordResetToken } from '@/lib/api/auth/reset-password';
import { flashAuth, getAuth } from '@/middlewares/auth.server';

type ResetPasswordLoaderData = {
    error?: string;
    success?: boolean;
    email?: string;
};

// eslint-disable-next-line react-refresh/only-export-components,custom/no-universal-loaders
export function loader({ request, context }: LoaderFunctionArgs) {
    // If user is already logged in as registered user, redirect to login page
    const session = getAuth(context);
    if (session.userType === 'registered') {
        return redirect('/login');
    }

    const url = new URL(request.url);
    const success = url.searchParams.get('success') === 'true';
    const email = url.searchParams.get('email');

    return {
        error: session.error,
        success,
        email,
    };
}

// Server action required for authentication - password reset token generation must be handled
// server-side to maintain security and proper integration with SFCC's authentication system
// eslint-disable-next-line react-refresh/only-export-components, custom/no-server-actions
export async function action({ request, context }: ActionFunctionArgs) {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();

    if (!email) {
        flashAuth(context, uiStrings.resetPassword.emailRequired);
        return redirect('/reset-password');
    }

    // Get password reset token using SLAS
    const result = await getPasswordResetToken(context, { email });

    if (result.success) {
        // Password reset email sent successfully
        return redirect(`/reset-password?success=true&email=${encodeURIComponent(email)}`);
    }

    // Password reset failed - redirect back with error
    return redirect('/reset-password');
}

export default function ResetPassword({ loaderData }: { loaderData: ResetPasswordLoaderData }): ReactElement {
    const { error, success, email } = loaderData;

    if (success && email) {
        // Success state
        return (
            <div className="flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                            {uiStrings.resetPassword.checkEmailTitle}
                        </h2>
                        <p className="mt-2 text-center text-sm text-muted-foreground">
                            {uiStrings.resetPassword.checkEmailDescription.replace('{email}', email)}
                        </p>
                    </div>

                    <Card className="p-8">
                        <div className="space-y-6">
                            <Link to="/login">
                                <Button className="w-full">{uiStrings.resetPassword.backToSignIn}</Button>
                            </Link>
                        </div>
                    </Card>
                </div>
            </div>
        );
    }

    // Initial form state
    return (
        <div className="flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        {uiStrings.resetPassword.title}
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">{uiStrings.resetPassword.subtitle}</p>
                </div>

                <Card className="p-8">
                    <Form method="post" className="space-y-6">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-foreground">
                                {uiStrings.resetPassword.emailLabel}
                            </label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                className="mt-1"
                                placeholder={uiStrings.resetPassword.emailPlaceholder}
                            />
                        </div>

                        <ResetPasswordSubmitButton />

                        <div className="text-center">
                            <span className="text-sm text-muted-foreground">{uiStrings.resetPassword.or}</span>
                            <Link to="/login" className="text-sm text-primary hover:text-primary/80">
                                {uiStrings.resetPassword.goBackToLogin}
                            </Link>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
