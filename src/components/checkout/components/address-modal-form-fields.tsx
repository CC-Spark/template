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

'use client';

/**
 * Address fields for {@link AddressModal} only.
 *
 * Mirrors `@/components/address-form-fields` but uses a local FormControl that
 * does not set `aria-describedby` to a non-existent description id (stock
 * `FormControl` always references `formDescriptionId` even when no
 * `FormDescription` is rendered). Keeps accessibility fixes in checkout-owned
 * code without modifying `ui/form.tsx`.
 */

import { useMemo, useState, type ChangeEvent, type ComponentProps, type ReactNode } from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type FieldValues, type Path } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { FormField, FormItem, FormLabel, FormMessage, useFormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { COUNTRY_CODES } from '@/components/customer-address-form/constants';
import AddressSuggestionDropdown, { type AddressSuggestion } from '@/components/address-suggestion-dropdown';
import { MIN_INPUT_LENGTH, useAutocompleteSuggestions } from '@/hooks/use-autocomplete-suggestions';
import { processAddressSuggestion } from '@/lib/address-suggestions';
import { UITarget } from '@/targets/ui-target';
import type { AddressFormFieldsProps } from '@/components/address-form-fields';

function AddressModalFormControl({ ...props }: ComponentProps<typeof Slot>) {
    const { error, formItemId, formMessageId } = useFormField();

    return (
        <Slot
            data-slot="form-control"
            id={formItemId}
            aria-describedby={error ? formMessageId : undefined}
            aria-invalid={!!error}
            {...props}
        />
    );
}

export function AddressModalFormFields<TFormValues extends FieldValues>({
    form,
    fieldPrefix = '',
    showPhone = true,
    autoFocus = false,
    autoFocusField = 'address1',
    countryCode = 'US',
    className,
    labelsAsPlaceholders = false,
    showCountry = false,
}: AddressFormFieldsProps<TFormValues>) {
    const { t } = useTranslation('checkout');
    const { t: tCountries } = useTranslation('countries');

    const [addressInput, setAddressInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    const {
        suggestions: addressSuggestions,
        isLoading: isLoadingSuggestions,
        resetSession,
    } = useAutocompleteSuggestions({
        inputString: addressInput,
        countryCode,
    });

    const getFieldName = (baseName: string): Path<TFormValues> => {
        if (!fieldPrefix) {
            return baseName as Path<TFormValues>;
        }
        const capitalizedBaseName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
        return `${fieldPrefix}${capitalizedBaseName}` as Path<TFormValues>;
    };

    const getAutoComplete = (autoCompleteValue: string): string => {
        const section = fieldPrefix || 'shipping';
        return `${section} ${autoCompleteValue}`;
    };

    const watchedCountry = showCountry ? form.watch(getFieldName('countryCode')) : undefined;
    const effectiveCountry = showCountry ? watchedCountry || countryCode || 'US' : countryCode || 'US';
    const useProvinceLabel = effectiveCountry === 'CA';
    const useZipLabel = effectiveCountry === 'US';

    const statesObj = useMemo(() => {
        return effectiveCountry && (effectiveCountry === 'US' || effectiveCountry === 'CA')
            ? (tCountries(`${effectiveCountry}.states`, { returnObjects: true }) as Record<string, string>)
            : null;
    }, [effectiveCountry, tCountries]);

    const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
        setShowSuggestions(false);

        const addressFields = await processAddressSuggestion(suggestion);

        form.setValue(getFieldName('address1'), addressFields.address1 as TFormValues[Path<TFormValues>]);
        if (addressFields.city) {
            form.setValue(getFieldName('city'), addressFields.city as TFormValues[Path<TFormValues>]);
        }
        if (addressFields.stateCode) {
            form.setValue(getFieldName('stateCode'), addressFields.stateCode as TFormValues[Path<TFormValues>]);
        }
        if (addressFields.postalCode) {
            form.setValue(getFieldName('postalCode'), addressFields.postalCode as TFormValues[Path<TFormValues>]);
        }

        resetSession();
        setAddressInput('');
    };

    const handleCloseSuggestions = () => {
        setShowSuggestions(false);
    };

    const handleAddressInputChange = (e: ChangeEvent<HTMLInputElement>, fieldOnChange: (value: string) => void) => {
        const value = e.target.value;
        fieldOnChange(value);
        setAddressInput(value);
        if (value.length >= MIN_INPUT_LENGTH) {
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const renderAddressAutocomplete = (): ReactNode => {
        if (!showSuggestions || addressSuggestions.length === 0) {
            return null;
        }

        const dropdown = (
            <AddressSuggestionDropdown
                suggestions={addressSuggestions}
                isVisible={showSuggestions}
                isLoading={isLoadingSuggestions}
                onClose={handleCloseSuggestions}
                onSelectSuggestion={(suggestion) => void handleSelectSuggestion(suggestion)}
            />
        );

        if (fieldPrefix === 'billing') {
            return (
                <div>
                    <UITarget targetId="checkout.payment.billingAddress.autocomplete">{dropdown}</UITarget>
                </div>
            );
        }

        return (
            <div>
                <UITarget targetId="checkout.shippingAddress.autocomplete">{dropdown}</UITarget>
            </div>
        );
    };

    return (
        <div className={className}>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField
                    control={form.control}
                    name={getFieldName('firstName')}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                className={labelsAsPlaceholders ? 'sr-only' : 'text-base font-medium text-foreground'}>
                                {t('addressForm.firstNameLabel')}
                            </FormLabel>
                            <AddressModalFormControl>
                                <Input
                                    placeholder={
                                        labelsAsPlaceholders
                                            ? `${t('addressForm.firstNameLabel')}*`
                                            : t('addressForm.firstNamePlaceholder')
                                    }
                                    autoComplete={getAutoComplete('given-name')}
                                    autoFocus={autoFocus && autoFocusField === 'firstName'}
                                    className="h-12 text-base border-2 focus:border-primary transition-colors"
                                    {...field}
                                />
                            </AddressModalFormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={getFieldName('lastName')}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                className={labelsAsPlaceholders ? 'sr-only' : 'text-base font-medium text-foreground'}>
                                {t('addressForm.lastNameLabel')}
                            </FormLabel>
                            <AddressModalFormControl>
                                <Input
                                    placeholder={
                                        labelsAsPlaceholders
                                            ? `${t('addressForm.lastNameLabel')}*`
                                            : t('addressForm.lastNamePlaceholder')
                                    }
                                    autoComplete={getAutoComplete('family-name')}
                                    className="h-12 text-base border-2 focus:border-primary transition-colors"
                                    {...field}
                                />
                            </AddressModalFormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {showCountry && (
                <div className="mb-4">
                    <FormField
                        control={form.control}
                        name={getFieldName('countryCode')}
                        render={({ field, fieldState }) => (
                            <FormItem className="w-full [&_[data-slot=native-select-wrapper]]:w-full">
                                <FormLabel
                                    className={
                                        labelsAsPlaceholders ? 'sr-only' : 'text-base font-medium text-foreground'
                                    }>
                                    {t('addressForm.countryLabel')}
                                </FormLabel>
                                <AddressModalFormControl>
                                    <NativeSelect
                                        className="h-12 text-sm text-foreground font-normal py-1 leading-normal border-2 focus:border-primary transition-colors w-full [font-family:inherit]"
                                        autoComplete={getAutoComplete('country')}
                                        aria-invalid={!!fieldState?.error}
                                        {...field}
                                        value={field.value || 'US'}
                                        onChange={(e) => field.onChange(e.target.value || 'US')}
                                        aria-label={t('addressForm.countryLabel') || 'Country'}>
                                        {COUNTRY_CODES.map((code) => (
                                            <NativeSelectOption key={code} value={code}>
                                                {tCountries(`${code}.name`)}
                                            </NativeSelectOption>
                                        ))}
                                    </NativeSelect>
                                </AddressModalFormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
            )}

            <div className="mb-4">
                <FormField
                    control={form.control}
                    name={getFieldName('address1')}
                    render={({ field }) => (
                        <FormItem className="relative">
                            <FormLabel
                                className={labelsAsPlaceholders ? 'sr-only' : 'text-base font-medium text-foreground'}>
                                {t('addressForm.addressLabel')}
                            </FormLabel>
                            <AddressModalFormControl>
                                <Input
                                    placeholder={
                                        labelsAsPlaceholders
                                            ? `${t('addressForm.addressLabel')}*`
                                            : t('addressForm.addressPlaceholder')
                                    }
                                    autoComplete="off"
                                    autoFocus={autoFocus && autoFocusField === 'address1'}
                                    className="h-12 text-base border-2 focus:border-primary transition-colors"
                                    {...field}
                                    onChange={(e) => handleAddressInputChange(e, field.onChange)}
                                />
                            </AddressModalFormControl>
                            {renderAddressAutocomplete()}
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="mb-4">
                <FormField
                    control={form.control}
                    name={getFieldName('address2')}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                className={labelsAsPlaceholders ? 'sr-only' : 'text-base font-medium text-foreground'}>
                                {t('addressForm.address2Label')}
                            </FormLabel>
                            <AddressModalFormControl>
                                <Input
                                    placeholder={t('addressForm.address2Placeholder')}
                                    autoComplete={getAutoComplete('address-line2')}
                                    className="h-12 text-base border-2 focus:border-primary transition-colors"
                                    {...field}
                                />
                            </AddressModalFormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
                <FormField
                    control={form.control}
                    name={getFieldName('postalCode')}
                    render={({ field }) => {
                        const postalLabel = useZipLabel ? t('addressForm.zipLabel') : t('addressForm.postalCodeLabel');
                        const postalPlaceholder = useZipLabel
                            ? t('addressForm.zipPlaceholder')
                            : t('addressForm.postalCodePlaceholder');
                        return (
                            <FormItem>
                                <FormLabel
                                    className={
                                        labelsAsPlaceholders ? 'sr-only' : 'text-base font-medium text-foreground'
                                    }>
                                    {postalLabel}
                                </FormLabel>
                                <AddressModalFormControl>
                                    <Input
                                        placeholder={labelsAsPlaceholders ? `${postalLabel}*` : postalPlaceholder}
                                        autoComplete={getAutoComplete('postal-code')}
                                        className="h-12 text-base border-2 focus:border-primary transition-colors"
                                        {...field}
                                    />
                                </AddressModalFormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />

                <FormField
                    control={form.control}
                    name={getFieldName('city')}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel
                                className={labelsAsPlaceholders ? 'sr-only' : 'text-base font-medium text-foreground'}>
                                {t('addressForm.cityLabel')}
                            </FormLabel>
                            <AddressModalFormControl>
                                <Input
                                    placeholder={
                                        labelsAsPlaceholders
                                            ? `${t('addressForm.cityLabel')}*`
                                            : t('addressForm.cityPlaceholder')
                                    }
                                    autoComplete={getAutoComplete('address-level2')}
                                    className="h-12 text-base border-2 focus:border-primary transition-colors"
                                    {...field}
                                />
                            </AddressModalFormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name={getFieldName('stateCode')}
                    render={({ field }) => {
                        const stateOptions = statesObj ? Object.entries(statesObj) : [];
                        const stateLabel = useProvinceLabel
                            ? t('addressForm.provinceLabel')
                            : t('addressForm.stateLabel');
                        const statePlaceholder = useProvinceLabel
                            ? t('addressForm.provincePlaceholder')
                            : t('addressForm.statePlaceholder');

                        return (
                            <FormItem className="w-full [&_[data-slot=native-select-wrapper]]:w-full">
                                <FormLabel
                                    className={
                                        labelsAsPlaceholders ? 'sr-only' : 'text-base font-medium text-foreground'
                                    }>
                                    {stateLabel}
                                </FormLabel>
                                <AddressModalFormControl>
                                    {stateOptions.length > 0 ? (
                                        <NativeSelect
                                            className="h-12 text-sm text-foreground font-normal py-1 leading-normal border-2 focus:border-primary transition-colors w-full [font-family:inherit]"
                                            autoComplete={getAutoComplete('address-level1')}
                                            {...field}
                                            value={field.value || ''}
                                            onChange={(e) => field.onChange(e.target.value)}
                                            aria-label={stateLabel || 'State or province'}>
                                            <NativeSelectOption value="">
                                                {labelsAsPlaceholders ? `${stateLabel}*` : statePlaceholder}
                                            </NativeSelectOption>
                                            {stateOptions.map(([code, name]) => (
                                                <NativeSelectOption key={code} value={code}>
                                                    {name}
                                                </NativeSelectOption>
                                            ))}
                                        </NativeSelect>
                                    ) : (
                                        <Input
                                            placeholder={labelsAsPlaceholders ? `${stateLabel}*` : statePlaceholder}
                                            autoComplete={getAutoComplete('address-level1')}
                                            className="h-12 text-base border-2 focus:border-primary transition-colors"
                                            {...field}
                                        />
                                    )}
                                </AddressModalFormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
            </div>

            {showPhone && (
                <FormField
                    control={form.control}
                    name={getFieldName('phone')}
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-base font-medium text-foreground">
                                {t('addressForm.phoneLabel')}
                            </FormLabel>
                            <AddressModalFormControl>
                                <Input
                                    type="tel"
                                    placeholder={t('addressForm.phonePlaceholder')}
                                    autoComplete="tel"
                                    className="h-12 text-base border-2 focus:border-primary transition-colors"
                                    {...field}
                                />
                            </AddressModalFormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            )}
        </div>
    );
}
