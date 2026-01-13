//#region src/cartridge-services/types.d.ts

interface DeployResult {
  version: string;
}
//#endregion
//#region src/cartridge-services/deploy-cartridge.d.ts
/**
 * Deploy code to Commerce Cloud by uploading, unzipping, and cleaning up
 *
 * This function performs a complete code deployment workflow:
 * 1. Uploads the archive file via WebDAV to the specified cartridge version
 * 2. Unzips the archive on the server
 * 3. Deletes the uploaded archive file
 * 4. Returns the deployed version name
 *
 * @param instance - The Commerce Cloud instance hostname
 * @param codeVersionName - The target code version name
 * @param sourceDir - The local directory containing the source files to deploy
 * @param basicAuth - Base64 encoded basic authentication credentials
 * @returns Promise resolving to deployment result with the version name
 * @throws Error if any step of the deployment process fails
 */
declare function deployCode(instance: string, codeVersionName: string, sourceDir: string, basicAuth: string): Promise<DeployResult>;
//#endregion
//#region src/cartridge-services/generate-cartridge.d.ts
/**
 * Options for generateMetadata function
 */
interface GenerateMetadataOptions {
  /**
   * Optional array of specific file paths to process.
   * If provided, only these files will be processed and existing cartridge files will NOT be deleted.
   * If omitted, the entire src/ directory will be scanned and all existing cartridge files will be deleted first.
   */
  filePaths?: string[];
  /**
   * Whether to run ESLint with --fix on generated JSON files to format them according to project settings.
   * Defaults to true.
   */
  lintFix?: boolean;
  /**
   * If true, scans files and reports what would be generated without actually writing any files or deleting directories.
   * Defaults to false.
   */
  dryRun?: boolean;
}
/**
 * Result returned by generateMetadata function
 */
interface GenerateMetadataResult {
  componentsGenerated: number;
  pageTypesGenerated: number;
  aspectsGenerated: number;
  totalFiles: number;
}
declare function generateMetadata(projectDirectory: string, metadataDirectory: string, options?: GenerateMetadataOptions): Promise<GenerateMetadataResult>;
//#endregion
export { type DeployResult, type GenerateMetadataOptions, type GenerateMetadataResult, deployCode, generateMetadata };
//# sourceMappingURL=index.d.ts.map