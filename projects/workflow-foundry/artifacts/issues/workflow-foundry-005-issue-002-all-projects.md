# Issue 002: Render all projects and required task fields

## Parent

`workflow-foundry-005` - Astro Project Task Tracker

## What to build

Expand the tracker from the first demoable shell into a complete read-only
snapshot of all projects in the repo. The page should gather every project
using the established project/task JSON contract and render the fields needed
to inspect workflow progress without opening raw JSON files.

This slice should keep the tracker useful with one project today and multiple
projects later.

## Acceptance criteria

- [ ] The generated tracker shows all discovered projects by default.
- [ ] Each project includes project name, slug, project state, and domain or
      goal context when available.
- [ ] Each task includes task id, title, task kind, status, previous workflow phase, updated
      date, explicit next action, phase guard summary, and linked artifacts.
- [ ] Missing optional fields degrade gracefully while missing required fields
      fail validation or build checks.
- [ ] The UI remains read-only and does not introduce a second source of truth.
- [ ] The repo workflow-state validator still passes after this slice.

## Blocked by

- Issue 001: Build the Astro tracker shell

## User stories covered

- 1. See all projects in one tracker
- 4. See each task status
- 5. See each task kind
- 6. See each previous workflow phase
- 7. See next-action and phase-guard state
- 8. See linked artifacts
- 13. Handle one project today and many projects later
