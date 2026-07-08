# Issue 002: Build Audit Cleanup Skill

Parent: workflow-foundry-013

## What To Build

Create the `audit-cleanup` workflow skill. It executes approved cleanup actions
through a selected tracker task, a linked Markdown cleanup plan or review
artifact, and JSON phase guards that name the approved paths and actions.

The skill should support tracker state cleanup, workflow artifact cleanup,
validation cleanup, and Git checkpoint cleanup. It should prepare the final
publish path but stop for the operator's final push instruction unless the
current operator turn has already supplied that explicit instruction.

## Acceptance Criteria

- [x] The skill has valid frontmatter and Codex metadata.
- [x] The skill requires a selected tracker task before mutation.
- [x] The skill requires both a Markdown cleanup plan or review artifact and
      JSON phase-guard approval before cleanup edits.
- [x] The skill may update phase guards only after explicit chat approval naming
      the selected task and Markdown cleanup plan.
- [x] The skill validates after phase-guard updates and after cleanup edits.
- [x] The skill keeps broad source refactors and broad deletion out of v1 unless
      explicitly approved in the cleanup plan.
- [x] The skill prepares local commit/checkpoint work and asks for final
      publish instruction before pushing by default.

## Blocked By

Issue 001 should land first so cleanup can reference the review handoff shape.
