# Issue 002: Artifact Migration

## Parent

`health-005`

## What To Build

Copy and normalize the Health foundation JSON into the standalone repo's
`artifacts/` tree. The copied data must be repo-local product data, not examples
that depend on foundry paths.

## Acceptance Criteria

- [ ] Registry, product catalog, source atlas, Maxicare deep dive, comparison
      readiness, and navigator flow JSON ship under `artifacts/`.
- [ ] Internal JSON references point to standalone repo-local paths.
- [ ] Artifact data preserves advice boundaries and human-review boundaries.
- [ ] `scripts/validate-artifacts.mjs` validates artifact shape, repo-local
      references, source grounding, date fields, and blocked decision language.

## Blocked By

- Issue 001: Repo Skeleton And Product Boundary
