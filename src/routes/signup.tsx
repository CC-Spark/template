import type { ReactElement } from 'react';
import { redirect, Link, Form, type LoaderFunctionArgs, type ActionFunctionArgs } from 'react-router';
import { Card } from '@/components/ui/card';
import uiStrings from '@/temp-ui-string';

// services
import { registerCustomer } from '@/lib/api/auth/register';

// components
import { SignupForm } from '@/components/signup/password-requirements';

// utils
import { isPasswordValid } from '@/lib/util';
import { flashAuth, getAuth } from '@/middlewares/auth.server';

type SignupLoaderData = {
    error?: string;
};

// eslint-disable-next-line react-refresh/only-export-components,custom/no-universal-loaders
export function loader({ context }: LoaderFunctionArgs) {
    const session = getAuth(context);
    if (session.userType === 'registered') {
        return redirect('/');
    }
    return {
        error: session.error,
    };
}

// Server action required for authentication - user registration must be handled server-side
// for security and to properly integrate with SFCC's authentication system
// eslint-disable-next-line react-refresh/only-export-components, custom/no-server-actions
export async function action({ request, context }: ActionFunctionArgs) {
    const formData = await request.formData();
    const firstName = formData.get('firstName')?.toString();
    const lastName = formData.get('lastName')?.toString();
    const email = formData.get('email')?.toString();
    const password = formData.get('password')?.toString();
    const confirmPassword = formData.get('confirmPassword')?.toString();

    // Validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
        flashAuth(context, uiStrings.signup.allFieldsRequired);
        return redirect('/signup');
    }

    if (password !== confirmPassword) {
        flashAuth(context, uiStrings.signup.passwordsDoNotMatch);
        return redirect('/signup');
    }

    if (!isPasswordValid(password)) {
        flashAuth(context, uiStrings.signup.passwordNotSecure);
        return redirect('/signup');
    }

    // Register the customer
    const result = await registerCustomer(context, {
        customer: {
            firstName,
            lastName,
            login: email,
            email,
        },
        password,
    });

    if (result.success) {
        // Registration and auto-login successful - redirect to home
        return redirect('/');
    }

    // Registration failed - redirect back to signup with error
    return redirect('/signup');
}

export default function Signup({ loaderData }: { loaderData: SignupLoaderData }): ReactElement {
    const { error } = loaderData;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        {uiStrings.signup.title}
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">{uiStrings.signup.subtitle}</p>
                </div>

                <Card className="p-8">
                    <Form method="POST">
                        <SignupForm error={error} />

                        <div className="text-center mt-6">
                            <p className="text-sm text-muted-foreground">
                                {uiStrings.signup.haveAccountQuestion}
                                <Link to="/login" className="font-medium text-primary hover:underline">
                                    {uiStrings.signup.signIn}
                                </Link>
                            </p>
                        </div>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
