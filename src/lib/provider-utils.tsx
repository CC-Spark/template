import { type ComponentType, type ReactElement, type ReactNode } from 'react';

type ProviderProps = { children: ReactNode };
type ProviderComponent = ComponentType<ProviderProps>;

/**
 * Higher-order component that applies multiple providers to a component.
 *
 * Providers are applied in the order they are passed, with the first provider
 * being the outermost and the last being the innermost.
 *
 * @param providers - Array of provider components to apply
 * @returns A higher-order component that wraps a component with all providers
 *
 * @example
 * ```tsx
 * const withAppProviders = applyProviders(
 *   ThemeProvider,
 *   AuthProvider,
 *   I18nProvider,
 *   AnalyticsProvider
 * );
 *
 * const AppWithProviders = withAppProviders(App);
 * ```
 */
export function applyProviders(...providers: ProviderComponent[]) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (Component: ComponentType<any>) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (props: any): ReactElement => {
            return providers.reduceRight((acc, Provider) => <Provider>{acc}</Provider>, <Component {...props} />);
        };
    };
}
