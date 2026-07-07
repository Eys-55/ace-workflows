# Quarantine Manifest: market-research-agent import

Status: quarantined, broken, not canonical.

Machine-readable marker:
`projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/quarantine.json`

Imported on: 2026-07-07

## Source

- `/Users/acecanacan/Documents/market-research-agent/data/agentic-repos`
- `/Users/acecanacan/Documents/market-research-agent/skills`

## Destination

- `projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos`
- `projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/skills`

## Scope

- Copied workflow catalog data, run outputs, prompts, logs, reports, and source JSON/CSV from `data/agentic-repos`.
- Copied legacy skill candidates from `skills`.
- Excluded `.DS_Store`, Python source files, and Python cache files to preserve this repo's file policy.
- Did not copy `node_modules`, `.git`, `dist`, or generated dependency/build surfaces.

## Initial Counts

- Quarantine files copied: 223
- Imported `SKILL.md` files: 18
- Imported `workflow-classifications-all.json` row count: 171 workflow doors
- Imported `workflow-classifications-all.json` unique workflow ids: 171

## Quarantine Rules

- The machine-readable `quarantine.json` marker is authoritative for tooling.
- Treat every imported skill as untrusted until audited.
- Do not report imported skills as `real-life-workflows` skills.
- Do not treat imported skills as callable, active, or discoverable skill
  surfaces.
- Do not promote any imported skill as-is.
- Do not move any imported skill into `.agents/skills`.
- Do not wire imported commands, prompts, scripts, or references into the active workflow surface.
- Do not use imported workflow catalog rows as accepted source-of-truth until the audit checks source quality, duplication, and schema consistency.

## Known Discrepancy

The user clarified that the 171 rows are workflow doors. They are entry points
for audit and expansion, not finished workflows. The later audit should preserve
that vocabulary and verify each door before promotion.

## Next Audit Action

Use the real-life-workflows task tracker to start an ECC audit that checks:

- skill metadata and folder naming
- whether each skill follows ECC workflow contract, input contract, eval gate, handoff, and human boundary requirements
- whether each skill should be migrated, rewritten, merged, or deleted
- whether the catalog schema and row counts match the intended real-world workflow corpus
