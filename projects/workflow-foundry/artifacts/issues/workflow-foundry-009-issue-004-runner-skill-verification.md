# Issue 004: Add Tracker Runner Skill And Verification

## Parent

`workflow-foundry-009`

## What to build

Create the `workflow-tracker-ui` skill under the canonical `.agents/skills`
surface. The skill should default to fast open/start behavior for the Astro
tracker and include an explicit optional verification path. Finish by validating
the skill metadata, tracker build output, tracker tests, and local UI behavior.

## Acceptance criteria

- [ ] The skill folder name and frontmatter name match `workflow-tracker-ui`.
- [ ] The skill instructs the agent to open an already-running tracker or start Astro when needed.
- [ ] The skill includes an optional verification mode for test/build checks.
- [ ] Codex metadata exists under `agents/openai.yaml`.
- [ ] Workflow validation, tracker tests, tracker build, generated-output tests, and a local UI smoke check pass.

## Blocked by

- `workflow-foundry-009-issue-001-derived-state.md`
- `workflow-foundry-009-issue-002-project-console-ui.md`
- `workflow-foundry-009-issue-003-task-detail-command.md`
