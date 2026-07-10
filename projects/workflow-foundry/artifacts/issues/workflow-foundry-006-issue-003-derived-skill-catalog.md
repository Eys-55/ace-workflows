# Issue 003: Derive Discovery From Complete Canonical Bundles

## Parent

`workflow-foundry-006` - Design skill-first Workflow Foundry revamp

## What to build

Derive one active skill catalog from complete canonical bundles and carry it
through validation, workflow-help routing and listing, query output, dependency
inspection, and the read-only tracker projection. Incomplete bundles must fail,
and packaged or standalone skills must stay outside the foundry runtime unless
an explicit promotion contract makes them canonical.

Turn the current `workflow-tracker-ui` help/catalog mismatch into a red fixture
before fixing it. The finished slice must remove the possibility of independent
hard-coded skill inventories drifting while preserving skill-first operator
routing.

## Acceptance criteria

- [x] The active catalog is derived from canonical directories containing a valid `SKILL.md` and `agents/openai.yaml`.
- [x] Validation, workflow-help, query output, dependency inspection, and tracker projection consume the same catalog.
- [x] Adding or removing a complete fixture bundle updates every consumer consistently.
- [x] Incomplete bundles and phantom catalog entries fail validation.
- [x] Packaged and standalone skills remain excluded unless explicitly promoted to the canonical surface.
- [x] The current `workflow-tracker-ui` mismatch fails as a characterization fixture before reconciliation and passes afterward.
- [x] Help remains skill-first and exposes runtime visibility and the correct invocation for every active canonical skill.
- [x] A fresh-agent help scenario discovers and selects a fixture skill from its trigger description without receiving a hidden expected answer.
- [x] Read-only tracker output exposes discovery readiness without adding mutation behavior.
- [x] Root workflow-state validation and tracker verification pass.

## Blocked by

- `workflow-foundry-006-issue-002-deliverable-contract-migration`

## User stories covered

- 3. Route foundry skills to the canonical discoverable surface
- 13. Make skill-authoring routes reachable through lifecycle and help skills
- 28. Derive one active catalog from real skill bundles
- 29. Keep help complete
- 42. Record and respect runtime visibility
- 43. Show discovery readiness without tracker mutation
