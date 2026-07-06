# /setup-workflow-project

Use the canonical skill at `skills/setup-workflow-project/SKILL.md`.

This command is a compatibility shim only. Do not add independent workflow
logic here.

Forward the user's arguments unchanged to `$setup-workflow-project`, for
example:

```text
/setup-workflow-project project:health name:"Health"
```

Project setup must create and register `projects/<slug>/AGENTS.md` as a
domain-only project AGENTS file. Root workflow mechanics stay in root
`AGENTS.md`.

Next surface: new projects go to `/initiate-task`; existing projects go to
`$review-project-state`.
