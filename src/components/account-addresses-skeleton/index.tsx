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

import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardAction, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton component for the account addresses page content.
 * Matches the structure of the actual addresses page with a grid of address cards.
 */
export function AccountAddressesSkeleton() {
    const { t } = useTranslation('account');
    return (
        <div className="space-y-6">
            {/* Page Header Skeleton */}
            <div>
                <h1 className="text-2xl font-bold text-foreground" tabIndex={0}>
                    {t('navigation.addresses')}
                </h1>
            </div>

            {/* Address Cards Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 3 }, (_, i) => i).map((index) => (
                    <Card key={index} className="border-border gap-0 py-4">
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="h-5 w-16" />
                            </CardTitle>
                            <CardAction>
                                <Skeleton className="h-5 w-20" />
                            </CardAction>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-4 w-40" />
                                <Skeleton className="h-4 w-36" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </CardContent>
                        <CardFooter className="gap-2">
                            <Skeleton className="h-8 w-12" />
                            <Skeleton className="h-8 w-16" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}

export default AccountAddressesSkeleton;
