import type { ReactElement } from 'react';

/**
 * NavigationDesktop skeleton component for loading states
 * Provides a visual placeholder while the actual navigation content is loading
 * Matches the exact structure of the rendered navigation HTML
 */
export default function NavigationDesktopSkeleton(): ReactElement {
    return (
        <div className="hidden lg:flex relative">
            <nav className="flex" aria-label="Main navigation" role="navigation">
                <div className="flex flex-row items-start justify-start pl-4 w-full min-w-xs">
                    <div className="flex flex-row whitespace-nowrap flex-wrap space-x-0">
                        {/* New Arrivals - with dropdown */}
                        <div className="relative flex items-center">
                            <div className="h-9 w-28 bg-muted rounded animate-pulse ml-3 px-3 py-2" />
                            <div className="h-9 w-9 bg-muted rounded animate-pulse ml-1 px-4 py-2" />
                        </div>

                        {/* Womens - with dropdown */}
                        <div className="relative flex items-center">
                            <div className="h-9 w-20 bg-muted rounded animate-pulse ml-3 px-3 py-2" />
                            <div className="h-9 w-9 bg-muted rounded animate-pulse ml-1 px-4 py-2" />
                        </div>

                        {/* Mens - with dropdown */}
                        <div className="relative flex items-center">
                            <div className="h-9 w-16 bg-muted rounded animate-pulse ml-3 px-3 py-2" />
                            <div className="h-9 w-9 bg-muted rounded animate-pulse ml-1 px-4 py-2" />
                        </div>

                        {/* Gift Certificates - no dropdown */}
                        <div className="relative flex items-center">
                            <div className="h-9 w-36 bg-muted rounded animate-pulse ml-3 px-3 py-2" />
                        </div>

                        {/* Top Sellers - no dropdown */}
                        <div className="relative flex items-center">
                            <div className="h-9 w-28 bg-muted rounded animate-pulse ml-3 px-3 py-2" />
                        </div>
                    </div>
                </div>
            </nav>
        </div>
    );
}
