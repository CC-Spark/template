# Extensions Directory

This folder contains **feature extensions** that allow you to enhance and customize your storefront experience in a modular way.

## Purpose

The `extensions` directory is the central place for developing and managing reusable application extensions, such as UI widgets, backend integrations, or business logic add-ons. Files under each is self-contained and can be included individually, making it easy to add new features or integrations to your retail application. 


## Extension Integration
This folder contains only "net-new" files related to an extention. Integration changes, i.e., additional code changes to the core application, are made in files outside the extension folder. They're marked by special comment markers to indicate the annotated code snippet is a part of an extension.

Example integration code:

- A single line of code
```typescript
/** @sfdc-extension-line SFDC_EXT_STORE_LOCATOR */
import storeLocator from '@extensions/store-locator'
```

- A block of code
```typescript
{/* @sfdc-extension-block-start SFDC_EXT_STORE_LOCATOR */}
<li>
    <Link to="/store-locator" className="hover:underline">
        {uiStringsSL.footer.links.storeLocator}
    </Link>
</li>
{/* @sfdc-extension-block-end SFDC_EXT_STORE_LOCATOR */}

```

- An entire file
```typescript
/** @sfdc-extension-file SFDC_EXT_STORE_LOCATOR */
...
```


## How Extensions Are Registered

Each extension is registered via the `config.json` file located in the `extensions` directory. Each entry is keyed by a unique marker string, which is used to mark code snippets where extension code is integrated with rest of the application. During the app creation process, a user chooses which extension to include based on the registry.

## Extensions Structure

Example structure:

```
src/extensions/
  config.json
  my-extension/
    index.ts
    [other extension files...]
  another-extension/
    index.ts
```

## `config.json` Schema

Each `config.json` must adhere to the following schema:

| Field                         | Type     | Required | Description                                                                   |
| ----------------------------- | -------- | -------- | ----------------------------------------------------------------------------- |
| `name`                        | string   | yes      | Human-readable name of the extension                                          |
| `description`                 | string   | yes      | A short description of what the extension does                                |
| `installationInstructions`    | string   | no       | (Optional) Path to file with installation instructions                        |
| `uninstallationInstructions`  | string   | no       | (Optional) Path to file with uninstallation instructions                      |

### Example `config.json`

```json
"SFDC_EXT_PRODUCT_REVIEW": {
  "name": "Product Review",
  "description": "Product review allows a user to see reviews of a product and create new reviews.",
  "installationInstructions": "instructions/install-product-review.mdc",
  "uninstallationInstructions": "instructions/uninstall-product-review.mdc"
}
```

## Adding an Extension

1. Create a new subdirectory in `src/extensions/`.
2. Add your extension code files.
3. Add your extension integration code.
3. Create a new entry in `config.json` per the schema above.

