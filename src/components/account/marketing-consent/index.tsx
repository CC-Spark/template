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
import { useMemo, useEffect, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import type { ShopperConsents } from '@salesforce/storefront-next-runtime/scapi';
import { Card, CardAction, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useConfig } from '@/config';
import { useScapiFetcher } from '@/hooks/use-scapi-fetcher';

type ConsentSubscription = ShopperConsents.schemas['ConsentSubscription'];

export type MarketingConsentSubscriptions = ShopperConsents.schemas['ConsentSubscriptionResponse'] | null;

export interface MarketingConsentProps {
    /** Optional override: subscription preferences from getSubscriptions (default: fetched by component). */
    subscriptions?: MarketingConsentSubscriptions | null;
}

function channelLabel(channelId: string): string {
    return channelId.charAt(0).toUpperCase() + channelId.slice(1).toLowerCase();
}

/** Status for a subscription on a channel: from consentStatus entry for that channel, or defaultStatus. */
function getStatusForChannel(sub: ConsentSubscription, channelId: string): 'opt_in' | 'opt_out' {
    const entry = sub.consentStatus?.find((e) => e.channel === channelId);
    return entry?.status ?? sub.defaultStatus ?? 'opt_out';
}

/** Group subscriptions by channel; each subscription appears under every channel in its channels array. Order follows API (first-seen channel order). */
function groupByChannel(subscriptions: ConsentSubscription[]) {
    const byChannel = new Map<string, ConsentSubscription[]>();
    for (const sub of subscriptions) {
        for (const channelId of sub.channels ?? []) {
            const list = byChannel.get(channelId) ?? [];
            list.push(sub);
            byChannel.set(channelId, list);
        }
    }
    return Array.from(byChannel, ([channelId, items]) => ({
        channelId,
        channelLabel: channelLabel(channelId),
        items,
    }));
}

export function MarketingConsent({ subscriptions: subscriptionsProp }: MarketingConsentProps): ReactElement {
    const { t } = useTranslation('account');
    const config = useConfig();
    const fetcher = useScapiFetcher('shopperConsents', 'getSubscriptions', {
        params: {
            path: { organizationId: config.commerce.api.organizationId },
            query: { siteId: config.commerce.api.siteId },
        },
    });

    useEffect(() => {
        if (subscriptionsProp === undefined) {
            void fetcher.load();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount when not controlled by prop
    }, []);

    const isControlled = subscriptionsProp !== undefined;
    const subscriptions = isControlled ? subscriptionsProp : (fetcher.data ?? null);

    const channelSections = useMemo(() => groupByChannel(subscriptions?.data ?? []), [subscriptions]);

    const statusToLabel = (status: 'opt_in' | 'opt_out'): string =>
        status === 'opt_in' ? t('marketingConsent.optedIn') : t('marketingConsent.optedOut');

    const renderContent = (): ReactElement => {
        return (
            <div className="space-y-4">
                {channelSections.map((section, sectionIndex) => (
                    <section
                        key={section.channelId}
                        className={sectionIndex > 0 ? 'border-t border-muted-foreground/10 pt-4' : ''}
                        aria-labelledby={`marketing-consent-channel-${section.channelId}`}>
                        <h2
                            id={`marketing-consent-channel-${section.channelId}`}
                            className="text-sm font-semibold text-foreground mb-2">
                            {section.channelLabel}
                        </h2>
                        <ul className="space-y-2 pl-4" role="list">
                            {section.items.map((sub) => {
                                const status = getStatusForChannel(sub, section.channelId);
                                const checked = status === 'opt_in';
                                const title = sub.title ?? sub.subscriptionId;
                                return (
                                    <li
                                        key={`${section.channelId}-${sub.subscriptionId}`}
                                        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between py-1">
                                        <div className="space-y-1 min-w-0">
                                            {sub.title != null && sub.title !== '' && (
                                                <p className="text-sm font-medium text-foreground">{sub.title}</p>
                                            )}
                                            {sub.subtitle != null && sub.subtitle !== '' && (
                                                <p className="text-sm text-muted-foreground">{sub.subtitle}</p>
                                            )}
                                        </div>
                                        <Switch
                                            checked={checked}
                                            aria-label={`${title}: ${
                                                checked ? statusToLabel('opt_in') : statusToLabel('opt_out')
                                            }`}
                                            className="shrink-0 sm:ml-4"
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    </section>
                ))}
                <p className="text-sm text-muted-foreground pt-4 border-t border-muted-foreground/10">
                    {t('marketingConsent.disclaimer')}
                </p>
            </div>
        );
    };

    return (
        <Card data-section="marketing-consent">
            <CardHeader className="border-b border-muted-foreground/20 pb-4">
                <CardTitle>{t('marketingConsent.title')}</CardTitle>
                <CardAction>
                    <Button variant="outline" size="sm" type="button" aria-label={t('marketingConsent.editA11y')}>
                        {t('marketingConsent.edit')}
                    </Button>
                </CardAction>
            </CardHeader>
            <CardContent className="pt-6">{renderContent()}</CardContent>
        </Card>
    );
}

export default MarketingConsent;
