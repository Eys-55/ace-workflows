# Workflow Foundry 016 Issue 002: Versioned Tracker Reconciliation

## Parent

`workflow-foundry-016`

## What to build

Reconcile newer local project state with the completed feature branch while
preserving the stricter v1 deliverable contract. Use existing tracker-maintenance
authority for minimal frozen migrations, regenerate task indexes and preload
snapshots from the combined state, and never regress completed 006 or 015 state.

## Acceptance criteria

- [ ] Completed 006 and 015 contracts, bindings, evidence, and done state remain authoritative.
- [ ] Newer Health, LinkedIn Posts, Real Life Workflows, and Workflow Foundry tasks and artifacts are preserved.
- [ ] Every non-grandfathered open task records a valid native, approved, or frozen pending migration.
- [ ] Code-review task migrations remain completion-ready or explicitly blocked without weakening validation.
- [ ] Shared indexes and preload snapshots match the combined non-done task set.
- [ ] Changed tracker and artifact paths have a valid non-done task owner.

## Blocked by

- Workflow Foundry 016 Issue 001
