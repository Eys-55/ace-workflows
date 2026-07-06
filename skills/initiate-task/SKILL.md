---
name: initiate-task
description: Canonical task workflow skill for this repo. Use when the user invokes initiate-task, /initiate-task, /continue-task, asks to start a new project task, continue an existing task, resume a task snapshot, query current task state, or coordinate parallel tasks inside projects/<project-slug>/ using JSON state, Matt Pocock phases, and ECC concepts.
---

# Initiate Task

Use this skill as the canonical task workflow entrypoint. The only task
operations are:

- initiate a new task
- continue an existing task

Matt Pocock phases are task state. Do not split them into separate repo-local
skills.

## Required Reading

Before acting:

1. Read the root `AGENTS.md`.
2. Read `references/matt-pocock-skills.md`.
3. Read this skill completely.
4. Read `registry/agents-md.json`.
5. If work enters or continues a Matt phase, inspect the matching upstream Matt
   Pocock skill named in `references/matt-pocock-skills.md`.

## Load Everything First

Load, load, load, load, load before doing anything with a task.

For every initiate or continue request:

1. Read root `AGENTS.md`.
2. Read `registry/agents-md.json`.
3. Read `projects/<project-slug>/AGENTS.md`.
4. Read `projects/<project-slug>/project.json`.
5. Read `projects/<project-slug>/tasks/index.json`.
6. Run `node scripts/query-workflow-state.mjs --project <project-slug> --list-tasks`
   if the script exists.
7. Run `node scripts/query-workflow-state.mjs --project <project-slug> --agents-md`
   if the script exists.
8. Read every task JSON listed in the index whose status is not `done`.
9. Read the selected task JSON if a task id is provided.
10. Review active, blocked, in-progress, and recently completed work.
11. Report conflicts or state gaps before taking any task action.

If project state is missing, only create it when the request is explicitly to
set up a project or initiate the first task in that project.

## State Model

Project state lives in `project.json`:

```json
{
  "project_slug": "health",
  "name": "Health",
  "project_state": "active",
  "goal": "",
  "domain": "",
  "agents_md": "projects/health/AGENTS.md",
  "active_conventions": [],
  "ecc_concepts_applied": [],
  "created_at": "YYYY-MM-DD",
  "updated_at": "YYYY-MM-DD"
}
```

Task index lives in `tasks/index.json`:

```json
{
  "project_slug": "health",
  "tasks": [
    {
      "task_id": "health-001",
      "title": "Short task title",
      "status": "todo",
      "matt_phase": "intake",
      "updated_at": "YYYY-MM-DD"
    }
  ]
}
```

Each task lives in `tasks/<task-id>.json`:

```json
{
  "task_id": "health-001",
  "project_slug": "health",
  "title": "Short task title",
  "status": "todo",
  "matt_phase": "intake",
  "explicit_next_action_required": true,
  "summary": "What this task is trying to build",
  "acceptance_criteria": [],
  "ecc_concepts_applied": [],
  "context_snapshot": {
    "summary": "",
    "must_load": []
  },
  "dependencies": [],
  "related_tasks": [],
  "linked_artifacts": [],
  "session_log": [],
  "created_at": "YYYY-MM-DD",
  "updated_at": "YYYY-MM-DD"
}
```

Allowed project states:

```text
active, paused, archived
```

Allowed task statuses:

```text
todo, in-progress, blocked, done
```

Allowed Matt phases:

```text
intake, grilling, prd, issues, implement, code-review, done
```

## ECC Concepts

Document ECC concepts applied at project and task level. Use these names unless
there is a clear reason to add a more specific concept:

```text
workflow contract
input contract
output artifact
eval gate
human boundary
handoff
reviewer lane
parallel task context
project state preload
```

## Initiate A Task

Use when the user invokes `/initiate-task` or asks to create/start a new task.

Required input:

- `project:<slug>`
- `title:"..."`

Process:

1. Load the whole project state first.
2. Create missing project scaffold only if the project is new.
3. Generate the next id as `<project-slug>-NNN`.
4. Create the task at `status: "todo"` and `matt_phase: "intake"`.
5. Set `explicit_next_action_required: true`.
6. Populate `ecc_concepts_applied` with at least `workflow contract`,
   `human boundary`, and `project state preload`.
7. Populate `context_snapshot.must_load` with root `AGENTS.md`,
   `registry/agents-md.json`, project `AGENTS.md`, project JSON, index JSON, and
   all non-done task JSON files known at creation time.
8. Update `tasks/index.json`.
9. Report the created task and stop.

Do not enter grilling, PRD, issues, implementation, or review in the same turn
unless the user explicitly asks to continue that task after creation.

## Continue A Task

Use when the user invokes `/continue-task`, asks to continue a task, or asks to
resume/revert back to a task.

Process:

1. Load the whole project state first.
2. If no task id is provided, list selectable tasks using
   `scripts/query-workflow-state.mjs` when available and ask the user to choose.
3. Load root `AGENTS.md`, the registry, project `AGENTS.md`, the selected task's
   `context_snapshot`, and linked artifacts.
4. Report current `status`, `matt_phase`, ECC concepts, open dependencies,
   related tasks, and conflicts.
5. Ask for the next explicit instruction if the user did not provide one.

Resume/revert means resume snapshot only:

- Load all project and task context.
- Continue from the saved Matt phase.
- Do not run `git revert`.
- Do not mark artifacts superseded unless the user explicitly asks.

If the task changes project agent behavior, target
`projects/<project-slug>/AGENTS.md`, add it to `linked_artifacts`, and keep it
in `context_snapshot.must_load`.

## Matt Phase Handling

Matt phases are allowed only inside a selected task.

- `grilling`: use Matt's `grill-with-docs` and ask one blocking question at a
  time.
- `prd`: use Matt's `to-prd` and write/link the PRD under project artifacts.
- `issues`: use Matt's `to-issues` and write/link issue artifacts under project
  artifacts.
- `implement`: use Matt's `implement`, which drives `tdd`.
- `code-review`: use Matt's `code-review` against standards and spec.

Never create repo-local phase substitute skills such as `write-workflow-prd`,
`split-workflow-issues`, or `advance-task-phase`.

## Output Contract

Every invocation must report:

```text
PROJECT
- slug
- project_state
- root AGENTS.md loaded
- registry loaded
- project AGENTS.md loaded
- tracker files read

PROJECT TASK STATE
- active / blocked / in-progress / recently completed tasks reviewed
- conflicts or none found

TASK
- id
- title
- status
- matt_phase
- ECC concepts applied
- context snapshot loaded

ACTION
- initiated / continued / waiting for task selection / blocked
- explicit next instruction required
```

## Validation

Run before committing workflow-state changes:

```bash
node scripts/validate-workflow-state.mjs
```

Use query helper when selecting or inspecting tasks:

```bash
node scripts/query-workflow-state.mjs --project health --list-tasks
node scripts/query-workflow-state.mjs --project health --task health-001
```
