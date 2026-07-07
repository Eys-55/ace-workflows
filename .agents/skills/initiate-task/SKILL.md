---
name: initiate-task
description: Canonical task creation skill for this repo. Use when the user invokes initiate-task, asks to start a new project task, create a tracker-maintenance task with target:tracker, query current task state before creation, or coordinate parallel tasks inside projects/<project-slug>/ using JSON state, Matt Pocock phases, and ECC concepts.
---

# Initiate Task

Use this skill as the canonical task creation entrypoint. The only task
operations are exposed as skills:

- `$initiate-task`: initiate a new task
- `$continue-task`: continue an existing task

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

For every initiate request:

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

If project state is missing, do not create a separate scaffold from this skill.
Hand off to `$setup-workflow-project` first, then stop. After setup succeeds,
the next invocation may initiate the first task.

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
      "task_kind": "workflow-change",
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
  "task_kind": "workflow-change",
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
  "phase_guard": {
    "selected_next_action": "none",
    "approved_artifacts": [],
    "process_exceptions": []
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

Allowed task kinds:

```text
workflow-change, tracker-maintenance
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

Use when the user invokes `$initiate-task` or asks to create/start a new task.

Required input:

- `project:<slug>`
- `title:"..."`

Accept:

- `target:tracker` to create a tracker-maintenance task

Process:

1. Load the whole project state first.
2. If the project is missing, hand off to `$setup-workflow-project` and stop.
3. Generate the next id as `<project-slug>-NNN`.
4. Create the task at `status: "todo"` and `matt_phase: "intake"`.
5. Set `task_kind` to `tracker-maintenance` when `target:tracker` is provided;
   otherwise set it to `workflow-change`.
6. Set `explicit_next_action_required: true`.
7. Populate `ecc_concepts_applied` with at least `workflow contract`,
   `human boundary`, and `project state preload`.
8. Populate `phase_guard` with `selected_next_action: "none"`, empty
   `approved_artifacts`, and empty `process_exceptions`.
9. For `tracker-maintenance`, add tracker files expected to change to
   `linked_artifacts`, such as `project.json`, `tasks/index.json`, task JSON
   files, or `registry/agents-md.json`.
10. Populate `context_snapshot.must_load` with root `AGENTS.md`,
   `registry/agents-md.json`, project `AGENTS.md`, project JSON, index JSON, and
   all non-done task JSON files known at creation time.
11. Update `tasks/index.json`.
12. Report the created task and stop.

Do not enter grilling, PRD, issues, implementation, or review in the same turn
unless the user explicitly asks to continue that task after creation.

Creating a `tracker-maintenance` task is the allowed bootstrap tracker write.
After that task exists, further tracker edits must happen through
`$continue-task` on that task.

## Continue A Task

Use when the user invokes `$continue-task`, asks to continue a task, or asks to
resume/revert back to a task.

Process:

1. Load the whole project state first.
2. If no task id is provided, list selectable tasks using
   `scripts/query-workflow-state.mjs` when available and ask the user to choose.
3. Load root `AGENTS.md`, the registry, project `AGENTS.md`, the selected task's
   `context_snapshot`, and linked artifacts.
4. Report current `status`, `matt_phase`, ECC concepts, open dependencies,
   related tasks, and conflicts.
5. Report `phase_guard.selected_next_action`, approved artifacts, and process
   exceptions.
6. Ask for the next explicit instruction if the user did not provide one.

Resume/revert means resume snapshot only:

- Load all project and task context.
- Continue from the saved Matt phase.
- Do not run `git revert`.
- Do not mark artifacts superseded unless the user explicitly asks.

If the task changes project agent behavior, target
`projects/<project-slug>/AGENTS.md`, add it to `linked_artifacts`, and keep it
in `context_snapshot.must_load`.

## Phase Guard

Artifact creation is phase-gated.

- If the selected task is still `intake`, do not create scripts, HTML, skills,
  workflow artifacts, tests, or implementation files.
- Before creating any script, HTML, skill, workflow artifact, test, or other
  implementation artifact, the selected task must include a matching
  `phase_guard.approved_artifacts` entry with the artifact `path`, phase
  `implement`, `approval_note`, and `approved_at`.
- Tracker bootstrap writes are allowed only for creating the
  `tracker-maintenance` task itself. Further tracker edits must continue that
  tracker-maintenance task.
- If validation reports an unapproved artifact, stop and return to the current
  Matt phase. Do not adopt the artifact as design unless the user explicitly
  approves the phase action.

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
- task_kind
- matt_phase
- ECC concepts applied
- context snapshot loaded
- phase guard loaded

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
