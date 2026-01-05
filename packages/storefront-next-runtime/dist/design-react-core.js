import { n as usePageDesignerMode, t as PageDesignerProvider } from "./PageDesignerProvider.js";
import { i as useRegionContext, n as useComponentContext, r as RegionContext, t as ComponentContext } from "./ComponentContext.js";
import { lazy } from "react";
import { Fragment, jsx } from "react/jsx-runtime";

//#region src/design/react/core/PageDesignerPageMetadataProvider.tsx
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
const LazyPageRegistration = lazy(() => import("./PageRegistration.js").then((module) => ({ default: module.PageRegistration })));
/**
* Provides the page metadata for Page Designer.
*/
function PageDesignerPageMetadataProvider({ page, children }) {
	const { isDesignMode } = usePageDesignerMode();
	if (!isDesignMode) return /* @__PURE__ */ jsx(Fragment, { children });
	return /* @__PURE__ */ jsx(LazyPageRegistration, {
		page,
		children
	});
}

//#endregion
export { ComponentContext, PageDesignerPageMetadataProvider, PageDesignerProvider, RegionContext, useComponentContext, usePageDesignerMode, useRegionContext };
//# sourceMappingURL=design-react-core.js.map