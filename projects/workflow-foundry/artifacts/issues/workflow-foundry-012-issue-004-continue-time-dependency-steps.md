# Issue 004: Continue-Time Dependency Steps

## Parent

`workflow-foundry-012` - Add capability dependencies to native Codex planning

## What to build

Extend `native Codex planning` so an in-progress primary task can add a new dependency
step when execution reveals a real dependency that was not known during
initiation. The workflow should load the referenced dependency workflow context,
show the proposed dependency step and write boundary, and require explicit
operator approval before the dependency can be used.

The completed slice should keep mid-execution dependency discovery auditable
rather than allowing ad hoc cross-project calls.

## Acceptance criteria

- [x] `native Codex planning` can propose a new `dependency_step` for the selected primary task when execution discovers a missing dependency.
- [x] The proposal loads the referenced dependency project's usable known skills or skill metadata before approval.
- [x] The proposed dependency step includes purpose, dependency project, selected skill, expected inputs, expected outputs, allowed writes, protected paths, and provenance requirements.
- [x] The proposed dependency step includes or points to a required `dependency_write_plan`.
- [x] The operator must explicitly approve the new dependency step before it can be used.
- [x] Approved mid-execution dependency steps are recorded in the primary task, not in the dependency project tracker.
- [x] Rejected or unapproved dependency proposals do not become part of the approved call surface.

## Blocked by

- `workflow-foundry-012-issue-001-capability-task-draft`
- `workflow-foundry-012-issue-003-dependency-write-plan-gate`

## User stories covered

- 20. native Codex planning can propose new dependency steps mid-execution
- 21. New mid-execution dependencies require approval
- 22. Every dependency step has a write plan before implementation
- 23. Implementation preflight blocks missing write plans
