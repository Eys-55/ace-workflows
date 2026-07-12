# Behavior Evaluation Contract

Use one versioned scenario source for deterministic fixtures and fresh-agent
runs. Store raw prompts, expected contracts, and observed evidence separately;
never reveal grader expectations to the fresh agent.

## Scenario Fields

Each scenario or expanded family variant carries:

- scenario id and family;
- contract version and prompt variant;
- runner modes;
- unaltered raw prompt;
- disposable repository context and policy files;
- expected intent, builder, branch, and deliverable kind;
- ownership boundary, target surface, visibility, and runtime targets;
- required primary bundle and semantics;
- allowed support;
- forbidden outcomes;
- dependency behavior and protected paths;
- starting repository state, approval behavior, and expected completion result;
- expected final status, catalog membership, and duplicate count.

## RED And GREEN

1. Keep lifecycle-intent routing separate from implementation-ready
   construction. Lifecycle cases classify or stop; construction cases receive
   the already approved contract but never the hidden expected route.
2. Run a construction prompt without the target builder. Archive the output,
   zero-write proof, and exact rationalization as RED.
3. Run the same prompt with the builder in a clean disposable worktree as
   GREEN.
4. Use GPT-5.6 Sol only. If it is unavailable, record a blocked run; never use a
   fallback model.
5. Give the runner no expected route, hidden classification, forbidden outcome,
   or rubric.
6. Grade actual contract state, emitted files, diff, catalog projection,
   dependency evidence, and completion result.
7. Preserve first-attempt results, record every retry as a new run linked to its
   prior attempt, and isolate every scenario from prior output.

## Evidence Fields

Record:

- evidence id, scenario id, scenario and builder contract versions;
- runner mode, explicit GPT-5.6 Sol identity, Codex CLI version, session id,
  start/completion timestamps, and `first_attempt: true`;
- raw prompt and repository context;
- exact raw runner output plus expected and observed route;
- observed ownership, deliverable contracts, artifacts, visibility, catalog
  membership, completion result, and dependency outcomes;
- full created/updated diff, or explicit verified zero-write evidence for a
  blocked/refused case;
- validation results from an independent deterministic, agent, human, or E2E
  grader with a different identity and session from the runner;
- observed rationalizations;
- pass/fail result, blocker or failure codes, and notes.

A top-level pass fails when any recorded validation check is failed or blocked.
Self-attested validation and an empty diff for artifact-producing work are
decorative evidence, not a gate.

## Failure Codes

Use stable codes:

```text
migration-pending
contract-missing
contract-invalid
ownership-unresolved
contract-approval-unbound
required-artifact-missing
required-artifact-invalid
support-artifact-undeclared
eval-evidence-missing
eval-evidence-failed
dependency-write-plan-missing
dependency-output-missing
dependency-provenance-missing
dependency-role-mismatch
dependency-out-of-boundary
catalog-bundle-incomplete
catalog-phantom-entry
review-evidence-missing
primary-deliverable-incomplete
python-substitute
javascript-only
helper-only
thin-wrapper
command-first
incomplete-metadata
identity-mismatch
decorative-eval
unreferenced-helper
```

## Release Threshold

- Every deterministic fixture passes.
- Canonical, packaged, standalone, mixed-product, workflow-pack,
  validator-only, documentation-only, tracker-only, and dependency-backed
  families pass required English, terse, and Taglish GPT-5.6 Sol runs.
- Ambiguous ownership stops with zero writes.
- Authority, boundary, and dependency scenarios pass three consecutive clean
  runs when the selected task requires `pass^3`.
- A retry after grader feedback never counts as a first-attempt pass.
