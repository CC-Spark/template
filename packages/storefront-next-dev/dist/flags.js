import { Flags } from "@oclif/core";

//#region src/flags.ts
const commonFlags = { "project-directory": Flags.string({
	char: "d",
	description: "Project directory",
	default: process.cwd()
}) };

//#endregion
export { commonFlags as t };