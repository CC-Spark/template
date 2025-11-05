import type { ReactElement } from 'react';
import { redirect, Link, useActionData, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ForgotPasswordForm } from '@/components/forgot-password-form';
import uiStrings from '@/temp-ui-string';

// services
import { getAuth, getPasswordResetToken } from '@/middlewares/auth.server';

type ForgotPasswordActionData = {
    error?: string;
    success?: boolean;
    email?: string;
};

// eslint-disable-next-line react-refresh/only-export-components,custom/no-universal-loaders
export function loader({ context }: LoaderFunctionArgs): Response | void {
    // If user is already logged in as registered user, redirect to login page
    const session = getAuth(context);
    if (session.userType === 'registered') {
        return redirect('/login');
    }
}

// Server action required for authentication - password reset token generation must be handled
// server-side to maintain security and proper integration with SFCC's authentication system
// eslint-disable-next-line react-refresh/only-export-components, custom/no-server-actions
export async function action({ request, context }: ActionFunctionArgs): Promise<ForgotPasswordActionData> {
    const formData = await request.formData();
    const email = formData.get('email')?.toString();
    if (!email) {
        return { error: uiStrings.resetPassword.emailRequired };
    }

    try {
        //Send password reset token using SLAS and Marketing Cloud
        await getPasswordResetToken(context, { email });
        return { success: true, email };
    } catch {
        // Generic error message for security - don't expose actual error to user
        return { error: uiStrings.errors.somethingWentWrong };
    }
}

export default function ForgotPassword(): ReactElement {
    const actionData = useActionData<ForgotPasswordActionData>();

    if (actionData?.success && actionData?.email) {
        return (
            <div className="flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div className="text-center">
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                            {uiStrings.resetPassword.checkEmailTitle}
                        </h2>
                        <p className="mt-2 text-center text-sm text-muted-foreground">
                            {uiStrings.resetPassword.checkEmailDescription.replace('{email}', actionData.email)}
                        </p>
                    </div>

                    <Card className="p-8">
                        <div className="space-y-6">
                            <Link to="/login">
                                <Button className="w-full cursor-pointer">
                                    {uiStrings.resetPassword.backToSignIn}
                                </Button>
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
                    <ForgotPasswordForm error={actionData?.error} />
                </Card>
            </div>
        </div>
    );
}
