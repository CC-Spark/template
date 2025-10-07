/**
 * Product Carousel Components
 *
 * This module exports the main ProductCarousel component, its associated skeleton component,
 * and a Suspense-wrapped version for better loading state management.
 *
 * @fileoverview Exports for product carousel functionality including loading states and Suspense boundaries
 */

// Main carousel component
export { default as ProductCarousel } from './carousel';

// Skeleton component for loading states
export { default as ProductCarouselSkeleton } from './skeleton';

// ProductCarousel wrapped with Suspense boundary
export { ProductCarouselWithSuspense } from './carousel';

// Re-export the main component as default for backward compatibility
// eslint-disable-next-line react-refresh/only-export-components
export { default } from './carousel';
