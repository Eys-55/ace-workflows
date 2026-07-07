# Issue 005: Document Read-Only Live Workflow Use

## Parent

`workflow-foundry-008` - Project Testing Sessions

## What to build

Document the operator-facing testing-session contract so future agents know the
mode is read-only but still represents real workflow use. The documentation
should make clear that testing sessions store captured run state only: they do
not create recommendations, initiate tasks, continue tasks, or mutate normal
workflow state by default.

This slice gives the workflow a clear handoff contract after the executable
session lifecycle and validation are in place.

## Acceptance criteria

- [x] The testing-session skill documentation explains start, stop, and status
      actions.
- [x] The documentation states that testing sessions are read-only against
      normal project state.
- [x] The documentation states that testing sessions represent real workflow
      use, not a fake harness.
- [x] The documentation states that testing sessions only store captured run
      state by default.
- [x] The documentation describes the session folder layout and index role.
- [x] The documentation describes how future agents should discover prior
      testing-session state.
- [x] Workflow-state validation still passes after this slice.

## Blocked by

- `workflow-foundry-008-issue-001-start-session`
- `workflow-foundry-008-issue-002-status-stop`
- `workflow-foundry-008-issue-003-project-preload-discovery`
- `workflow-foundry-008-issue-004-validation-fixtures`

## User stories covered

- 4. Actually use workflows during testing
- 5. Run independently
- 9. Preserve human-readable context
- 14. Let future agents consider prior captured runs
- 17. Avoid automatic recommendations
- 19. Preserve the skills-first workflow surface
