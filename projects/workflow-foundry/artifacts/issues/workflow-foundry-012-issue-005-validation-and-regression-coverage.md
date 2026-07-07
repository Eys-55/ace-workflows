# Issue 005: Validation And Regression Coverage

## Parent

`workflow-foundry-012` - Add capability dependencies to initiate-task

## What to build

Add validation, fixtures, or deterministic checks that prove capability
dependencies are explicit, bounded, and backward compatible. The checks should
exercise the new task fields and dependency execution gates without turning
capability dependencies into a direct project wrapper or broad project import
mechanism.

The completed slice should make the new contract hard to regress and should
preserve the existing task workflow for tasks that do not use dependencies.

## Acceptance criteria

- [x] Validation or fixtures cover task JSON with `capability_dependencies` and ordered `dependency_steps`.
- [x] Validation or fixtures prove loaded-but-not-selected dependency skills are not approved for use.
- [x] Validation or fixtures prove dependency suggestions are limited to known registered tracker context, not broad live folder scans.
- [x] Validation or fixtures prove dependency project trackers are not mutated with backlinks by default.
- [x] Validation or fixtures prove a dependency step cannot run without an approved `dependency_write_plan`.
- [x] Validation or fixtures prove out-of-bound dependency writes stop instead of silently creating files elsewhere.
- [x] Validation or fixtures prove provenance is recorded for dependency-created artifacts.
- [x] Validation or fixtures prove normal tasks without capability dependencies still validate and initiate through the existing path.
- [x] Workflow-state validation passes after implementation.

## Blocked by

- `workflow-foundry-012-issue-001-capability-task-draft`
- `workflow-foundry-012-issue-002-dependency-artifact-provenance`
- `workflow-foundry-012-issue-003-dependency-write-plan-gate`
- `workflow-foundry-012-issue-004-continue-time-dependency-steps`

## User stories covered

- 7. Dependency suggestions are limited to known trackers
- 11. Loaded-but-not-selected skills are excluded from approval
- 19. Dependency artifacts are indexed under the primary task
- 23. Implementation preflight blocks missing write plans
- 24. Out-of-bound writes stop execution
- 25. Provenance records exist after every dependency step
- 26. Existing tasks without dependencies keep working
- 27. Validation or fixtures cover the new schema
- 28. Direct project-wrapper integration stays separate
