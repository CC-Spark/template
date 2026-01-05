import React from "react";

//#region src/design/react/core/RegionContext.tsx
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
const RegionContext = React.createContext(null);
const useRegionContext = () => React.useContext(RegionContext);

//#endregion
//#region src/design/react/core/ComponentContext.tsx
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
const ComponentContext = React.createContext(null);
const useComponentContext = () => React.useContext(ComponentContext);

//#endregion
export { useRegionContext as i, useComponentContext as n, RegionContext as r, ComponentContext as t };
//# sourceMappingURL=ComponentContext.js.map