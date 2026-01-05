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
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Skeleton component for the account details page content.
 * Matches the structure of the actual account details with profile and password cards.
 */
export function AccountDetailSkeleton() {
    return (
        <div className="space-y-6">
            {/* Page Header Skeleton */}
            <div>
                <Skeleton className="h-8 w-40" />
            </div>

            {/* My Profile Card Skeleton */}
            <Card className="border-border">
                <CardContent className="p-6">
                    <div className="mb-6">
                        <Skeleton className="h-6 w-24" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        {/* Profile fields skeleton */}
                        {Array.from({ length: 3 }, (_, i) => i).map((index) => (
                            <div key={index}>
                                <div className="mb-2">
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <div>
                                    <Skeleton className="h-4 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Password Card Skeleton */}
            <Card className="border-border">
                <CardContent className="p-6">
                    <div className="mb-6">
                        <Skeleton className="h-6 w-20" />
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div>
                            <div className="mb-2">
                                <Skeleton className="h-4 w-16" />
                            </div>
                            <div>
                                <Skeleton className="h-4 w-24" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default AccountDetailSkeleton;
