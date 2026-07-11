# Workflow Foundry 016 Issue 001: Isolated Candidate And Inventory

## Parent

`workflow-foundry-016`

## What to build

Establish a clean integration candidate containing the complete typed-foundation
and product-builder commit chain. Inventory every dirty and untracked source path,
classify overlap, and preserve immutable before-state references without changing
the original dirty worktree.

## Acceptance criteria

- [ ] Candidate descends from the verified remote main baseline and contains both feature commits.
- [ ] Feature worktree and candidate baseline validation are recorded.
- [ ] Every dirty and untracked path is classified as non-overlap, semantic overlap, generated state, or deferred.
- [ ] Original dirty worktree remains unmodified by integration operations.
- [ ] Remote main and feature references are recorded as rollback points.

## Blocked by

None - can start immediately.
