//#region src/configs/react-router.config.ts
/**
* Storefront Next preset for React Router configuration.
* This preset enforces standard configuration for SFCC Storefront Next applications.
* Users cannot override these values - they will be validated and an error will be thrown if modified.
*/
function storefrontNextPreset() {
	const sfwFalconInstance = process.env.SFW_FALCON_INSTANCE;
	const presetConfig = {
		appDirectory: "./src",
		buildDirectory: "build",
		routeDiscovery: { mode: "initial" },
		serverModuleFormat: "cjs",
		ssr: true,
		future: {
			v8_middleware: true,
			v8_viteEnvironmentApi: true
		},
		...sfwFalconInstance && { allowedActionOrigins: [`*.dataplane.cvw-dataplane-test.${sfwFalconInstance}.aws.sfdc.cl`] }
	};
	return {
		name: "storefront-next-preset",
		reactRouterConfig: () => presetConfig,
		reactRouterConfigResolved: ({ reactRouterConfig }) => {
			const errors = [];
			if (reactRouterConfig.routeDiscovery?.mode !== presetConfig.routeDiscovery.mode) errors.push(`routeDiscovery.mode: expected "${presetConfig.routeDiscovery.mode}", got "${reactRouterConfig.routeDiscovery?.mode}"`);
			if (reactRouterConfig.serverModuleFormat !== presetConfig.serverModuleFormat) errors.push(`serverModuleFormat: expected "${presetConfig.serverModuleFormat}", got "${reactRouterConfig.serverModuleFormat}"`);
			if (reactRouterConfig.ssr !== presetConfig.ssr) errors.push(`ssr: expected ${presetConfig.ssr}, got ${reactRouterConfig.ssr}`);
			if (reactRouterConfig.future?.v8_middleware !== presetConfig.future.v8_middleware) errors.push(`future.v8_middleware: expected ${presetConfig.future.v8_middleware}, got ${reactRouterConfig.future?.v8_middleware}`);
			if (reactRouterConfig.future?.v8_viteEnvironmentApi !== presetConfig.future.v8_viteEnvironmentApi) errors.push(`future.v8_viteEnvironmentApi: expected ${presetConfig.future.v8_viteEnvironmentApi}, got ${reactRouterConfig.future?.v8_viteEnvironmentApi}`);
			if (errors.length > 0) throw new Error(`Storefront Next preset configuration was overridden. The following values must not be modified:\n${errors.map((e) => `  - ${e}`).join("\n")}`);
		}
	};
}

//#endregion
export { storefrontNextPreset };
//# sourceMappingURL=react-router.config.js.map