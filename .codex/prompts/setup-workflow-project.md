# /setup-workflow-project Slash Prompt

Create a new workflow project scaffold in this repo.

This is a Codex-facing slash prompt. It is only a thin command shim.
The workflow behavior lives in the repo skill named below.

## Required Behavior

1. Work from `/Users/acecanacan/Documents/ace-workflows`.
2. Read root `AGENTS.md`.
3. Read `skills/setup-workflow-project/SKILL.md` completely before acting.
4. Follow that skill exactly.
5. Create and register `projects/<slug>/AGENTS.md` as project-domain only.
6. For existing projects, hand off to `$review-project-state` before changing
   project state.

## Skill To Use

- `skills/setup-workflow-project/SKILL.md`

## Arguments

$ARGUMENTS: expected format is `project:<slug>` with optional `name:"..."`,
`goal:"..."`, and `domain:"..."`.
