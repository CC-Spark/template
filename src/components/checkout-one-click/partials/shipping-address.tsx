import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToggleCard, ToggleCardEdit, ToggleCardSummary } from '@/components/toggle-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/typography';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useBasket } from '@/providers/basket';
import { shippingAddressSchema, type ShippingAddressData } from '@/lib/checkout-schemas';
import { useCustomerProfile } from '@/hooks/checkout/use-customer-profile';
import { getShippingAddressFromCustomer } from '@/lib/customer-profile-utils';
import { cn } from '@/lib/utils';
import uiStrings from '@/temp-ui-string';
import type { CheckoutActionData } from '../types';

interface ShippingAddressProps {
    onSubmit: (formData: FormData) => void;
    isLoading: boolean;
    actionData?: CheckoutActionData;
    // Step state managed by container
    isCompleted: boolean;
    isEditing: boolean;
    onEdit: () => void;
}

export default function ShippingAddress({
    onSubmit,
    isLoading,
    actionData,
    isCompleted,
    isEditing,
    onEdit,
}: ShippingAddressProps) {
    const cart = useBasket();
    const customerProfile = useCustomerProfile();

    const shippingAddress = cart?.shipments?.[0]?.shippingAddress;

    // Get auto-populated shipping address from customer profile
    const customerShippingAddress = getShippingAddressFromCustomer(customerProfile);

    const form = useForm<ShippingAddressData>({
        resolver: zodResolver(shippingAddressSchema),
        defaultValues: {
            firstName: shippingAddress?.firstName || customerShippingAddress.firstName || '',
            lastName: shippingAddress?.lastName || customerShippingAddress.lastName || '',
            address1: shippingAddress?.address1 || customerShippingAddress.address1 || '',
            address2: shippingAddress?.address2 || customerShippingAddress.address2 || '',
            city: shippingAddress?.city || customerShippingAddress.city || '',
            stateCode: shippingAddress?.stateCode || customerShippingAddress.stateCode || '',
            postalCode: shippingAddress?.postalCode || customerShippingAddress.postalCode || '',
            phone: shippingAddress?.phone || customerShippingAddress.phone || '',
        },
    });

    const handleFormSubmit = (data: ShippingAddressData) => {
        // Convert typed data to FormData for the action route
        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value) {
                formData.append(key, value);
            }
        });
        onSubmit(formData);
    };

    // Component visibility is now managed by the container
    if (!isEditing && !isCompleted) {
        return null;
    }

    const stepTitle = (
        <div className="flex items-center gap-2">
            <span
                className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
                    isCompleted ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'
                )}>
                {isCompleted
                    ? uiStrings.checkout.common.stepCompleted
                    : uiStrings.checkout.common.stepNumbers.shippingAddress}
            </span>
            {uiStrings.checkout.shippingAddress.title}
        </div>
    );

    return (
        <ToggleCard
            id="shipping-address"
            title={stepTitle}
            editing={isEditing}
            disabled={!isEditing && !isCompleted}
            onEdit={onEdit}
            editLabel={uiStrings.checkout.common.edit}
            isLoading={isLoading}>
            <ToggleCardEdit>
                <Form {...form}>
                    <form onSubmit={(e) => void form.handleSubmit(handleFormSubmit)(e)} className="space-y-6">
                        {actionData?.fieldErrors && (
                            <div className="space-y-2">
                                {Object.entries(actionData.fieldErrors).map(([field, error]) => (
                                    <div
                                        key={field}
                                        className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                                        {error}
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="firstName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{uiStrings.checkout.shippingAddress.firstNameLabel}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={uiStrings.checkout.shippingAddress.firstNamePlaceholder}
                                                autoComplete="given-name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="lastName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{uiStrings.checkout.shippingAddress.lastNameLabel}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={uiStrings.checkout.shippingAddress.lastNamePlaceholder}
                                                autoComplete="family-name"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address1"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{uiStrings.checkout.shippingAddress.addressLabel}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={uiStrings.checkout.shippingAddress.addressPlaceholder}
                                            autoComplete="address-line1"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="address2"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{uiStrings.checkout.shippingAddress.address2Label}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={uiStrings.checkout.shippingAddress.address2Placeholder}
                                            autoComplete="address-line2"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="city"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{uiStrings.checkout.shippingAddress.cityLabel}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={uiStrings.checkout.shippingAddress.cityPlaceholder}
                                                autoComplete="address-level2"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="stateCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{uiStrings.checkout.shippingAddress.stateLabel}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={uiStrings.checkout.shippingAddress.statePlaceholder}
                                                autoComplete="address-level1"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="postalCode"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{uiStrings.checkout.shippingAddress.zipLabel}</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder={uiStrings.checkout.shippingAddress.zipPlaceholder}
                                                autoComplete="postal-code"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{uiStrings.checkout.shippingAddress.phoneLabel}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="tel"
                                            placeholder={uiStrings.checkout.shippingAddress.phonePlaceholder}
                                            autoComplete="tel"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-center pt-2">
                            <Button type="submit" disabled={isLoading} size="lg" className="min-w-48">
                                {isLoading
                                    ? uiStrings.checkout.common.submitting
                                    : uiStrings.checkout.shippingAddress.continue}
                            </Button>
                        </div>
                    </form>
                </Form>
            </ToggleCardEdit>

            <ToggleCardSummary>
                <div className="space-y-3">
                    {shippingAddress && (
                        <div className="rounded-lg p-3 space-y-2 bg-muted/50">
                            <Typography variant="p" className="font-medium">
                                {shippingAddress.firstName} {shippingAddress.lastName}
                            </Typography>
                            <Typography variant="p" className="text-muted-foreground">
                                {shippingAddress.address1}
                                {shippingAddress.address2 && (
                                    <>
                                        <br />
                                        {shippingAddress.address2}
                                    </>
                                )}
                                <br />
                                {shippingAddress.city}
                                {shippingAddress.stateCode && `, ${shippingAddress.stateCode}`}{' '}
                                {shippingAddress.postalCode}
                                {shippingAddress.phone && (
                                    <>
                                        <br />
                                        {shippingAddress.phone}
                                    </>
                                )}
                            </Typography>
                        </div>
                    )}
                </div>
            </ToggleCardSummary>
        </ToggleCard>
    );
}
