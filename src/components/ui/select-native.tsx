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

import { type ComponentProps } from 'react';
import { ChevronDownIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

const SelectNative = ({ className, children, onChange, ...props }: ComponentProps<'select'>) => {
    return (
        <div className="relative flex">
            <select
                data-slot="select-native"
                onChange={(e) => onChange?.(e)}
                className={cn(
                    'peer border-input text-foreground focus-visible:border-ring focus-visible:ring-ring/50 has-[option[disabled]:checked]:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex w-full cursor-pointer appearance-none items-center rounded-md border text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                    props.multiple ? '[&_option:checked]:bg-accent py-1 *:px-3 *:py-1' : 'h-9 ps-3 pe-8',
                    className
                )}
                {...props}>
                {children}
            </select>
            {!props.multiple && (
                <span className="text-muted-foreground/80 peer-aria-invalid:text-destructive/80 pointer-events-none absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center peer-disabled:opacity-50">
                    <ChevronDownIcon size={16} aria-hidden="true" />
                </span>
            )}
        </div>
    );
};

export { SelectNative };
