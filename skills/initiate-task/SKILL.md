---
name: initiate-task
description: Start or resume a project workflow task in this repo using the JSON task tracker, Matt Pocock flow, and ECC workflow discipline. Use when the user invokes initiate-task, /initiate-task, asks to start a task, resume a task, proceed to a Matt phase, or coordinate parallel workflow tasks inside projects/<project-slug>/.
---

# Initiate Task

Use this skill as the canonical entrypoint for starting or resuming workflow
tasks in this repository.

## Required Reading

Before acting:

1. Read the root `AGENTS.md`.
2. Read `references/matt-pocock-skills.md`.
3. Read this skill completely.
4. If the task enters a Matt phase, inspect the matching upstream Matt Pocock
   skill named in `references/matt-pocock-skills.md`.

## Operating Contract

The task tracker is JSON. The workflow instructions and artifacts are Markdown.
Python is forbidden. `.mjs` may be used only for JSON validation and query
helpers.

Matt phases:

```text
intake -> grilling -> prd -> issues -> implement -> code-review -> done
```

Never auto-continue across phases. Report the current phase and stop unless the
user explicitly requested the phase action in this turn.

Explicit phase action examples:

```text
/initiate-task project:health task:health-001 proceed:grilling
/initiate-task project:health task:health-001 proceed:prd
proceed to issues for health-001
continue code-review for health-001
```

## Project Shape

Use this structure:

```text
projects/
  <project-slug>/
    project.json
    tasks/
      index.json
      <task-id>.json
    artifacts/
      prds/
      issues/
      reviews/
      handoffs/
```

Create missing directories only when starting a new task or when the user
explicitly asks to initialize the project.

## JSON Contracts

`project.json`:

```json
{
  "project_slug": "health",
  "name": "Health",
  "goal": "",
  "domain": "",
  "active_conventions": [],
  "created_at": "YYYY-MM-DD",
  "updated_at": "YYYY-MM-DD"
}
```

`tasks/index.json`:

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

Task file:

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
  "dependencies": [],
  "related_tasks": [],
  "linked_artifacts": [],
  "session_log": [],
  "created_at": "YYYY-MM-DD",
  "updated_at": "YYYY-MM-DD"
}
```

Allowed statuses:

```text
todo, in-progress, blocked, done
```

Allowed Matt phases:

```text
intake, grilling, prd, issues, implement, code-review, done
```

## Preflight

For every invocation:

1. Parse `project:<slug>`, `task:<id>`, `title:"..."`, and `proceed:<phase>`
   if present.
2. If no project is clear, ask for the project and stop.
3. Read `projects/<project-slug>/project.json` if it exists.
4. Read `projects/<project-slug>/tasks/index.json` if it exists.
5. Read every task JSON listed in the index whose status is not `done`.
6. Report active, blocked, and in-progress tasks before acting.
7. Check whether the requested task conflicts with parallel work.
8. If a needed tracker file is missing, create it only for a new task or an
   explicit project initialization.

## Starting A New Task

When the user provides a project and title but no task id:

1. Create the project scaffold if missing.
2. Generate the next task id as `<project-slug>-NNN` using the highest existing
   numeric suffix plus one.
3. Create the task at `matt_phase: "intake"`.
4. Set `status: "todo"` and `explicit_next_action_required: true`.
5. Add the lightweight summary to `tasks/index.json`.
6. Report the created task id, current phase, and required next explicit action.
7. Stop. Do not enter `grilling` unless the user explicitly requested
   `proceed:grilling` in the same invocation.

## Resuming A Task

When the user provides a task id:

1. Read that task file after the project-wide preflight.
2. Report the task title, status, current Matt phase, linked artifacts, and
   parallel task context.
3. If no explicit `proceed:<phase>` or equivalent user instruction is present,
   stop and ask for explicit phase instruction.
4. If the requested phase is neither the current phase nor the next phase in the
   Matt sequence, stop and explain the valid next action.
5. If the requested phase is valid, run only that phase.

## Phase Rules

`grilling`:

- Use Matt's grilling primitive through `grill-with-docs`.
- Ask one blocking question at a time.
- Update task JSON only with session notes or linked artifacts produced in this
  phase.
- Do not synthesize a PRD until the user explicitly requests `proceed:prd`.

`prd`:

- Use Matt's `to-prd` behavior.
- Synthesize from already settled conversation and tracker context.
- Write or link the PRD under `projects/<project-slug>/artifacts/prds/`.
- Do not create issues until the user explicitly requests `proceed:issues`.

`issues`:

- Use Matt's `to-issues` behavior.
- Split the PRD into independently grabbable vertical slices.
- Write or link issue artifacts under `projects/<project-slug>/artifacts/issues/`.
- Do not implement until the user explicitly requests `proceed:implement`.

`implement`:

- Use Matt's `implement` behavior.
- Drive work with `tdd`: one red slice, one green slice, then the next.
- Keep changes scoped to the selected task.
- Do not enter review until the user explicitly requests `proceed:code-review`.

`code-review`:

- Use Matt's `code-review` behavior.
- Review against both standards and spec.
- Write or link review artifacts under
  `projects/<project-slug>/artifacts/reviews/`.
- Mark `done` only after the user explicitly accepts completion.

## Output Contract

Every invocation must report:

```text
PROJECT
- slug
- tracker files read

TASK
- id or new-task candidate
- title
- status
- current Matt phase

PARALLEL WORK
- active / blocked / in-progress tasks reviewed
- conflicts or none found

ACTION
- created / resumed / blocked / phase action
- explicit next instruction required
```

## Validation

If `scripts/validate-workflow-state.mjs` exists, run:

```bash
node scripts/validate-workflow-state.mjs
```

Fix validation failures before committing tracker or workflow changes.
