import { type UseFormReturn } from 'react-hook-form';
import type { ScapiFetcher } from '@/hooks/use-scapi-fetcher';
import type { ShopperCustomersTypes } from 'commerce-sdk-isomorphic';

// Type for the form data (inferred from schema in index.tsx)
export type CustomerAddressFormData = {
    addressId: string;
    firstName: string;
    lastName: string;
    phone?: string;
    countryCode: 'US' | 'CA';
    address1: string;
    address2?: string;
    city: string;
    stateCode?: string;
    postalCode: string;
    preferred?: boolean;
};

// Props interface for CustomerAddressForm component
export interface CustomerAddressFormProps {
    initialData?: Partial<CustomerAddressFormData>;
    // The fetcher returns CustomerAddress directly (unwrapped by ScapiFetcher)
    updateFetcher: ScapiFetcher<ShopperCustomersTypes.CustomerAddress>;
    onSuccess?: (formData: CustomerAddressFormData) => void;
    onError?: (error: string) => void;
    onCancel?: () => void;
}

// Props interface for CustomerAddressFields component
export interface CustomerAddressFieldsProps {
    form: UseFormReturn<CustomerAddressFormData>;
}
