# Issue 007: Reconcile Capability Outcomes With Deliverables

## Parent

`workflow-foundry-006` - Design skill-first Workflow Foundry revamp

## What to build

Take one dependency-backed workflow request through proposed deliverable
contracts, an approved capability step and write plan, output production,
provenance reconciliation, phase and completion enforcement, read-only
readiness, deterministic fixtures, and fresh-agent evidence. Each dependency
step must name the deliverable and artifact role it supports.

Valid dependency JSON without the promised artifact, provenance, promotion
state, or correct role must fail. Dependency evidence cannot masquerade as a
primary skill. Preserve protected paths and the existing audit, review,
cleanup, and external-write approval boundaries. Add the dependency-backed
variants to the shared scenario contract introduced by Issue 004.

## Acceptance criteria

- [ ] A dependency-backed task contract identifies the capability step, supported deliverable, artifact role, required outcome, and completion condition before execution.
- [ ] The approved dependency write plan bounds allowed writes and preserves protected paths and external-write approvals.
- [ ] Successful reconciliation verifies output existence, provenance, role, promotion state, and the owning deliverable's normal validation.
- [ ] Dependency metadata alone cannot satisfy a deliverable or mark a step complete.
- [ ] Missing-output, missing-provenance, wrong-role, and out-of-boundary fixtures stop deterministically with specific reasons.
- [ ] Dependency evidence cannot satisfy a primary skill unless the contract assigns that role and the bundle passes normal skill validation.
- [ ] Query and read-only tracker projections expose dependency readiness and failure reasons without mutation.
- [ ] Dependency-backed variants extend the shared scenario contract and drive both live fresh-agent runs and deterministic fixtures.
- [ ] Fresh-agent English, terse, and Taglish dependency scenarios produce the expected contract and stop or advance correctly without hidden classification hints.
- [ ] Evidence records the raw prompt, context, observed dependency outcomes and artifacts, provenance, runner identity, timestamp, contract version, and result.
- [ ] Existing audit-foundry, audit-review, audit-cleanup, and external-write ownership boundaries remain intact.
- [ ] Root workflow-state validation and tracker verification pass.

## Blocked by

- `workflow-foundry-006-issue-004-canonical-skill-tracer`

## User stories covered

- 19. Tie capability dependency steps to deliverables
- 20. Verify dependency output existence and provenance
- 21. Prevent dependency evidence from satisfying the wrong role
- 22. Approve dependency artifacts by deliverable and role
- 23. Block implementation when dependency write plans are missing
- 24. Block completion when dependency outcomes are incomplete
- 34. Preserve an auditable intent-to-evidence trace
- 39. Preserve dependency and external-write boundaries
- 43. Show dependency readiness without tracker mutation
- 44. Record raw behavior evidence and observed results
