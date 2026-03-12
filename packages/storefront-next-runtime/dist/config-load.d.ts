import { t as BaseConfig } from "./schema.js";

//#region src/config/load-config.d.ts

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
declare function loadConfig<T extends BaseConfig = BaseConfig>(): Promise<T>;
//#endregion
export { loadConfig };
//# sourceMappingURL=config-load.d.ts.map