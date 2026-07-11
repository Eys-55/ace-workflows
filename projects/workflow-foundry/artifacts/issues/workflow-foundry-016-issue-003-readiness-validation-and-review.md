# Workflow Foundry 016 Issue 003: Readiness Validation And Review

## Parent

`workflow-foundry-016`

## What to build

Prove the combined candidate through the integrated root validator, complete
tracker verification, skill catalog and release gates, downstream Health
dependency readiness, secret and diff inspection, and independent standards and
security review. Record failures without weakening gates.

## Acceptance criteria

- [ ] Root workflow-state validation passes on the clean candidate commit.
- [ ] Complete tracker data, coverage, build, and generated-output verification passes.
- [ ] Canonical catalog exposes the complete build-workflow-product bundle.
- [ ] Health task 008 resolves the completed capability without gaining write authority.
- [ ] Diff and secret checks find no unaccounted or sensitive content.
- [ ] Independent review has no unresolved critical or high finding.

## Blocked by

- Workflow Foundry 016 Issue 002
