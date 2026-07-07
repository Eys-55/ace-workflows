---
name: continue-task
description: Continue an existing JSON-tracked workflow task in ace-workflows. Use when the user asks to resume a task, continue a task, select an existing task, load a task snapshot, inspect current Matt phase, or proceed with phase work after full project-state loading.
---

# Continue Task

Use this skill to continue an existing task. It is a discoverable alias for the
continue behavior defined in `.agents/skills/initiate-task/SKILL.md`.

## Required Reading

Before acting:

1. Read root `AGENTS.md`.
2. Read `references/matt-pocock-skills.md`.
3. Read `.agents/skills/initiate-task/SKILL.md` completely.
4. Read `registry/agents-md.json`.

## Continue Contract

Follow the `Continue A Task` section of `.agents/skills/initiate-task/SKILL.md`.

Load, load, load, load, load before doing anything with the task:

1. Read root `AGENTS.md`.
2. Read `registry/agents-md.json`.
3. Read `projects/<project-slug>/AGENTS.md`.
4. Read `projects/<project-slug>/project.json`.
5. Read `projects/<project-slug>/tasks/index.json`.
6. Run `node scripts/query-workflow-state.mjs --project <project-slug> --list-tasks`
   if the script exists.
7. Run `node scripts/query-workflow-state.mjs --project <project-slug> --agents-md`
   if the script exists.
8. Run `node scripts/query-workflow-state.mjs --project <project-slug> --testing-sessions`
   if the script exists. Load only index summaries and pointers unless exact
   testing-session evidence is needed.
9. Read every task JSON listed in the index whose status is not `done`.
10. Read the selected task JSON if a task id is provided.
11. Read the selected task's linked artifacts and `context_snapshot.must_load`.
12. Read and report `phase_guard.selected_next_action`, approved artifacts, and
    process exceptions.
13. Report conflicts, state gaps, and relevant testing-session summaries before
    taking any task action.

If no task id is provided, list selectable tasks and ask the user to choose.

Report the current Matt phase and stop unless the user explicitly requested the
next phase action.

If the selected task is still `intake`, do not create scripts, HTML, skills,
workflow artifacts, tests, or implementation files. Before creating any such
artifact, the selected task must include a matching
`phase_guard.approved_artifacts` entry for the artifact path and phase
`implement`.
