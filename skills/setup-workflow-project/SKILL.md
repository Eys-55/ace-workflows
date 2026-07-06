---
name: setup-workflow-project
description: Set up a new workflow project in this repo by creating the JSON project state, task index, artifact folders, and project-level ECC concept notes under projects/<project-slug>/. Use when the user asks to create, initialize, or set up a workflow project.
---

# Setup Workflow Project

Use this skill to initialize a project workspace. It creates project-level JSON
state; it does not create a task unless the user also invokes task initiation.

## Required Reading

Before acting:

1. Read root `AGENTS.md`.
2. Read `references/matt-pocock-skills.md`.
3. Read `skills/initiate-task/SKILL.md` for the task state contract.

## Inputs

Require:

- `project:<slug>`

Accept:

- `name:"..."`
- `goal:"..."`
- `domain:"..."`

If `project:<slug>` is missing, ask for it and stop.

## Project Scaffold

Create:

```text
projects/<project-slug>/
  project.json
  tasks/
    index.json
  artifacts/
    prds/
    issues/
    reviews/
    handoffs/
```

Do not overwrite existing project files. If the project already exists, load it,
report its state, and ask for explicit instructions before changing it.

## JSON Contract

Create `project.json`:

```json
{
  "project_slug": "health",
  "name": "Health",
  "project_state": "active",
  "goal": "",
  "domain": "",
  "active_conventions": [],
  "ecc_concepts_applied": [
    "workflow contract",
    "human boundary",
    "project state preload"
  ],
  "created_at": "YYYY-MM-DD",
  "updated_at": "YYYY-MM-DD"
}
```

Create `tasks/index.json`:

```json
{
  "project_slug": "health",
  "tasks": []
}
```

## Output Contract

Report:

```text
PROJECT
- slug
- project_state
- files created or already present

ECC CONCEPTS
- concepts recorded

NEXT ACTION
- initiate a task with /initiate-task
```

## Validation

Run:

```bash
node scripts/validate-workflow-state.mjs
```
