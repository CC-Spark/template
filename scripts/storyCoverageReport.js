#!/usr/bin/env node
/**
 * Storybook Coverage Report Generator
 *
 * Scans /src/components recursively:
 *  - Detects all *.tsx component files (except *.stories.tsx, *.test.tsx, *.snapshot.tsx, *-snapshot.tsx)
 *  - Detects matching *.stories.tsx files
 *  - Creates coverage %, missing story list
 *  - Emits Markdown + JSON summary
 */
import fs from 'fs';
import path from 'path';
// ---- CONFIG ----
const COMPONENTS_DIR = path.join(process.cwd(), 'src/components');
const OUTPUT_DIR = path.join(process.cwd(), 'coverage');
const JSON_PATH = path.join(OUTPUT_DIR, 'storybook-component-coverage.json');
const MD_PATH = path.join(OUTPUT_DIR, 'storybook-component-coverage.md');
// Components that don't require stories (simple icons, internal sub-components, etc.)
const EXCLUDED_COMPONENTS = new Set([
    // Simple icon components
    'icons/amex-icon',
    'icons/discover-icon',
    'icons/generic-card-icon',
    'icons/heart-icon',
    'icons/mastercard-icon',
    'icons/visa-icon',
]);
// Ensure OUTPUT DIR exists
if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
// Check if components directory exists
if (!fs.existsSync(COMPONENTS_DIR)) {
    console.error(`❌ Components directory not found: ${COMPONENTS_DIR}`);
    process.exit(1);
}
function walk(dir, fileCallback) {
    if (!fs.existsSync(dir)) return;
    for (const file of fs.readdirSync(dir)) {
        const full = path.join(dir, file);
        const stat = fs.statSync(full);
        if (stat.isDirectory()) walk(full, fileCallback);
        else fileCallback(full);
    }
}
function getComponentName(filePath, componentsDir) {
    // Get relative path from components directory
    const relativePath = path.relative(componentsDir, filePath);
    // Remove extension and get the component identifier
    const withoutExt = relativePath.replace(/\.tsx$/, '');
    // Replace path separators with '/' for consistency
    return withoutExt.split(path.sep).join('/');
}
function generateCoverage() {
    const components = new Map(); // Map<componentName, filePath>
    const stories = new Set();
    // Collect all story files first
    walk(COMPONENTS_DIR, (file) => {
        if (file.endsWith('.stories.tsx')) {
            const componentName = getComponentName(file, COMPONENTS_DIR).replace(/\.stories$/, '');
            stories.add(componentName);
        }
    });
    // Collect all component files
    walk(COMPONENTS_DIR, (file) => {
        // Skip story files, test files, and snapshot files
        if (
            file.endsWith('.stories.tsx') ||
            file.endsWith('.test.tsx') ||
            file.endsWith('-snapshot.tsx') ||
            file.includes('/stories/') ||
            file.includes('/__snapshots__/') ||
            file.includes('/__mocks__/')
        ) {
            return;
        }
        // Only process .tsx files
        if (file.endsWith('.tsx')) {
            const componentName = getComponentName(file, COMPONENTS_DIR);
            // Store both the name and path for better reporting
            if (!components.has(componentName)) {
                components.set(componentName, file);
            }
        }
    });
    // Find missing stories
    const missing = [];
    const excluded = [];
    for (const [componentName, filePath] of components.entries()) {
        // Skip excluded components
        if (EXCLUDED_COMPONENTS.has(componentName)) {
            excluded.push({ name: componentName, path: filePath });
            continue;
        }
        // Check if there's a matching story
        // A story can match by:
        // 1. Exact name match (e.g., "cart/cart-content" matches "cart/cart-content.stories.tsx")
        // 2. Story in stories/ subdirectory (e.g., "cart/cart-content" matches "cart/stories/cart-content")
        // 3. Story in same directory (e.g., "customer-address-form/form" matches "customer-address-form/form.stories.tsx")
        // 4. Index story for directory (e.g., "cart/index" matches "cart/stories/index")
        const baseName = path.basename(componentName);
        const dirName = path.dirname(componentName);
        const hasStory =
            stories.has(componentName) ||
            stories.has(`${dirName}/stories/${baseName}`) ||
            stories.has(`${dirName}/${baseName}`) ||
            (componentName.endsWith('/index') && stories.has(`${dirName}/stories/index`));
        if (!hasStory) {
            missing.push({ name: componentName, path: filePath });
        }
    }
    const totalComponents = components.size;
    const covered = totalComponents - missing.length;
    const percent = totalComponents === 0 ? 100 : Math.round((covered / totalComponents) * 100);
    // Sort missing components for better readability
    missing.sort((a, b) => a.name.localeCompare(b.name));

    // Determine badge color based on coverage
    let badgeColor = 'red';
    let badgeEmoji = '❌';
    if (percent === 100) {
        badgeColor = 'brightgreen';
        badgeEmoji = '✅';
    } else if (percent >= 90) {
        badgeColor = 'green';
        badgeEmoji = '✅';
    } else if (percent >= 75) {
        badgeColor = 'yellowgreen';
        badgeEmoji = '⚠️';
    } else if (percent >= 50) {
        badgeColor = 'yellow';
        badgeEmoji = '⚠️';
    }

    const jsonSummary = {
        timestamp: new Date().toISOString(),
        totalComponents,
        componentsWithStories: covered,
        coveragePercent: percent,
        excludedComponents: excluded.length,
        missingComponents: missing.map((m) => m.name),
    };

    // Format date nicely
    const date = new Date();
    const formattedDate = date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short',
    });

    const md = `
<div align="center">

# 📚 Storybook Component Coverage Report

![Coverage](https://img.shields.io/badge/coverage-${percent}%25-${badgeColor}?style=for-the-badge&logo=storybook)
${missing.length === 0 ? '![Status](https://img.shields.io/badge/status-complete-success?style=flat-square)' : `![Status](https://img.shields.io/badge/missing-${missing.length}%20stories-critical?style=flat-square)`}

---

</div>

## 📈 Summary

| Metric | Value | Status |
|:-------|:-----:|:------:|
| **Total Components** | \`${totalComponents}\` | ${totalComponents > 0 ? '📦' : '⚠️'} |
| **Components With Stories** | \`${covered}\` | ${covered === totalComponents ? '✅' : '⚠️'} |
| **Excluded Components** | \`${excluded.length}\` | ℹ️ |
| **Coverage** | **\`${percent}%\`** | ${badgeEmoji} |

${
    missing.length === 0
        ? `
<div align="center">

## 🎉 Perfect Coverage!

**All \`${totalComponents}\` components have Storybook stories!** 

✨ Great job maintaining comprehensive component documentation! ✨

</div>
`
        : `
## ⚠️ Missing Stories (${missing.length})

The following components are missing Storybook stories:

<details>
<summary><b>Click to expand missing components list</b></summary>

${missing.map((m, idx) => `\`${idx + 1}.\` \`${m.name}\``).join('\n')}

</details>
`
}

---

<div align="right">

<sub>📅 Generated: ${formattedDate}</sub>

</div>
`;

    fs.writeFileSync(JSON_PATH, JSON.stringify(jsonSummary, null, 2));
    fs.writeFileSync(MD_PATH, md.trim());
    console.log('✔️ Coverage report generated');
    console.log(`📄 JSON: ${JSON_PATH}`);
    console.log(`📄 MD: ${MD_PATH}`);
    console.log(
        `📊 Coverage: ${percent}% (${covered}/${totalComponents - excluded.length} components, ${excluded.length} excluded)`
    );
    // Exit non-zero for CI enforcement
    if (missing.length > 0) {
        console.error(`\n❌ Missing stories for ${missing.length} component(s):`);
        missing.slice(0, 10).forEach((m) => {
            console.error(`   - ${m.name}`);
        });
        if (missing.length > 10) {
            console.error(`   ... and ${missing.length - 10} more (see report for full list)`);
        }
        process.exit(1);
    }
}
generateCoverage();
