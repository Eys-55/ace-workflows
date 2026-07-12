# Integrate Workflow Product Builder And Repair Dependency State

Task: `workflow-foundry-016`  
Status: PRD  
Generated: 2026-07-12  
Triage: ready for issue decomposition

## Executive Summary

Workflow Foundry already contains a completed and remotely pushed implementation
of the typed workflow-construction foundation and the Markdown-first
`$build-workflow-product` capability. Those changes live on the clean remote
feature branch `codex/build-workflow-product`, which is two commits ahead of
`main`. The current `main` worktree still contains an older, dirty tracker
snapshot that reports workflow-foundry-006 as being in issues and
workflow-foundry-015 as being in grilling. That stale state makes the capability
look unfinished and prevents confirmed consumers such as Health task 008 from
treating it as active.

This task will produce a conflict-safe integrated repository state without
discarding unrelated local work. It will construct and validate an isolated
integration candidate, reconcile overlapping tracker files semantically, prove
canonical skill discovery and downstream dependency readiness, and prepare an
explicit adoption checkpoint. It will not merge into `main` or push merely
because the candidate passes. Main-branch adoption and remote publication remain
separate human-approved actions.

## Problem Statement

As the operator, I cannot reliably tell whether Workflow Foundry capabilities
are active because branch truth, tracker truth, and the current worktree have
diverged. Workflow-foundry-006 and workflow-foundry-015 are implemented,
reviewed, validated, committed, and pushed on a feature branch, but the active
`main` worktree still records them as unfinished. Other workflows inspect that
stale state and correctly refuse to depend on a capability that does not appear
active on `main`.

The worktree cannot be repaired with a casual merge. It contains substantial
tracked and untracked work across Health, LinkedIn Posts, Real Life Workflows,
and Workflow Foundry. Eighteen paths overlap between the local dirty state and
the two feature commits. A direct merge, reset, checkout, or broad file copy
could erase newer tasks, regress the stricter deliverable-contract system,
reopen completed work, or silently mix unrelated project state.

The desired outcome is not merely “the branch was merged.” The desired outcome
is one verified repository state in which:

- the completed 006 and 015 implementations and evidence remain intact;
- newer local project and task work remains intact;
- the canonical product-builder skill is discoverable from the main-equivalent
  repository state;
- downstream tasks can resolve its completion without bypassing their own phase
  and write approvals;
- validation proves that the reconciliation did not weaken contracts or lose
  work; and
- adoption and publication remain explicit and reversible.

## Solution

Build the integration in a clean isolated worktree and branch derived from the
current remote `main` lineage. Bring in the complete two-commit feature chain as
one dependency-preserving unit. Treat the feature branch as authoritative for
the completed workflow-foundry-006 and workflow-foundry-015 implementation,
contract schemas, release evidence, canonical skills, validators, and tests.
Treat the dirty `main` worktree as authoritative only for newer unrelated work
that is absent from the feature branch.

For every overlapping path, perform semantic reconciliation rather than
choosing an entire file by branch. Preserve completed task state, versioned
deliverable contracts, artifact bindings, release evidence, and stricter
validation fields from the feature branch. Preserve newer task identities,
context preload entries, project relationships, and unrelated content from the
dirty worktree. Reject any reconciliation that downgrades 006 or 015, removes a
newer task, weakens a validation gate, or makes a changed artifact ownerless.

Run the highest available integration seam against the isolated candidate: the
root state validator plus the complete Workflow Foundry verification suite.
Supplement it with explicit assertions for commit ancestry, canonical skill
discovery, 006/015 completion, preservation of newer tasks, dirty-file
accounting, and Health dependency resolution. Record all evidence in a durable
integration report.

After independent review finds no unresolved critical or high issue, present an
adoption plan naming the exact integrated commit, the current `main` and remote
references, the preserved dirty-state inventory, and the rollback point. Only a
subsequent explicit operator checkpoint may update `main` or push.

## Self-Grill Findings

### What is actually broken?

The product-builder implementation is not broken. Repository integration and
state projection are broken. The active tracker reads the dirty `main`
worktree, while the complete implementation and done-state live on another
branch.

### Is workflow-foundry-015 safe to integrate alone?

No. Its parent commit contains workflow-foundry-006’s typed deliverable,
catalog, routing, validation, and readiness foundation. Integrating only the
015 commit would detach the product builder from its required contract system.

### Can the feature branch simply fast-forward `main`?

The Git ancestry permits a two-commit fast-forward, but the checked-out `main`
worktree does not. It has overlapping tracked modifications and untracked task
state. Git ancestry being simple does not make worktree reconciliation simple.

### Which state wins during reconciliation?

Authority is field- and artifact-specific:

- Feature branch wins for completed 006/015 phase, contracts, implementation,
  tests, evidence, validation logic, and canonical skill files.
- Current dirty state wins for newer unrelated task identities and artifacts
  created after the feature branch diverged.
- Neither side wins automatically for shared tracker indexes and preload lists;
  those must be regenerated from the combined task set and validated.
- Conflicting substantive edits without a clear owner stop the integration and
  become an explicit issue rather than being guessed through.

### What proves downstream workflows are unblocked?

Health task 008 is the confirmed consumer. The integrated candidate must expose
`build-workflow-product` in the canonical skill catalog, record 015 as done,
retain Health’s selected dependency mapping, and allow Health to pass dependency
readiness checks without editing Health’s phase or granting implementation
writes. Real Life Workflows task 006 is related but has no recorded capability
dependency, so this task must not falsely claim it is unblocked or mutate it.

### What is the rollback?

The existing remote `main` commit and the existing remote feature branch remain
immutable reference points. The integration candidate is built on a separate
branch/worktree. Failure deletes or abandons only that candidate after evidence
capture; it does not reset, clean, or rewrite the dirty `main` worktree.

### Who may publish?

Only the operator. Passing validation authorizes a recommendation, not a push.

## Considered Approaches

### 1. Direct merge in the current `main` worktree

Rejected. It has the shortest Git command path but the highest loss and conflict
risk. It would make it difficult to distinguish pre-existing dirty changes from
merge results and could partially overwrite newer tracker work.

### 2. Copy only the product-builder skill into `main`

Rejected. This would bypass workflow-foundry-006, omit validated routing and
release gates, produce false tracker completion, and recreate the exact
skill-versus-helper drift that the foundry revamp was designed to prevent.

### 3. Isolated integration candidate with semantic reconciliation

Selected. It preserves both sources of truth, provides a clean diff and rollback
boundary, supports the strict branch validator, and permits complete verification
before any main-branch mutation. It costs more review effort because overlapping
JSON must be merged semantically, but that effort directly addresses the actual
risk.

## User Stories

1. As the operator, I want workflow-foundry-006 and workflow-foundry-015 to show
   their real completed state, so that the tracker does not send me back into
   obsolete issues or grilling work.
2. As the operator, I want the complete two-commit dependency chain integrated,
   so that the product builder does not exist without its typed construction
   foundation.
3. As the operator, I want integration performed outside the dirty `main`
   worktree, so that unrelated work is not placed at risk.
4. As the operator, I want every dirty and untracked path inventoried before
   reconciliation, so that no local work can disappear silently.
5. As the operator, I want every overlapping file assigned an explicit merge
   rule, so that conflict resolution is reviewable rather than intuitive.
6. As the operator, I want completed task contracts, artifact bindings, behavior
   evidence, and reviews preserved, so that completion is not reduced to a
   status flag.
7. As the operator, I want newer Health, LinkedIn Posts, Real Life Workflows,
   and Workflow Foundry tasks preserved, so that activating the builder does not
   roll back later project work.
8. As the operator, I want combined task indexes and preload snapshots regenerated
   consistently, so that validators and future sessions load the same project
   state.
9. As the operator, I want `$build-workflow-product` discoverable from the
   canonical skill catalog, so that other tasks can select the real callable
   capability.
10. As the Health workflow owner, I want Health task 008 to resolve 015 as an
    active completed dependency, so that Health UI planning can proceed through
    its approved dependency step.
11. As the Health workflow owner, I want dependency readiness to preserve Health’s
    own phase guards, so that foundry integration cannot authorize Health product
    writes.
12. As a Real Life Workflows maintainer, I want its paused UI task preserved
    without being falsely marked unblocked, so that the tracker reflects its
    actual dependency state.
13. As a future task operator, I want `main` to be the authoritative active skill
    surface, so that branch-local completion cannot confuse capability routing.
14. As a reviewer, I want an isolated candidate diff against remote `main`, so
    that I can review only the intended integrated outcome.
15. As a reviewer, I want exact commit ancestry recorded, so that I can prove the
    candidate contains both feature commits without rewriting their content.
16. As a reviewer, I want root validation run using the integrated stricter
    validator, so that old validation cannot falsely bless new contract state.
17. As a reviewer, I want the complete tracker verification suite to pass, so
    that schema, readiness, catalog, routing, release evidence, product skill,
    coverage, build, and generated output are tested together.
18. As a security reviewer, I want a secret scan and diff review before any
    checkpoint, so that integration cannot publish credentials or private state.
19. As the operator, I want validation failures to preserve their evidence and
    stop adoption, so that gates are repaired rather than weakened.
20. As the operator, I want a durable integration evidence report, so that task
    completion can be independently audited later.
21. As the operator, I want the evidence report to name unresolved risks and
    excluded downstream work, so that “unblocked” is not overstated.
22. As the operator, I want a precise adoption procedure with before-and-after
    references, so that updating `main` is controlled and reversible.
23. As the operator, I want the remote feature branch retained until adoption is
    verified, so that it remains a recovery source.
24. As the operator, I want no automatic push after tests pass, so that external
    publication remains my decision.
25. As the operator, I want no duplicate implementation of 015, so that there is
    one reviewed product-builder capability rather than competing copies.
26. As the operator, I want workflow-foundry-004 and workflow-foundry-007 overlap
    explicitly accounted for, so that broad maintenance and checkpoint tasks do
    not silently compete with this focused integration owner.
27. As a tracker maintainer, I want this task to own only the foundry integration
    tracker changes, so that downstream project trackers remain governed by their
    own tasks.
28. As a future contributor, I want the integration procedure reusable for other
    completed-but-unmerged foundry branches, so that branch drift does not recur.
29. As the operator, I want a failure to leave the current worktree untouched, so
    that investigation does not make the original problem worse.
30. As the operator, I want completion declared only after the integrated candidate,
    adoption checkpoint, and remote state all agree, so that “done” means active
    rather than merely pushed somewhere.

## Implementation Decisions

- Use a dedicated integration branch and isolated worktree based on the verified
  remote main reference.
- Integrate the complete linear feature chain. Do not squash, omit the typed
  foundation, or reconstruct the product builder from files.
- Capture the dirty-state inventory and the feature diff before reconciliation.
  Hash or otherwise identify the source snapshots used by the candidate.
- Build an overlap manifest that classifies every path as feature-authoritative,
  dirty-state-authoritative, generated-from-combined-state, or blocked for manual
  resolution.
- Reconcile shared task JSON by semantic fields. Preserve complete deliverable
  contracts and completion evidence while adding newer task preload references
  and relationships required by the combined tracker.
- Regenerate shared indexes from the combined task set instead of accepting one
  side’s whole-file version.
- Treat validators, schema modules, catalog logic, readiness logic, release gates,
  tests, and canonical skill bundles from the feature chain as one indivisible
  implementation unit.
- Do not alter downstream task phase, dependency write plans, approved artifacts,
  or tracker state. Downstream checks are read-only readiness assertions.
- Store integration evidence as the primary task output. Evidence must include
  source references, overlap decisions, validation commands and results, failed
  attempts, final diff, review disposition, rollback point, and adoption status.
- Keep the integration task open after candidate validation until the operator
  approves adoption. Keep it open after local adoption until remote publication
  is either approved and verified or explicitly deferred.
- Never use destructive Git cleanup. Any temporary integration candidate may be
  abandoned without modifying the original dirty worktree.
- A validation failure must be fixed in the candidate or reported as blocked. Do
  not edit tests or contracts merely to silence a failure.

## Testing Decisions

The primary test seam is the isolated main-equivalent repository state. Tests
must exercise observable repository behavior rather than internal merge helper
implementation.

Required checks:

1. **Ancestry:** the candidate contains the exact typed-foundation and
   product-builder commits and descends from the verified remote main baseline.
2. **Dirty-state accounting:** every pre-existing tracked modification and
   untracked file is classified as preserved, superseded with rationale, or
   explicitly deferred. No path may be absent from the accounting.
3. **Tracker truth:** the combined task index matches task files; 006 and 015 are
   done; 016 remains in its real phase; newer task identities remain present;
   preload snapshots satisfy the integrated validator.
4. **Canonical capability:** catalog discovery returns the complete
   `build-workflow-product` bundle with matching metadata and no phantom or
   command-first substitute.
5. **Dependency readiness:** Health task 008 resolves the selected capability and
   completed dependency task while remaining in its own saved phase with no new
   write authority.
6. **Root state:** the integrated root workflow-state validator passes.
7. **Tracker suite:** data tests, schema and boundary tests, skill catalog and
   routing tests, release gates, product-skill tests, coverage gates, production
   build, and generated-output test pass.
8. **Security and integrity:** diff inspection, secret scanning, evidence hash or
   provenance checks, and untrusted-content boundaries pass.
9. **Independent review:** a reviewer checks the candidate against this PRD,
   overlap manifest, task contracts, and downstream boundary. No unresolved
   critical or high finding may remain.
10. **Adoption verification:** after explicit approval only, local and remote
    references are compared to the approved candidate and the same high-level
    validation is rerun or verified from an unchanged commit.

Existing Workflow Foundry validators and tracker tests are the preferred prior
art. New tests are justified only for integration behavior that the existing
suite cannot observe, especially dirty-state preservation and downstream
dependency readiness.

## Failure Handling

- If remote references moved, stop and refresh the integration baseline.
- If the feature branch is no longer a complete linear dependency chain, stop
  and re-establish commit provenance before integrating.
- If an overlapping file has two substantive owners and no safe semantic merge,
  record it as blocked and request an explicit ownership decision.
- If a newer local task cannot satisfy the stricter contract schema, preserve the
  task and route its migration through an approved tracker decision; do not delete
  it or weaken validation.
- If Health dependency readiness fails, identify whether the failure is catalog,
  task completion, dependency mapping, or phase authority. Do not advance Health
  as a shortcut.
- If any required test fails, retain the candidate and evidence for diagnosis or
  abandon only the isolated candidate. Leave the original worktree untouched.
- If secret or sensitive data is detected, stop before commit or push and remove
  it from the candidate while preserving the original evidence privately.
- If adoption cannot occur safely with the dirty worktree present, prepare the
  verified candidate and exact handoff, then stop for operator direction rather
  than stashing, committing, or cleaning unrelated work without approval.

## Acceptance Criteria

The PRD is satisfied only when:

- an isolated candidate contains both required feature commits;
- all pre-existing local work is accounted for and no unrelated work is lost;
- combined tracker state is internally consistent and preserves newer tasks;
- 006 and 015 are completed in the candidate with their full contracts and
  evidence;
- the canonical product-builder skill is discoverable and validates;
- Health task 008 resolves the capability without receiving unauthorized writes;
- the integrated root validator and complete tracker verification pass;
- security, diff, evidence, and independent review gates pass;
- the integration evidence report and rollback/adoption procedure are complete;
- no unresolved critical or high finding remains; and
- `main` and the remote are changed only after explicit operator approval and
  verified against the approved candidate.

## Out Of Scope

- Reimplementing or redesigning `$build-workflow-product`.
- Building the Health or workflow-search user interfaces.
- Advancing Health task 008 or Real Life Workflows task 006 through their phases.
- Mutating downstream project trackers from this task.
- Cleaning all unrelated dirty repository work.
- Closing every stale or dormant task in the repository.
- Redesigning the tracker UI or adding a new global paused status.
- Deleting the feature branch before adoption is fully verified.
- Automatically committing, merging, updating `main`, or pushing during PRD or
  issue decomposition.

## Further Notes

- Verified current remote references at PRD time: `main` at `675efe0` and
  `codex/build-workflow-product` at `795fbaf`.
- The feature branch is two commits ahead of `main`: typed workflow construction
  foundation followed by the workflow product builder.
- The feature worktree is clean and passes the integrated root state validator.
- The current dirty `main` state passes only its current validator; this is not
  sufficient evidence that it will pass the stricter integrated contract system.
- Eighteen paths currently overlap between dirty local state and the feature
  chain, including shared foundry task files and two downstream task files.
- Health task 008 is the only confirmed selected consumer of
  `build-workflow-product` in the loaded state.
- This PRD follows Matt Pocock’s `to-prd` structure and uses the existing root
  validator plus complete tracker verification as the highest practical test
  seam.
