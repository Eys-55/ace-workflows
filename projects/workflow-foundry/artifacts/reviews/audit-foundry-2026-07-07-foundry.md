# Audit Foundry Report

Task/Invocation: `$audit-foundry`
Generated: 2026-07-07
Scope: foundry

## Executive Summary

The workflow foundry is active and validating. The canonical skill surface is
`.agents/skills`, the root and project `AGENTS.md` files are registered, and
workflow-state validation passes.

The foundry currently has several active workstreams. The most relevant state
for this audit is that `workflow-foundry-011` is implementing the new
`audit-foundry` skill, while `workflow-foundry-012` now owns the deferred
one-way project connection workflow. That separation keeps this audit skill
focused on reporting and leaves integration behavior for later tracked work.

The working tree contains substantial uncommitted work across workflow-foundry
and real-life-workflows. This audit does not classify those changes as wrong by
itself, but it does make the checkpoint risk visible: commits should remain
scoped so unrelated project work is not accidentally bundled into the
audit-foundry commit.

## Loaded Sources

- `AGENTS.md`
- `registry/agents-md.json`
- `projects/workflow-foundry/AGENTS.md`
- `projects/workflow-foundry/project.json`
- `projects/workflow-foundry/tasks/index.json`
- non-done workflow-foundry task JSON files
- `projects/workflow-foundry/artifacts/prds/workflow-foundry-011-audit-foundry.md`
- `projects/workflow-foundry/artifacts/issues/workflow-foundry-011-issue-001-skill-contract.md`
- `projects/workflow-foundry/artifacts/issues/workflow-foundry-011-issue-002-report-generation.md`
- `projects/workflow-foundry/artifacts/issues/workflow-foundry-011-issue-003-help-validation-review.md`
- `.agents/skills`
- `scripts/query-workflow-state.mjs`
- `scripts/validate-workflow-state.mjs`

Commands run:

```bash
node scripts/query-workflow-state.mjs --project workflow-foundry --list-tasks
node scripts/query-workflow-state.mjs --project workflow-foundry --agents-md
node scripts/query-workflow-state.mjs --project workflow-foundry --testing-sessions
node scripts/query-workflow-state.mjs --list-projects
node scripts/query-workflow-state.mjs --list-agents-md
node scripts/validate-workflow-state.mjs
git status --short
```

## Foundry State

`workflow-foundry` is active. Its goal is to maintain the repo-local workflow
system that creates, connects, validates, and resumes agent workflow projects.

The project conventions remain consistent with the foundry model:

- `.agents/skills` is the canonical workflow skill surface.
- JSON task state is source of truth.
- project `AGENTS.md` files are domain-only.
- tracker-maintenance tasks audit tracker edits.
- prompt and command shims are not active workflow surfaces.
- validation enforces skill metadata and surface boundaries.

Open workflow-foundry tasks at audit time:

- `workflow-foundry-001` todo / intake - Connect workflow skills and handoffs
- `workflow-foundry-002` todo / intake - Add tracker-edit tasks
- `workflow-foundry-003` todo / intake - Expose workflow skills in Codex app
- `workflow-foundry-004` todo / intake - Maintain workflow tracker state
- `workflow-foundry-005` in-progress / code-review - Create dark-mode project task tracker UI
- `workflow-foundry-006` in-progress / grilling - Create foundry expansion discovery workflow
- `workflow-foundry-007` todo / intake - Checkpoint foundry repository to GitHub
- `workflow-foundry-009` in-progress / code-review - Create tracker UI runner skill and project workflow view
- `workflow-foundry-011` in-progress / implement - Create audit-foundry skill
- `workflow-foundry-012` in-progress / grilling - Create one-way project skill connection workflow

Recently completed foundry tasks:

- `workflow-foundry-008` done - Add project testing mode sessions
- `workflow-foundry-010` done - Create foundry explainer Markdown

## Project State

Not in scope for this report, except where project registry state affects the
foundry control plane.

Registered projects discovered by query helper:

- `workflow-foundry`
- `real-life-workflows`

Project-inclusive audit modes should inspect project-specific state in later
runs using `scope:foundry-projects`, `scope:projects`, or `project:<slug>`.

## Skill Surface

Codex-discoverable skill files present at audit time:

- `.agents/skills/audit-foundry/SKILL.md`
- `.agents/skills/continue-task/SKILL.md`
- `.agents/skills/initiate-task/SKILL.md`
- `.agents/skills/review-project-state/SKILL.md`
- `.agents/skills/setup-workflow-project/SKILL.md`
- `.agents/skills/testing-session/SKILL.md`
- `.agents/skills/workflow-help/SKILL.md`
- `.agents/skills/workflow-tracker-ui/SKILL.md`

The new `audit-foundry` skill follows the current repo skill shape with
`SKILL.md` and `agents/openai.yaml`.

## Tracker And Registry Health

The root `AGENTS.md`, workflow-foundry project `AGENTS.md`, and
real-life-workflows project `AGENTS.md` are registered in
`registry/agents-md.json`.

Workflow-state validation currently passes, which means changed tracker and
artifact files are linked to non-done tasks or allowed surfaces under the
current validation rules.

The validator now includes `audit-foundry` in the canonical skill invocation
name list used for primary slash-command boundary checks.

## Validation Status

Validation command:

```bash
node scripts/validate-workflow-state.mjs
```

Result: passed.

No workflow-foundry testing sessions are currently present.

## Generated UI And Testing State

The tracker UI work remains represented by `workflow-foundry-005` and
`workflow-foundry-009`.

Generated tracker files and local Astro state exist under
`projects/workflow-foundry/tracker/`, including `dist/index.html` and `.astro`
state. The audit did not inspect the UI visually; the UI smoke/review evidence
belongs to `workflow-foundry-009`.

No workflow-foundry testing-session index was found.

## Findings

### Medium: Commit scope risk from broad dirty working tree

Evidence: `git status --short`.

Impact: The repository contains active uncommitted work for multiple tasks and
projects. A broad commit could mix audit-foundry changes with real-life-workflows
quarantine work, tracker UI changes, or the deferred project-connection task.

Recommended next tracker action: commit `workflow-foundry-011` with a scoped
file list, then handle unrelated dirty work through its own existing tasks.

### Low: Foundry audit and project connection concerns are now separated

Evidence: `workflow-foundry-011` and `workflow-foundry-012` task JSON.

Impact: This is the desired direction after grilling. The remaining risk is
operator confusion if future answers collapse the two tasks again.

Recommended next tracker action: keep `audit-foundry` documentation focused on
reporting; keep connection workflow changes under `workflow-foundry-012`.

### Note: Existing review-project-state remains useful but narrower

Evidence: `.agents/skills/review-project-state/SKILL.md`.

Impact: `review-project-state` remains a dashboard/preflight skill for one
project. `audit-foundry` is now the durable Markdown report generator.

Recommended next tracker action: keep both skills and explain the distinction
in `workflow-help`.

## Recommended Next Tracker Actions

1. Finish `workflow-foundry-011` code review and commit only its scoped files.
2. Continue `workflow-foundry-012` separately for one-way project skill
   connection behavior.
3. Use `workflow-foundry-004` for any future tracker-maintenance cleanup that
   is not specific to this audit skill.

## Boundaries And Deferred Work

This audit did not modify source state beyond writing this report artifact.

Deferred work:

- Project integration and connection registration belong to `workflow-foundry-012`.
- Project-inclusive audit behavior should be exercised with
  `scope:foundry-projects`, `scope:projects`, or `project:<slug>` in later audit
  runs.
- Fixes for audit findings must go through `$initiate-task` or
  `$continue-task`.
