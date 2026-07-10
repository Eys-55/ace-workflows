# Issue 001: Prefactor One Workflow-State Validation Core

## Parent

`workflow-foundry-006` - Design skill-first Workflow Foundry revamp

## What to build

Characterize the current workflow-state validator and move its behavior behind
one importable core before adding the revamp contracts. Preserve the existing
command entrypoint and current green behavior while making disposable-repository
fixtures call the exact same validation logic.

This is the one deliberate prefactor slice. It must not introduce the new
deliverable model, repair current discovery drift, or change phase behavior.
Its purpose is to create the seam needed for later tracer bullets without
duplicating validation rules between the command and tests.

## Acceptance criteria

- [x] Characterization fixtures capture current valid and invalid workflow-state behavior before the refactor.
- [x] Workflow-state validation is exposed through one importable core with structured success and failure results.
- [x] The existing command entrypoint delegates to the core and preserves its command-line contract.
- [x] Disposable-repository fixtures invoke the same core rather than a copied or reduced validator.
- [x] Existing repository validation outcomes remain unchanged, including known green-but-wrong discovery behavior reserved for Issue 003.
- [x] The core introduces no new operator-facing command, skill, or task phase.
- [x] Root workflow-state validation and tracker verification pass.

## Blocked by

None - can start immediately.

## User stories covered

- 37. Use one importable validation seam for commands and fixtures
- 40. Begin the approved issue-sized migration sequence
