# Issue 002: Audit Report Generation

## Parent

`workflow-foundry-011` - Audit Foundry Skill

## What to build

Define the audit loading and report-writing workflow for each supported report
type. Each run should load the selected scope, write a date-stamped Markdown
report under the workflow-foundry reviews artifact area, then summarize the
report path, key findings, and recommended next tracker actions in chat.

## Acceptance criteria

- [x] Foundry-only reports load root instructions, registry, workflow-foundry state, non-done workflow-foundry tasks, foundry skills, validation scripts, and generated UI pointers.
- [x] Foundry-plus-projects reports also load selected or discoverable project summaries, task indexes, non-done task JSON, and testing-session indexes.
- [x] Projects-only reports focus on project tracker state without foregrounding foundry control-plane analysis.
- [x] Specific-project reports require and audit exactly one `project:<slug>`.
- [x] Full artifacts, testing-session event streams, and quarantined import bodies remain on-demand unless exact evidence is needed.
- [x] Reports are stored under `projects/workflow-foundry/artifacts/reviews/` with date-stamped `audit-foundry` Markdown filenames.
- [x] Reports include state summary, findings, risks, and recommended next tracker actions.
- [x] Chat response summarizes the written report instead of replacing it.

## Blocked by

- `workflow-foundry-011-issue-001-skill-contract`

## User stories covered

- 6. Always write a Markdown report
- 7. Summarize the report in chat
- 8. Store reports neatly
- 9. Name recommended next tracker actions
- 11. Distinguish active skills from artifacts and generated UI
- 12. Inspect AGENTS.md boundaries
- 13. Inspect workflow-foundry task state
- 14. Inspect validation behavior
- 15. Inspect generated UI state
- 16. Read project summaries, task indexes, non-done tasks, and testing-session indexes
- 17. Load heavy evidence only when needed
