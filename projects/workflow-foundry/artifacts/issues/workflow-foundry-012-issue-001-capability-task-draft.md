# Issue 001: Capability Dependency Task Drafts

## Parent

`workflow-foundry-012` - Add capability dependencies to native Codex planning

## What to build

Extend the task initiation workflow so a new primary project task can explicitly
include capability dependencies on usable skills from another known project. The
operator should be able to state the dependency directly or in natural language,
have `native Codex planning` infer and confirm the dependency, load the selected
dependency project's usable known skills, and review a final task draft before
any task JSON is written.

The completed slice should preserve the existing normal initiation path for
tasks with no dependencies.

## Acceptance criteria

- [x] `native Codex planning` can model `capability_dependencies` for a primary project task without creating a helper task in the dependency project.
- [x] Natural-language dependency mentions are inferred but require explicit operator confirmation before task creation.
- [x] Dependency suggestions come only from known registered tracker context and existing project, task, skill, or artifact records.
- [x] Dependency projects do not need to advertise reusable capabilities.
- [x] When a dependency project is selected, initiation loads all usable known skills or skill metadata for that project plus enough relationship context to understand selected skill calls.
- [x] The final task draft includes primary project, title, summary, selected capability dependencies, ordered dependency steps, selected dependency skill map, allowed writes, protected paths, expected artifacts, and acceptance criteria.
- [x] The dependency skill map lists only selected dependency skills; loaded-but-not-selected skills are not approved for use.
- [x] The created task remains a single primary project task at `removed_lifecycle_field:intake`.
- [x] Existing task creation with no capability dependencies still follows the current initiation contract.

## Blocked by

None - can start immediately.

## User stories covered

- 1. One primary project task can call another project's workflow capability
- 2. Health task can call real-life-workflows skills
- 3. Dependency use is explicit in task JSON
- 4. Inferred dependencies require confirmation
- 5. Ordered dependency steps are part of the task plan
- 6. Initiate can suggest dependencies from known tracker context
- 7. Dependency suggestions are limited to known trackers
- 8. Projects remain standalone and do not advertise themselves
- 9. Initiate loads usable known skills for the dependency project
- 10. Task draft shows selected dependency skills
- 11. Loaded-but-not-selected skills are excluded from approval
- 26. Existing tasks without dependencies keep working
