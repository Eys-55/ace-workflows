# Workflow Foundry 016 Integration Evidence

Task: `workflow-foundry-016`  
Generated: 2026-07-12  
Candidate branch: `codex/integrate-workflow-product`

## Result

Pending final review, completion-state transition, commit, and remote adoption.

## Source References And Rollback

- Remote and local main baseline: `675efe042de0baed68470590c55fa497ace7817a`
- Typed workflow construction foundation: `2fd5ebe3239f15a727c6543b5a39bbf932f15585`
- Completed workflow product builder: `795fbaf06114e745bde9cdb3a35d41c88c6c9c6d`
- Feature branch: `codex/build-workflow-product`
- Integration branch: `codex/integrate-workflow-product`
- Original dirty worktree: `<original-ace-workflows-worktree>`

The integration candidate begins at the completed feature tip, whose ancestry is
the remote main baseline followed by the typed-foundation and product-builder
commits. The original dirty worktree has not been reset, cleaned, checked out,
or rewritten by integration operations. The baseline and feature refs remain
rollback points until post-push verification completes.

## Inventory And Reconciliation

The source worktree contained 58 dirty or untracked paths at the immutable
inventory checkpoint. The candidate preserves or explicitly defers every path,
then adds task 016's issues, regression, privacy repair, manifest, and this
evidence artifact. The path-level manifest is
`workflow-foundry-016-source-inventory.json`, with source snapshot SHA-256
`c31d8b60c576b1ccab1b9b4a19e8321c1444be7ca9c3ea155acc2d7af6107c62`.

| Project area | Preserved source paths | Reconciliation |
| --- | ---: | --- |
| Health | 27 | Preserved v2 PRD, 12 issues, workflow packet, task index, and tasks 001-008. Four private testing-session files remain only in the original worktree and are classified as deferred-private. |
| LinkedIn Posts | 6 | Preserved draft run, index, and tasks 001-004 while retaining the feature branch's frozen migration for task 002. |
| Real Life Workflows | 7 | Preserved index and tasks 001-006; kept task 006 paused in grilling without claiming product-builder readiness. |
| Workflow Foundry | 18 | Kept feature-authoritative 006/015 contracts, evidence, validators, and done state; preserved task 014; continued task 016; regenerated combined preload state. |

Eighteen source paths overlapped feature-branch changes. Whole-file overwrite was
rejected. The candidate applies these semantic rules:

- Feature state is authoritative for completed 006 and 015, v1 schemas,
  canonical skills, routing, catalog, readiness, release evidence, and tests.
- Source state is authoritative for newer task identities and project artifacts.
- Shared indexes and `context_snapshot.must_load` entries are derived from the
  combined non-done task set.
- Workflow Foundry task 004 remains the tracker-maintenance owner for minimal
  compatibility writes across preserved project trackers.
- Newer open tasks are frozen with pending v1 migration metadata unless their
  current phase requires a complete contract.

## Contract Compatibility

Minimal frozen migrations were added without changing phase or write authority
for:

- `workflow-foundry-014`
- `health-008`
- `linkedin-posts-003`
- `linkedin-posts-004`
- `real-life-workflows-005`
- `real-life-workflows-006`

Health 007's saved code-review phase was not supportable: its standalone product
worktree is still uncommitted and no durable review artifact exists. The task was
corrected to implement with a frozen pending migration, preserving its original
worktree and dependency provenance without publishing machine-specific write
authority. A fresh local `npm run release:check` still passed and is recorded as
diagnostic evidence, not completion evidence:

- 7 callable skills
- 39 entities and 15 product surfaces
- 16 packet fields
- 8 refusal classes
- 7 source roles
- 14 scenarios
- 16 audit fixtures
- 6 forward-test runs
- 7 examples
- 31 package support files
- v0.2.0 release validation
- successful npm dry-run package

## Canonical Capability And Downstream State

- Workflow Foundry 006 remains `done / done` with typed deliverable routing.
- Workflow Foundry 015 remains `done / done` with its complete canonical skill,
  five references, behavior evidence, release gates, and review.
- The derived catalog exposes `build-workflow-product` as a complete canonical
  skill.
- Health 008 retains the confirmed `build-workflow-product` dependency and stays
  in grilling with an empty approved-artifact list. The canonical capability and
  completed 015 dependency resolve; overall Health 008 readiness remains blocked
  by its own pending migration. Integration does not grant Health product writes.
- Real Life Workflows 006 remains in grilling with no capability dependency and
  is not falsely reported as unblocked.

## Test-Driven Integration Evidence

The combined root validator was first run before reconciliation and failed on:

- missing v1 migration metadata for preserved newer tasks;
- missing combined preload entries;
- Health 007 completion readiness; and
- changed-artifact ownership.

After semantic reconciliation and the conservative Health 007 phase correction,
the same root validator passed without validator or gate changes.

The new integration regression was then run before task completion and failed
for the expected reason: task 016 was still `in-progress / implement`. The test
also covers completed 006/015 state, canonical product-builder discovery, Health
008 dependency preservation, and Real Life Workflows 006 non-advancement.

## Validation Log

| Check | Result | Evidence |
| --- | --- | --- |
| Feature baseline root validation | PASS | `Workflow state is valid.` |
| Feature baseline tracker data tests | PASS | 61 tests, 0 failures |
| Feature schema coverage | PASS | 88.29% lines, 88.46% branches, 90.91% functions |
| Feature readiness coverage | PASS | 96.58% lines, 90.48% branches, 95.00% functions |
| Feature catalog coverage | PASS | 83.58% lines, 83.16% branches, 95.83% functions |
| Feature evidence coverage | PASS | 96.53% lines, 84.55% branches, 100% functions |
| Feature Astro production build | PASS | One static page built |
| Feature generated-output test | PASS | 1 test, 0 failures |
| Health 007 standalone release check | PASS (diagnostic) | All validators, release surface, and npm dry run passed; task remains implement pending durable review |
| Combined root validation after reconciliation | PASS | `Workflow state is valid.` |
| Integration regression RED run | EXPECTED FAIL | The first test exposed a circular done-state assertion; the lifecycle contract was corrected before closure |
| Integration regression GREEN run | PASS | Canonical data suite passed 64 tests with 0 failures |
| Final tracker verification | PASS | 64 data tests, all four coverage gates, Astro build, and generated-output test passed |
| Diff and secret review | PASS | `git diff --check`, dependency audit, and changed-file credential scan passed |
| Independent standards/security review | PASS | Two independent lanes found no remaining critical or high blockers after re-review |
| Post-commit clean validation | PENDING | Required before push |
| Remote branch and main verification | PENDING | Required after push |

## Security And Boundaries

- No validator was weakened or bypassed.
- No product-builder implementation was reconstructed or copied without its
  typed-foundation dependency.
- No downstream task was advanced by integration.
- No destructive Git command was used.
- No force push is permitted.
- External product paths remain bound to their existing approved worktrees.
- The private Health testing session is excluded from publication and remains in
  the original worktree. Testing-session writes now reject POSIX, Windows drive,
  UNC, and device absolute paths plus traversal. A best-effort sensitive-text
  screen supplements the skill's mandatory redaction, neutral-fixture, and
  private-detail-withholding rules; it is not treated as proof that arbitrary
  free text is safe to publish.

## Review

Independent correctness and security re-reviews passed with no remaining
critical or high blockers. The review-required repairs were: remove the
circular completion assertion, make the historical 015 scope check
commit-stable, exclude private testing-session state, classify text screening
as best-effort defense in depth, and reject POSIX, Windows drive, UNC, and
device absolute paths.

## Adoption

Pending final commit and explicitly authorized non-force push. Remote main may
advance only to the reviewed candidate lineage. The feature branch and source
worktree remain preserved until remote verification succeeds.
