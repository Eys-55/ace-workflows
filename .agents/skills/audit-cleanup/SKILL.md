---
name: audit-cleanup
description: Implement approved foundry cleanup directly from audit evidence or a decision-complete cleanup plan, then validate, commit, and push the working branch. Use when the user asks to remediate audit findings or repository drift.
---

# Audit Cleanup

Apply the smallest safe remediation slices from confirmed audit evidence.

## Inputs

Require an audit report, cleanup plan, or sufficiently explicit user request
that identifies the findings and intended outcome. A task record is not
required.

## Procedure

1. Read root instructions, affected project instructions, audit evidence, and
   the current worktree.
2. Confirm the cleanup scope, ownership, dependencies, acceptance checks, and
   overlapping changes.
3. Add or update a failing test or validation case when feasible.
4. Apply one focused cleanup slice and run the narrowest relevant check.
5. Repeat until the approved scope is complete; do not expand into unrelated
   refactors.
6. Run final repository validation and affected package verification.
7. Inspect the full diff, check it for whitespace errors, and scan for secrets.
8. Commit a coherent unit with a Conventional Commit and push the current
   working branch. Never merge into `main` or publish a release without an
   explicit request.

If validation or the secret scan fails, preserve local work, do not push, and
report the exact blocker. Optional status-ledger updates may record useful
history but never gate remediation.

## Output

Return findings fixed, files changed, validation evidence, commit, pushed
branch, deferred risks, and any blocker.

## Developer Verification

Use `git diff --check` as the deterministic whitespace check before commit.
