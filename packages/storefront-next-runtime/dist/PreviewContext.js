import { r as isPreviewModeActive } from "./modeDetection.js";
import { createContext, useMemo } from "react";
import { jsx } from "react/jsx-runtime";

//#region src/design/react/context/PreviewContext.tsx
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
const PreviewContext = createContext({ isPreviewMode: false });
const PreviewProvider = ({ children }) => {
	const isPreviewMode = isPreviewModeActive();
	const contextValue = useMemo(() => ({ isPreviewMode }), [isPreviewMode]);
	return /* @__PURE__ */ jsx(PreviewContext.Provider, {
		value: contextValue,
		children
	});
};

//#endregion
export { PreviewProvider };
//# sourceMappingURL=PreviewContext.js.map