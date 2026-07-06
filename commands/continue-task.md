# /continue-task

Use the canonical skill at `skills/initiate-task/SKILL.md`.

This command is a compatibility shim only. Do not add independent workflow
logic here.

Forward the user's arguments unchanged to `$initiate-task`. Continuing a task
must load the whole project state before any task action:

```text
/continue-task project:health
/continue-task project:health task:health-001
```

Required load set: root `AGENTS.md`, `registry/agents-md.json`, selected
project `AGENTS.md`, `project.json`, `tasks/index.json`, the selected task,
and every non-done task JSON.

Next surface: report the current Matt phase and wait for an explicit phase
instruction unless the user already provided one.
