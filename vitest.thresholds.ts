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

/**
 * These thresholds correspond to the coverage status as of 2025-11-19 and thus represent our absolute minimum values
 * that must not be undershot going forward. They should be raised regularly to reflect the current status.
 */
export default {
    lines: 70,
    statements: 70,
    functions: 75,
    branches: 85,
};
