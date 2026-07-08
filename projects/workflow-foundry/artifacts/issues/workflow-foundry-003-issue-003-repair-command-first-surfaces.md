# Issue 003: Repair Command-First Surfaces

## Parent

`workflow-foundry-003`

## What to build

Repair the surfaces found by the audit so they lead with skill/runtime usage
instead of command invocation. Keep valid helper commands only under clear
developer verification, package smoke-test, validation, query-helper, or
internal-support labels.

## Acceptance criteria

- [x] Active workflow skills repeat concise skill-first guidance where the rule
      affects behavior.
- [x] `workflow-help` explains the skill-first surface without making scripts
      look like the primary operator path.
- [x] Project-local packaged skill docs distinguish agent-runtime usage from
      package helper commands.
- [x] Real Life Workflows README no longer places `npx` under `Call The Skill`
      as the primary operator path.
- [x] Existing package/bin surfaces are classified by wording, not blindly
      deleted.

## Blocked by

- `workflow-foundry-003-issue-001-root-skill-first-rule.md`
- `workflow-foundry-003-issue-002-validator-command-first-guard.md`
