import { t as commonFlags } from "../flags.js";
import { i as SFNEXT_BASE_CARTRIDGE_OUTPUT_DIR, t as CARTRIDGES_BASE_DIR } from "../config.js";
import { t as generateMetadata } from "../generate-cartridge.js";
import { Command } from "@oclif/core";
import path from "path";
import fs from "fs-extra";

//#region src/commands/generate-cartridge.ts
/**
* Generate cartridge metadata command.
*
* Scans the project for decorated components and generates Page Designer
* metadata files in the cartridge directory.
*/
var Generate = class Generate extends Command {
	static description = "Generate Page Designer component metadata from decorated components";
	static examples = ["<%= config.bin %> <%= command.id %>", "<%= config.bin %> <%= command.id %> -d ./my-project"];
	static flags = { ...commonFlags };
	async run() {
		const { flags } = await this.parse(Generate);
		const projectDirectory = flags["project-directory"];
		if (!fs.existsSync(projectDirectory)) this.error(`Project directory doesn't exist: ${projectDirectory}`);
		const metadataDir = path.join(projectDirectory, CARTRIDGES_BASE_DIR, SFNEXT_BASE_CARTRIDGE_OUTPUT_DIR);
		if (!fs.existsSync(metadataDir)) {
			this.log(`Creating metadata directory: ${metadataDir}`);
			fs.mkdirSync(metadataDir, { recursive: true });
		}
		this.log("Generating Page Designer metadata...");
		await generateMetadata(projectDirectory, metadataDir);
		this.log("Page Designer metadata generated successfully!");
	}
};

//#endregion
export { Generate as default };