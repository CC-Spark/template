import { i as SFNEXT_BASE_CARTRIDGE_OUTPUT_DIR, r as SFNEXT_BASE_CARTRIDGE_NAME, t as CARTRIDGES_BASE_DIR } from "../config.js";
import path from "path";
import fs from "fs-extra";
import { InstanceCommand } from "@salesforce/b2c-tooling-sdk/cli";
import { uploadCartridges } from "@salesforce/b2c-tooling-sdk/operations/code";

//#region src/commands/deploy-cartridge.ts
/**
* Deploy cartridge command - deploys the Page Designer metadata cartridge to a B2C instance.
*
* Inherits all B2C instance flags from InstanceCommand:
* - --server/-s: B2C instance hostname (env: SFCC_SERVER)
* - --code-version/-v: Code version (env: SFCC_CODE_VERSION)
* - --username/-u: Basic auth username (env: SFCC_USERNAME)
* - --password/-p: Basic auth password (env: SFCC_PASSWORD)
* - --client-id: OAuth client ID (env: SFCC_CLIENT_ID)
* - --client-secret: OAuth client secret (env: SFCC_CLIENT_SECRET)
* - --webdav-server: Separate WebDAV hostname (env: SFCC_WEBDAV_SERVER)
* - --config: Path to dw.json config file (env: SFCC_CONFIG)
* - --instance/-i: Named instance from config (env: SFCC_INSTANCE)
*/
var Deploy = class Deploy extends InstanceCommand {
	static description = "Deploy cartridge to B2C Commerce Cloud instance";
	static examples = [
		"<%= config.bin %> <%= command.id %>",
		"<%= config.bin %> <%= command.id %> --project-directory ./my-project",
		"<%= config.bin %> <%= command.id %> -s my-sandbox.dx.commercecloud.salesforce.com",
		"<%= config.bin %> <%= command.id %> --code-version staging"
	];
	static flags = { ...InstanceCommand.baseFlags };
	async run() {
		const { flags } = await this.parse(Deploy);
		const projectDirectory = flags["project-directory"] || process.cwd();
		if (!fs.existsSync(projectDirectory)) this.error(`Project directory doesn't exist: ${projectDirectory}`);
		const metadataDir = path.join(projectDirectory, CARTRIDGES_BASE_DIR, SFNEXT_BASE_CARTRIDGE_OUTPUT_DIR);
		if (!fs.existsSync(metadataDir)) this.error(`Metadata directory doesn't exist: ${metadataDir}. Run 'sfnext generate-cartridge' first.`);
		this.requireServer();
		this.requireCodeVersion();
		this.requireWebDavCredentials();
		const cartridges = [{
			name: SFNEXT_BASE_CARTRIDGE_NAME,
			src: path.join(projectDirectory, CARTRIDGES_BASE_DIR, SFNEXT_BASE_CARTRIDGE_NAME),
			dest: SFNEXT_BASE_CARTRIDGE_NAME
		}];
		this.log(`Deploying cartridge "${SFNEXT_BASE_CARTRIDGE_NAME}" to code version "${this.resolvedConfig.values.codeVersion}"...`);
		await uploadCartridges(this.instance, cartridges);
		this.log(`Code deployed to version "${this.resolvedConfig.values.codeVersion}" successfully!`);
	}
};

//#endregion
export { Deploy as default };