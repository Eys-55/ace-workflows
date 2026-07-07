# Issue 003: Dependency Write Plan Gate

## Parent

`workflow-foundry-012` - Add capability dependencies to initiate-task

## What to build

Add the implementation readiness gate for dependency steps. Every dependency
step must have an approved `dependency_write_plan` before implementation can run
that step. The plan should define expected output paths or patterns, allowed
write zones, protected paths, artifact promotion rules, provenance requirements,
and stop conditions.

The completed slice should let implementation proceed continuously when the plan
is complete, and stop immediately when a selected dependency skill or documented
helper tries to write outside the approved boundary.

## Acceptance criteria

- [x] PRD or issue artifacts can specify a `dependency_write_plan` for every dependency step.
- [x] Each write plan names expected output paths or patterns, allowed write zones, protected paths, promotion rules, provenance requirements, and stop conditions.
- [x] Implementation preflight verifies that every dependency step has an approved write plan before dependency execution.
- [x] Dependency execution is blocked when any required write plan is missing or incomplete.
- [x] Selected dependency skills may call documented helper skills when helpers are part of the selected skill's normal workflow.
- [x] Helper skill usage is recorded in dependency provenance after use.
- [x] Execution stops and asks the operator if a selected dependency skill or helper attempts to write outside the approved artifact boundary.
- [x] Source-project control-plane files, dependency tracker files, dependency skill definitions, and dependency `AGENTS.md` files are protected unless a later explicitly approved tracker task allows mutation.

## Blocked by

- `workflow-foundry-012-issue-001-capability-task-draft`
- `workflow-foundry-012-issue-002-dependency-artifact-provenance`

## User stories covered

- 12. Selected dependency skills can call documented helper skills
- 13. Helper usage is recorded after the fact
- 22. Every dependency step has a write plan before implementation
- 23. Implementation preflight blocks missing write plans
- 24. Out-of-bound writes stop execution
- 25. Provenance records exist after every dependency step
