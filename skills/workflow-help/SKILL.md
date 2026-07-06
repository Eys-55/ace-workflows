---
name: workflow-help
description: Show the available workflow commands, skills, scripts, task states, and safe next actions for this repo. Use when the user invokes workflow-help, /workflow-help, asks what commands exist, asks what this workflow repo can do, or needs help choosing setup, initiate, continue, or review project state.
---

# Workflow Help

Use this skill to explain what the workflow repo can do right now. This is a
read-only guide surface.

## Required Reading

Before answering:

1. Read root `AGENTS.md`.
2. Read `references/matt-pocock-skills.md`.
3. Read `registry/agents-md.json`.
4. Inspect `commands/`, `skills/`, and `scripts/` so the answer reflects the
   actual repo.
5. Run `node scripts/query-workflow-state.mjs --list-projects` and
   `node scripts/query-workflow-state.mjs --list-agents-md` when available.

Do not mutate project or task state from this skill.

## What To Show

Report the currently available surfaces in this order:

```text
COMMANDS
- /workflow-help
- /setup-workflow-project
- /initiate-task
- /continue-task

SKILLS
- workflow-help
- setup-workflow-project
- initiate-task
- review-project-state

SCRIPTS
- node scripts/validate-workflow-state.mjs
- node scripts/query-workflow-state.mjs --list-projects
- node scripts/query-workflow-state.mjs --list-agents-md
- node scripts/query-workflow-state.mjs --project <slug> --agents-md
- node scripts/query-workflow-state.mjs --project <slug> --snapshot
- node scripts/query-workflow-state.mjs --project <slug> --list-tasks
- node scripts/query-workflow-state.mjs --project <slug> --task <task-id>

TASK FLOW
- setup project
- initiate task
- continue task
- review project state
- follow Matt Pocock phases inside the selected task

CONNECTED FLOW
- /workflow-help -> /setup-workflow-project -> /initiate-task -> /continue-task
- use /continue-task or $review-project-state when project state already exists
```

## Command Guide

`/setup-workflow-project`

- Create a new `projects/<slug>/` workspace.
- Create project `AGENTS.md`, `project.json`, `tasks/index.json`, and artifact
  folders.
- Register project `AGENTS.md` in `registry/agents-md.json`.
- Use before the first task in a project.

`/initiate-task`

- Start a new task at `matt_phase: "intake"`.
- Requires `project:<slug>` and `title:"..."`.
- Loads all project state before creating task state.
- Use `target:tracker` when creating a task specifically to edit tracker files.

`/continue-task`

- Resume an existing task from its saved snapshot.
- Loads all project state and every non-done task before action.
- If no task id is provided, list/select available tasks.

`/workflow-help`

- Show this command/skill/script guide.
- Read-only. Do not change workflow state.
- Use live registry and project query output when recommending the next command.

## Skill Guide

`$setup-workflow-project`

- Canonical skill behind `/setup-workflow-project`.

`$initiate-task`

- Canonical skill behind `/initiate-task` and `/continue-task`.
- Owns task state, task resume, Matt phase handling, and the load-everything
  invariant.
- Creates normal `workflow-change` tasks and `tracker-maintenance` tasks.

`$review-project-state`

- Load and report complete project state before deciding what to do next.
- Use when the user asks for the dashboard or wants to understand ongoing work.
- Use as mandatory preflight when a project already exists or task work is risky.

`$workflow-help`

- Read-only help surface.

## Matt Flow Reminder

`target:tracker` is not a Matt phase. It creates a `tracker-maintenance` task at
`intake` for auditable changes to `project.json`, `tasks/index.json`, task JSON
files, or `registry/agents-md.json`.

Matt Pocock phases are not separate repo-local skills:

```text
intake -> grilling -> prd -> issues -> implement -> code-review -> done
```

They happen inside the selected task. Do not create separate local helper skills
for PRD, issues, implementation, or review phases.

## AGENTS.md Boundary Reminder

Root `AGENTS.md` owns workflow-foundry mechanics: tasks, JSON state, Matt/ECC
flow, validation, file policy, and checkpoints.

Project `AGENTS.md` files live under `projects/<slug>/AGENTS.md` and are
project/domain-only. For example, a healthcare project AGENTS.md may define
healthcare vocabulary and lung-specific guidance, but it must not redefine task
tracking or root workflow mechanics.

Every live `AGENTS.md` must be registered in `registry/agents-md.json`.

## Safety Rules

- Python is forbidden.
- JSON is the source of truth for project/task state.
- Markdown is the source of truth for skill and command instructions.
- `.mjs` is allowed only for JSON query/validation helpers.
- Task work must load `project.json`, `tasks/index.json`, and every non-done
  task JSON first.
- Task work must load root `AGENTS.md`, the registry, and project `AGENTS.md`
  first.

## Output Contract

When invoked, answer in this shape:

```text
AVAILABLE COMMANDS
- command: when to use it

CONNECTED FLOW
- current recommended path

AVAILABLE SKILLS
- skill: when to use it

LIVE STATE
- projects and registered AGENTS.md files seen

STATE HELPERS
- script: what it shows or validates

RECOMMENDED NEXT ACTION
- one concrete next command based on the user's request
```
