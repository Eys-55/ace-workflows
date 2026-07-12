# Audit Foundry Report

Task/Invocation: `$audit-foundry scope:foundry-projects` inferred from "kamusta ang skills and projects"
Generated: 2026-07-08 11:00:40 PST
Scope: Foundry plus projects

## Executive Summary

The foundry is organized around the intended control model: `.agents/skills/`
is the active skill surface, project state lives under `projects/<slug>/`, and
live `AGENTS.md` files are registered in `registry/agents-md.json`.

Current state:

- 3 active projects: `workflow-foundry`, `real-life-workflows`,
  `linkedin-posts`.
- 18 tracked tasks total: 6 done, 12 open, 0 blocked.
- 8 active repo skill directories, each with `SKILL.md` metadata and
  `agents/openai.yaml`.
- 18 imported `real-life-workflows` skill files remain quarantined as source
  evidence only; they are not active skills.
- Validation is not green because an existing untracked report artifact is not
  linked to a non-done task.

Highest-signal next action: continue the foundry code-review lane for
`workflow-foundry-011` / audit report artifact policy, because the active audit
skill works but validation currently blocks a clean checkpoint when new audit
reports are present.

## Loaded Sources

- `AGENTS.md`
- `AGENTS.md`
- `registry/agents-md.json`
- `projects/workflow-foundry/AGENTS.md`
- `projects/workflow-foundry/project.json`
- `projects/workflow-foundry/tasks/index.json`
- Non-done `workflow-foundry` task JSON files:
  `workflow-foundry-001`, `workflow-foundry-002`, `workflow-foundry-003`,
  `workflow-foundry-004`, `workflow-foundry-005`, `workflow-foundry-006`,
  `workflow-foundry-007`, `workflow-foundry-009`, `workflow-foundry-011`
- `.agents/skills/workflow-help/SKILL.md`
- `.agents/skills/review-project-state/SKILL.md`
- `.agents/skills/audit-foundry/SKILL.md`
- `scripts/query-workflow-state.mjs`
- `scripts/validate-workflow-state.mjs`
- `projects/real-life-workflows/AGENTS.md`
- `projects/real-life-workflows/project.json`
- `projects/real-life-workflows/tasks/index.json`
- `projects/real-life-workflows/tasks/real-life-workflows-003.json`
- `projects/linkedin-posts/AGENTS.md`
- `projects/linkedin-posts/project.json`
- `projects/linkedin-posts/tasks/index.json`
- `projects/linkedin-posts/tasks/linkedin-posts-001.json`
- `projects/linkedin-posts/tasks/linkedin-posts-002.json`

Commands loaded additional state:

- `node scripts/query-workflow-state.mjs --list-projects`
- `node scripts/query-workflow-state.mjs --project workflow-foundry --list-tasks`
- `node scripts/query-workflow-state.mjs --project workflow-foundry --agents-md`
- `node scripts/query-workflow-state.mjs --project workflow-foundry --testing-sessions`
- `node scripts/query-workflow-state.mjs --project workflow-foundry --snapshot`
- `node scripts/query-workflow-state.mjs --project real-life-workflows --agents-md`
- `node scripts/query-workflow-state.mjs --project real-life-workflows --list-tasks`
- `node scripts/query-workflow-state.mjs --project real-life-workflows --testing-sessions`
- `node scripts/query-workflow-state.mjs --project real-life-workflows --quarantine-imports`
- `node scripts/query-workflow-state.mjs --project linkedin-posts --agents-md`
- `node scripts/query-workflow-state.mjs --project linkedin-posts --list-tasks`
- `node scripts/query-workflow-state.mjs --project linkedin-posts --testing-sessions`

## Foundry State

`workflow-foundry` is active and remains the repo control-plane project.

Task state:

- 12 tasks total.
- 3 done: `workflow-foundry-008`, `workflow-foundry-010`,
  `workflow-foundry-012`.
- 9 open: 5 todo at intake, 4 in progress.
- 3 in code review: `workflow-foundry-005`, `workflow-foundry-009`,
  `workflow-foundry-011`.
- 1 in planning: `workflow-foundry-006`.
- 0 blocked.

The root/project boundary is still clear: root `AGENTS.md` owns repo mechanics,
previous workflow/ECC process, validation, tracker policy, and file policy. The
`workflow-foundry` project `AGENTS.md` stays focused on workflow-system
maintenance vocabulary and ownership notes.

## Project State

Registered projects:

- `workflow-foundry`: active, 12 tasks, 9 open.
- `real-life-workflows`: active, 4 tasks, 1 open.
- `linkedin-posts`: active, 2 tasks, 2 open.

`real-life-workflows` is in good shape structurally. Its only open task is
`real-life-workflows-003`, a tracker-maintenance task in code review for the
quarantined imported skill surface. The project has one stopped testing session
with 7 events for the 171 catalog doors/rows.

`linkedin-posts` is newly active. Its tracker setup task
`linkedin-posts-001` is still todo/intake, while `linkedin-posts-002` has
already reached issues with a PRD and five issue artifacts for the LinkedIn
post generation workflow.

## Skill Surface

Active `.agents/skills` directories:

- `audit-foundry`
- `native Codex planning`
- `native Codex planning`
- `review-project-state`
- `setup-workflow-project`
- `testing-session`
- `workflow-help`
- `workflow-tracker-ui`

All 8 active skill folders have:

- `SKILL.md`
- matching `name` frontmatter
- `description` frontmatter
- `agents/openai.yaml`

The callable operator surface is therefore healthy at the file/metadata level.
The main drift is documentation and enforcement polish: `workflow-help` lists
the core skill flow but its static "What To Show" block does not include
`workflow-tracker-ui`, and the validator's slash-invocation guard list does not
include every active skill name.

## Tracker And Registry Health

`registry/agents-md.json` registers:

- root `AGENTS.md`
- `projects/workflow-foundry/AGENTS.md`
- `projects/real-life-workflows/AGENTS.md`
- `projects/linkedin-posts/AGENTS.md`

The query helper successfully resolves each project's root and project-domain
`AGENTS.md` entries. Project `AGENTS.md` files do not redefine the root task
tracker mechanics.

Tracker counts:

- 18 task JSON files exist across all projects.
- 18 tasks are listed in project indexes.
- 12 tasks are open.
- 4 tracker-maintenance tasks exist.
- 14 workflow-change tasks exist.

Current worktree state includes modified and untracked project/task artifacts
from existing work. These are linked to open tasks except for the existing
untracked foundry audit report named in validation output.

## Validation Status

`node scripts/validate-workflow-state.mjs` was run and failed with:

```text
- projects/workflow-foundry/artifacts/reviews/audit-foundry-2026-07-08-foundry.md changed but is not linked to a non-done task
```

This appears to be an existing untracked report artifact present before this
report was written. This audit did not fix it because audit-foundry is
read-only against source state except for report creation.

The validator does enforce the important foundry gates:

- no Python files
- no active `commands/*.md`
- no legacy root `skills/*/SKILL.md`
- skill frontmatter and folder-name alignment
- registered live `AGENTS.md` files
- project and task JSON shape
- required non-done task preload paths
- phase guards
- changed-file linkage to non-done tasks
- quarantine marker rules for imported skill evidence
- testing-session state validation

## Generated UI And Testing State

The tracker UI exists under `projects/workflow-foundry/tracker/` with Astro
source, build output, and installed dependencies. Its corresponding task
`workflow-foundry-009` is in code review.

Testing-session state:

- `workflow-foundry`: no testing sessions found.
- `real-life-workflows`: one stopped testing session,
  `real-life-workflows-20260707T110147Z`, 7 events.
- `linkedin-posts`: no testing sessions found.

## Findings

### high: Validation is currently blocked by an unlinked audit report artifact

Evidence: `node scripts/validate-workflow-state.mjs`

The validator fails because
`projects/workflow-foundry/artifacts/reviews/audit-foundry-2026-07-08-foundry.md`
is changed but not linked to a non-done task.

Impact: the repo cannot reach a clean validation checkpoint until the report
artifact policy and task linkage are reconciled.

Recommended next tracker action: `native Codex planning project:workflow-foundry task:workflow-foundry-011`
to finish the audit-foundry code-review/report-artifact policy, or
`native Codex planning project:workflow-foundry task:workflow-foundry-004` if the fix
is classified as tracker maintenance.

### medium: Foundry has several mature tasks waiting in code review

Evidence: `node scripts/query-workflow-state.mjs --project workflow-foundry --list-tasks`

`workflow-foundry-005`, `workflow-foundry-009`, and `workflow-foundry-011` are
all in progress at `code-review`.

Impact: completed implementation work remains operationally open, which keeps
phase guards and changed-file linkage more complicated than necessary.

Recommended next tracker action: close or explicitly carry forward the code
review tasks in this order: audit-foundry report policy, tracker UI runner,
then dark-mode tracker UI.

### medium: LinkedIn project setup is still intake while workflow design has advanced

Evidence: `projects/linkedin-posts/tasks/index.json` and
`node scripts/query-workflow-state.mjs --project linkedin-posts --list-tasks`

`linkedin-posts-001` is a tracker-maintenance setup task at `todo/intake`, but
`linkedin-posts-002` is already in progress at `issues` with PRD and issue
artifacts.

Impact: the project is usable, but its setup lifecycle is not closed, which can
confuse future continuation and checkpoint summaries.

Recommended next tracker action: `native Codex planning project:linkedin-posts task:linkedin-posts-001`
to review and close the setup tracker task, then continue
`linkedin-posts-002` into implementation.

### low: Workflow help is slightly stale against the active skill surface

Evidence: `.agents/skills/workflow-help/SKILL.md` and active skill scan.

The active surface has 8 skill directories, but the static help block lists 7
core skills and omits `workflow-tracker-ui` from the visible "What To Show"
skill list.

Impact: operators asking "what skills exist" may miss the tracker UI runner,
even though the skill is present and valid.

Recommended next tracker action: update help through
`native Codex planning project:workflow-foundry task:workflow-foundry-009` or
`workflow-foundry-001` after deciding whether `workflow-tracker-ui` is a core
operator skill or an auxiliary runner.

### low: Slash-invocation guard does not cover every active skill

Evidence: `scripts/validate-workflow-state.mjs`

The validator's `skillInvocationNames` list includes six canonical names but
does not include `review-project-state` or `workflow-tracker-ui`.

Impact: the validator may not catch primary slash-style references for every
active skill, even though the repo policy is `$skill-name` invocation from
`.agents/skills`.

Recommended next tracker action: align the validator's active skill list with
the discovered skill surface through `workflow-foundry-001` or
`workflow-foundry-009`.

### note: Real-life imported skills remain correctly quarantined

Evidence:
`node scripts/query-workflow-state.mjs --project real-life-workflows --quarantine-imports`

The imported market-research-agent material reports as `quarantined`,
`not-callable`, and `not-project-skills`, with 18 imported skill files.

Impact: this protects operator answers from treating imported source material
as active repo skills.

Recommended next tracker action: finish `real-life-workflows-003` code review
and keep future promotion/rewrite work behind explicit tracked tasks.

## Recommended Next Tracker Actions

1. `native Codex planning project:workflow-foundry task:workflow-foundry-011`
   to resolve audit-foundry/report validation and close the audit skill lane.
2. `native Codex planning project:linkedin-posts task:linkedin-posts-001`
   to close the newly created project setup tracker task.
3. `native Codex planning project:real-life-workflows task:real-life-workflows-003`
   to finish the quarantined imported skill surface code-review lane.
4. `native Codex planning project:workflow-foundry task:workflow-foundry-009`
   to align the tracker UI runner with workflow help and validation.

## Boundaries And Deferred Work

This audit did not mutate tracker state, registry entries, skill files,
project files, validation scripts, generated UI, or testing-session state.

The only write from this invocation is this Markdown report artifact.

Deferred work must happen through `native Codex planning` or `native Codex planning`, not
through audit-foundry directly.
