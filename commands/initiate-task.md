# /initiate-task

Use the canonical skill at `skills/initiate-task/SKILL.md`.

This command is a compatibility shim only. Do not add independent workflow
logic here.

Forward the user's arguments unchanged to `$initiate-task`, for example:

```text
/initiate-task project:health title:"Build referral intake workflow"
```

This command starts new tasks only. Use `/continue-task` to resume existing
tasks.

Before creating any task, the canonical skill must load root `AGENTS.md`,
`registry/agents-md.json`, the selected project `AGENTS.md`, `project.json`,
`tasks/index.json`, and every non-done task JSON.

Next surface: after creation, stop at `intake`; use `/continue-task` for any
Matt phase work.
