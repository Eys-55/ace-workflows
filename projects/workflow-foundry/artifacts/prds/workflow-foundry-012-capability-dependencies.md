# PRD: Initiate Task Capability Dependencies

Task: `workflow-foundry-012`
Status: Ready for issue breakdown

## Problem Statement

The foundry is organized around standalone workflow projects. Each project can
own its own instructions, skills, trackers, artifacts, and domain workflow.
That isolation is useful, but real work can still require one project to use a
workflow capability from another project.

For example, a health project task may need to use the real-life-workflows
project to discover relevant workflows or create workflow packets. That should
not create a second helper task by default, mutate the dependency project's
tracker, or turn the dependency project into an advertised shared library. The
operator wants one primary task that can explicitly call another project's
usable workflow skills while preserving provenance, write boundaries, and
source-project isolation.

The current task flow does not have a durable model for this. Without one,
dependency-created files can look like ordinary dependency-project outputs,
implementation can stall when write boundaries are unclear, and later reviewers
cannot tell which task caused which packet or artifact to be created.

## Solution

Extend the task workflow so `native Codex planning` and `native Codex planning` can model
explicit capability dependencies.

A capability-dependent task remains a single primary project task. It may name
one or more external workflow capabilities as `capability_dependencies`, and it
may include ordered `dependency_steps` that say when and why those capabilities
are called.

Dependency projects do not need to advertise themselves. `native Codex planning` may
suggest dependencies only from known registered tracker context and existing
project, task, skill, or artifact records. It must not broadly scan arbitrary
project folders looking for capabilities.

When a dependency project is selected, `native Codex planning` loads all usable known
skills or skill metadata for that dependency project, plus enough relationship
context to understand how the selected skills can be called. It does not need
to audit or load the entire workflow agent.

Before task creation, `native Codex planning` presents a final task draft that includes
the primary project, task title, summary, capability dependencies, ordered
dependency steps, selected dependency skill map, allowed writes, protected
paths, expected artifacts, and acceptance criteria. It waits for explicit
operator approval before writing task JSON.

Dependency calls may happen during intake or planning when needed to understand
or prepare the task. Those calls may create real artifacts. Any such artifact
must be labeled as an intake or planning dependency artifact and indexed under
the primary task with provenance. If the post-planning PRD names the artifact,
it becomes an official task artifact with promotion metadata. If the PRD does
not name it, it remains linked evidence or context, not a final deliverable.

Before implementation starts, the PRD or issues must include a
`dependency_write_plan` for every dependency step. Implementation preflight must
verify those plans and block dependency execution if any required plan is
missing or incomplete.

If a selected dependency skill or documented helper skill tries to write outside
the approved artifact boundary, execution stops and asks the operator. The PRD
and issue phases should settle expected write zones early so implementation can
run continuously once it starts.

## User Stories

1. As the foundry operator, I want one primary project task to call another project's workflow capability, so that cross-project work stays unified.
2. As the foundry operator, I want a health task to call real-life-workflows skills, so that workflow packet creation can happen inside the health task's plan.
3. As the foundry operator, I want dependency use to be explicit in task JSON, so that I can audit why another project was used.
4. As the foundry operator, I want `capability_dependencies` to be confirmed before task creation, so that inferred dependencies do not silently become approved.
5. As the foundry operator, I want ordered `dependency_steps`, so that dependency calls are part of the task plan rather than loose metadata.
6. As the foundry operator, I want `native Codex planning` to suggest dependencies from known tracker context, so that I can find useful workflows without remembering every skill name.
7. As the foundry operator, I want dependency suggestions limited to known trackers, so that arbitrary project folders are not scanned or connected accidentally.
8. As the foundry operator, I want projects to remain standalone, so that a project does not need to advertise itself as a reusable capability.
9. As the foundry operator, I want `native Codex planning` to load all usable known skills for a selected dependency project, so that the chosen dependency is understood in context.
10. As the foundry operator, I want the task draft to show selected dependency skills, so that approval is specific.
11. As the foundry operator, I want loaded-but-not-selected skills excluded from the approved call surface, so that broad loading does not imply broad permission.
12. As the foundry operator, I want selected dependency skills to call documented helper skills, so that normal workflow behavior still works.
13. As the foundry operator, I want helper usage recorded after the fact, so that provenance remains complete.
14. As the foundry operator, I want dependency-created artifacts owned by the primary task, so that the task that caused the work owns the result.
15. As the foundry operator, I want dependency-created artifacts to keep dependency provenance, so that reviewers can trace which project and skill produced them.
16. As the foundry operator, I want intake and planning dependency calls to create real artifacts when useful, so that early discovery work does not need to be recreated later.
17. As the foundry operator, I want PRD-named intake or planning artifacts promoted into official task artifacts, so that valuable early outputs become durable deliverables.
18. As the foundry operator, I want unpromoted intake or planning artifacts retained as evidence, so that context is preserved without bloating final deliverables.
19. As the foundry operator, I want dependency artifacts indexed under the primary task by default, so that dependency project trackers are not mutated.
20. As the foundry operator, I want `native Codex planning` to propose new dependency steps when execution discovers a real need, so that large projects can adapt midstream.
21. As the foundry operator, I want new mid-execution dependencies to require approval, so that hidden cross-project calls do not happen.
22. As the foundry operator, I want every dependency step to have a write plan before implementation, so that implementation can proceed without repeated boundary interruptions.
23. As the foundry operator, I want implementation preflight to block missing write plans, so that dependency calls cannot run with unclear artifact boundaries.
24. As the foundry operator, I want out-of-bound writes to stop execution, so that dependency skills cannot mutate protected project state.
25. As a future maintainer, I want provenance records after every dependency step, so that generated artifacts can be explained later.
26. As a future maintainer, I want existing tasks without dependencies to keep working, so that this model does not disrupt the normal task flow.
27. As a future maintainer, I want validation or fixtures for the new schema, so that dependency contracts do not regress.
28. As a future maintainer, I want direct project-wrapper integration kept separate, so that capability dependencies do not become a broad project import mechanism.

## Implementation Decisions

- Keep `native Codex planning` as the operator-facing entrypoint.
- Do not create a separate primary skill for connecting projects.
- Treat the current model as capability dependency, not direct project
  integration.
- A capability-dependent task is created under the primary project and remains a
  single task.
- Add optional `capability_dependencies` task data for external project
  workflow capabilities that the task may call.
- Add ordered `dependency_steps` task data for explicit external capability
  calls inside the primary task sequence.
- Each dependency step records its purpose, dependency project, selected skill,
  expected inputs, expected outputs, allowed writes, protected paths, and
  provenance requirements.
- Allow dependency inference from natural language, but require operator
  confirmation before task creation.
- Suggest dependencies only from known registered tracker context and existing
  project, task, skill, or artifact records.
- Do not require projects to publish or advertise reusable capability records.
- When a dependency project is selected, load all usable known skills or skill
  metadata for that dependency project.
- Load enough relationship notes to understand how selected skills can be
  called, but do not require a full dependency-project audit.
- Include a compact dependency skill map in the task draft.
- The skill map lists only dependency skills selected for the task.
- Loaded-but-not-selected skills are not approved for use.
- Selected dependency skills may call documented helper skills when those
  helpers are part of the selected skill's normal workflow.
- Record helper skill usage in provenance after use.
- Allow dependency calls during intake and planning when needed to understand or
  prepare the task.
- Allow intake and planning dependency calls to create real artifacts.
- Label pre-execution dependency artifacts with phase, primary task,
  dependency project, source workflow or skill, purpose, generated files, and
  protected-boundary metadata.
- Promote intake or planning dependency artifacts into official task artifacts
  when the post-planning PRD names them.
- Keep unpromoted intake or planning artifacts as linked evidence or context.
- Index dependency-created artifacts under the primary task by default.
- Do not mutate the dependency project tracker with backlinks by default.
- Allow `native Codex planning` to propose a new dependency step later when execution
  discovers a real need.
- Require workflow context loading and operator approval before using any
  newly discovered dependency step.
- Require a `dependency_write_plan` for every dependency step before
  implementation starts.
- Make implementation preflight verify all dependency write plans before
  running dependency steps.
- Stop execution when a dependency skill or documented helper tries to write
  outside the approved boundary.
- Preserve direct project wrapper, adapter, and connection-registry work for a
  separate task unless it is only needed to support provenance for this model.

## Testing Decisions

- Test the task model at the highest available seam: task creation and task
  continuation behavior.
- Add fixtures or validation coverage for a task with `capability_dependencies`
  and ordered `dependency_steps`.
- Verify that a dependency task draft includes selected dependency skills,
  expected artifacts, allowed writes, protected paths, and acceptance criteria.
- Verify that loaded-but-not-selected dependency skills are not part of the
  approved call surface.
- Verify that documented helper calls are allowed only under a selected
  dependency skill and are recorded in provenance.
- Verify that a dependency step cannot run before it has an approved
  `dependency_write_plan`.
- Verify that write plans include expected output paths or patterns, allowed
  write zones, protected paths, promotion rules, provenance requirements, and
  stop conditions.
- Verify that out-of-bound writes block execution instead of silently creating
  files elsewhere.
- Verify that dependency-created artifacts are indexed under the primary task.
- Verify that dependency project trackers are not mutated by default.
- Verify that PRD-named intake or planning dependency artifacts can be promoted.
- Verify that non-promoted intake or planning dependency artifacts remain
  evidence or context only.
- Verify that provenance records include primary project, primary task id,
  dependency step id, dependency project, selected skill, helper skills used,
  inputs, generated artifacts, write plan used, phase, timestamp, and artifact
  status.
- Run workflow-state validation after implementation.

## Out of Scope

- Creating a separate connect-project skill.
- Making dependency projects advertise reusable capabilities.
- Broad live scans of arbitrary project folders for possible dependencies.
- Creating foundry wrappers or adapters for source project skills.
- Building a full source-project connection registry.
- Mutating dependency project trackers with backlinks by default.
- Auditing the entire dependency workflow agent during task initiation.
- Replacing the normal previous workflow task phases.
- Creating one helper task per dependency project by default.
- Implementing a real health workflow or real-life-workflows packet in this
  task.
- Pushing, publishing, or modifying external services.

## Further Notes

This PRD supersedes the earlier direct connection and wrapper framing from the
planning history. In this task, "connection" means an explicit capability
dependency inside a primary project task. The dependency project stays isolated,
the primary task owns dependency-created artifacts, and provenance explains how
those artifacts were produced.
