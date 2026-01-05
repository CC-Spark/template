import type { ClientActionFunctionArgs } from 'react-router';
import { extractQualifiersFromInput, safeParseCookie, updateShopperContext } from '@/lib/shopper-context-utils';
import { getAuth } from '@/middlewares/auth.client';
import { getTranslation } from '@/lib/i18next';
import { extractStatusCode } from '@/lib/utils';

type UpdateShopperContextResponse = {
    success: boolean;
    message?: string;
    error?: string;
};

/**
 * Client action to update all qualifiers in shopper context
 * Supports customQualifiers, assignmentQualifiers, couponCodes, sourceCode, and other root-level qualifiers
 */
// eslint-disable-next-line custom/no-client-actions -- Client action required to support updating shopper context from client components
export async function clientAction({ request, context }: ClientActionFunctionArgs): Promise<Response> {
    const { t } = getTranslation();

    const session = getAuth(context);
    if (!session.usid) {
        return Response.json(
            {
                success: false,
                error: t('Usid is not available for updating shopper context.'),
            },
            { status: 401 }
        );
    }

    if (request.method !== 'PUT') {
        throw new Response(t(`This method isn't allowed to update shopper context.`), { status: 405 });
    }

    try {
        const formData = await request.formData();
        const qualifiersJson = formData.get('qualifiers');

        // Parse new qualifiers
        const allNewQualifiers =
            qualifiersJson && typeof qualifiersJson === 'string' ? safeParseCookie(qualifiersJson) : {};

        const { qualifiers: newShopperContext, sourceCodeQualifiers: newSourceCodeContext } =
            extractQualifiersFromInput(allNewQualifiers);
        // Validate that at least one qualifier is provided
        if (Object.keys(newShopperContext).length === 0 && Object.keys(newSourceCodeContext).length === 0) {
            return Response.json(
                {
                    success: false,
                    error: t('At least one qualifier must be provided to update shopper context.'),
                },
                { status: 400 }
            );
        }

        // Use shared function to update shopper context
        await updateShopperContext({
            context,
            usid: session.usid,
            newShopperContext,
            newSourceCodeContext,
        });

        return Response.json({
            success: true,
            message: t('Shopper context has been updated.'),
        } satisfies UpdateShopperContextResponse);
    } catch (error) {
        const statusCode = extractStatusCode(error) ? Number(extractStatusCode(error)) : 500;
        const errorMessage = error instanceof Error ? error.message : t('Shopper context failed to update');
        return Response.json(
            {
                success: false,
                error: errorMessage,
            } satisfies UpdateShopperContextResponse,
            { status: statusCode }
        );
    }
}
