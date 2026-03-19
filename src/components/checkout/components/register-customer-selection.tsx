/**
 * Copyright 2026 Salesforce, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useFetcher } from 'react-router';
import { useTranslation } from 'react-i18next';
const OtpModal = lazy(() => import('@/components/login/otp-modal'));
import { useBasket } from '@/providers/basket';
import { useConfig } from '@salesforce/storefront-next-runtime/config';
import type { ShopperLogin } from '@salesforce/storefront-next-runtime/scapi';

interface RegisterCustomerSelectionProps {
    /** Callback when checkbox state changes - receives boolean value */
    onSaved?: (shouldCreateAccount: boolean) => void;
    /** Callback when OTP verification succeeds */
    onRegistrationSuccess?: () => void;
    /** Whether the user opted to save their payment method */
    savePaymentToProfile?: boolean;
    /** Optional toast callback to avoid bundling sonner in this lazy chunk */
    showToast?: (message: string, type: 'success' | 'error', options?: { duration?: number }) => void;
}

type InitiateRegistrationResponse = {
    success: boolean;
    error?: string;
    email?: string;
};

export default function RegisterCustomerSelection({
    onSaved,
    onRegistrationSuccess,
    savePaymentToProfile: _savePaymentToProfile = false,
    showToast,
}: RegisterCustomerSelectionProps) {
    const [shouldCreateAccount, setShouldCreateAccount] = useState(false);
    const [accountCreated, setAccountCreated] = useState(false);
    const [isOtpModalOpen, setIsOtpModalOpen] = useState(false);
    const [registrationEmail, setRegistrationEmail] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const { t: _t } = useTranslation('checkout');
    const t = _t as (key: string, options?: object) => string;
    const basket = useBasket();
    const config = useConfig();
    const registrationFetcher = useFetcher<InitiateRegistrationResponse>({ key: 'checkout-registration' });
    const lastProcessedDataRef = useRef<InitiateRegistrationResponse | null>(null);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setShouldCreateAccount(checked);
        setError(null);

        if (checked) {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.setItem('registeredViaCheckout', 'true');
            }

            const email = basket?.customerInfo?.email;
            if (!email) {
                const errorMsg = t('registration.emailNotFound');
                setError(errorMsg);
                showToast?.(errorMsg, 'error');
                setShouldCreateAccount(false);
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.removeItem('registeredViaCheckout');
                }
                return;
            }

            setRegistrationEmail(email);

            const formData = new FormData();
            formData.append('email', email);

            void registrationFetcher.submit(formData, {
                method: 'POST',
                action: '/action/initiate-checkout-registration',
            });
        } else {
            if (typeof sessionStorage !== 'undefined') {
                sessionStorage.removeItem('registeredViaCheckout');
            }
            onSaved?.(false);
        }
    };

    useEffect(() => {
        const { state, data } = registrationFetcher;

        if (state === 'idle' && data && data !== lastProcessedDataRef.current) {
            lastProcessedDataRef.current = data;

            if (data.success) {
                setIsOtpModalOpen(true);
            } else {
                const errorMsg = data.error || t('registration.initiationFailed');
                setError(errorMsg);
                showToast?.(errorMsg, 'error');
                setShouldCreateAccount(false);
                if (typeof sessionStorage !== 'undefined') {
                    sessionStorage.removeItem('registeredViaCheckout');
                }
            }
        }
    }, [registrationFetcher, registrationFetcher.state, registrationFetcher.data, t, showToast]);

    const handleOtpSuccess = (tokenResponse?: ShopperLogin.schemas['TokenResponse']) => {
        setIsOtpModalOpen(false);
        setAccountCreated(true);
        onSaved?.(true);

        if (typeof sessionStorage !== 'undefined' && tokenResponse) {
            sessionStorage.setItem('checkoutRegistrationTokens', JSON.stringify(tokenResponse));
        }

        showToast?.(t('registration.accountCreatedSuccess'), 'success', { duration: 8000 });
        onRegistrationSuccess?.();
    };

    const handleOtpModalClose = () => {
        setIsOtpModalOpen(false);
        setShouldCreateAccount(false);
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('registeredViaCheckout');
        }
        onSaved?.(false);
    };

    const handleResendCode = async () => {
        const formData = new FormData();
        formData.append('email', registrationEmail);

        return new Promise<void>((resolve, _reject) => {
            void registrationFetcher.submit(formData, {
                method: 'POST',
                action: '/action/initiate-checkout-registration',
            });

            setTimeout(() => resolve(), 1000);
        });
    };

    const handleCheckoutAsGuest = () => {
        setShouldCreateAccount(false);
        setIsOtpModalOpen(false);
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.removeItem('registeredViaCheckout');
        }
        onSaved?.(false);
    };

    if (accountCreated) {
        return (
            <section className="rounded-lg border bg-card p-6" aria-label={t('registration.accountCreatedTitle')}>
                <div className="space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h6 className="text-base font-semibold">{t('registration.accountCreatedTitle')}</h6>
                        <div className="inline-flex items-center gap-2 border border-primary rounded-sm px-2 py-1">
                            <svg
                                className="w-4 h-4 text-primary"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                data-testid="check-icon">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                            <span className="text-sm font-medium text-primary">{t('registration.verified')}</span>
                        </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {t('registration.accountCreatedDescription')}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <div data-testid="register-customer-checkbox">
            <div className="space-y-3">
                <div className="flex items-start space-x-3">
                    <input
                        type="checkbox"
                        id="create-account-checkbox"
                        data-testid="create-account-checkbox"
                        checked={shouldCreateAccount}
                        onChange={handleCheckboxChange}
                        className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                        aria-label={t('payment.createAccountForFasterCheckout')}
                        disabled={registrationFetcher.state === 'submitting'}
                    />
                    <div className="space-y-1 flex-1">
                        <label
                            htmlFor="create-account-checkbox"
                            className="text-sm font-medium leading-none cursor-pointer">
                            {t('payment.createAccountForFasterCheckout')}
                        </label>
                        {registrationFetcher.state === 'submitting' && (
                            <p className="text-sm text-muted-foreground">{t('registration.sendingVerificationCode')}</p>
                        )}
                        {error && <p className="text-sm text-destructive">{error}</p>}
                    </div>
                </div>
                {shouldCreateAccount && !error && registrationFetcher.state !== 'submitting' && (
                    <p className="text-sm text-muted-foreground pl-8">
                        {t('registration.checkboxExpandedDescription')}
                    </p>
                )}
            </div>

            {isOtpModalOpen && (
                <Suspense fallback={null}>
                    <OtpModal
                        isOpen={isOtpModalOpen}
                        onClose={handleOtpModalClose}
                        email={registrationEmail}
                        onSuccess={handleOtpSuccess}
                        onCheckoutAsGuest={handleCheckoutAsGuest}
                        onResendCode={handleResendCode}
                        otpLength={(config.auth as { otpLength: number })?.otpLength ?? 6}
                    />
                </Suspense>
            )}
        </div>
    );
}
