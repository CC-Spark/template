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
 * Logging utilities for cartridge deployment
 */
import chalk from 'chalk';

const colors = {
    warn: 'yellow',
    error: 'red',
    success: 'green',
    info: 'gray',
    debug: 'cyan',
} as const;

/**
 * Internal function to log messages with colored output
 *
 * @param level - The log level determining the color
 * @param msg - The message to log
 */
const fancyLog = (level: keyof typeof colors, msg: string) => {
    const color = colors[level];
    const colorFn = chalk[color];
    // eslint-disable-next-line no-console
    console.log(`${colorFn(level)}: ${msg}`);
};

/**
 * Log a warning message in yellow
 *
 * @param msg - The warning message to display
 */
export const warn = (msg: string) => fancyLog('warn', msg);

/**
 * Log an error message in red
 *
 * @param msg - The error message to display
 */
export const error = (msg: string) => fancyLog('error', msg);

/**
 * Log a success message in green
 *
 * @param msg - The success message to display
 */
export const success = (msg: string) => fancyLog('success', msg);

/**
 * Log an informational message in gray
 *
 * @param msg - The informational message to display
 */
export const info = (msg: string) => fancyLog('info', msg);

/**
 * Log a debug message in cyan
 *
 * @param msg - The debug message to display
 */
export const debug = (msg: string) => fancyLog('debug', msg);
