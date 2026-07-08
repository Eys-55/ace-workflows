# Issue 004: Validation, Review, And Push

## Parent

`workflow-foundry-003`

## What to build

Close the task with validation, a focused review artifact, and a Git checkpoint.
Resolve unrelated validation blockers by accounting for them in the correct
open task rather than reverting or hiding them.

## Acceptance criteria

- [x] Workflow-state validation passes.
- [x] Package/readme validators affected by repaired surfaces pass.
- [x] A focused review artifact records standards and spec findings.
- [x] Dirty unrelated files are preserved and not reverted.
- [x] The completed changes are committed and pushed after validation.

## Blocked by

- `workflow-foundry-003-issue-001-root-skill-first-rule.md`
- `workflow-foundry-003-issue-002-validator-command-first-guard.md`
- `workflow-foundry-003-issue-003-repair-command-first-surfaces.md`
