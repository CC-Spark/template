import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

//#region src/config/load-config.ts
/**
* Dynamically imports `config.server.ts` from the project root (CWD) and returns
* the full configuration object. This runs at route discovery time under vite-node
* (typegen, dev, build), which handles the TS transformation.
*
* Returns the full config including `metadata`, `runtime`, and `app` sections.
* Callers that only need `app` can destructure: `const { app } = await loadConfig()`.
*
* - If the config file is missing, throws with a clear message.
* - If the config file exists but fails to import, throws with the original error as cause.
*
* @returns The full configuration object.
* @throws If `config.server.ts` is not found or fails to import.
*/
async function loadConfig() {
	const configPath = path.resolve(process.cwd(), "config.server.ts");
	if (!fs.existsSync(configPath)) throw new Error(`[storefront-next-runtime] config.server.ts is required but not found at ${configPath}. Create this file with defineConfig() to configure your storefront application.`);
	try {
		const mod = await import(
			/* @vite-ignore */
			pathToFileURL(configPath).href
);
		return mod.default ?? mod;
	} catch (error) {
		throw new Error(`[storefront-next-runtime] Found config.server.ts at ${configPath} but failed to import it.`, { cause: error });
	}
}

//#endregion
export { loadConfig as t };
//# sourceMappingURL=load-config.js.map