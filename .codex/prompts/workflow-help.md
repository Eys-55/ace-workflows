# /workflow-help Slash Prompt

Show available workflow commands, skills, scripts, project state, and next
actions for this repo.

This is a Codex-facing slash prompt. It is only a thin command shim.
The workflow behavior lives in the repo skill named below.

## Required Behavior

1. Work from `/Users/acecanacan/Documents/ace-workflows`.
2. Read root `AGENTS.md`.
3. Read `skills/workflow-help/SKILL.md` completely before answering.
4. Follow that skill exactly.
5. Use live project and registry state when recommending the next command.
6. Do not mutate project or task state.

## Skill To Use

- `skills/workflow-help/SKILL.md`

## Arguments

$ARGUMENTS: optional focus text for this slash command.
