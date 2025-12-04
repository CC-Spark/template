'use client';

import { useEffect, type ReactElement } from 'react';
import { useRecommenders, type Product } from '@/hooks/recommenders/use-recommenders';
import ProductCarousel from '@/components/product-carousel/carousel';
import { ProductRecommendationSkeleton } from '@/components/product/skeletons';
import { cn } from '@/lib/utils';

/**
 * Configuration for a single recommender
 */
export interface RecommenderConfig {
    /** Unique identifier for the recommender (e.g., 'pdp-similar-items') */
    name: string;
    /** Display title for the recommendation section */
    title: string;
    /** Type of recommendation request ('recommender' or 'zone') */
    type?: 'recommender' | 'zone';
}

/**
 * Props for the ProductRecommendations component
 */
export interface ProductRecommendationsProps {
    recommender: RecommenderConfig;
    products?: Product[];
    args?: Record<string, unknown>;
    className?: string;
    carouselClassName?: string;
    enabled?: boolean;
}

/**
 * ProductRecommendations component displays a single product recommendation carousel using Einstein.
 *
 * This component uses the `useRecommenders` hook to fetch Einstein recommendations
 * and renders them as a product carousel.
 *
 * The component handles loading states and only displays the carousel when products are available.
 *
 * @param props - The component props
 * @param props.recommender - Recommender configuration (name, title, type)
 * @param props.products - Optional products to use as context
 * @param props.args - Optional arguments to pass to the recommender
 * @param props.className - Optional className for the wrapper
 * @param props.carouselClassName - Optional className for the carousel
 * @param props.enabled - Whether recommendations are enabled (default: true)
 *
 * @returns JSX element representing the product recommendation carousel
 */
export default function ProductRecommendations({
    recommender,
    products,
    args,
    className,
    carouselClassName,
    enabled = true,
}: ProductRecommendationsProps): ReactElement | null {
    const { getRecommendations, getZoneRecommendations, recommendations, isLoading, error } = useRecommenders(enabled);

    // Fetch recommendations when component mounts or dependencies change
    useEffect(() => {
        if (!enabled || !recommender) {
            return;
        }

        if (recommender.type === 'zone') {
            void getZoneRecommendations(recommender.name, products, args);
        } else {
            void getRecommendations(recommender.name, products, args);
        }
    }, [recommender, products, args, enabled, getRecommendations, getZoneRecommendations]);

    // Early return if no recommender configured or if error occurred
    if (!recommender || error) {
        return null;
    }

    // Show loading state
    if (isLoading) {
        return (
            <div className={cn(className)}>
                <ProductRecommendationSkeleton title={recommender.title} />
            </div>
        );
    }

    // Don't render if no recommendations returned
    const productRecs = recommendations?.recs;

    if (!productRecs || productRecs.length === 0) {
        return null;
    }

    // Products are already in ProductSearchHit format from the hook enrichment
    return (
        <div className={cn(className)}>
            <ProductCarousel
                products={productRecs}
                title={recommendations.displayMessage || recommender.title}
                className={carouselClassName}
            />
        </div>
    );
}
