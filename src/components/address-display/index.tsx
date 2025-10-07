import { Typography } from '@/components/typography';
import type { ShopperBasketsTypes, ShopperCustomersTypes } from 'commerce-sdk-isomorphic';

interface AddressDisplayProps {
    address: ShopperBasketsTypes.OrderAddress | ShopperCustomersTypes.CustomerAddress;
}

export default function AddressDisplay({ address }: AddressDisplayProps) {
    if (!address) {
        return (
            <Typography variant="small" className="text-muted-foreground">
                No address provided
            </Typography>
        );
    }

    return (
        <div className="space-y-1">
            <Typography variant="p">
                {address.firstName} {address.lastName}
            </Typography>
            <Typography variant="small" className="text-muted-foreground">
                {address.address1}
            </Typography>
            {address.address2 && (
                <Typography variant="small" className="text-muted-foreground">
                    {address.address2}
                </Typography>
            )}
            <Typography variant="small" className="text-muted-foreground">
                {address.city}
                {address.stateCode && `, ${address.stateCode}`}
                {address.postalCode && ` ${address.postalCode}`}
            </Typography>
            {address.countryCode && (
                <Typography variant="small" className="text-muted-foreground">
                    {address.countryCode}
                </Typography>
            )}
            {address.phone && (
                <Typography variant="small" className="text-muted-foreground">
                    {address.phone}
                </Typography>
            )}
        </div>
    );
}
