import type { Meta } from '@storybook/react-vite';
import { useEffect, useRef, type ReactElement, type ReactNode } from 'react';
import { action } from 'storybook/actions';
import { Toaster } from './index';

function ActionLogger({ children }: { children: ReactNode }): ReactElement {
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const logShow = action('toast-show');
        const logHover = action('toast-button-hover');
        const logDismiss = action('toast-dismiss');
        const logActionClick = action('toast-action');

        const resolveKind = (text: string): { kind: string; position?: string } => {
            const t = text.toLowerCase();
            if (t.includes('promise')) return { kind: 'promise' };
            if (t.includes('fire 3')) return { kind: 'multiple' };
            if (t.includes('top-right')) return { kind: 'default', position: 'top-right' };
            if (t.includes('success')) return { kind: 'success' };
            if (t.includes('error')) return { kind: 'error' };
            if (t.includes('default') || t.includes('show toast')) return { kind: 'default' };
            return { kind: 'unknown' };
        };

        const handleClick = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            const btn = target.closest('button');
            if (!btn) return;

            const label = btn.getAttribute('aria-label') || btn.textContent?.trim() || '';
            // Toast instances: detect action/dismiss by common labels
            if (/^retry$/i.test(label)) {
                logActionClick({ label: 'Retry' });
                return;
            }
            if (/^close$/i.test(label)) {
                logDismiss({ label: 'Close' });
                return;
            }

            // Demo trigger buttons: prevent showing real toasts, just log
            const { kind, position } = resolveKind(label);
            if (kind !== 'unknown') {
                logShow({ kind, position });
            }
        };

        const handleMouseOver = (event: Event) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;
            const btn = target.closest('button');
            if (!btn) return;
            const label = btn.getAttribute('aria-label') || btn.textContent?.trim() || '';
            if (label) {
                logHover({ label });
            }
        };

        root.addEventListener('click', handleClick, true);
        root.addEventListener('mouseover', handleMouseOver, true);
        return () => {
            root.removeEventListener('click', handleClick, true);
            root.removeEventListener('mouseover', handleMouseOver, true);
        };
    }, []);

    return <div ref={containerRef}>{children}</div>;
}

const meta: Meta<typeof Toaster> = {
    title: 'FEEDBACK/Toast',
    component: Toaster,
    tags: ['autodocs', 'interaction'],
    parameters: {
        docs: {
            description: {
                component: `
Toast notifications powered by sonner. Includes success, error, and info variants.
                `,
            },
        },
    },
    decorators: [
        (Story) => (
            <ActionLogger>
                <div className="min-h-[40vh] bg-background p-6">
                    <Story />
                </div>
            </ActionLogger>
        ),
    ],
};

export default meta;
