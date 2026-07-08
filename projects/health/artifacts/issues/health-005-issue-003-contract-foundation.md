# Issue 003: Contract Foundation

## Parent

`health-005`

## What To Build

Define the shared ECC-style input and output contracts that every v1 skill must
use. Add reference material and a deterministic validator for skill contracts.

## Acceptance Criteria

- [ ] A shared contract reference defines required inputs, optional inputs,
      artifact dependencies, source freshness expectations, stop conditions,
      and output/handoff behavior.
- [ ] The shared output contract requires `query`, `sources_used`,
      `confidence_boundary`, `human_review_required`, `blocked_decisions`, and
      `next_questions`.
- [ ] `scripts/validate-skill-contracts.mjs` verifies each v1 `SKILL.md`
      declares the required contracts and safety boundaries.
- [ ] The validator fails if any required v1 skill is missing.

## Blocked By

- Issue 001: Repo Skeleton And Product Boundary
- Issue 002: Artifact Migration
