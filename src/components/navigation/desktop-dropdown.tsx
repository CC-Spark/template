'use client';

import { type JSX, type ReactElement, useMemo } from 'react';
import { Link } from 'react-router';
import type { ShopperProductsTypes } from 'commerce-sdk-isomorphic';
import { useShallow } from 'zustand/react/shallow';
import { useCategoryStore } from '@/providers/category-store';

const COLUMNS_MAX = 5;

const CategoryLinks = ({ category }: { category: ShopperProductsTypes.Category }): ReactElement => {
    const { id, name, categories: subCategories } = category;

    const categoryLink = {
        href: `/category/${id}`,
        text: name,
        className: 'text-md mb-2 font-bold',
    };

    const subCategoryLinks = subCategories
        ? subCategories
              .filter((sub) => sub.c_showInMenu)
              .map((subCategory) => ({
                  href: `/category/${subCategory.id}`,
                  text: subCategory.name,
                  className: 'text-md py-3 text-foreground/80 hover:text-foreground',
              }))
        : [];

    return (
        <div className="min-w-0 flex-[0_0_21%]">
            <Link to={categoryLink.href} className={`block ${categoryLink.className}`}>
                {categoryLink.text}
            </Link>

            {subCategoryLinks.map((link) => (
                <Link key={link.href} to={link.href} className={`block ${link.className} hover:no-underline`}>
                    {link.text}
                </Link>
            ))}
        </div>
    );
};

const LoadingIndicator = (): ReactElement => (
    <div className="min-w-0 flex-[0_0_21%] animate-pulse">
        <div className="h-5 bg-muted rounded mb-2" />
        <div className="space-y-3">
            <div className="h-4 bg-muted/50 rounded" />
            <div className="h-4 bg-muted/50 rounded" />
            <div className="h-4 bg-muted/50 rounded" />
        </div>
    </div>
);

export default function NavigationDesktopDropdown({
    category,
}: {
    category: ShopperProductsTypes.Category;
}): JSX.Element | null {
    const { categories } = useCategoryStore(
        useShallow((state) => ({
            categories: state.categories,
        }))
    );
    const { subCategories, columnsToShow } = useMemo(() => {
        // Filter categories that should show up in menu
        return {
            subCategories: (categories[category.id]?.categories ?? []).filter(
                (c: ShopperProductsTypes.Category) => c.c_showInMenu
            ),
            columnsToShow: Math.min(Number(category.onlineSubCategoriesCount), COLUMNS_MAX),
        };
    }, [category, categories]);

    if (category.onlineSubCategoriesCount === 0) {
        return null;
    }
    return (
        <div
            className="grid gap-8 justify-start ml-[68px] xl:ml-24"
            style={{
                gridTemplateColumns: `repeat(${Math.max(columnsToShow, 2)}, minmax(0, 21%))`,
            }}>
            {subCategories.length
                ? // Show actual subcategories
                  subCategories.map((subCategory: ShopperProductsTypes.Category) => (
                      <CategoryLinks key={subCategory.id} category={subCategory} />
                  ))
                : // Show loading placeholders
                  Array.from({ length: Math.max(columnsToShow, 2) }, (_, i) => i).map((index) => (
                      <LoadingIndicator key={`loading-${index}`} />
                  ))}
        </div>
    );
}
