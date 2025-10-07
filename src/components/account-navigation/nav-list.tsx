import type { ReactElement } from 'react';
import { AccountNavItem } from './nav-item';
import type { LucideIcon } from 'lucide-react';

export interface AccountNavItemData {
    path: string;
    icon: LucideIcon;
    label: string;
    disabled?: boolean;
}

interface AccountNavListProps {
    isMobile?: boolean;
    items: AccountNavItemData[];
}

export function AccountNavList({ isMobile = false, items }: AccountNavListProps): ReactElement {
    return (
        <>
            {items.map((item) => (
                <AccountNavItem key={item.path} item={item} isMobile={isMobile} />
            ))}
            {/* TODO ADD LOGOUT BUTTON */}
        </>
    );
}
