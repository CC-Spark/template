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
