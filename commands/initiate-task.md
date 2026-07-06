# /initiate-task

Use the canonical skill at `skills/initiate-task/SKILL.md`.

This command is a compatibility shim only. Do not add independent workflow
logic here.

Forward the user's arguments unchanged to `$initiate-task`, for example:

```text
/initiate-task project:health title:"Build referral intake workflow"
/initiate-task project:health task:health-001
/initiate-task project:health task:health-001 proceed:grilling
```
