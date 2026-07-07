# Issue 002: Build Project-Scoped Tracker Console

## Parent

`workflow-foundry-009`

## What to build

Replace the all-project task table with a read-only project console: left
project sidebar, selected-project summary strip, task search, lifecycle rail
filters, active task rows, and a collapsed done section. The UI should default
to dark mode and stay dense, flat, outlined, and fully 2D.

## Acceptance criteria

- [ ] The first viewport shows project navigation on the left and selected-project workflow tasks on the right.
- [ ] Project sidebar search filters by project name and slug.
- [ ] Lifecycle rail chips filter tasks by phase and highlight the selected task's phase.
- [ ] Active/open tasks are primary and done tasks are collapsed by default.
- [ ] Task rows show truncated next action and do not render long raw artifact paths.

## Blocked by

- `workflow-foundry-009-issue-001-derived-state.md`
