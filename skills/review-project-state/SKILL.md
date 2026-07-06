---
name: review-project-state
description: Load and review the complete JSON state for a workflow project before task work. Use when the user asks to review project state, inspect active tasks, see blocked or in-progress work, check conflicts, or prepare to initiate or continue a task.
---

# Review Project State

Use this skill to inspect a workflow project before task work. This is the
project dashboard: load everything before recommending or editing anything.

## Required Reading

Before acting:

1. Read root `AGENTS.md`.
2. Read `skills/initiate-task/SKILL.md`.
3. Read `references/matt-pocock-skills.md`.
4. Read `registry/agents-md.json`.

## Inputs

Require:

- `project:<slug>`

If missing, ask for the project and stop.

## Load Everything

Load, load, load, load, load.

1. Read `projects/<project-slug>/project.json`.
2. Read `projects/<project-slug>/AGENTS.md`.
3. Read `projects/<project-slug>/tasks/index.json`.
4. Run `node scripts/query-workflow-state.mjs --project <project-slug> --agents-md`
   if available.
5. Run `node scripts/query-workflow-state.mjs --project <project-slug> --list-tasks`
   if available.
6. Read every task JSON listed in the index whose status is not `done`.
7. Read recently completed task summaries from the index.
8. Check missing task files, invalid states, dependency conflicts, stale linked
   artifacts, and tasks in the same Matt phase.

## Output Contract

Report:

```text
PROJECT
- slug
- project_state
- goal / domain
- ECC concepts applied
- registered AGENTS.md path

TASK STATE
- active
- blocked
- in-progress
- todo
- recently completed

CONFLICTS
- dependency conflicts
- related task conflicts
- missing artifacts or task files
- unregistered or misplaced AGENTS.md files

NEXT SAFE ACTION
- initiate task / continue task / fix tracker state / ask user
```

Do not edit project state from this skill unless the user explicitly asks for a
fix after reviewing the report.
