import os from "os";
import chalk from "chalk";
import { createRequire } from "module";

//#region package.json
var version = "0.2.0-dev";

//#endregion
//#region src/utils/logger.ts
/**
* Get the local network IPv4 address
*/
function getNetworkAddress() {
	const interfaces = os.networkInterfaces();
	for (const name of Object.keys(interfaces)) {
		const iface = interfaces[name];
		if (!iface) continue;
		for (const alias of iface) if (alias.family === "IPv4" && !alias.internal) return alias.address;
	}
}
/**
* Get the version of a package from the project's package.json
*/
function getPackageVersion(packageName, projectDir) {
	try {
		const require = createRequire(import.meta.url);
		return require(require.resolve(`${packageName}/package.json`, { paths: [projectDir] })).version;
	} catch {
		return "unknown";
	}
}
/**
* Logger utilities
*/
const colors = {
	warn: "yellow",
	error: "red",
	success: "cyan",
	info: "green",
	debug: "gray"
};
const fancyLog = (level, msg) => {
	const colorFn = chalk[colors[level]];
	console.log(`${colorFn(level)}: ${msg}`);
};
const info = (msg) => fancyLog("info", msg);
const success = (msg) => fancyLog("success", msg);
const warn = (msg) => fancyLog("warn", msg);
const error = (msg) => fancyLog("error", msg);
const debug = (msg, data) => {
	if (process.env.DEBUG || process.env.NODE_ENV !== "production") {
		fancyLog("debug", msg);
		if (data) console.log(data);
	}
};
/**
* Print the server information banner with URLs and versions
*/
function printServerInfo(mode, port, startTime, projectDir) {
	const elapsed = Date.now() - startTime;
	const sfnextVersion = version;
	const reactVersion = getPackageVersion("react", projectDir);
	const reactRouterVersion = getPackageVersion("react-router", projectDir);
	const modeLabel = mode === "development" ? "Development Mode" : "Preview Mode";
	console.log();
	console.log(`  ${chalk.cyan.bold("⚡ SFCC Storefront Next")} ${chalk.dim(`v${sfnextVersion}`)}`);
	console.log(`  ${chalk.green.bold(modeLabel)}`);
	console.log();
	console.log(`  ${chalk.dim("react")} ${chalk.green(`v${reactVersion}`)} ${chalk.dim("│")} ${chalk.dim("react-router")} ${chalk.green(`v${reactRouterVersion}`)} ${chalk.dim("│")} ${chalk.green(`ready in ${elapsed}ms`)}`);
	console.log();
}
/**
* Print server configuration details (proxy, static, etc.)
*/
function printServerConfig(config) {
	const { port, enableProxy, enableStaticServing, enableCompression, proxyPath, proxyHost, shortCode, organizationId, clientId, siteId } = config;
	console.log(`  ${chalk.bold("Environment Configuration:")}`);
	if (enableProxy && proxyPath && proxyHost && shortCode) {
		console.log(`    ${chalk.green("✓")} ${chalk.bold("Proxy:")} ${chalk.cyan(`localhost:${port}${proxyPath}`)} ${chalk.dim("→")} ${chalk.cyan(proxyHost)}`);
		console.log(`      ${chalk.dim("Short Code:     ")} ${chalk.dim(shortCode)}`);
		if (organizationId) console.log(`      ${chalk.dim("Organization ID:")} ${chalk.dim(organizationId)}`);
		if (clientId) console.log(`      ${chalk.dim("Client ID:      ")} ${chalk.dim(clientId)}`);
		if (siteId) console.log(`      ${chalk.dim("Site ID:        ")} ${chalk.dim(siteId)}`);
	} else console.log(`    ${chalk.gray("○")} ${chalk.bold("Proxy:           ")} ${chalk.dim("disabled")}`);
	if (enableStaticServing) console.log(`    ${chalk.green("✓")} ${chalk.bold("Static:          ")} ${chalk.dim("enabled")}`);
	if (enableCompression) console.log(`    ${chalk.green("✓")} ${chalk.bold("Compression:     ")} ${chalk.dim("enabled")}`);
	const localUrl = `http://localhost:${port}`;
	const networkAddress = process.env.SHOW_NETWORK === "true" ? getNetworkAddress() : void 0;
	const networkUrl = networkAddress ? `http://${networkAddress}:${port}` : void 0;
	console.log();
	console.log(`  ${chalk.green("➜")}  ${chalk.bold("Local:  ")} ${chalk.cyan(localUrl)}`);
	if (networkUrl) console.log(`  ${chalk.green("➜")}  ${chalk.bold("Network:")} ${chalk.cyan(networkUrl)}`);
	console.log();
	console.log(`  ${chalk.dim("Press")} ${chalk.bold("Ctrl+C")} ${chalk.dim("to stop the server")}`);
	console.log();
}
/**
* Print shutdown message
*/
function printShutdownMessage() {
	console.log(`\n  ${chalk.yellow("⚡")} ${chalk.dim("Server shutting down...")}\n`);
}

//#endregion
export { printServerInfo as a, warn as c, printServerConfig as i, error as n, printShutdownMessage as o, info as r, success as s, debug as t };