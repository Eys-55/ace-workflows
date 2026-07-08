# Issue 005: Evals And Safety Release Gate

## Parent

`health-005`

## What To Build

Move fixture data into the standalone repo's `evals/` tree and add release-gate
coverage for the full multi-skill workflow surface.

## Acceptance Criteria

- [ ] `evals/` contains fixtures and expected behaviors, not product source
      data.
- [ ] Fixtures cover category separation, source grounding, comparison without
      ranking, provider deep-dive expectations, navigator routing, refusal
      behavior, and evidence audit behavior.
- [ ] Safety checks fail on PHI, patient-document handling, medical advice,
      eligibility decisions, coverage determinations, claims decisions,
      rankings, and purchase recommendations.
- [ ] The eval gate can be run by package validation scripts.

## Blocked By

- Issue 004: Six Skill Surfaces
