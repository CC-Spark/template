import { B2CPluginManager } from "@salesforce/b2c-tooling-sdk/plugins";
import { getLogger } from "@salesforce/b2c-tooling-sdk/logging";

//#region src/cli-plugins.ts
let manager;
let initialized = false;
/**
* Initializes the b2c-cli plugin system.
*
* Discovers plugins installed via `b2c plugins:install`, invokes their hooks,
* and registers middleware and config sources with the global registries.
* All failures are non-fatal — the CLI continues to work without plugin support.
*/
async function initializePlugins() {
	if (initialized) return;
	initialized = true;
	try {
		const logger = getLogger();
		manager = new B2CPluginManager({ logger });
		await manager.initialize();
		manager.applyMiddleware();
		if (manager.pluginNames.length > 0) logger.info(`Loaded ${manager.pluginNames.length} plugin(s): ${manager.pluginNames.join(", ")}`);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		try {
			getLogger().warn(`Plugin initialization failed: ${message}`);
		} catch {}
		manager = void 0;
	}
}

//#endregion
//#region src/hooks/init.ts
/**
* Oclif init hook — runs before any command executes.
*
* Discovers b2c-cli plugins (installed via `b2c plugins:install`) and registers
* their middleware and config sources with the global registries. This ensures
* all sfnext commands automatically benefit from installed b2c-cli plugins.
*/
const hook = async function() {
	await initializePlugins();
};
var init_default = hook;

//#endregion
export { init_default as default };