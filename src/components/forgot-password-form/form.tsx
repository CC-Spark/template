'use client';

import { Form, Link } from 'react-router';
import { Input } from '@/components/ui/input';
import { FormSubmitButton } from '@/components/buttons/form-submit-button';
import uiStrings from '@/temp-ui-string';
import { type ForgotPasswordFormProps } from './types';

export function ForgotPasswordForm({ error }: ForgotPasswordFormProps) {
    return (
        <Form method="post" className="space-y-6">
            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
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

            <FormSubmitButton
                defaultText={uiStrings.resetPassword.resetButton}
                submittingText={uiStrings.resetPassword.sendingEmail}
            />

            <div className="text-center">
                <span className="text-sm text-muted-foreground">{uiStrings.resetPassword.or}</span>
                <Link to="/login" className="text-sm text-primary hover:text-primary/80">
                    {uiStrings.resetPassword.goBackToLogin}
                </Link>
            </div>
        </Form>
    );
}
