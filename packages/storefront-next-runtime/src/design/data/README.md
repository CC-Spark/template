# @salesforce/storefront-next-runtime/design/data

Runtime page resolution logic for Page Designer. Given a page identifier (a product ID, category ID, or direct page ID), this module resolves it through content assignments and manifest lookup, selects the correct page variation based on visibility rules, and returns a fully filtered page ready for rendering. This is SDK-level infrastructure consumed by all storefronts built on the platform.

## Page Resolution Pipeline

The `resolvePage` function orchestrates the full pipeline:

```
Input: (id, identifierType, locale, manifestStorage, contextResolver)
│
├─ 1. Resolve dynamic page ID
│     For product/category identifiers, look up the assigned page ID
│     via content assignments in the site manifest.
│     Direct page IDs pass through unchanged.
│
├─ 2. Fetch page manifest
│     Load the PageManifest for the resolved page ID and locale.
│     The manifest contains all variations and their visibility rules.
│
├─ 3. Select variation
│     Evaluate variations in order. Each variation may have a
│     visibility rule (customer groups, campaigns, schedule).
│     The first matching variation wins; otherwise the default is used.
│
├─ 4. Load qualifier context (lazy)
│     The shopper's context (active campaigns, customer group
│     memberships) is only fetched if a variation's rule requires it.
│
└─ 5. Process page
      Filter the selected page's components by their individual
      visibility rules, removing any that don't match the context.
│
Output: Page with only visible components, or null
```

## Key Concepts

**Page Manifest** — The data structure containing all variations of a single page, their visibility rules, and the order in which variations should be evaluated. Each page ID + locale pair maps to one manifest.

**Variation** — A single version of a page within a manifest. Variations are evaluated in order; the first whose visibility rule passes is selected. Every manifest has a default variation used as a fallback.

**Visibility Rules** — Conditions that control when a variation or component is shown. Rules can require specific customer groups (all must match), active campaign/promotion pairs (all must match), or a time window (start/end timestamps). All conditions in a rule must pass for the rule to be satisfied.

**Content Assignments** — Mappings in the site manifest that connect product or category identifiers to page IDs. For categories, the lookup traverses the category hierarchy from child to parent until an assignment is found.

**Qualifier Context** — Runtime state representing the current shopper's active campaign qualifiers and customer group memberships. This context is lazily resolved — it's only fetched when a visibility rule actually needs it.