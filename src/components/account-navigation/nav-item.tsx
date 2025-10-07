import type { ReactElement } from 'react';
import { NavLink } from 'react-router';
import type { LucideIcon } from 'lucide-react';
import { Button } from '../ui/button';

interface AccountNavItemProps {
    item: {
        path: string;
        icon: LucideIcon;
        label: string;
        disabled?: boolean;
    };
    isMobile?: boolean;
}

export function AccountNavItem({ item, isMobile = false }: AccountNavItemProps): ReactElement {
    const Icon = item.icon;
    const baseClasses = 'w-full px-3 py-2 text-left font-medium rounded-md flex items-center gap-2';
    const mobileClasses = `${baseClasses} border`;
    const desktopClasses = baseClasses;
    const disabledClasses = 'opacity-50 cursor-not-allowed pointer-events-none';

    if (item.disabled) {
        return (
            <Button
                className={`${isMobile ? mobileClasses : desktopClasses} ${disabledClasses} text-muted-foreground`}
                disabled
                variant="ghost"
                size="sm">
                <Icon data-testid={`${item.label}-icon`} className="h-5 w-5" />
                {item.label}
            </Button>
        );
    }

    return (
        <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => {
                const containerClasses = isMobile ? mobileClasses : desktopClasses;
                const activeClasses = isActive
                    ? isMobile
                        ? 'bg-background text-foreground'
                        : 'bg-muted/50 text-foreground'
                    : isMobile
                      ? 'bg-transparent text-muted-foreground hover:text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/30';

                return `${containerClasses} ${activeClasses}`;
            }}>
            <Icon data-testid={`${item.label}-icon`} className="h-5 w-5" />
            {item.label}
        </NavLink>
    );
}
