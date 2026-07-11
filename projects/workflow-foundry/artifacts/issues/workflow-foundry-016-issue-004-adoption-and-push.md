# Workflow Foundry 016 Issue 004: Adoption And Push

## Parent

`workflow-foundry-016`

## What to build

Create the final integration evidence, close task 016 only after all completion
conditions are met, push the verified integration branch, fast-forward remote
main under the operator's explicit authorization, and verify exact remote refs.
Keep the recovery branch until adoption is confirmed.

## Acceptance criteria

- [ ] Integration evidence records ancestry, reconciliation, validation, review, risks, and rollback.
- [ ] Final task and index state agree and pass completion readiness.
- [ ] Verified candidate commit is pushed without force.
- [ ] Remote main advances only to the reviewed candidate lineage.
- [ ] Remote main and integration branch refs are verified after push.
- [ ] Original dirty worktree is not destructively cleaned or reset.

## Blocked by

- Workflow Foundry 016 Issue 003
