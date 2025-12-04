import { Suspense } from 'react';
import { Await } from 'react-router';
import type { ShopperProducts } from '@salesforce/storefront-next-runtime/scapi';
import ContentCard from '@/components/content-card';
import { Skeleton } from '@/components/ui/skeleton';
import { Typography } from '@/components/typography';
import { Component, Loader } from '@/lib/decorators/component';
import { AttributeDefinition } from '@/lib/decorators/attribute-definition';
import { RegionDefinition } from '@/lib/decorators';
import { useTranslation } from 'react-i18next';
import heroImage from '/images/hero-cube.png';
import { loader } from './loaders';

interface PopularCategoriesProps {
    categoriesPromise?: Promise<ShopperProducts.schemas['Category'][]>;
    parentId?: string;
    paddingX?: string;
    // Data prop provided by the Page Designer component loader
    data?: ShopperProducts.schemas['Category'][];
}

/* v8 ignore start - do not test decorators in unit tests, decorator functionality is tested separately*/
@Component('popularCategories', {
    name: 'Popular Categories',
    description: 'Displays a grid of popular category cards with images, titles, descriptions, and shop now buttons',
})
@RegionDefinition([])
@Loader(loader)
export class PopularCategoriesMetadata {
    @AttributeDefinition({
        name: 'Parent Category ID',
        description: 'The parent category ID to fetch child categories from (e.g., root, mens, womens)',
    })
    parentId?: string;

    @AttributeDefinition({
        name: 'Horizontal Padding',
        description: 'Horizontal padding classes (e.g., px-4 sm:px-6 lg:px-8)',
    })
    paddingX?: string;
}
/* v8 ignore stop */

/**
 * Skeleton component for category grid loading state
 */
function CategoryGridSkeleton({ paddingX = 'px-4 sm:px-6 lg:px-8' }: { paddingX?: string }) {
    return (
        <div className="w-full">
            <div className={`text-center mb-8 ${paddingX}`}>
                <Skeleton className="h-10 w-64 mx-auto" />
            </div>
            <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 ${paddingX}`}>
                {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="space-y-4">
                        <Skeleton className="h-48 w-full rounded-lg" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-8 w-full" />
                    </div>
                ))}
            </div>
        </div>
    );
}

/**
 * Content component that renders the category grid
 * Separated to handle both promise-based and direct data scenarios
 */
function CategoryGridContent({ categories }: { categories: ShopperProducts.schemas['Category'][] }) {
    const { t } = useTranslation('home');
    const displayCategories = categories.slice(0, 4);

    return (
        <>
            <div className="text-center mb-8">
                <Typography variant="h2" align="center" className="text-3xl font-extrabold text-foreground sm:text-4xl">
                    {t('categoryGrid.title')}
                </Typography>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:grid-flow-col lg:auto-cols-fr">
                {displayCategories.map((category) => {
                    const { image, c_slotBannerImage } = category;
                    const imageUrl = (image ?? c_slotBannerImage ?? heroImage) as string;
                    return (
                        <ContentCard
                            key={category.id}
                            title={category.name || ''}
                            description={category.pageDescription || ''}
                            imageUrl={imageUrl}
                            imageAlt={category.name}
                            buttonText={t('categoryGrid.shopNowButton')}
                            buttonLink={`/category/${category.id}`}
                            showBackground={true}
                            showBorder={true}
                            loading="eager"
                        />
                    );
                })}
            </div>
        </>
    );
}

/**
 * Popular Categories component that displays a grid of category cards
 * Shows the first 4 categories in a responsive grid layout
 *
 * Can be used in multiple ways:
 * 1. With categoriesPromise - receives pre-fetched categories from route loader
 * 2. With data prop - receives categories from Page Designer component loader
 * 3. With parentId - triggers component loader to fetch categories (used in Page Designer)
 */
export default function PopularCategories({
    categoriesPromise,
    data,
    paddingX = 'px-4 sm:px-6 lg:px-8',
}: PopularCategoriesProps) {
    return (
        <div className="pt-16">
            <div className={`max-w-screen-2xl mx-auto ${paddingX}`}>
                {/* If data is already provided (from component loader), render directly */}
                {data ? (
                    <CategoryGridContent categories={data} />
                ) : categoriesPromise ? (
                    /* If categoriesPromise is provided (from route loader), use Suspense/Await */
                    <Suspense fallback={<CategoryGridSkeleton paddingX={paddingX} />}>
                        <Await resolve={categoriesPromise}>
                            {(categories) => <CategoryGridContent categories={categories} />}
                        </Await>
                    </Suspense>
                ) : (
                    /* Fallback: show skeleton (component loader will provide data) */
                    <CategoryGridSkeleton paddingX={paddingX} />
                )}
            </div>
        </div>
    );
}
