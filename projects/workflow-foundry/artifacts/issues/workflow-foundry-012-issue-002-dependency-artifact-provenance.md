# Issue 002: Dependency Artifact Provenance

## Parent

`workflow-foundry-012` - Add capability dependencies to initiate-task

## What to build

Define how dependency-created artifacts are owned, labeled, indexed, and
promoted. A dependency skill may create real artifacts during intake, grilling,
or later task execution, but those artifacts belong to the primary project task
and must carry provenance back to the dependency project and selected skill.

The completed slice should make it clear which dependency artifacts became
official deliverables and which remain linked evidence or context.

## Acceptance criteria

- [x] Dependency-created artifacts are owned and indexed under the primary project task by default.
- [x] Dependency project trackers are not mutated with backlinks by default.
- [x] Intake or grilling dependency artifacts can be created when needed to understand or prepare the task.
- [x] Intake or grilling dependency artifacts are labeled with phase, primary task provenance, dependency project, source workflow or skill, purpose, generated files, and protected-boundary metadata.
- [x] Post-grilling PRD inclusion promotes an intake or grilling dependency artifact into an official task artifact.
- [x] Promotion preserves original dependency provenance and adds promotion metadata.
- [x] Intake or grilling dependency artifacts not named in the PRD remain linked evidence or context, not final deliverables.
- [x] After a dependency step runs, provenance records include primary project, primary task id, dependency step id, dependency project, selected skill, helper skills used, inputs, generated artifacts, write plan used, phase, timestamp, and artifact status.

## Blocked by

- `workflow-foundry-012-issue-001-capability-task-draft`

## User stories covered

- 14. Dependency-created artifacts are owned by the primary task
- 15. Dependency-created artifacts keep dependency provenance
- 16. Intake and grilling dependency calls can create real artifacts
- 17. PRD-named early artifacts can become official task artifacts
- 18. Unpromoted artifacts remain evidence or context
- 19. Dependency artifacts are indexed under the primary task
- 25. Provenance records exist after every dependency step
