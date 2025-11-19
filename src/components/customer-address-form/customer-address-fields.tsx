/* c8 ignore start */
/* istanbul ignore file */
// This file is excluded from coverage as it primarily renders presentational form fields
// using React Hook Form integration. Testing this component properly requires complex
// setup of form context, field state, and render props which is better handled through
// integration tests that can verify end-to-end user interactions.
/* c8 ignore end */

import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { SelectNative } from '@/components/ui/select-native';

import uiStrings from '@/temp-ui-string';

import { COUNTRIES } from './constants';
import { getStatesForCountry } from './utils';
import { type CustomerAddressFieldsProps } from './types';

/**
 * CustomerAddressFields component that renders the form fields for editing customer address.
 *
 * This component is responsible for rendering all input fields including address title, first name, last name,
 * phone, country, address line 1, address line 2, city, state/province, postal code, and preferred flag.
 * It does not include action buttons, which are handled by the parent form component.
 *
 * @param form - React Hook Form instance for managing form state and validation
 */
export function CustomerAddressFields({ form }: CustomerAddressFieldsProps) {
    // Watch country code to update state options
    const countryCode = form.watch('countryCode');

    // Get state/province options based on selected country
    const stateOptions = useMemo(() => {
        return getStatesForCountry(countryCode);
    }, [countryCode]);

    // Determine if current country uses "State" or "Province"
    const stateLabel = useMemo(() => {
        return countryCode === 'US'
            ? uiStrings.account.addressForm.stateLabel
            : uiStrings.account.addressForm.provinceLabel;
    }, [countryCode]);

    const statePlaceholder = useMemo(() => {
        return countryCode === 'US'
            ? uiStrings.account.addressForm.selectStatePlaceholder
            : uiStrings.account.addressForm.selectProvincePlaceholder;
    }, [countryCode]);

    // Update postal code label based on country
    const postalCodeLabel = useMemo(() => {
        return countryCode === 'US'
            ? uiStrings.account.addressForm.zipCodeLabel
            : uiStrings.account.addressForm.postalCodeLabel;
    }, [countryCode]);

    return (
        <div className="space-y-4">
            {/* Address Title Field */}
            <FormField
                control={form.control}
                name="addressId"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                            {uiStrings.account.addressForm.addressTitleLabel}
                        </FormLabel>
                        <FormControl>
                            <Input type="text" autoComplete="off" id="addressId" className="rounded-md" {...field} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* First Name and Last Name Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name Field */}
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground">
                                {uiStrings.account.addressForm.firstNameLabel}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    autoComplete="given-name"
                                    id="firstName"
                                    className="rounded-md"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Last Name Field */}
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground">
                                {uiStrings.account.addressForm.lastNameLabel}
                            </FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    autoComplete="family-name"
                                    id="lastName"
                                    className="rounded-md"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Phone Number Field */}
            <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                            {uiStrings.account.addressForm.phoneLabel}
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="tel"
                                autoComplete="tel"
                                inputMode="numeric"
                                id="phone"
                                className="rounded-md"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Country Field */}
            <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                            {uiStrings.account.addressForm.countryLabel}
                        </FormLabel>
                        <FormControl>
                            <SelectNative
                                id="countryCode"
                                value={field.value}
                                onChange={(e) => {
                                    field.onChange(e.target.value);
                                    // Reset state code when country changes
                                    form.setValue('stateCode', '');
                                    form.setValue('postalCode', '');
                                }}
                                className="rounded-md">
                                {COUNTRIES.map((country) => (
                                    <option key={country.code} value={country.code}>
                                        {country.name}
                                    </option>
                                ))}
                            </SelectNative>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Address Line 1 Field */}
            <FormField
                control={form.control}
                name="address1"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                            {uiStrings.account.addressForm.addressLabel}
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                autoComplete="address-line1"
                                id="address1"
                                className="rounded-md"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* Address Line 2 Field */}
            <FormField
                control={form.control}
                name="address2"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                            {uiStrings.account.addressForm.address2Label}
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                autoComplete="address-line2"
                                id="address2"
                                placeholder={uiStrings.account.addressForm.address2Placeholder}
                                className="rounded-md"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* City Field */}
            <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel className="text-sm font-medium text-foreground">
                            {uiStrings.account.addressForm.cityLabel}
                        </FormLabel>
                        <FormControl>
                            <Input
                                type="text"
                                autoComplete="address-level2"
                                id="city"
                                className="rounded-md"
                                {...field}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            {/* State/Province and Postal Code Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* State/Province Field */}
                <FormField
                    control={form.control}
                    name="stateCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground">{stateLabel}</FormLabel>
                            <FormControl>
                                <SelectNative
                                    id="stateCode"
                                    value={field.value || ''}
                                    onChange={(e) => field.onChange(e.target.value)}
                                    className="rounded-md">
                                    <option value="">{statePlaceholder}</option>
                                    {stateOptions.map((state) => (
                                        <option key={state.code} value={state.code}>
                                            {state.name}
                                        </option>
                                    ))}
                                </SelectNative>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Postal Code Field */}
                <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-sm font-medium text-foreground">{postalCodeLabel}</FormLabel>
                            <FormControl>
                                <Input
                                    type="text"
                                    autoComplete="postal-code"
                                    id="postalCode"
                                    className="rounded-md"
                                    {...field}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
            </div>

            {/* Preferred Checkbox */}
            <FormField
                control={form.control}
                name="preferred"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                            <Checkbox
                                checked={field.value}
                                onCheckedChange={(checked) => field.onChange(checked === true)}
                                id="preferred"
                            />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium text-foreground cursor-pointer">
                                {uiStrings.account.addressForm.preferredLabel}
                            </FormLabel>
                        </div>
                    </FormItem>
                )}
            />
        </div>
    );
}
