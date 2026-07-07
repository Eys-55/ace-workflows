# Real-World Workflow Catalog

This folder is the local workflow-search system for finding real-world workflow
patterns and Codex/ECC config-package references.

## Start Here

| File | Purpose |
| --- | --- |
| `workflow-search-index.json` | Main clean 171-row searchable catalog. |
| `workflow-search-index.csv` | Spreadsheet-friendly version of the catalog. |
| `workflow-search-index-by-domain.json` | Compact domain grouping for quick lookup. |
| `../../reports/workflow-search-index.md` | Human-readable summary and best rows by domain. |
| `workflow-search-index.json` and `workflow-search-index-by-domain.json` | Primary skill-readable lookup surfaces. |

## Querying From Codex

Codex should read the committed JSON indexes directly when a workflow needs
catalog context. Python query adapters may exist for maintainer diagnostics, but
they are not the operator interface.

## Quality Model

| Tier | Meaning |
| --- | --- |
| `gold` | Source reachable or canonicalized, high confidence, ready to copy/adapt. |
| `silver` | Useful reference with medium or better confidence. |
| `bronze` | Potentially useful but source needs repair or verification. |
| `needs_verification` | Searchable, but verify before relying on it. |

## Source Runs

The clean index was built from:

- `workflow-catalog-runs/2026-07-05-priority1-cli-10x5/`
- `workflow-catalog-runs/2026-07-05-remaining-cli-25x5/`
- `workflow-catalog-runs/workflow-classifications-all.json`

If source rows change, update the committed JSON indexes directly through the
agent-workflow-project-maker skill and record the change in a status note.
