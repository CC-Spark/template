const MRT_BUNDLE_TYPE_SSR = 'ssr' as const;
const MRT_BUNDLE_TYPE_STREAMING = 'streamingHandler' as const;
export type MrtBundleType = typeof MRT_BUNDLE_TYPE_SSR | typeof MRT_BUNDLE_TYPE_STREAMING;
/**
 * Gets the MRT entry file for the given mode
 * @param mode - The mode to get the MRT entry file for
 * @returns The MRT entry file for the given mode
 */
export const getMrtEntryFile = (mode: string): MrtBundleType => {
    // TODO: Move the MRT_BUNDLE_TYPE env var to a command line option with sfnext
    const disableStreaming = process.env.MRT_BUNDLE_TYPE === MRT_BUNDLE_TYPE_SSR || mode !== 'production';
    return disableStreaming ? MRT_BUNDLE_TYPE_SSR : MRT_BUNDLE_TYPE_STREAMING;
};
