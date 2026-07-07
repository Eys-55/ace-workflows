# Issue 003: Help, Validation, And Review

## Parent

`workflow-foundry-011` - Audit Foundry Skill

## What to build

Connect `audit-foundry` to the foundry's help and validation surfaces, then
verify the implementation by running a real audit report and reviewing the
result against the PRD.

## Acceptance criteria

- [x] Workflow help lists `$audit-foundry` in available skills and Codex-discoverable skill files.
- [x] Workflow help explains when to use `$audit-foundry` and how it differs from `$review-project-state`.
- [x] Workflow validation recognizes the new canonical skill name where relevant.
- [x] Workflow-state validation passes after implementation.
- [x] A real audit report is written under workflow-foundry review artifacts.
- [x] The report path is linked from the task state.
- [x] A focused code-review/spec-review pass finds no blocking issues or records fixes before completion.

## Blocked by

- `workflow-foundry-011-issue-001-skill-contract`
- `workflow-foundry-011-issue-002-report-generation`

## User stories covered

- 7. Summarize the report in chat
- 8. Store reports neatly
- 18. Follow `.agents/skills` shape
- 20. Prove metadata and report behavior do not regress
