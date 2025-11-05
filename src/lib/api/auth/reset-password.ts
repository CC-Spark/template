import { type ActionFunctionArgs, type LoaderFunctionArgs, redirect, type RouterContextProvider } from 'react-router';
import { extractResponseError, getAppOrigin } from '@/lib/utils';
import { getConfig } from '@/config';
import uiStrings from '@/temp-ui-string';
import {
    resetMarketingCloudTokenCache,
    sendMarketingCloudEmail,
    validateSlasCallbackToken,
} from '@/lib/marketing-cloud';

// Re-export for backwards compatibility with tests
export { resetMarketingCloudTokenCache };

/**
 * Sends a magic link email for reset password
 */
async function sendResetPasswordEmail(
    context: Readonly<RouterContextProvider>,
    email_id: string,
    token: string
): Promise<object> {
    const base = getAppOrigin();

    const config = getConfig(context);
    const landingPath = config.site.features.resetPassword.landingUri;
    const magicLink = `${base}${landingPath}?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email_id)}`;

    const templateId = process.env.MARKETING_CLOUD_PASSWORDLESS_LOGIN_TEMPLATE;
    if (!templateId) {
        throw new Error('MARKETING_CLOUD_PASSWORDLESS_LOGIN_TEMPLATE is not set in the environment variables.');
    }
    return await sendMarketingCloudEmail(email_id, magicLink, templateId);
}

/**
 * Handles reset password callback action
 * Processes SLAS callback token and sends magic link email
 */
export async function handleResetPasswordCallback({ request, context }: ActionFunctionArgs) {
    try {
        const slasCallbackToken = request.headers.get('x-slas-callback-token');

        if (!slasCallbackToken) {
            return {
                success: false,
                error: uiStrings.errors.passwordless.missingCallbackToken,
            };
        }

        await validateSlasCallbackToken(context, slasCallbackToken);

        const body = await request.json();
        const { email_id, token } = body as { email_id: string; token: string };

        if (!email_id || !token) {
            return {
                success: false,
                error: uiStrings.errors.passwordless.missingRequiredFields,
            };
        }

        const result = await sendResetPasswordEmail(context, email_id, token);

        return {
            success: true,
            result,
        };
    } catch (error) {
        const { responseMessage } = await extractResponseError(error);
        // eslint-disable-next-line no-console
        console.error('[Reset Password Callback] Error:', responseMessage);

        return {
            success: false,
            error: responseMessage,
        };
    }
}

/**
 * Handles reset password landing page loader
 * Simply passes through to the reset-password route with query parameters
 * The reset-password route's loader will handle validation
 */
export function handleResetPasswordLanding({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);
    const token = url.searchParams.get('token') || '';
    const email = url.searchParams.get('email') || '';

    return redirect(`/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`);
}
