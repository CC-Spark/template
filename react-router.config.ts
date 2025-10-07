import type { Config } from '@react-router/dev/config';

export default {
    appDirectory: './src',
    buildDirectory: 'build',
    // Static client manifest
    routeDiscovery: { mode: 'initial' },
    serverModuleFormat: 'cjs',
    ssr: true,
    future: {
        unstable_middleware: true,
        unstable_viteEnvironmentApi: true,
    },
} satisfies Config;
