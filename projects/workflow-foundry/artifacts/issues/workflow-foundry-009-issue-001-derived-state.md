# Issue 001: Derive Project Console State

## Parent

`workflow-foundry-009`

## What to build

Expose the project and task data needed by the v2 tracker UI through the
existing workflow-state loader. The selected UI should be able to render project
counts, hot phase, lifecycle phase, next-action text, grouped artifact labels,
continue commands, and recent session events without recomputing workflow logic
inside the template.

## Acceptance criteria

- [ ] Each project exposes open, blocked, in-review, done, active task count, and hot phase fields.
- [ ] Each task exposes a lifecycle phase, readable next-action text, exact continue command, recent session events, and full session log.
- [ ] Linked artifacts are grouped by PRD, Issues, Skills, Tracker, Tests, and Other with labels separate from raw paths.
- [ ] Data tests cover representative derived project and task fields.

## Blocked by

None - can start immediately.
