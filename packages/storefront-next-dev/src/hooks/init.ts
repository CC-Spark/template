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

import type { Hook } from '@oclif/core';
import { initializePlugins } from '../cli-plugins.js';

/**
 * Oclif init hook — runs before any command executes.
 *
 * Discovers b2c-cli plugins (installed via `b2c plugins:install`) and registers
 * their middleware and config sources with the global registries. This ensures
 * all sfnext commands automatically benefit from installed b2c-cli plugins.
 */
const hook: Hook<'init'> = async function () {
    await initializePlugins();
};

export default hook;
