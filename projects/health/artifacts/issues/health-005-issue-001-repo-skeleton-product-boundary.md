# Issue 001: Repo Skeleton And Product Boundary

## Parent

`health-005`

## What To Build

Create the standalone `philippines-health-coverage` repo skeleton with its own
product guidance, package metadata, skill manifest, skill surface folders,
artifact/eval/script directories, and a documented no-foundry-runtime boundary.

## Acceptance Criteria

- [ ] The standalone repo has `AGENTS.md`, `README.md`, `package.json`,
      `skill-manifest.json`, `skills/`, `references/`, `artifacts/`, `evals/`,
      and `scripts/`.
- [ ] The standalone repo documents that it does not depend on this foundry,
      project trackers, or `real-life-workflows` at runtime.
- [ ] The package identity is `philippines-health-coverage`.
- [ ] The operator-facing docs are skill-first and do not present helper
      scripts as the primary user path.

## Blocked By

None - can start immediately.
