# /continue-task Slash Prompt

Continue an existing JSON-tracked workflow task in this repo.

This is a Codex-facing slash prompt. It is only a thin command shim.
The workflow behavior lives in the repo skill named below.

## Required Behavior

1. Work from `/Users/acecanacan/Documents/ace-workflows`.
2. Read root `AGENTS.md`.
3. Read `skills/initiate-task/SKILL.md` completely before acting.
4. Follow that skill exactly.
5. Load the registry, project `AGENTS.md`, project JSON, task index, the
   selected task, linked artifacts, and every non-done task JSON before action.
6. Report the current Matt phase and stop unless the operator explicitly
   requested the next phase action.

## Skill To Use

- `skills/initiate-task/SKILL.md`

## Arguments

$ARGUMENTS: expected format is `project:<slug>` or
`project:<slug> task:<task-id>`.
