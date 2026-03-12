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
import { forwardRef } from 'react';
import {
    Link as RouterLink,
    NavLink as RouterNavLink,
    type LinkProps as RouterLinkProps,
    type NavLinkProps as RouterNavLinkProps,
} from 'react-router';
import { buildUrl, useSite } from '@salesforce/storefront-next-runtime/multi-site';
import { useConfig } from '@salesforce/storefront-next-runtime/config';
import type { AppConfig } from '@/types/config';

/**
 * Multi-site-aware <Link>. Drop-in replacement for React Router's <Link>.
 * Automatically prepends URL prefix and appends search params from Url config.
 * When no SiteProvider is mounted, behaves identically to React Router's Link.
 *
 * TODO: Move this component to storefront-next-runtime once useConfig is available
 * in the runtime package. Currently it must live in the template because it depends
 * on useConfig (template-only) to read urlConfig and siteAliasMap.
 */
export const Link = forwardRef<HTMLAnchorElement, RouterLinkProps>(function Link({ to: _to, ...rest }, ref) {
    const site = useSite();
    const config = useConfig<AppConfig>();
    const to =
        typeof _to === 'string' && site
            ? buildUrl({
                  to: _to,
                  urlConfig: config.url,
                  params: {
                      siteId: config.siteAliasMap?.[site.id] ?? site.id,
                      localeId: site.defaultLocale,
                  },
              })
            : _to;
    return <RouterLink ref={ref} to={to} {...rest} />;
});

/**
 * Multi-site-aware <NavLink>. Drop-in replacement for React Router's <NavLink>.
 * Inherits all NavLink functionality (active class, aria-current).
 */
export const NavLink = forwardRef<HTMLAnchorElement, RouterNavLinkProps>(function NavLink({ to: _to, ...rest }, ref) {
    const site = useSite();
    const config = useConfig<AppConfig>();
    const to =
        typeof _to === 'string' && site
            ? buildUrl({
                  to: _to,
                  urlConfig: config.url,
                  params: {
                      siteId: config.siteAliasMap?.[site.id] ?? site.id,
                      localeId: site.defaultLocale,
                  },
              })
            : _to;
    return <RouterNavLink ref={ref} to={to} {...rest} />;
});
