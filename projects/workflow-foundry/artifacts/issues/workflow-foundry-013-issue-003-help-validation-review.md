# Issue 003: Update Help, Validation, And Review Surfaces

Parent: workflow-foundry-013

## What To Build

Expose `audit-review` and `audit-cleanup` as canonical foundry skills, update
the help surface so operators can discover the new workflow, update validation
where canonical skill names are enumerated, and complete a focused code-review
against the PRD.

## Acceptance Criteria

- [x] Workflow help lists `audit-review` and `audit-cleanup` in the available
      skill guide.
- [x] Validation treats the new skills as canonical `$skill-name` surfaces.
- [x] Workflow state validation passes.
- [x] Tracker verification passes.
- [x] A focused standards/spec review finds no blocking issues or records the
      remaining risks.
- [x] The task is closed only after implementation and review complete.

## Blocked By

Issues 001 and 002.
