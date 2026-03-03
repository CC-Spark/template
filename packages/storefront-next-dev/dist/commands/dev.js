import { a as printServerInfo, i as printServerConfig, o as printShutdownMessage } from "../logger.js";
import { c as loadEnvFile } from "../utils.js";
import { n as getCommerceCloudApiUrl, r as loadProjectConfig, t as createServer$1 } from "../server.js";
import { t as commonFlags } from "../flags.js";
import { Command, Flags } from "@oclif/core";
import path from "path";
import { createServer } from "vite";

//#region src/lib/dev.ts
/**
* Start the development server with Vite in middleware mode
*/
async function dev(options = {}) {
	const startTime = Date.now();
	const projectDir = path.resolve(options.projectDirectory || process.cwd());
	const port = options.port || 5173;
	process.env.NODE_ENV = process.env.NODE_ENV ?? "development";
	process.env.EXTERNAL_DOMAIN_NAME = process.env.EXTERNAL_DOMAIN_NAME ?? `localhost:${port}`;
	loadEnvFile(projectDir);
	const config = await loadProjectConfig(projectDir);
	const vite = await createServer({
		root: projectDir,
		server: { middlewareMode: true }
	});
	const server = (await createServer$1({
		mode: "development",
		projectDirectory: projectDir,
		config,
		port,
		vite
	})).listen(port, () => {
		printServerInfo("development", port, startTime, projectDir);
		printServerConfig({
			mode: "development",
			port,
			enableProxy: true,
			enableStaticServing: false,
			enableCompression: false,
			proxyPath: config.commerce.api.proxy,
			proxyHost: getCommerceCloudApiUrl(config.commerce.api.shortCode, config.commerce.api.proxyHost),
			shortCode: config.commerce.api.shortCode,
			organizationId: config.commerce.api.organizationId,
			clientId: config.commerce.api.clientId,
			siteId: config.commerce.api.siteId
		});
	});
	["SIGTERM", "SIGINT"].forEach((signal) => {
		process.once(signal, () => {
			printShutdownMessage();
			server?.close(() => {
				vite.close();
				process.exit(0);
			});
		});
	});
}

//#endregion
//#region src/commands/dev.ts
/**
* Dev server command - starts the Vite development server with SSR.
*/
var Dev = class Dev extends Command {
	static description = "Start Vite development server with SSR";
	static examples = ["<%= config.bin %> <%= command.id %>", "<%= config.bin %> <%= command.id %> -d ./my-project -p 3000"];
	static flags = {
		...commonFlags,
		port: Flags.integer({
			char: "p",
			description: "Port number (default: 5173)"
		})
	};
	async run() {
		const { flags } = await this.parse(Dev);
		await dev({
			projectDirectory: flags["project-directory"],
			port: flags.port
		});
	}
};

//#endregion
export { Dev as default };