import type { ReactElement } from 'react';
import { data, redirect, type LoaderFunctionArgs } from 'react-router';
import { flashAuth } from '@/middlewares/auth.server';
import { loginIDPUser } from '@/lib/api/auth/social-login';
import { Spinner } from '@/components/spinner';
import uiStrings from '@/temp-ui-string';

type CallbackLoaderData = {
    error?: string;
    processing?: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components, custom/no-async-page-loader,custom/no-universal-loaders
export async function loader({ request, context }: LoaderFunctionArgs) {
    const url = new URL(request.url);

    // SLAS may send different parameter names than direct OAuth
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    const usid = url.searchParams.get('usid');

    // Handle error from social provider
    if (error) {
        flashAuth(context, uiStrings.socialCallback.socialError);
        return redirect('/login');
    }

    // Handle successful authorization with code
    if (code) {
        const result = await loginIDPUser(context, {
            code,
            usid: usid || undefined,
            redirectURI: `${url.origin}/social-callback`,
        });

        if (result.success) {
            // Login successful - redirect to home
            return redirect('/');
        }

        // Login failed - redirect back to login with error
        return redirect('/login');
    }

    // No code or error - show processing state
    // This handles the initial redirect from social provider before parameters are processed
    return data(
        {
            processing: true,
        },
        {
            headers: {
                Refresh: '3; url=/login', // Auto-redirect after 3 seconds if stuck
            },
        }
    );
}

export default function SocialCallback({ loaderData }: { loaderData: CallbackLoaderData }): ReactElement {
    const { processing } = loaderData;

    return (
        <div className="min-h-screen flex items-center justify-center bg-background py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="flex justify-center mb-4">
                        <Spinner size="xl" />
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
                        {uiStrings.socialCallback.authenticatingTitle}
                    </h2>
                    <p className="mt-2 text-center text-sm text-muted-foreground">
                        {uiStrings.socialCallback.authenticatingDescription}
                    </p>
                    {processing && (
                        <p className="mt-4 text-center text-xs text-muted-foreground">
                            {uiStrings.socialCallback.notRedirectedPromptPrefix}
                            <a href="/login" className="text-primary hover:text-primary/80 underline">
                                {uiStrings.socialCallback.clickHere}
                            </a>
                            {uiStrings.socialCallback.notRedirectedPromptSuffix}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
