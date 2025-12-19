import fs from "fs";
import path, { basename, extname, join, posix, resolve } from "path";
import archiver from "archiver";
import { access, mkdir, readFile, readdir, rm, writeFile } from "fs/promises";
import { Node, Project } from "ts-morph";
import { execSync } from "child_process";

//#region src/cartridge-services/types.ts
const WEBDAV_BASE = "/on/demandware.servlet/webdav/Sites";
const CARTRIDGES_PATH = "Cartridges";
const HTTP_METHODS = {
	PUT: "PUT",
	POST: "POST",
	DELETE: "DELETE"
};
const CONTENT_TYPES = {
	APPLICATION_ZIP: "application/zip",
	APPLICATION_FORM_URLENCODED: "application/x-www-form-urlencoded",
	APPLICATION_JSON: "application/json"
};
const WEBDAV_OPERATIONS = {
	UNZIP: "UNZIP",
	TARGET_CARTRIDGES: "cartridges"
};

//#endregion
//#region src/cartridge-services/sfcc-client.ts
/**
* SFCC API client utilities for Commerce Cloud requests
* Handles SSL, authentication, and network requests for WebDAV and OCAPI
*/
/**
* Create HTTP request options for WebDAV operations (file upload/download)
*
* @param instance - The Commerce Cloud instance hostname
* @param path - The WebDAV path (e.g., '/cartridges')
* @param basicAuth - Base64 encoded basic authentication credentials (required)
* @param method - HTTP method (PUT, DELETE, UNZIP, etc.)
* @param formData - Optional form data for the request
* @returns Configured HTTP request options for WebDAV operations
*/
function getWebdavOptions(instance, path$1, basicAuth, method, formData) {
	const endpoint = `${WEBDAV_BASE}/${path$1}`;
	return {
		baseUrl: `https://${instance}`,
		uri: endpoint,
		auth: { basic: basicAuth },
		method,
		...formData && { form: formData }
	};
}
/**
* Check if an HTTP response indicates an authentication error and throw if so
*
* @param response - The HTTP response to check
* @throws Error with authentication message if status code is 401
*/
function checkAuthenticationError(response) {
	if (response.statusCode === 401) throw new Error("Authentication failed. Please login again.");
}
/**
* Execute an HTTP request using the native fetch API with default SSL validation
*
* This function handles general HTTP requests and does not automatically set Content-Type headers.
* Callers must set the appropriate Content-Type header in opts.headers based on their body type
*
* @param opts - HTTP request configuration including URL, method, headers, and body
* @returns Promise resolving to an object containing the HTTP response and parsed body
* @throws Error if the HTTP request fails or cannot be completed
*/
async function makeRequest(opts) {
	const url = opts.uri;
	const fetchOptions = {
		...opts,
		headers: {
			Authorization: `Basic ${opts.auth.basic}`,
			...opts.headers
		}
	};
	if (opts.form) {
		const formData = new URLSearchParams();
		Object.entries(opts.form).forEach(([key, value]) => {
			formData.append(key, String(value));
		});
		fetchOptions.body = formData;
		fetchOptions.headers = {
			...fetchOptions.headers,
			"Content-Type": CONTENT_TYPES.APPLICATION_FORM_URLENCODED
		};
	}
	try {
		const response = await fetch(url, fetchOptions);
		const body = response.headers.get("content-type")?.includes(CONTENT_TYPES.APPLICATION_JSON) ? await response.json() : await response.text();
		const headers = {};
		response.headers.forEach((value, key) => {
			headers[key] = value;
		});
		return {
			response: {
				statusCode: response.status,
				statusMessage: response.statusText,
				headers
			},
			body
		};
	} catch (error) {
		throw new Error(`HTTP request failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}

//#endregion
//#region src/cartridge-services/validation.ts
/**
* Input validation utilities for cartridge services
* Validates parameters before calling core business logic functions
*/
/**
* Validation error class for cartridge service parameter validation
*/
var ValidationError = class extends Error {
	constructor(message) {
		super(message);
		this.name = "ValidationError";
	}
};
/**
* Validate Commerce Cloud instance hostname
*
* @param instance - The instance hostname to validate
* @throws ValidationError if instance is invalid
*/
function validateInstance(instance) {
	if (!instance || typeof instance !== "string") throw new ValidationError("Instance parameter is required and must be a string");
	if (instance.trim().length === 0) throw new ValidationError("Instance parameter cannot be empty");
	if (!instance.includes(".")) throw new ValidationError("Parameter instance must be a valid domain name");
}
/**
* Validate cartridge file (must be a ZIP file)
*
* @param cartridgePath - The cartridge file path to validate
* @throws ValidationError if cartridge is invalid
*/
function validateCartridgePath(cartridgePath) {
	if (!cartridgePath || typeof cartridgePath !== "string") throw new ValidationError("cartridge parameter is required and must be a string");
	if (cartridgePath.trim().length === 0) throw new ValidationError("cartridge parameter cannot be empty");
	const ext = extname(cartridgePath).toLowerCase();
	if (ext !== "") throw new ValidationError(`cartridge must be a directory, got: ${ext}`);
}
/**
* Validate Basic Auth credentials
*
* @param basicAuth - The base64 encoded basic auth credentials to validate
* @throws ValidationError if credentials are invalid
*/
function validateBasicAuth(basicAuth) {
	if (!basicAuth || typeof basicAuth !== "string") throw new ValidationError("Basic auth credentials parameter is required and must be a string");
	if (basicAuth.trim().length === 0) throw new ValidationError("Basic auth credentials parameter cannot be empty");
	if (basicAuth.length < 10) throw new ValidationError("Basic auth credentials appear to be too short to be valid");
}
/**
* Validate code version name
*
* @param version - The code version name to validate
* @throws ValidationError if version is invalid
*/
function validateVersion(version) {
	if (!version || typeof version !== "string") throw new ValidationError("Version parameter is required and must be a string");
	if (version.trim().length === 0) throw new ValidationError("Version parameter cannot be empty");
	if (!/^[a-zA-Z0-9._-]+$/.test(version)) throw new ValidationError("Version parameter contains invalid characters. Only alphanumeric, dots, hyphens, and underscores are allowed");
}
/**
* Validate WebDAV path
*
* @param webdavPath - The WebDAV path to validate
* @throws ValidationError if path is invalid
*/
function validateWebdavPath(webdavPath) {
	if (!webdavPath || typeof webdavPath !== "string") throw new ValidationError("WebDAV path parameter is required and must be a string");
	if (!webdavPath.startsWith("/")) throw new ValidationError("WebDAV path must start with a forward slash");
}
/**
* Validate all parameters for deployCode function
*
* @param instance - Commerce Cloud instance hostname
* @param codeVersionName - Target code version name
* @param cartridgeDirectoryPath - Path to the source directory
* @param basicAuth - Base64 encoded basic auth credentials
* @param cartridgeWebDevPath - WebDAV path for cartridge deployment
* @throws ValidationError if any parameter is invalid
*/
function validateDeployCodeParams(instance, codeVersionName, cartridgeDirectoryPath, basicAuth, cartridgeWebDevPath) {
	validateInstance(instance);
	validateVersion(codeVersionName);
	validateCartridgePath(cartridgeDirectoryPath);
	validateBasicAuth(basicAuth);
	validateWebdavPath(cartridgeWebDevPath);
}

//#endregion
//#region src/cartridge-services/deploy-cartridge.ts
/**
* Core cartridge business logic
* Contains the actual implementation without validation
*/
/**
* Extract the filename (including extension) from a file path
*
* @param filePath - The full path to the file
* @returns The filename portion of the path (e.g., 'archive.zip' from '/path/to/archive.zip')
*/
function getFilename(filePath) {
	return path.basename(filePath);
}
/**
* Create a ZIP cartridge from a directory
*
* @param sourceDir - The directory to zip
* @param outputPath - The output ZIP file path (can be same as sourceDir)
* @returns Promise resolving when the ZIP file is created
*/
async function zipCartridge(sourceDir, outputPath) {
	const archive = archiver("zip", { zlib: { level: 9 } });
	const output = fs.createWriteStream(outputPath);
	archive.pipe(output);
	archive.directory(sourceDir, false);
	await archive.finalize();
}
/**
* Build the WebDAV endpoint URL for a file
*
* @param instance - The Commerce Cloud instance hostname
* @param path - The WebDAV path (e.g., 'Cartridges/local_metadata')
* @param file - The local file path (filename will be extracted)
* @returns The complete WebDAV endpoint URL
*/
function buildWebdavEndpoint(instance, webdavPath, file) {
	return `https://${instance}${WEBDAV_BASE}/${webdavPath}/${getFilename(file)}`;
}
/**
* Unzip an uploaded archive file on Commerce Cloud via WebDAV
*
* @param instance - The Commerce Cloud instance hostname
* @param path - The WebDAV path where the file was uploaded
* @param file - The local file path (used to determine the remote filename)
* @param basicAuth - Base64 encoded basic authentication credentials
* @returns Promise resolving to HTTP response and body from the unzip operation
*/
async function unzip(instance, webdavPath, file, basicAuth) {
	const endpoint = buildWebdavEndpoint(instance, webdavPath, file);
	const opts = getWebdavOptions(instance, webdavPath, basicAuth, HTTP_METHODS.POST, {
		method: WEBDAV_OPERATIONS.UNZIP,
		target: WEBDAV_OPERATIONS.TARGET_CARTRIDGES
	});
	opts.uri = endpoint;
	const result = await makeRequest(opts);
	checkAuthenticationError(result.response);
	return result;
}
/**
* Delete a file from Commerce Cloud via WebDAV
*
* @param instance - The Commerce Cloud instance hostname
* @param path - The WebDAV path where the file is located
* @param file - The local file path (used to determine the remote filename)
* @param basicAuth - Base64 encoded basic authentication credentials
* @returns Promise resolving to HTTP response and body from the delete operation
*/
async function deleteFile(instance, webdavPath, file, basicAuth) {
	const endpoint = buildWebdavEndpoint(instance, webdavPath, file);
	const opts = getWebdavOptions(instance, webdavPath, basicAuth, HTTP_METHODS.DELETE);
	opts.uri = endpoint;
	const result = await makeRequest(opts);
	checkAuthenticationError(result.response);
	return result;
}
/**
* Upload a file to a specific cartridge version on Commerce Cloud via WebDAV (internal function)
*
* @param instance - The Commerce Cloud instance hostname
* @param codeVersionName - The target code version name
* @param filePath - The local file path to upload
* @param basicAuth - Base64 encoded basic authentication credentials
* @returns Promise resolving to HTTP response and body from the upload operation
*/
async function postFile(instance, codeVersionName, filePath, basicAuth) {
	const targetPath = `${CARTRIDGES_PATH}/${codeVersionName}`;
	try {
		const endpoint = buildWebdavEndpoint(instance, targetPath, filePath);
		const opts = getWebdavOptions(instance, targetPath, basicAuth, HTTP_METHODS.PUT);
		opts.uri = endpoint;
		opts.body = fs.createReadStream(filePath);
		opts.duplex = "half";
		opts.headers = {
			...opts.headers,
			"Content-Type": CONTENT_TYPES.APPLICATION_ZIP
		};
		const result = await makeRequest(opts);
		checkAuthenticationError(result.response);
		if (![
			200,
			201,
			204
		].includes(result.response.statusCode)) throw new Error(`Post file "${filePath}" failed: ${result.response.statusCode} (${result.response.statusMessage})`);
		return result;
	} catch (error) {
		throw new Error(`Post file "${filePath}" failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}
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
async function deployCode(instance, codeVersionName, sourceDir, basicAuth) {
	validateDeployCodeParams(instance, codeVersionName, sourceDir, basicAuth, `/${CARTRIDGES_PATH}/${codeVersionName}/cartridges`);
	const tempZipPath = path.join(path.dirname(sourceDir), `metadata-${Date.now()}.zip`);
	try {
		await zipCartridge(sourceDir, tempZipPath);
		const file = path.basename(tempZipPath);
		await postFile(instance, codeVersionName, tempZipPath, basicAuth);
		const unzipResult = await unzip(instance, `${CARTRIDGES_PATH}/${codeVersionName}`, file, basicAuth);
		if (![
			200,
			201,
			202
		].includes(unzipResult.response.statusCode)) throw new Error(`Deploy code ${file} failed (unzip step): ${unzipResult.response.statusCode} (${unzipResult.response.statusMessage})`);
		const deleteResult = await deleteFile(instance, `${CARTRIDGES_PATH}/${codeVersionName}`, file, basicAuth);
		if (![200, 204].includes(deleteResult.response.statusCode)) throw new Error(`Delete ZIP file ${file} after deployment failed (deleteFile step): ${deleteResult.response.statusCode} (${deleteResult.response.statusMessage})`);
		return { version: getFilename(file).replace(".zip", "") };
	} catch (error) {
		if (error instanceof Error) throw error;
		throw new Error(`Deploy code ${sourceDir} failed: ${String(error)}`);
	} finally {
		if (fs.existsSync(tempZipPath)) fs.unlinkSync(tempZipPath);
	}
}

//#endregion
//#region src/cartridge-services/generate-cartridge.ts
const SKIP_DIRECTORIES = [
	"build",
	"dist",
	"node_modules",
	".git",
	".next",
	"coverage"
];
const DEFAULT_COMPONENT_GROUP = "odyssey_base";
const ARCH_TYPE_HEADLESS = "headless";
const VALID_ATTRIBUTE_TYPES = [
	"string",
	"text",
	"markup",
	"integer",
	"boolean",
	"product",
	"category",
	"file",
	"page",
	"image",
	"url",
	"enum",
	"custom",
	"cms_record"
];
const TYPE_MAPPING = {
	String: "string",
	string: "string",
	Number: "integer",
	number: "integer",
	Boolean: "boolean",
	boolean: "boolean",
	Date: "string",
	URL: "url",
	CMSRecord: "cms_record"
};
function resolveAttributeType(decoratorType, tsMorphType, fieldName) {
	if (decoratorType) {
		if (!VALID_ATTRIBUTE_TYPES.includes(decoratorType)) {
			console.error(`Error: Invalid attribute type '${decoratorType}' for field '${fieldName || "unknown"}'. Valid types are: ${VALID_ATTRIBUTE_TYPES.join(", ")}`);
			process.exit(1);
		}
		return decoratorType;
	}
	if (tsMorphType && TYPE_MAPPING[tsMorphType]) return TYPE_MAPPING[tsMorphType];
	return "string";
}
function toHumanReadableName(fieldName) {
	return fieldName.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase()).trim();
}
function toCamelCaseFileName(name) {
	if (!/[\s-]/.test(name)) return name;
	return name.split(/[\s-]+/).map((word, index) => {
		if (index === 0) return word.toLowerCase();
		return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
	}).join("");
}
function getTypeFromTsMorph(property, _sourceFile) {
	try {
		const typeNode = property.getTypeNode();
		if (typeNode) return typeNode.getText().split("|")[0].split("&")[0].trim();
	} catch {}
	return "string";
}
function parseExpression(expression) {
	if (Node.isStringLiteral(expression)) return expression.getLiteralValue();
	else if (Node.isNumericLiteral(expression)) return expression.getLiteralValue();
	else if (Node.isTrueLiteral(expression)) return true;
	else if (Node.isFalseLiteral(expression)) return false;
	else if (Node.isObjectLiteralExpression(expression)) return parseNestedObject(expression);
	else if (Node.isArrayLiteralExpression(expression)) return parseArrayLiteral(expression);
	else return expression.getText();
}
function parseNestedObject(objectLiteral) {
	const result = {};
	try {
		const properties = objectLiteral.getProperties();
		for (const property of properties) if (Node.isPropertyAssignment(property)) {
			const name = property.getName();
			const initializer = property.getInitializer();
			if (initializer) result[name] = parseExpression(initializer);
		}
	} catch (error) {
		console.warn(`Warning: Could not parse nested object: ${error.message}`);
		return result;
	}
	return result;
}
function filePathToRoute(filePath, projectRoot) {
	const filePathPosix = filePath.replace(/\\/g, "/");
	const projectRootPosix = projectRoot.replace(/\\/g, "/");
	const routesRoot = posix.join(projectRootPosix, "src/routes");
	const marker = "/src/routes/";
	let routePath = (filePathPosix.includes(marker) ? filePathPosix.slice(filePathPosix.indexOf(marker) + 12) : posix.relative(routesRoot, filePathPosix)).replace(/\.(tsx|ts|jsx|js)$/i, "");
	routePath = routePath.replace(/(?<!\.)\.(?!\.)/g, "/");
	routePath = routePath.replace(/^_index$/i, "").replace(/^index$/i, "").replace(/\/_index$/i, "").replace(/\/index$/i, "").replace(/\$([^/]+)/g, ":$1");
	return routePath.startsWith("/") ? routePath : `/${routePath}`;
}
function parseArrayLiteral(arrayLiteral) {
	const result = [];
	try {
		const elements = arrayLiteral.getElements();
		for (const element of elements) result.push(parseExpression(element));
	} catch (error) {
		console.warn(`Warning: Could not parse array literal: ${error.message}`);
	}
	return result;
}
function parseDecoratorArgs(decorator) {
	const result = {};
	try {
		const args = decorator.getArguments();
		if (args.length === 0) return result;
		const firstArg = args[0];
		if (Node.isObjectLiteralExpression(firstArg)) {
			const properties = firstArg.getProperties();
			for (const property of properties) if (Node.isPropertyAssignment(property)) {
				const name = property.getName();
				const initializer = property.getInitializer();
				if (initializer) result[name] = parseExpression(initializer);
			}
		} else if (Node.isStringLiteral(firstArg)) {
			result.id = parseExpression(firstArg);
			if (args.length > 1) {
				const secondArg = args[1];
				if (Node.isObjectLiteralExpression(secondArg)) {
					const properties = secondArg.getProperties();
					for (const property of properties) if (Node.isPropertyAssignment(property)) {
						const name = property.getName();
						const initializer = property.getInitializer();
						if (initializer) result[name] = parseExpression(initializer);
					}
				}
			}
		}
		return result;
	} catch (error) {
		console.warn(`Warning: Could not parse decorator arguments: ${error.message}`);
		return result;
	}
}
function extractAttributesFromSource(sourceFile, className) {
	const attributes = [];
	try {
		const classDeclaration = sourceFile.getClass(className);
		if (!classDeclaration) return attributes;
		const properties = classDeclaration.getProperties();
		for (const property of properties) {
			const attributeDecorator = property.getDecorator("AttributeDefinition");
			if (!attributeDecorator) continue;
			const fieldName = property.getName();
			const config = parseDecoratorArgs(attributeDecorator);
			const isRequired = !property.hasQuestionToken();
			const inferredType = config.type || getTypeFromTsMorph(property, sourceFile);
			const attribute = {
				id: config.id || fieldName,
				name: config.name || toHumanReadableName(fieldName),
				type: resolveAttributeType(config.type, inferredType, fieldName),
				required: config.required !== void 0 ? config.required : isRequired,
				description: config.description || `Field: ${fieldName}`
			};
			if (config.values) attribute.values = config.values;
			if (config.defaultValue !== void 0) attribute.default_value = config.defaultValue;
			attributes.push(attribute);
		}
	} catch (error) {
		console.warn(`Warning: Could not extract attributes from class ${className}: ${error.message}`);
	}
	return attributes;
}
function extractRegionDefinitionsFromSource(sourceFile, className) {
	const regionDefinitions = [];
	try {
		const classDeclaration = sourceFile.getClass(className);
		if (!classDeclaration) return regionDefinitions;
		const classRegionDecorator = classDeclaration.getDecorator("RegionDefinition");
		if (classRegionDecorator) {
			const args = classRegionDecorator.getArguments();
			if (args.length > 0) {
				const firstArg = args[0];
				if (Node.isArrayLiteralExpression(firstArg)) {
					const elements = firstArg.getElements();
					for (const element of elements) if (Node.isObjectLiteralExpression(element)) {
						const regionConfig = parseDecoratorArgs({ getArguments: () => [element] });
						const regionDefinition = {
							id: regionConfig.id || "region",
							name: regionConfig.name || "Region"
						};
						if (regionConfig.componentTypes) regionDefinition.component_types = regionConfig.componentTypes;
						if (Array.isArray(regionConfig.componentTypeInclusions)) regionDefinition.component_type_inclusions = regionConfig.componentTypeInclusions.map((incl) => ({ type_id: incl }));
						if (Array.isArray(regionConfig.componentTypeExclusions)) regionDefinition.component_type_exclusions = regionConfig.componentTypeExclusions.map((excl) => ({ type_id: excl }));
						if (regionConfig.maxComponents !== void 0) regionDefinition.max_components = regionConfig.maxComponents;
						if (regionConfig.minComponents !== void 0) regionDefinition.min_components = regionConfig.minComponents;
						if (regionConfig.allowMultiple !== void 0) regionDefinition.allow_multiple = regionConfig.allowMultiple;
						if (regionConfig.defaultComponentConstructors) regionDefinition.default_component_constructors = regionConfig.defaultComponentConstructors;
						regionDefinitions.push(regionDefinition);
					}
				}
			}
		}
	} catch (error) {
		console.warn(`Warning: Could not extract region definitions from class ${className}: ${error.message}`);
	}
	return regionDefinitions;
}
async function processComponentFile(filePath, _projectRoot) {
	try {
		const content = await readFile(filePath, "utf-8");
		const components = [];
		if (!content.includes("@Component")) return components;
		try {
			const sourceFile = new Project({
				useInMemoryFileSystem: true,
				skipAddingFilesFromTsConfig: true
			}).createSourceFile(filePath, content);
			const classes = sourceFile.getClasses();
			for (const classDeclaration of classes) {
				const componentDecorator = classDeclaration.getDecorator("Component");
				if (!componentDecorator) continue;
				const className = classDeclaration.getName();
				if (!className) continue;
				const componentConfig = parseDecoratorArgs(componentDecorator);
				const attributes = extractAttributesFromSource(sourceFile, className);
				const regionDefinitions = extractRegionDefinitionsFromSource(sourceFile, className);
				const componentMetadata = {
					typeId: componentConfig.id || className.toLowerCase(),
					name: componentConfig.name || toHumanReadableName(className),
					group: componentConfig.group || DEFAULT_COMPONENT_GROUP,
					description: componentConfig.description || `Custom component: ${className}`,
					regionDefinitions,
					attributes
				};
				components.push(componentMetadata);
			}
		} catch (error) {
			console.warn(`Warning: Could not process file ${filePath}:`, error.message);
		}
		return components;
	} catch (error) {
		console.warn(`Warning: Could not read file ${filePath}:`, error.message);
		return [];
	}
}
async function processPageTypeFile(filePath, projectRoot) {
	try {
		const content = await readFile(filePath, "utf-8");
		const pageTypes = [];
		if (!content.includes("@PageType")) return pageTypes;
		try {
			const sourceFile = new Project({
				useInMemoryFileSystem: true,
				skipAddingFilesFromTsConfig: true
			}).createSourceFile(filePath, content);
			const classes = sourceFile.getClasses();
			for (const classDeclaration of classes) {
				const pageTypeDecorator = classDeclaration.getDecorator("PageType");
				if (!pageTypeDecorator) continue;
				const className = classDeclaration.getName();
				if (!className) continue;
				const pageTypeConfig = parseDecoratorArgs(pageTypeDecorator);
				const attributes = extractAttributesFromSource(sourceFile, className);
				const regionDefinitions = extractRegionDefinitionsFromSource(sourceFile, className);
				const route = filePathToRoute(filePath, projectRoot);
				const pageTypeMetadata = {
					typeId: pageTypeConfig.id || className.toLowerCase(),
					name: pageTypeConfig.name || toHumanReadableName(className),
					description: pageTypeConfig.description || `Custom page type: ${className}`,
					regionDefinitions,
					supportedAspectTypes: pageTypeConfig.supportedAspectTypes || [],
					attributes,
					route
				};
				pageTypes.push(pageTypeMetadata);
			}
		} catch (error) {
			console.warn(`Warning: Could not process file ${filePath}:`, error.message);
		}
		return pageTypes;
	} catch (error) {
		console.warn(`Warning: Could not read file ${filePath}:`, error.message);
		return [];
	}
}
async function processAspectFile(filePath, _projectRoot) {
	try {
		const content = await readFile(filePath, "utf-8");
		const aspects = [];
		if (!filePath.endsWith(".json") || !content.trim().startsWith("{")) return aspects;
		if (!filePath.includes("/aspects/") && !filePath.includes("\\aspects\\")) return aspects;
		try {
			const aspectData = JSON.parse(content);
			const fileName = basename(filePath, ".json");
			if (!aspectData.name || !aspectData.attribute_definitions) return aspects;
			const aspectMetadata = {
				id: fileName,
				name: aspectData.name,
				description: aspectData.description || `Aspect type: ${aspectData.name}`,
				attributeDefinitions: aspectData.attribute_definitions || [],
				supportedObjectTypes: aspectData.supported_object_types || []
			};
			aspects.push(aspectMetadata);
		} catch (parseError) {
			console.warn(`Warning: Could not parse JSON in file ${filePath}:`, parseError.message);
		}
		return aspects;
	} catch (error) {
		console.warn(`Warning: Could not read file ${filePath}:`, error.message);
		return [];
	}
}
async function generateComponentCartridge(component, outputDir) {
	const fileName = toCamelCaseFileName(component.typeId);
	const groupDir = join(outputDir, component.group);
	const outputPath = join(groupDir, `${fileName}.json`);
	try {
		await mkdir(groupDir, { recursive: true });
	} catch {}
	const attributeDefinitionGroups = [{
		id: component.typeId,
		name: component.name,
		description: component.description,
		attribute_definitions: component.attributes
	}];
	const cartridgeData = {
		name: component.name,
		description: component.description,
		group: component.group,
		arch_type: ARCH_TYPE_HEADLESS,
		region_definitions: component.regionDefinitions || [],
		attribute_definition_groups: attributeDefinitionGroups
	};
	await writeFile(outputPath, JSON.stringify(cartridgeData, null, 2));
	console.log(`   - ${String(component.typeId)}: ${String(component.name)} (${String(component.attributes.length)} attributes) → ${fileName}.json`);
}
async function generatePageTypeCartridge(pageType, outputDir) {
	const fileName = toCamelCaseFileName(pageType.name);
	const outputPath = join(outputDir, `${fileName}.json`);
	const cartridgeData = {
		name: pageType.name,
		description: pageType.description,
		arch_type: ARCH_TYPE_HEADLESS,
		region_definitions: pageType.regionDefinitions || []
	};
	if (pageType.attributes && pageType.attributes.length > 0) cartridgeData.attribute_definition_groups = [{
		id: pageType.typeId || fileName,
		name: pageType.name,
		description: pageType.description,
		attribute_definitions: pageType.attributes
	}];
	if (pageType.supportedAspectTypes) cartridgeData.supported_aspect_types = pageType.supportedAspectTypes;
	if (pageType.route) cartridgeData.route = pageType.route;
	await writeFile(outputPath, JSON.stringify(cartridgeData, null, 2));
	console.log(`   - ${String(pageType.name)}: ${String(pageType.description)} (${String(pageType.attributes.length)} attributes) → ${fileName}.json`);
}
async function generateAspectCartridge(aspect, outputDir) {
	const fileName = toCamelCaseFileName(aspect.id);
	const outputPath = join(outputDir, `${fileName}.json`);
	const cartridgeData = {
		name: aspect.name,
		description: aspect.description,
		arch_type: ARCH_TYPE_HEADLESS,
		attribute_definitions: aspect.attributeDefinitions || []
	};
	if (aspect.supportedObjectTypes) cartridgeData.supported_object_types = aspect.supportedObjectTypes;
	await writeFile(outputPath, JSON.stringify(cartridgeData, null, 2));
	console.log(`   - ${String(aspect.name)}: ${String(aspect.description)} (${String(aspect.attributeDefinitions.length)} attributes) → ${fileName}.json`);
}
/**
* Runs ESLint with --fix on the specified directory to format JSON files.
* This ensures generated JSON files match the project's Prettier/ESLint configuration.
*/
function lintGeneratedFiles(metadataDir, projectRoot) {
	try {
		console.log("🔧 Running ESLint --fix on generated JSON files...");
		execSync(`npx eslint "${metadataDir}/**/*.json" --fix --no-error-on-unmatched-pattern`, {
			cwd: projectRoot,
			stdio: "pipe",
			encoding: "utf-8"
		});
		console.log("✅ JSON files formatted successfully");
	} catch (error) {
		const execError = error;
		if (execError.status === 2) {
			const errMsg = execError.stderr || execError.stdout || "Unknown error";
			console.warn(`⚠️  Warning: Could not run ESLint --fix: ${errMsg}`);
		} else if (execError.stderr && execError.stderr.includes("error")) console.warn(`⚠️  Warning: Some linting issues could not be auto-fixed. Run ESLint manually to review.`);
		else console.log("✅ JSON files formatted successfully");
	}
}
async function generateMetadata(projectDirectory, metadataDirectory, options) {
	try {
		const filePaths = options?.filePaths;
		const isIncrementalMode = filePaths && filePaths.length > 0;
		if (isIncrementalMode) console.log(`🔍 Generating metadata for ${filePaths.length} specified file(s)...`);
		else console.log("🔍 Generating metadata for decorated components and page types...");
		const projectRoot = resolve(projectDirectory);
		const srcDir = join(projectRoot, "src");
		const metadataDir = resolve(metadataDirectory);
		const componentsOutputDir = join(metadataDir, "components");
		const pagesOutputDir = join(metadataDir, "pages");
		const aspectsOutputDir = join(metadataDir, "aspects");
		if (!isIncrementalMode) {
			console.log("🗑️  Cleaning existing output directories...");
			for (const outputDir of [
				componentsOutputDir,
				pagesOutputDir,
				aspectsOutputDir
			]) try {
				await rm(outputDir, {
					recursive: true,
					force: true
				});
				console.log(`   - Deleted: ${outputDir}`);
			} catch {
				console.log(`   - Directory not found (skipping): ${outputDir}`);
			}
		} else console.log("📝 Incremental mode: existing cartridge files will be preserved/overwritten");
		console.log("📁 Creating output directories...");
		for (const outputDir of [
			componentsOutputDir,
			pagesOutputDir,
			aspectsOutputDir
		]) try {
			await mkdir(outputDir, { recursive: true });
		} catch (error) {
			try {
				await access(outputDir);
			} catch {
				console.error(`❌ Error: Failed to create output directory ${outputDir}: ${error.message}`);
				process.exit(1);
			}
		}
		let files = [];
		if (isIncrementalMode && filePaths) {
			files = filePaths.map((fp) => resolve(projectRoot, fp));
			console.log(`📂 Processing ${files.length} specified file(s)...`);
		} else {
			const scanDirectory = async (dir) => {
				const entries = await readdir(dir, { withFileTypes: true });
				for (const entry of entries) {
					const fullPath = join(dir, entry.name);
					if (entry.isDirectory()) {
						if (!SKIP_DIRECTORIES.includes(entry.name)) await scanDirectory(fullPath);
					} else if (entry.isFile() && (extname(entry.name) === ".ts" || extname(entry.name) === ".tsx" || extname(entry.name) === ".json")) files.push(fullPath);
				}
			};
			await scanDirectory(srcDir);
		}
		const allComponents = [];
		const allPageTypes = [];
		const allAspects = [];
		for (const file of files) {
			const components = await processComponentFile(file, projectRoot);
			allComponents.push(...components);
			const pageTypes = await processPageTypeFile(file, projectRoot);
			allPageTypes.push(...pageTypes);
			const aspects = await processAspectFile(file, projectRoot);
			allAspects.push(...aspects);
		}
		if (allComponents.length === 0 && allPageTypes.length === 0 && allAspects.length === 0) {
			console.log("⚠️  No decorated components, page types, or aspect files found.");
			return;
		}
		if (allComponents.length > 0) {
			console.log(`✅ Found ${allComponents.length} decorated component(s):`);
			for (const component of allComponents) await generateComponentCartridge(component, componentsOutputDir);
			console.log(`📄 Generated ${allComponents.length} component metadata file(s) in: ${componentsOutputDir}`);
		}
		if (allPageTypes.length > 0) {
			console.log(`✅ Found ${allPageTypes.length} decorated page type(s):`);
			for (const pageType of allPageTypes) await generatePageTypeCartridge(pageType, pagesOutputDir);
			console.log(`📄 Generated ${allPageTypes.length} page type metadata file(s) in: ${pagesOutputDir}`);
		}
		if (allAspects.length > 0) {
			console.log(`✅ Found ${allAspects.length} decorated aspect(s):`);
			for (const aspect of allAspects) await generateAspectCartridge(aspect, aspectsOutputDir);
			console.log(`📄 Generated ${allAspects.length} aspect metadata file(s) in: ${aspectsOutputDir}`);
		}
		if (options?.lintFix !== false && (allComponents.length > 0 || allPageTypes.length > 0 || allAspects.length > 0)) lintGeneratedFiles(metadataDir, projectRoot);
	} catch (error) {
		console.error("❌ Error:", error.message);
		process.exit(1);
	}
}

//#endregion
export { deployCode, generateMetadata };
//# sourceMappingURL=index.js.map