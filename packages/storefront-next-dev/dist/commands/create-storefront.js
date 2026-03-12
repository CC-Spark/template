import { c as warn, n as error } from "../logger.js";
import { t as generateEnvFile } from "../utils.js";
import { a as trimExtensions, i as validateNoCycles, n as resolveDependenciesForMultiple } from "../dependency-utils.js";
import { t as prepareForLocalDev } from "../local-dev-setup.js";
import { Command, Flags } from "@oclif/core";
import { execSync } from "child_process";
import path from "path";
import fs from "fs-extra";
import dotenv from "dotenv";
import prompts from "prompts";

//#region src/create-storefront.ts
const DEFAULT_STOREFRONT = "sfcc-storefront";
const STOREFRONT_NEXT_GITHUB_URL = "https://github.com/SalesforceCommerceCloud/storefront-next-template";
const createStorefront = async (options = {}) => {
	try {
		execSync("git --version", { stdio: "ignore" });
	} catch (e) {
		error(`❌ git isn't installed or found in your PATH. Install git before running this command: ${String(e)}`);
		process.exit(1);
	}
	let storefront = options.name;
	if (!storefront) storefront = (await prompts({
		type: "text",
		name: "storefront",
		message: "🏪 What would you like to name your storefront?\n",
		initial: DEFAULT_STOREFRONT
	})).storefront;
	if (!storefront) {
		error("Storefront name is required.");
		process.exit(1);
	}
	console.log("\n");
	let template = options.template;
	if (!template) {
		template = (await prompts({
			type: "select",
			name: "template",
			message: "📄 Which template would you like to use for your storefront?\n",
			choices: [{
				title: "Salesforce B2C Commerce Retail Storefront",
				value: STOREFRONT_NEXT_GITHUB_URL
			}, {
				title: "A different template (I will provide the Github URL)",
				value: "custom"
			}]
		})).template;
		console.log("\n");
		if (template === "custom") {
			const { githubUrl } = await prompts({
				type: "text",
				name: "githubUrl",
				message: "🌐 What is the Github URL for your template?\n"
			});
			if (!githubUrl) {
				error("Github URL is required.");
				process.exit(1);
			}
			template = githubUrl;
		}
	}
	if (!template) {
		error("Template is required.");
		process.exit(1);
	}
	execSync(`git clone --depth 1 ${template} ${storefront}`);
	const gitDir = path.join(storefront, ".git");
	if (fs.existsSync(gitDir)) fs.rmSync(gitDir, {
		recursive: true,
		force: true
	});
	if (template.startsWith("file://") || options.localPackagesDir) {
		const templatePath = template.replace("file://", "");
		const sourcePackagesDir = options.localPackagesDir || path.dirname(templatePath);
		await prepareForLocalDev({
			projectDirectory: storefront,
			sourcePackagesDir
		});
	}
	console.log("\n");
	if (fs.existsSync(path.join(storefront, "src", "extensions", "config.json"))) {
		const extensionConfigText = fs.readFileSync(path.join(storefront, "src", "extensions", "config.json"), "utf8");
		const extensionConfig = JSON.parse(extensionConfigText);
		if (extensionConfig.extensions) {
			try {
				validateNoCycles(extensionConfig);
			} catch (e) {
				error(`Extension configuration error: ${e.message}`);
				process.exit(1);
			}
			const { selectedExtensions } = await prompts({
				type: "multiselect",
				name: "selectedExtensions",
				message: "🔌 Which extension would you like to enable? (Use arrow keys to select, space to toggle, and enter to confirm.)\n",
				choices: Object.keys(extensionConfig.extensions).map((extension) => ({
					title: `${extensionConfig.extensions[extension].name} - ${extensionConfig.extensions[extension].description}`,
					value: extension,
					selected: extensionConfig.extensions[extension].defaultOn ?? true
				})),
				instructions: false
			});
			const resolvedExtensions = resolveDependenciesForMultiple(selectedExtensions, extensionConfig);
			const selectedSet = new Set(selectedExtensions);
			const autoAdded = resolvedExtensions.filter((ext) => !selectedSet.has(ext));
			if (autoAdded.length > 0) for (const addedExt of autoAdded) {
				const dependentExts = selectedExtensions.filter((selected) => {
					return (extensionConfig.extensions[selected]?.dependencies || []).includes(addedExt) || resolvedExtensions.indexOf(addedExt) < resolvedExtensions.indexOf(selected);
				});
				if (dependentExts.length > 0) {
					const addedName = extensionConfig.extensions[addedExt]?.name || addedExt;
					warn(`${dependentExts.map((ext) => extensionConfig.extensions[ext]?.name || ext).join(", ")} requires ${addedName}. ${addedName} has been automatically added.`);
				}
			}
			const enabledExtensions = Object.fromEntries(resolvedExtensions.map((ext) => [ext, true]));
			trimExtensions(storefront, enabledExtensions, { extensions: extensionConfig.extensions }, options?.verbose || false);
		}
	}
	const configMetaPath = fs.existsSync(path.join(storefront, "config-meta.json")) ? path.join(storefront, "config-meta.json") : path.join(storefront, "src", "config", "config-meta.json");
	const configMeta = JSON.parse(fs.readFileSync(configMetaPath, "utf8"));
	const envDefaultPath = path.join(storefront, ".env.default");
	let envDefaultValues = {};
	if (fs.existsSync(envDefaultPath)) envDefaultValues = dotenv.parse(fs.readFileSync(envDefaultPath, "utf8"));
	console.log("\n⚙️ We will now configure your storefront before it will be ready to run.\n");
	const configOverrides = {};
	for (const config of configMeta.configs) {
		const answer = await prompts({
			type: "text",
			name: config.key,
			message: `What is the value for ${config.name}? (default: ${envDefaultValues[config.key]})\n`,
			initial: envDefaultValues[config.key] ?? ""
		});
		configOverrides[config.key] = answer[config.key];
	}
	generateEnvFile(storefront, configOverrides);
	const BANNER = `
    ╔══════════════════════════════════════════════════════════════════╗
    ║                       CONGRATULATIONS                            ║
    ╚══════════════════════════════════════════════════════════════════╝

        🎉 Congratulations! Your storefront is ready to use! 🎉
        What's next:
        - Navigate to the storefront directory: cd ${storefront}
        - Install dependencies: pnpm install
        - Build the storefront: pnpm run build
        - Run the development server: pnpm run dev
    `;
	console.log(BANNER);
};

//#endregion
//#region src/commands/create-storefront.ts
/**
* Create storefront command - creates a new storefront project from template.
*/
var CreateStorefront = class CreateStorefront extends Command {
	static description = "Create a storefront project";
	static examples = [
		"<%= config.bin %> <%= command.id %>",
		"<%= config.bin %> <%= command.id %> -v",
		"<%= config.bin %> <%= command.id %> -n my-storefront -t https://github.com/org/template",
		"<%= config.bin %> <%= command.id %> -l /path/to/monorepo/packages"
	];
	static flags = {
		verbose: Flags.boolean({
			char: "v",
			description: "Verbose mode",
			default: false
		}),
		name: Flags.string({
			char: "n",
			description: "Storefront project name"
		}),
		template: Flags.string({
			char: "t",
			description: "Template GitHub URL to use for the storefront"
		}),
		"local-packages-dir": Flags.string({
			char: "l",
			description: "Local monorepo packages directory for file:// templates (pre-fills dependency paths)"
		})
	};
	async run() {
		const { flags } = await this.parse(CreateStorefront);
		await createStorefront({
			verbose: flags.verbose,
			name: flags.name,
			template: flags.template,
			localPackagesDir: flags["local-packages-dir"]
		});
	}
};

//#endregion
export { CreateStorefront as default };