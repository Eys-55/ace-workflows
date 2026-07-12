---
name: review-project-state
description: "Inspect a workflow project's metadata, optional status ledger, linked artifacts, dependencies, and current repository state. Use when the user asks for project status, conflicts, blockers, or a safe implementation starting point."
---

# Review Project State

Review project state without mutating it.

## Procedure

1. Read root `AGENTS.md`, `registry/agents-md.json`, the project `AGENTS.md`, and
   `project.json`.
2. If a task index exists, read the full index and every referenced task detail.
3. Inspect linked artifacts, dependency provenance, session history, and current
   Git status.
4. Compare index/detail identity, status, and update metadata.
5. Classify work by `todo`, `in-progress`, `blocked`, and `done`.
6. Identify overlapping files, stale status, missing evidence, dependency
   conflicts, and the plain `next_action` for non-done work.
7. Recommend a direct Codex plan and the narrowest validation needed.

The ledger is descriptive and optional. Missing ledger state does not block
implementation, and this review does not create or update records.

## Output

Return project health, active work, blockers, dependency evidence, overlap
risks, and the recommended direct next action.
