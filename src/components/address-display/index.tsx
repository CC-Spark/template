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
import { Typography } from '@/components/typography';
import type { ShopperBasketsV2, ShopperCustomers } from '@salesforce/storefront-next-runtime/scapi';

interface AddressDisplayProps {
    address: ShopperBasketsV2.schemas['OrderAddress'] | ShopperCustomers.schemas['CustomerAddress'];
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
