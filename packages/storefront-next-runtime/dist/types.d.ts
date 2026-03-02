//#region src/config/types.d.ts
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
type Locale = {
  id: string;
  preferredCurrency: string;
};
type Site = {
  cookies?: {
    domain?: string;
  };
  defaultCurrency: string;
  defaultLocale: string;
  domain?: string;
  id: string;
  supportedCurrencies: string[];
  supportedLocales: Array<Locale>;
};
type Url = {
  /** URL path prefix using React Router param syntax. e.g. '/:siteId/:localeId' */
  prefix?: string;
  /**
   * Query parameters to append to URLs, using ':param' syntax.
   * e.g. '?lng=:localeId' or '?lng=:localeId&site=:siteId'
   */
  search?: string;
  excludeRoutes?: string[];
};
//#endregion
export { Site as n, Url as r, Locale as t };
//# sourceMappingURL=types.d.ts.map