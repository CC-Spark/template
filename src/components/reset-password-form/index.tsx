'use client';

import { Form } from 'react-router';
import { Input } from '@/components/ui/input';
import { PasswordRequirement } from '@/components/password-requirements';
import { FormSubmitButton } from '@/components/buttons/form-submit-button';
import { usePasswordValidation } from '@/hooks/use-password-validation';
import uiStrings from '@/temp-ui-string';

interface ResetPasswordFormProps {
    error?: string;
    token: string;
    email: string;
}

export function ResetPasswordForm({ error, token, email }: ResetPasswordFormProps) {
    const {
        password,
        confirmPassword,
        showPasswordMismatch,
        handlePasswordChange,
        handleConfirmPasswordChange,
        isFormValid,
    } = usePasswordValidation();

    return (
        <Form method="POST">
            {error && (
                <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive">{error}</p>
                </div>
            )}

            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="email" value={email} />

            <div className="space-y-6">
                <div>
                    <label htmlFor="email-display" className="block text-sm font-medium text-foreground">
                        {uiStrings.resetPassword.emailLabel || uiStrings.signup.form.emailLabel}
                    </label>
                    <Input
                        id="email-display"
                        type="email"
                        value={email}
                        disabled
                        className="mt-1 bg-muted cursor-not-allowed"
                    />
                </div>

                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-foreground">
                        {uiStrings.resetPassword.newPasswordLabel || uiStrings.signup.form.passwordLabel}
                    </label>
                    <Input
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={password}
                        onChange={handlePasswordChange}
                        className="mt-1"
                        placeholder={
                            uiStrings.resetPassword.newPasswordPlaceholder || uiStrings.signup.form.passwordPlaceholder
                        }
                    />
                    <PasswordRequirement password={password} />
                </div>

                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground">
                        {uiStrings.resetPassword.confirmPasswordLabel || uiStrings.signup.form.confirmPasswordLabel}
                    </label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        className="mt-1"
                        aria-invalid={showPasswordMismatch && confirmPassword ? true : undefined}
                        placeholder={
                            uiStrings.resetPassword.confirmPasswordPlaceholder ||
                            uiStrings.signup.form.confirmPasswordPlaceholder
                        }
                    />
                    {showPasswordMismatch && confirmPassword && (
                        <p className="mt-1 text-sm text-destructive">{uiStrings.signup.passwordsDoNotMatch}</p>
                    )}
                </div>

                <div>
                    <FormSubmitButton
                        defaultText={uiStrings.resetPassword.resetPasswordButton || 'Reset Password'}
                        submittingText={uiStrings.resetPassword.resettingPassword || 'Resetting...'}
                        disabled={!isFormValid}
                    />
                </div>
            </div>
        </Form>
    );
}
