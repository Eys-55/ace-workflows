# /initiate-task Slash Prompt

Start a new JSON-tracked workflow task in this repo.

This is a Codex-facing slash prompt. It is only a thin command shim.
The workflow behavior lives in the repo skill named below.

## Required Behavior

1. Work from `/Users/acecanacan/Documents/ace-workflows`.
2. Read root `AGENTS.md`.
3. Read `skills/initiate-task/SKILL.md` completely before acting.
4. Follow that skill exactly.
5. Load the registry, project `AGENTS.md`, project JSON, task index, and every
   non-done task JSON before creating task state.
6. Do not ask the operator to run terminal commands.

## Skill To Use

- `skills/initiate-task/SKILL.md`

## Arguments

$ARGUMENTS: expected format is `project:<slug> title:"..."`; use
`target:tracker` for tracker-maintenance tasks.
