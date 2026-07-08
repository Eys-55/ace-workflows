# Audit Review And Cleanup PRD

Task: workflow-foundry-013
Generated: 2026-07-08
Status: PRD

## Problem Statement

The foundry can already produce read-only audit reports, but turning audit
findings into cleanup work is still too manual. After an audit, the operator has
to infer which tracker task owns a fix, which files are safe to edit, which
phase guard should approve the work, and whether the final cleaned state should
be committed or pushed.

That gap creates avoidable conflicts: stale task state can remain open, changed
artifacts can fail validation because they are not linked to a non-done task,
and cleanup can blur the boundary between read-only auditing and mutation.

## Solution

Build two workflow skills:

1. `audit-review`: a non-mutating review skill that reads audit reports,
   validation output, dirty worktree state, and tracker state, then writes a
   Markdown review artifact with classified conflicts and proposed cleanup
   actions.
2. `audit-cleanup`: an approval-gated cleanup skill that executes only through
   a selected tracker task, a linked Markdown cleanup plan or review artifact,
   and JSON phase guards that name the approved paths and actions.

`audit-foundry` remains read-only. It produces audit evidence. `audit-review`
turns that evidence into a human-readable cleanup plan. `audit-cleanup` executes
approved cleanup, validates the state, prepares the checkpoint path, and stops
for the operator's final publish or push instruction.

## User Stories

1. As the foundry operator, I want an audit review skill, so that I can
   understand which audit findings require cleanup without mutating state.
2. As the foundry operator, I want audit findings classified by severity and
   cleanup type, so that I can decide what should be fixed now.
3. As the foundry operator, I want each proposed cleanup action tied to a task
   path, so that cleanup remains auditable.
4. As the foundry operator, I want a Markdown cleanup plan, so that I can review
   the rationale before any mutation happens.
5. As the foundry operator, I want JSON phase guards to remain the enforcement
   source of truth, so that cleanup cannot rely on prose alone.
6. As the foundry operator, I want audit cleanup to create or continue a tracker
   task before editing, so that every changed artifact has an owner.
7. As the foundry operator, I want cleanup to support tracker state repairs, so
   that stale statuses, linked artifacts, and preload snapshots can be fixed.
8. As the foundry operator, I want cleanup to support workflow artifact repairs,
   so that PRD, issue, review, and handoff artifacts stay linked and current.
9. As the foundry operator, I want cleanup to support validation repairs, so
   that root validation and tracker verification pass after cleanup.
10. As the foundry operator, I want cleanup to prepare the Git checkpoint path,
    so that cleaned state can be committed and pushed when I approve it.
11. As the foundry operator, I want cleanup to stop before the final push, so
    that external writes still require my final instruction.
12. As the foundry operator, I want broad deletion and source refactors out of
    v1 by default, so that cleanup does not expand beyond audit maintenance.
13. As the foundry operator, I want the cleanup skill to explain what it changed,
    so that I can trust the final state before publishing.
14. As a future agent, I want the review and cleanup skills to have predictable
    invocation contracts, so that I can route follow-up work correctly.
15. As a future agent, I want validation to know these skills are canonical
    surfaces, so that docs and skill references stay coherent.

## Implementation Decisions

- Split the workflow into two skills because diagnostic planning and mutation
  have different safety boundaries.
- Keep `audit-review` non-mutating by default. Its normal output is a Markdown
  review artifact with findings, conflict classification, proposed cleanup
  actions, and exact follow-up skill paths.
- Require `audit-cleanup` to operate through a tracker task. It may continue an
  existing suitable task or initiate a tracker-maintenance task when needed.
- Require both a Markdown cleanup plan or review artifact and JSON phase guards
  before cleanup edits. The Markdown explains the rationale; JSON enforces the
  approved paths and actions.
- Allow `audit-cleanup` to update the selected task's phase guard only after
  explicit chat approval naming the Markdown plan and selected task. It must
  validate after that update before cleanup edits.
- Support v1 cleanup categories: tracker state cleanup, workflow artifact
  cleanup, validation cleanup, and Git checkpoint cleanup.
- Keep broad source-code refactors and broad file deletion out of v1 unless the
  approved Markdown cleanup plan explicitly includes them.
- Make the final GitHub push a final operator instruction. Cleanup can validate,
  commit when approved, and prepare the push path, but it should ask at the end
  before pushing unless the current operator turn has already supplied that
  final push instruction.
- Update the help and validation surfaces so the new skills are discoverable and
  canonical.

## Testing Decisions

- Validate the new skill metadata through the existing workflow-state validator.
- Verify the tracker package so generated workflow-state UI data remains
  coherent after task and skill additions.
- Use skill contract review as the main behavior test because the skills are
  workflow instructions, not executable runtime code.
- Use validator behavior as the enforcement seam for phase guards, linked
  artifacts, canonical skill invocation names, and implementation artifact
  gating.
- Use generated tracker verification as the integration seam for task state,
  linked artifacts, and derived task counts.

## Out Of Scope

- Changing `audit-foundry` into a mutating skill.
- Replacing project-local JSON task tracking.
- Adding command shims or prompt files.
- Building a general file-deletion or source-refactor bot.
- Pushing to GitHub without an explicit final operator instruction.
- Closing unrelated open tasks such as foundry expansion discovery or the
  general checkpoint follow-up.

## Further Notes

The main design risk is the handoff between review and cleanup. The cleanup
skill must be convenient enough to resolve live tracker conflicts, but strict
enough that audit text does not become an untracked mutation command.
