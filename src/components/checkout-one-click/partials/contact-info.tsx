import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ToggleCard, ToggleCardEdit, ToggleCardSummary } from '@/components/toggle-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Typography } from '@/components/typography';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useBasket } from '@/providers/basket';
import { contactInfoSchema, type ContactInfoData } from '@/lib/checkout-schemas';
import { useLoginSuggestion } from '@/hooks/use-customer-lookup';
import { useCustomerProfile } from '@/hooks/checkout/use-customer-profile';
import { getContactInfoFromCustomer } from '@/lib/customer-profile-utils';
import { cn } from '@/lib/utils';
import uiStrings from '@/temp-ui-string';
import type { CheckoutActionData } from '../types';

interface ContactInfoProps {
    onSubmit: (data: ContactInfoData) => void;
    isLoading: boolean;
    actionData?: CheckoutActionData;
    onRegisteredUserChoseGuest?: (isGuest: boolean) => void;
    // Step state managed by container
    isCompleted: boolean;
    isEditing: boolean;
    onEdit: () => void;
}

export default function ContactInfo({
    onSubmit,
    isLoading,
    actionData,
    onRegisteredUserChoseGuest: _onRegisteredUserChoseGuest,
    isCompleted,
    isEditing,
    onEdit,
}: ContactInfoProps) {
    const cart = useBasket();
    const loginSuggestion = useLoginSuggestion();
    const customerProfile = useCustomerProfile();

    // Get auto-populated contact info from customer profile
    const customerContactInfo = getContactInfoFromCustomer(customerProfile);

    const form = useForm<ContactInfoData>({
        resolver: zodResolver(contactInfoSchema),
        defaultValues: {
            email: cart?.customerInfo?.email || customerContactInfo.email || '',
        },
    });

    const handleFormSubmit = (data: ContactInfoData) => {
        onSubmit(data);
    };

    const stepTitle = (
        <div className="flex items-center gap-2">
            <span
                className={cn(
                    'w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium',
                    isCompleted ? 'bg-accent text-accent-foreground' : 'bg-primary/10 text-primary'
                )}>
                {isCompleted
                    ? uiStrings.checkout.common.stepCompleted
                    : uiStrings.checkout.common.stepNumbers.contactInfo}
            </span>
            {uiStrings.checkout.contactInfo.title}
        </div>
    );

    return (
        <ToggleCard
            id="contact-info"
            title={stepTitle}
            editing={isEditing}
            disabled={!isEditing && !isCompleted}
            onEdit={onEdit}
            editLabel={uiStrings.checkout.common.edit}
            isLoading={isLoading}>
            <ToggleCardEdit>
                <Form {...form}>
                    <form onSubmit={(e) => void form.handleSubmit(handleFormSubmit)(e)} className="space-y-6">
                        {actionData?.formError && actionData.step === 'contactInfo' && (
                            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded">
                                {actionData.formError}
                            </div>
                        )}

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{uiStrings.checkout.contactInfo.emailLabel}</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="email"
                                            placeholder={uiStrings.checkout.contactInfo.emailPlaceholder}
                                            autoComplete="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-center">
                            <Button
                                type="submit"
                                disabled={isLoading || !form.formState.isValid}
                                size="lg"
                                className="min-w-48">
                                {isLoading
                                    ? uiStrings.checkout.contactInfo.saving
                                    : uiStrings.checkout.contactInfo.continue}
                            </Button>
                        </div>
                    </form>
                </Form>
            </ToggleCardEdit>

            <ToggleCardSummary>
                <div className="space-y-2">
                    <Typography variant="small" className="text-muted-foreground">
                        {uiStrings.checkout.contactInfo.emailLabel}
                    </Typography>
                    <Typography variant="p" className="font-medium">
                        {cart?.customerInfo?.email ||
                            (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('checkoutEmail'))}
                    </Typography>
                    {loginSuggestion.shouldSuggestLogin && (
                        <Typography variant="small" className="text-accent-foreground">
                            💡 Have an account? You can continue as guest or{' '}
                            <a href="/login" className="underline hover:no-underline">
                                sign in for faster checkout
                            </a>
                        </Typography>
                    )}
                    {loginSuggestion.isCurrentUser && (
                        <Typography variant="small" className="text-success-foreground">
                            ✓ Using your registered account
                        </Typography>
                    )}
                </div>
            </ToggleCardSummary>
        </ToggleCard>
    );
}
