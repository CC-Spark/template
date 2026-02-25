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
import { type ReactElement, useEffect, useState, useCallback, Suspense } from 'react';
import { Await, type LoaderFunctionArgs, type ShouldRevalidateFunctionArgs } from 'react-router';
import { type ShopperCustomers, type ShopperProducts, ApiError } from '@salesforce/storefront-next-runtime/scapi';
import { Heart } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuth } from '@/middlewares/auth.server';
import { useTranslation } from 'react-i18next';
import { fetchProductsForWishlist, getWishlist } from '@/lib/api/wishlist';
import { WishlistListItem } from '@/components/wishlist/wishlist-list-item';

type CustomerProductList = ShopperCustomers.schemas['CustomerProductList'];
type CustomerProductListItem = ShopperCustomers.schemas['CustomerProductListItem'];
type Product = ShopperProducts.schemas['Product'];

/**
 * Server-side loader to fetch the customer's wishlist items and product details.
 * Product details are returned as a Promise for streaming — the Suspense boundary
 * in the component shows a skeleton until they resolve.
 */
// eslint-disable-next-line react-refresh/only-export-components
export async function loader({ context }: LoaderFunctionArgs): Promise<{
    wishlist: CustomerProductList | null;
    items: CustomerProductListItem[];
    productsByProductId: Promise<Record<string, Product>>;
}> {
    const session = getAuth(context);

    const isRegistered =
        session.userType === 'registered' &&
        session.customerId &&
        session.accessToken &&
        session.accessTokenExpiry &&
        session.accessTokenExpiry > Date.now();

    if (!isRegistered || !session.customerId) {
        return {
            wishlist: null,
            items: [],
            productsByProductId: Promise.resolve({}),
        };
    }

    try {
        const customerId = session.customerId;
        const { wishlist, items, id: listId } = await getWishlist(context, customerId);

        if (!wishlist || !listId) {
            return {
                wishlist: null,
                items: [],
                productsByProductId: Promise.resolve({}),
            };
        }

        return {
            wishlist,
            items,
            // Fetch ALL items' product details — no initial-batch limit since pagination
            // is not yet implemented on the list view. Returned as a Promise so the
            // server can stream the response and the Suspense boundary renders a
            // skeleton while products load.
            productsByProductId: fetchProductsForWishlist(context, items),
        };
    } catch (error) {
        let status_code: string | undefined;

        if (error instanceof ApiError) {
            status_code = String(error.status);
        }

        if (status_code === '401' || status_code === '403') {
            return {
                wishlist: null,
                items: [],
                productsByProductId: Promise.resolve({}),
            };
        }

        return {
            wishlist: null,
            items: [],
            productsByProductId: Promise.resolve({}),
        };
    }
}

/**
 * Prevent automatic revalidation after wishlist remove actions.
 * Disabled-item state is managed client-side to avoid unnecessary refetches.
 */
// eslint-disable-next-line react-refresh/only-export-components
export function shouldRevalidate({ formAction, defaultShouldRevalidate }: ShouldRevalidateFunctionArgs) {
    if (formAction === '/action/wishlist-remove') {
        return false;
    }
    return defaultShouldRevalidate;
}

/**
 * Skeleton shown while product details are streaming from the server.
 */
export function WishlistSkeleton(): ReactElement {
    const { t } = useTranslation('account');

    return (
        <div className="space-y-6">
            {/* Header card skeleton */}
            <Card className="p-6 gap-0">
                <h1 className="text-2xl font-bold text-foreground" tabIndex={0}>
                    {t('navigation.wishlist')}
                </h1>
                <Skeleton className="h-4 w-48 mt-1" />
            </Card>

            {/* Items card skeleton */}
            <Card className="py-0 gap-0">
                <div className="p-4 border-b border-border">
                    <Skeleton className="h-6 w-36" />
                </div>
                <div className="p-4 space-y-4">
                    <Skeleton className="h-5 w-36" />
                    {(['skeleton-1', 'skeleton-2', 'skeleton-3'] as const).map((key) => (
                        <div key={key} className="flex gap-4 p-4 border border-border rounded-lg">
                            <Skeleton className="w-20 h-20 md:w-28 md:h-28 flex-shrink-0 rounded" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-5 w-16 rounded-md" />
                            </div>
                            <Skeleton className="w-20 h-6 flex-shrink-0" />
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
}

function AccountWishlistContent({
    items,
    productsByProductId,
}: {
    items: CustomerProductListItem[];
    productsByProductId: Record<string, Product>;
}): ReactElement {
    const { t } = useTranslation('account');

    // Track removed items client-side, persisted in sessionStorage to survive revalidations
    const [disabledItemIds, setDisabledItemIds] = useState<Set<string>>(() => {
        if (typeof window !== 'undefined') {
            const stored = sessionStorage.getItem('wishlist-disabled');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored) as string[];
                    return new Set(parsed);
                } catch (e) {
                    // eslint-disable-next-line no-console
                    console.error('Failed to parse stored disabled IDs:', e);
                }
            }
        }
        return new Set();
    });

    useEffect(() => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('wishlist-disabled', JSON.stringify(Array.from(disabledItemIds)));
        }
    }, [disabledItemIds]);

    useEffect(() => {
        return () => {
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('wishlist-disabled');
            }
        };
    }, []);

    const handleItemRemove = useCallback((itemId: string) => {
        setDisabledItemIds((prev) => new Set(prev).add(itemId));
    }, []);

    const visibleItems = items.filter((item) => !item.id || !disabledItemIds.has(item.id));

    return (
        <div className="space-y-6">
            {/* Page Header Card */}
            <Card className="p-6 gap-0">
                <h1 className="text-2xl font-bold text-foreground" tabIndex={0}>
                    {t('wishlist.pageTitle')}
                </h1>
                <p className="text-muted-foreground mt-1">{t('wishlist.pageSubtitle')}</p>
            </Card>

            {/* Saved Items Card */}
            <Card className="py-0 gap-0">
                {/* Header: title + item count — separator (border-b) sits below count */}
                <div className="p-4 space-y-1 border-b border-border">
                    <h2 className="text-lg font-semibold text-foreground">{t('wishlist.savedItems')}</h2>
                    {visibleItems.length > 0 && (
                        <p className="text-sm text-muted-foreground">
                            {t('wishlist.itemCount', { count: visibleItems.length })}
                        </p>
                    )}
                </div>

                {visibleItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                        <Heart className="w-16 h-16 text-muted-foreground/40 mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">{t('wishlist.emptyTitle')}</h3>
                        <p className="text-muted-foreground">{t('wishlist.emptySubtitle')}</p>
                    </div>
                ) : (
                    <div className="p-4 space-y-4">
                        {visibleItems.map((item) => {
                            if (!item.id || !item.productId) return null;
                            const product = productsByProductId[item.productId];
                            if (!product?.name) return null;

                            return (
                                <WishlistListItem
                                    key={item.id}
                                    product={product}
                                    wishlistItem={item}
                                    onRemove={handleItemRemove}
                                />
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}

export default function AccountWishlist({
    loaderData,
}: {
    loaderData: Awaited<ReturnType<typeof loader>>;
}): ReactElement {
    return (
        <Suspense fallback={<WishlistSkeleton />}>
            <Await resolve={loaderData.productsByProductId}>
                {(productsByProductId) => (
                    <AccountWishlistContent items={loaderData.items} productsByProductId={productsByProductId} />
                )}
            </Await>
        </Suspense>
    );
}
