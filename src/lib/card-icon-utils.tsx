import type { ComponentType } from 'react';
import { VisaIcon, MastercardIcon, AmexIcon, DiscoverIcon, GenericCardIcon } from '@/components/icons';

interface CardIconProps {
    className?: string;
    width?: number | string;
    height?: number | string;
}

// Mapping function to get the right icon component
export const getCardIcon = (cardType: string): ComponentType<CardIconProps> => {
    switch (cardType) {
        case 'Visa':
            return VisaIcon;
        case 'Mastercard':
            return MastercardIcon;
        case 'American Express':
            return AmexIcon;
        case 'Discover':
            return DiscoverIcon;
        case 'Diners Club':
        case 'JCB':
        default:
            return GenericCardIcon;
    }
};
