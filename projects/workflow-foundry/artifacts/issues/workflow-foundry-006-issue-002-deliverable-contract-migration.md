# Issue 002: Adopt Versioned Deliverable Contracts End To End

## Parent

`workflow-foundry-006` - Design skill-first Workflow Foundry revamp

## What to build

Take one generic workflow request through proposed-contract review, persisted
versioned task state, role-aware phase approval, deterministic enforcement,
query output, and read-only tracker readiness. New tasks must declare at least
one typed deliverable before creation. Open legacy tasks must receive explicit
migration state and remain frozen at their current phase until classification
is approved; completed history remains valid through compatibility policy.

`workflow-foundry-006` owns the behavior and acceptance evidence. Any tracker
schema or migration write must be executed through the existing
`workflow-foundry-004` tracker-maintenance authority rather than silently
crossing task ownership. Audit-foundry reports violations without repairing
them.

## Acceptance criteria

- [ ] A proposed contract shows a stable deliverable identifier, kind, version, primary or support role, ownership boundary, target surface, runtime visibility, runtime targets, required artifacts, allowed support, guidance, eval plan, and completion conditions before task creation.
- [ ] Every newly initiated task persists at least one approved deliverable contract.
- [ ] Phase approvals identify the deliverable and artifact role they authorize.
- [ ] Missing contract data or unresolved ownership blocks task creation or phase transition with a specific reason.
- [ ] Open legacy tasks record explicit migration state and cannot advance until classified.
- [ ] Completed historical tasks remain valid without bulk rewrites.
- [ ] Query and read-only tracker surfaces expose contracts, migration state, readiness, and blocking reasons without mutation.
- [ ] Audit-foundry reports contract and migration violations while audit-review and audit-cleanup keep their existing ownership.
- [ ] Tracker schema and migration writes are performed only under `workflow-foundry-004`; behavior and acceptance evidence remain linked to this issue.
- [ ] Deterministic fixtures cover a valid new task, a frozen open task, a migrated open task, and a compatible completed task.
- [ ] Root workflow-state validation and tracker verification pass.

## Blocked by

- `workflow-foundry-006-issue-001-validation-core-prefactor`
- `workflow-foundry-004` must reach an approved tracker-maintenance phase with the required tracker schema and migration paths authorized before this issue performs those writes.

## User stories covered

- 2. Show the proposed deliverable contract before task creation
- 22. Approve artifacts by deliverable and role
- 32. Persist typed deliverable contracts
- 35. Preserve historical done tasks through compatibility policy
- 36. Upgrade open tasks before their next phase transition
- 39. Preserve tracker, audit, cleanup, and external-write boundaries
- 43. Show deliverable readiness without tracker mutation
