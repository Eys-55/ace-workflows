# Quarantine Review: real-life-workflows-001

## Findings

No blocking quarantine findings.

## Acceptance Check

- Project-local quarantine exists at `projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent`.
- Imported material is not in `.agents/skills` and is not canonical.
- Quarantine contains 223 files and 18 imported `SKILL.md` files, matching the manifest.
- Forbidden copied surfaces were not found: `.py`, `.DS_Store`, `__pycache__`, `node_modules`, `.git`, or `dist`.
- Catalog counts are recorded as 171 workflow doors, not finished workflows.
- The later audit path is captured in the manifest and in `real-life-workflows-002`.

## Verification

- `find projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent -type f | wc -l`
- `find projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent -type f -name 'SKILL.md' | wc -l`
- `find projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent -type f \( -name '*.py' -o -name '.DS_Store' -o -path '*/__pycache__/*' -o -path '*/node_modules/*' -o -path '*/.git/*' -o -path '*/dist/*' \) -print`
- `jq '{rows:(.rows|length), unique_ids:(.rows|map(.workflow_id // .id)|unique|length)}' projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json`
- `jq '{rows:(.rows|length), unique_ids:(.rows|map(.id)|unique|length), door_count}' projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-door-catalog.json`
- `jq '{workflow_link_count, repo_count_expected, repo_count_inspected, links:(.workflow_links|length)}' projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-link-seed.json`
- `node scripts/validate-workflow-state.mjs`

## Status

The quarantine work is complete. The imported catalog and skill candidates remain isolated and explicitly untrusted for future ECC audit work.
