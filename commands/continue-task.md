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
