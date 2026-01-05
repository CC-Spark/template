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
import { cn } from '@/lib/utils';

/**
 * A skeleton loading component that displays a placeholder with a pulsing animation
 * while content is being loaded. This provides visual feedback to users during
 * asynchronous operations and improves perceived performance.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <Skeleton className="h-4 w-[250px]" />
 *
 * // Custom styling
 * <Skeleton className="h-8 w-8 rounded-full" />
 *
 * // In a loading state
 * {isLoading ? (
 *   <Skeleton className="h-32 w-full" />
 * ) : (
 *   <ActualContent />
 * )}
 * ```
 *
 * @param className - Additional CSS classes to apply to the skeleton element
 * @param props - Additional HTML div attributes
 * @returns A div element with skeleton styling and pulse animation
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    return <div className={cn('animate-pulse rounded-md bg-muted', className)} {...props} />;
}

export { Skeleton };
