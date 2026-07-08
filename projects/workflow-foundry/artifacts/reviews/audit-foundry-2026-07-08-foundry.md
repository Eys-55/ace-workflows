# Audit Foundry Report

Task/Invocation: $audit-foundry
Generated: 2026-07-08 03:02:53 PST
Scope: foundry-only

## Executive Summary

The workflow-foundry control plane is structurally healthy: root and project
AGENTS.md boundaries are registered, the workflow-foundry project is active,
the canonical skill surface is `.agents/skills`, and
`node scripts/validate-workflow-state.mjs` passed before this report artifact
was written.

The main current risk is the tracker UI verification gate. The tracker package
`npm run verify` failed in `tests/workflow-state.test.mjs` because live
workflow-foundry state reports 9 open tasks while the test still expects 10.
This looks like stale generated UI/test expectation after
`workflow-foundry-012` moved to done.

The second operating risk is tracker backlog clarity. The foundry has 12 tasks:
3 done, 4 in-progress, and 5 todo. Three in-progress tasks are already in
`code-review`, one task remains in `grilling`, and several older todo/intake
tasks contain substantial completed history. The next safest tracker action is
to continue the owning code-review task for the tracker UI before treating the
UI as checkpoint-ready.

## Loaded Sources

- `AGENTS.md`
- `references/matt-pocock-skills.md`
- `registry/agents-md.json`
- `projects/workflow-foundry/AGENTS.md`
- `projects/workflow-foundry/project.json`
- `projects/workflow-foundry/tasks/index.json`
- Non-done workflow-foundry task JSON:
  - `projects/workflow-foundry/tasks/workflow-foundry-001.json`
  - `projects/workflow-foundry/tasks/workflow-foundry-002.json`
  - `projects/workflow-foundry/tasks/workflow-foundry-003.json`
  - `projects/workflow-foundry/tasks/workflow-foundry-004.json`
  - `projects/workflow-foundry/tasks/workflow-foundry-005.json`
  - `projects/workflow-foundry/tasks/workflow-foundry-006.json`
  - `projects/workflow-foundry/tasks/workflow-foundry-007.json`
  - `projects/workflow-foundry/tasks/workflow-foundry-009.json`
  - `projects/workflow-foundry/tasks/workflow-foundry-011.json`
- `.agents/skills/audit-foundry/SKILL.md`
- `.agents/skills/workflow-help/SKILL.md`
- `.agents/skills/review-project-state/SKILL.md`
- `scripts/query-workflow-state.mjs`
- `scripts/validate-workflow-state.mjs`
- Tracker UI package metadata and task-linked artifact pointers:
  - `projects/workflow-foundry/tracker/package.json`
  - `projects/workflow-foundry/tracker/tests/workflow-state.test.mjs`
  - `projects/workflow-foundry/artifacts/reviews/workflow-foundry-009-tracker-ui-smoke.png`

Commands run:

```bash
node scripts/query-workflow-state.mjs --project workflow-foundry --list-tasks
node scripts/query-workflow-state.mjs --project workflow-foundry --agents-md
node scripts/query-workflow-state.mjs --project workflow-foundry --testing-sessions
node scripts/query-workflow-state.mjs --project workflow-foundry --snapshot
node scripts/query-workflow-state.mjs --list-projects
node scripts/query-workflow-state.mjs --list-agents-md
node scripts/validate-workflow-state.mjs
npm run verify
git status --porcelain --untracked-files=all
```

## Foundry State

`projects/workflow-foundry/project.json` marks the project active with the goal
of maintaining the repo-local workflow system that creates, connects,
validates, and resumes agent workflow projects.

The task index currently reports:

- `done`: `workflow-foundry-008`, `workflow-foundry-010`,
  `workflow-foundry-012`
- `in-progress/code-review`: `workflow-foundry-005`,
  `workflow-foundry-009`, `workflow-foundry-011`
- `in-progress/grilling`: `workflow-foundry-006`
- `todo/intake`: `workflow-foundry-001`, `workflow-foundry-002`,
  `workflow-foundry-003`, `workflow-foundry-004`, `workflow-foundry-007`

The control-plane split is clear in current instructions. Root `AGENTS.md`
owns task mechanics, validation, Matt Pocock flow, file policy, and checkpoint
policy. `projects/workflow-foundry/AGENTS.md` stays project-domain focused and
does not redefine root mechanics.

## Project State

Not in scope for this report.

Project discovery was still checked for registry context. The repo currently
discovers three projects:

- `workflow-foundry`
- `real-life-workflows`
- `linkedin-posts`

Project tracker health outside workflow-foundry was not audited in this
foundry-only report.

## Skill Surface

The canonical Codex-discoverable skill surface is `.agents/skills`. Eight skill
entrypoints are present with matching `SKILL.md` frontmatter and
`agents/openai.yaml` metadata:

- `audit-foundry`
- `continue-task`
- `initiate-task`
- `review-project-state`
- `setup-workflow-project`
- `testing-session`
- `workflow-help`
- `workflow-tracker-ui`

No legacy `commands/*.md`, `.codex/prompts/*.md`, or top-level
`skills/*/SKILL.md` workflow surfaces were found by the audit scan.

## Tracker And Registry Health

`registry/agents-md.json` currently registers all live AGENTS.md files seen by
the audit:

- `AGENTS.md`
- `projects/workflow-foundry/AGENTS.md`
- `projects/real-life-workflows/AGENTS.md`
- `projects/linkedin-posts/AGENTS.md`

`node scripts/validate-workflow-state.mjs` passed before this audit report was
written, which means the current registry, task schema, phase guards, canonical
skill metadata, AGENTS.md boundaries, quarantine boundaries, testing-session
state, and changed-file linkage were valid at that point.

The worktree was already dirty before this report was created. Existing pending
changes include modified real-life-workflows task JSON, modified
`registry/agents-md.json`, and untracked `projects/linkedin-posts` tracker and
artifact files. These were not changed by this audit.

## Validation Status

Passed:

```text
node scripts/validate-workflow-state.mjs
Workflow state is valid.
```

Failed:

```text
npm run verify
```

The failure is isolated to the tracker UI data test:

```text
tests/workflow-state.test.mjs
Expected values to be strictly equal: 9 !== 10
```

The failing assertion is `workflowFoundry.stats.open`, which currently expects
10 in the test. Live task state from the query helper shows 9 non-done
workflow-foundry tasks after `workflow-foundry-012` moved to done.

## Generated UI And Testing State

The tracker UI is present under `projects/workflow-foundry/tracker/` as an
Astro package. Its package scripts include:

- `build`: `astro build`
- `test:data`: workflow-state and testing-session node tests
- `test:output`: generated-output node test
- `verify`: data tests, Astro build, and output tests

The tracker task ownership is split across:

- `workflow-foundry-005`: original dark-mode read-only tracker UI, currently
  `in-progress` at `code-review`
- `workflow-foundry-009`: tracker UI runner skill and per-project workflow
  view, currently `in-progress` at `code-review`

`node scripts/query-workflow-state.mjs --project workflow-foundry --testing-sessions`
reported no workflow-foundry testing sessions.

## Findings

### high: Tracker UI verification is failing

What is wrong: `npm run verify` in
`projects/workflow-foundry/tracker` fails because
`tests/workflow-state.test.mjs` expects `workflowFoundry.stats.open` to equal
10, while live state now returns 9.

Evidence: `npm run verify`; `projects/workflow-foundry/tracker/tests/workflow-state.test.mjs`;
`node scripts/query-workflow-state.mjs --project workflow-foundry --list-tasks`.

Impact: The tracker UI cannot be treated as verification-clean or
checkpoint-ready even though the repo-wide workflow-state validator passes.

Recommended next tracker action: `$continue-task project:workflow-foundry task:workflow-foundry-009`
to review whether the test expectation should be updated or the derived open
count logic is wrong.

### medium: Several foundry tasks appear stale or partially closed by history

What is wrong: `workflow-foundry-001`, `workflow-foundry-002`,
`workflow-foundry-003`, `workflow-foundry-004`, and `workflow-foundry-007`
remain `todo` at `intake`, but their session logs and linked artifacts show
substantial completed work or checkpoint history.

Evidence: `projects/workflow-foundry/tasks/index.json`; task JSON session logs
for `workflow-foundry-001` through `workflow-foundry-004` and
`workflow-foundry-007`.

Impact: Operators may choose the wrong continuation task, and tracker counts
can overstate unfinished intake work.

Recommended next tracker action: `$continue-task project:workflow-foundry task:workflow-foundry-004`
as tracker maintenance to reconcile stale task status, phase, and next-action
metadata after the tracker UI verification issue is resolved.

### medium: The dirty worktree spans other projects and registry state

What is wrong: The audit started with modified `real-life-workflows` task JSON,
modified `registry/agents-md.json`, and untracked `projects/linkedin-posts`
project files and artifacts.

Evidence: `git status --porcelain --untracked-files=all`.

Impact: Any checkpoint or push from the foundry would mix foundry audit output
with unrelated project tracker work unless the operator deliberately scopes the
checkpoint.

Recommended next tracker action: Use `$continue-task` on the owning project
tasks before checkpointing, or create a scoped tracker-maintenance task if the
registry/linkedin-posts changes need cleanup.

### note: Foundry AGENTS.md and registry boundaries are currently aligned

What is worth noting: Root and workflow-foundry AGENTS.md responsibilities are
cleanly separated, and the registry includes the live project AGENTS.md files
seen in this checkout.

Evidence: `registry/agents-md.json`; `node scripts/query-workflow-state.mjs --list-agents-md`;
`node scripts/validate-workflow-state.mjs`.

Impact: The repo has a valid control-plane boundary for future workflow work.

Recommended next tracker action: Keep using project-local `AGENTS.md` for
domain behavior only; do not move root task mechanics into project AGENTS.md
files.

### note: Workflow-foundry has no testing-session summaries yet

What is worth noting:
`node scripts/query-workflow-state.mjs --project workflow-foundry --testing-sessions`
reported no testing sessions.

Evidence: query helper output.

Impact: There is no durable testing-session history for foundry audits to load
later, despite the testing-session feature existing as a canonical skill.

Recommended next tracker action: Use `$testing-session` only when an operator
wants a captured project-scoped run; do not create one from this audit.

## Recommended Next Tracker Actions

1. `$continue-task project:workflow-foundry task:workflow-foundry-009`
   to fix or re-baseline the tracker UI verification failure.
2. After verification is clean, `$continue-task project:workflow-foundry task:workflow-foundry-004`
   to reconcile stale foundry tracker state and task statuses.
3. Before any checkpoint, inspect and deliberately scope the existing dirty
   worktree across `real-life-workflows`, `registry/agents-md.json`, and
   `projects/linkedin-posts`.

## Boundaries And Deferred Work

This audit did not fix source state, update tracker JSON, reclassify tasks,
edit skills, edit scripts, update generated UI, create testing sessions, stage
files, commit, or push.

Project-level health for `real-life-workflows` and `linkedin-posts` is deferred
because this invocation defaulted to foundry-only scope. Use
`$audit-foundry scope:foundry-projects`, `$audit-foundry scope:projects`, or
`$audit-foundry project:<slug>` for those reports.
