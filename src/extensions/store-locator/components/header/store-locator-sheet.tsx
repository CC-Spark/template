/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use client';

import { type PropsWithChildren, type ReactElement, useState } from 'react';
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetTrigger,
} from '@/components/ui/sheet';
import StoreLocator from '@/extensions/store-locator/components/store-locator';
import { StoreLocatorLayoutProvider } from '@/extensions/store-locator/context/layout';
import uiStringsSL from '@/extensions/store-locator/temp-ui-string-store-locator';

/**
 * StoreLocatorSheet
 *
 * Sheet container that hosts the store locator experience. It accepts a trigger via
 * `children` and controls open state locally for simplicity.
 *
 * @param children - Trigger element rendered with `SheetTrigger asChild`
 * @returns ReactElement
 *
 * @example
 * <StoreLocatorSheet>
 *   <Button variant="ghost" aria-label="Open Store Locator" />
 * </StoreLocatorSheet>
 */
export default function StoreLocatorSheet({ children }: PropsWithChildren): ReactElement {
    const [open, setOpen] = useState<boolean>(true);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>{children}</SheetTrigger>
            <SheetContent className="md:w-1/3 md:max-w-1/3 p-0">
                <SheetHeader>
                    <SheetTitle>{uiStringsSL.storeLocator.title}</SheetTitle>
                    <SheetDescription>{uiStringsSL.storeLocator.description}</SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-4 pb-4">
                    <StoreLocatorLayoutProvider forceMobile>
                        <StoreLocator />
                    </StoreLocatorLayoutProvider>
                </div>
                <SheetClose />
            </SheetContent>
        </Sheet>
    );
}
