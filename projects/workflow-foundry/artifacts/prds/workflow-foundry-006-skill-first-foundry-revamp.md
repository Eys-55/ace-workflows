# PRD: Skill-First Workflow Foundry Revamp

Task: `workflow-foundry-006`
Status: Ready for issue breakdown

## Problem Statement

The Workflow Foundry says that skills are the primary product, but it does not
make a requested skill a first-class deliverable. When the operator asks to
create a skill, the task workflow records a generic workflow change, advances
through phases, and approves arbitrary artifact paths. Nothing in that path
requires the result to be a callable skill bundle.

This creates a gap between intent and output. An agent can respond to a skill
request with Python, JavaScript, a validator, a helper script, or a thin wrapper
and still appear to have completed the task. Python is rejected inside this
repository, but JavaScript and helper-only outputs are not consistently rejected
when they substitute for the requested skill. External or global skill-writing
guidance can also select a different skill root, prefer a Python scaffolder, or
treat runtime metadata as optional because the foundry does not resolve those
conflicts before implementation.

The current validator enforces negative rules after files exist. It checks
existing skill frontmatter, phase linkage, and some command-first wording, but it
does not prove that a task asking for a skill produced the correct skill bundle,
used the approved dependency capabilities, included behavior evidence, or
became discoverable. The repository can therefore validate successfully while
the operator's actual request remains unmet.

The operator wants a foundry that understands the requested product before it
builds anything. A skill request must produce an actual skill. A UI or validator
request may legitimately produce code, but that code must never masquerade as a
skill. Scripts may support a skill only after the skill contract is explicit.

## Solution

Make the requested deliverable a first-class part of task state and enforce it
across task drafting, phase transitions, skill construction, validation,
discovery, and review.

Every new task will declare one or more deliverable contracts. Each contract
will identify the deliverable kind, whether it is primary or supporting, its
ownership boundary, target surface, runtime visibility, runtime targets,
required primary artifacts, allowed supporting artifacts, required guidance,
evaluation evidence, and completion conditions.
Task kind will continue to distinguish workflow changes from tracker
maintenance; deliverable kind will describe what the task must actually produce.

The first deliverable taxonomy will cover:

1. canonical foundry skill;
2. standalone or project-local packaged skill;
3. multi-skill workflow pack;
4. UI or application;
5. deterministic validator or query helper;
6. documentation or handoff artifact; and
7. tracker-only change.

A task may contain multiple contracts. For example, a tracker UI task may have
a UI deliverable and a separate canonical skill wrapper. JavaScript may satisfy
the UI contract, but it cannot satisfy the skill contract.

Adopt this target routing law:

- Foundry and control-plane skills belong to the canonical repository skill
  surface.
- In-foundry project packages belong to the owning project's packaged skill
  surface and remain explicitly non-active in the local foundry runtime.
- Standalone product skills belong to the product repository and canonical
  product surface named by the task; the foundry tracks but does not duplicate
  them.
- Ambiguous destinations stop for operator clarification before task creation or
  phase progression.
- Scripts, validators, references, assets, and data files are supporting
  artifacts unless the user explicitly requested that artifact family.

Create one dedicated, model-invoked `$build-workflow-skill` as the single
authoring contract for both canonical and standalone skill branches. The task
lifecycle skills will remain thin: they classify intent, persist the deliverable
contract, enforce phase boundaries, and delegate skill construction to the
builder. The builder will apply the repository's previous workflow and ECC guidance,
construct the required skill bundle, justify optional resources, run behavioral
evaluation, and return evidence to the selected task.

Within this repository, local foundry policy takes precedence over generic
global authoring defaults. The builder will use the repository-selected target
surface, require both skill instructions and runtime metadata, avoid Python
scaffolding, and create supporting resources only after the core skill contract
is defined. Generic skill-authoring guidance remains reference material; it
cannot choose a conflicting destination or substitute scripts for the requested
skill.

Extend capability dependency behavior so dependency steps support named
deliverable contracts. A dependency's declared outputs must exist, retain
provenance, and satisfy only the artifact role they were approved to support.
Valid dependency metadata or a workflow-pattern packet does not count as the
requested skill unless the primary skill bundle and its behavior evidence are
also complete.

Move validation from negative wording checks to positive outcome enforcement.
The foundry must reject missing skill bundles, missing or invalid runtime
metadata, script-only substitutes, mismatched names, unreferenced helpers,
command-first wrappers, unresolved dependency outcomes, discovery drift, and
phase completion without behavior evidence. It must preserve legitimate code
products when their deliverable contract is a UI, application, validator, or
query helper.

Derive the active skill catalog from the canonical skill surface and use that
catalog as the shared source for discovery, help, validation, and dependency
inspection. Static skill lists must not silently drift from the actual runtime
surface.

Expose deliverable contracts and readiness through the existing query and
read-only tracker surfaces. Keep audit-foundry diagnostic, audit-review
planning-only, and audit-cleanup approval-gated while allowing those consumers
to report or repair deliverable-contract violations through their established
boundaries.

## User Stories

1. As the foundry operator, I want a request for a skill to be classified as a skill deliverable, so that the task cannot silently become a coding task.
2. As the foundry operator, I want the proposed deliverable contract shown before task creation, so that I can verify what will actually be built.
3. As the foundry operator, I want foundry skills routed to the canonical repository skill surface, so that Codex can discover and invoke them.
4. As the foundry operator, I want standalone product skills routed to the named product repository, so that the foundry does not absorb product runtime state.
5. As the foundry operator, I want ambiguous skill destinations to stop for clarification, so that the agent does not guess the wrong ownership boundary.
6. As the foundry operator, I want each task to distinguish primary deliverables from support artifacts, so that helpers cannot be reported as the product.
7. As the foundry operator, I want tasks to support multiple deliverables, so that legitimate products such as a UI plus a skill wrapper can be represented accurately.
8. As the foundry operator, I want a canonical skill deliverable to require skill instructions and runtime metadata, so that a directory of scripts is not called a skill.
9. As the foundry operator, I want skill names, folder names, metadata, and invocation prompts to agree, so that discoverability is predictable.
10. As the foundry operator, I want skill descriptions to contain the trigger contract, so that model invocation does not depend on hidden body text.
11. As the foundry operator, I want one dedicated skill builder, so that skill-authoring rules have one source of truth.
12. As the foundry operator, I want task lifecycle skills to remain focused on state and phases, so that they do not become sprawling skill-writing manuals.
13. As the foundry operator, I want the skill builder reachable by lifecycle and help skills, so that agents can select it without me memorizing another manual process.
14. As the foundry operator, I want local foundry policy to override conflicting global skill destinations, so that skills are written to the correct workspace.
15. As the foundry operator, I want Python scaffolding excluded from this repository, so that generic authoring tools cannot violate repository policy.
16. As the foundry operator, I want JavaScript and deterministic helpers classified explicitly, so that legitimate support code remains possible without replacing skill logic.
17. As the foundry operator, I want optional scripts, references, and assets justified by concrete repeated needs, so that generated skill bundles stay lean.
18. As the foundry operator, I want a multi-skill workflow pack represented as a coordinated set of skill contracts, so that shared references and evals do not erase individual skill interfaces.
19. As the foundry operator, I want capability dependency steps tied to deliverables, so that an external workflow capability has a precise role.
20. As the foundry operator, I want dependency outputs checked for existence and provenance, so that shape-valid JSON does not imply successful execution.
21. As the foundry operator, I want dependency evidence prevented from satisfying the wrong artifact role, so that a research packet cannot masquerade as a callable skill.
22. As the foundry operator, I want phase guards to approve artifacts by deliverable and role, so that implementation permissions remain understandable.
23. As the foundry operator, I want implementation blocked when a skill contract lacks its required bundle or eval plan, so that bad work does not begin.
24. As the foundry operator, I want task completion blocked when primary artifacts or behavior evidence are missing, so that green tracker status means the request was fulfilled.
25. As the foundry operator, I want fresh-agent behavior tests for skill creation, so that the foundry proves routing rather than relying on prose review.
26. As the foundry operator, I want script-only and thin-wrapper fixtures to fail, so that the reported regression cannot return unnoticed.
27. As the foundry operator, I want legitimate UI and validator fixtures to pass, so that stronger skill enforcement does not ban appropriate code products.
28. As the foundry operator, I want the active skill catalog derived from real skill bundles, so that help and runtime discovery cannot drift.
29. As the foundry operator, I want help to expose the skill builder and every active canonical skill, so that the operational surface stays complete.
30. As a standalone product maintainer, I want product skills kept outside the foundry runtime unless explicitly promoted, so that product boundaries remain intact.
31. As a standalone product maintainer, I want the foundry to respect the product repository's own file policy, so that foundry-specific restrictions are not applied blindly outside this workspace.
32. As a future agent, I want a typed deliverable contract, so that I do not need to infer artifact families from task titles and prose.
33. As a future agent, I want completion criteria at every authoring step, so that I do not rush ahead to supporting code or later phases.
34. As a reviewer, I want a trace from user intent to task contract, artifacts, dependencies, evals, and review evidence, so that I can verify the output against the request.
35. As a reviewer, I want historical done tasks preserved under a compatibility policy, so that the revamp does not require unsafe bulk tracker rewrites.
36. As a reviewer, I want open tasks upgraded before their next phase transition, so that new enforcement applies where work can still change.
37. As a foundry maintainer, I want one importable validation seam used by commands and fixture tests, so that the same contract is tested and enforced.
38. As a foundry maintainer, I want Codex to be the first executable target with portable contracts for other agent runtimes, so that the revamp remains shippable.
39. As a foundry maintainer, I want existing audit, cleanup, tracker UI, dependency, and external-write boundaries preserved, so that the revamp strengthens rather than bypasses established controls.
40. As the foundry operator, I want issue-sized migration slices after this PRD, so that implementation can proceed test-first without a single risky rewrite.
41. As the foundry operator, I want an existing-skill update distinguished from new-skill creation, so that the builder does not create duplicate skill identities.
42. As the foundry operator, I want runtime visibility recorded explicitly, so that packaged or standalone skills are never mislabeled as callable in this foundry.
43. As a tracker user, I want deliverable readiness visible without allowing the tracker UI to mutate state, so that I can see why a task is or is not ready to advance.
44. As a reviewer, I want behavioral-eval evidence to record the raw scenario and observed result, so that an empty or decorative eval file cannot satisfy completion.

## Implementation Decisions

- Keep `task_kind` for workflow-change versus tracker-maintenance accounting.
  Add a separate deliverable-contract model for the requested output family.
- Allow multiple deliverable contracts on one task. Each contract records an
  identifier, contract version, kind, primary or support role, ownership
  boundary, target surface, runtime visibility, runtime targets, required
  artifacts, allowed support artifacts, required guidance, eval evidence, and
  completion conditions.
- Require every newly initiated task to declare at least one deliverable
  contract before it is written.
- Require every non-done legacy task to receive a deliverable contract before
  its next phase transition. Preserve completed historical tasks through a
  compatibility rule rather than rewriting their history.
- Use the approved taxonomy: canonical skill, standalone packaged skill,
  multi-skill workflow pack, UI or application, validator or query helper,
  documentation or handoff, and tracker-only change.
- Treat artifact role separately from artifact type. A task can contain a
  primary UI, a primary skill wrapper, and supporting tests without allowing
  one to satisfy another.
- Add one model-invoked `$build-workflow-skill` as the single authoring branch
  for skill deliverables. Use one skill with canonical and standalone branches
  instead of separate authoring skills in the first version.
- Keep task initiation and continuation focused on classification, persistence,
  dependency selection, phase guards, and delegation to the builder.
- Update the help router so create-skill language routes to the skill builder
  and the complete canonical skill catalog remains visible.
- Within this repository, repository policy and the selected deliverable
  contract override generic global authoring defaults.
- Treat generic system or personal skill-authoring skills as adaptable
  references, not destination or scaffolding authorities. Do not modify those
  global skills or user-home configuration in this task.
- Require the canonical skill bundle to include skill instructions and Codex
  runtime metadata. Require lowercase hyphenated identity, matching metadata,
  a non-empty trigger description, and a default invocation that names the
  skill.
- Require the skill builder to define the workflow, inputs, outputs, decision
  points, failure handling, human boundaries, handoffs, and completion criteria
  before optional support resources are added.
- Require the task or issue to record which previous workflow and ECC guidance applies
  and how each selected ECC concept is evidenced by the deliverable or eval.
  A free-form list of concept names is not sufficient evidence.
- Keep Python forbidden in the repository. Do not use generic Python skill
  scaffolders here.
- Do not create a new repository-wide JavaScript or TypeScript allowance. An
  existing approved UI or package boundary keeps its own explicit code policy,
  but JavaScript or TypeScript cannot satisfy a workflow-skill deliverable.
- Allow repository-local `.mjs` only for deterministic JSON validation or query
  support, consistent with the root file policy. Require each helper to be
  classified, linked to its owning deliverable, and referenced by the skill or
  validation contract that uses it.
- Preserve standalone product file policies. The foundry records and validates
  the product's skill bundle contract but does not impose the foundry's exact
  local helper restrictions outside this repository without an explicit task
  decision.
- Extend capability dependency steps to reference the deliverables they
  support. Require actual output evidence and provenance before a dependency
  step can be considered complete.
- Prevent dependency artifacts from satisfying a primary deliverable unless
  the contract explicitly assigns that role and the artifact passes the same
  validation.
- Make phase approvals identify the deliverable and artifact role they enable.
  Block implementation when required primary paths, eval plans, dependency
  write plans, or ambiguity resolutions are missing.
- Block task completion until all primary deliverables exist, all required
  behavior evidence is present, dependency provenance is complete, and focused
  standards/spec review has passed.
- Validate every immediate canonical skill directory, not only skill files that
  happen to exist.
- Validate runtime metadata and invocation consistency as part of the canonical
  skill bundle.
- Derive one active skill catalog from the canonical surface. Use it for help,
  validation, query output, and dependency inspection instead of maintaining
  independent hard-coded lists.
- Make the query and read-only tracker projections expose deliverable kind,
  runtime visibility, required outcomes, and readiness without adding mutation
  behavior.
- Make audit-foundry report contract violations without repairing them;
  preserve audit-review and audit-cleanup as the planning and approved-mutation
  paths.
- Replace heading-allowlist command checks with a default-deny operator rule:
  command examples are support material only when they appear in explicitly
  classified developer verification, package smoke-test, deterministic
  validation, query, or internal-support sections.
- Refactor workflow-state validation behind one importable core seam while
  preserving the existing command entrypoint.
- Migrate in stages: contract and failing fixtures first; lifecycle routing and
  builder second; skill bundle/discovery enforcement third; open-task and
  active-skill audit fourth; forward-testing and focused review last.
- Version the deliverable contract. Migrate affected open tasks explicitly
  before their next phase transition. Mark legacy open tasks with an explicit
  migration state and freeze their current phase until classification is
  complete. Preserve historical done tasks as legacy valid state, and let
  read-only audits report legacy gaps without rewriting history. Do not infer
  migration eligibility from dates or Git history.
- Keep Codex as the first executable runtime target. Define portable skill
  contracts for Claude Code, opencode, and Antigravity-style environments, but
  defer runtime-specific adapters until evidence requires them.
- Keep `workflow-foundry-004` as tracker-maintenance owner for tracker schema
  and migration edits. Keep the revamp design and implementation behavior under
  `workflow-foundry-006`.
- Leave the checkpoint task and personal README task independent. This task may
  define policy they later consume but must not publish or rewrite their owned
  artifacts.

## Testing Decisions

- Test at the highest behavior seam: given a representative operator request
  and project context, the lifecycle flow must produce the correct deliverable
  contract before any implementation artifact can be approved.
- Use a hybrid regression gate. Pair isolated live lifecycle scenarios for
  natural-language routing with deterministic disposable-repository fixtures
  for task, bundle, completion, provenance, and discovery enforcement.
- Drive both seams from one scenario contract containing the prompt, repository
  context, expected route, ownership boundary, required bundle, allowed
  support, forbidden outcomes, dependency behavior, phase behavior, and final
  result.
- Require behavioral-eval evidence to record scenario id, raw prompt,
  repository context, isolated runner or testing-session identity, expected
  route, observed deliverable contract and artifacts, pass/fail result,
  timestamp, and skill-builder contract version.
- Use one importable workflow-state validation core as the deterministic
  contract seam. The command-line validator and isolated fixture tests must call
  the same core behavior.
- Prefer observable outcomes over implementation details: task contract,
  approved artifact roles, resulting skill bundle, dependency evidence,
  discoverability, and phase transition result.
- Use existing workflow-state data tests and generated tracker verification as
  prior art for isolated state loading and derived-output checks.
- Add a passing canonical-skill fixture with a complete bundle, correct
  invocation metadata, a behavioral eval, and an explicitly referenced
  deterministic helper.
- Add a passing standalone-skill fixture that remains outside the canonical
  active-skill catalog and records its product boundary.
- Add a passing multi-deliverable UI fixture showing that application code may
  satisfy a UI contract while a separate skill wrapper satisfies the skill
  contract.
- Add a passing validator/query-helper fixture that does not invent a skill when
  the operator requested only deterministic support.
- Add a failing Python-substitution fixture.
- Add a failing JavaScript-only skill fixture.
- Add a failing `.mjs`-only skill fixture.
- Add a failing skill-directory-without-instructions fixture.
- Add a failing skill-without-runtime-metadata fixture.
- Add failing folder-name, frontmatter-name, trigger-description, and default
  invocation consistency fixtures.
- Add a failing command-first wrapper fixture, including command examples under
  quick-start, getting-started, example, or unheaded sections.
- Add a failing unreferenced-helper fixture.
- Add a failing task-intent-versus-artifact-role fixture in which a helper is
  approved but the primary skill bundle is absent.
- Add a failing capability-dependency fixture in which metadata is valid but
  the declared output or provenance is absent.
- Add a failing help/catalog-drift fixture.
- Add a failing phase-transition fixture for missing primary artifacts, eval
  evidence, ambiguity resolution, or dependency write plans.
- Add a compatibility fixture proving completed historical tasks remain valid.
- Forward-test the skill builder with fresh agents and raw prompts for canonical
  skills, standalone product skills, workflow packs, UI applications,
  validators, documentation, existing-skill updates, two-skill tasks, mixed
  UI-plus-skill tasks, generic authoring-skill collisions, and ambiguous
  requests.
- Include English, terse, and Taglish prompt variants for each routing family.
- Do not provide forward-test agents with the intended classification. Judge
  success from the task contract and emitted artifacts to avoid leaking the
  expected answer.
- Capture the reported regression as a permanent scenario: a request to create
  a skill must fail evaluation if the result contains only code or helpers.
- Run root workflow-state validation and tracker verification after every
  implementation slice. Run focused skill and fixture validation before code
  review.

## Out of Scope

- Implementing any skill, validator, query helper, UI change, or schema change
  during the PRD phase.
- Rewriting every historical completed task.
- Deleting legitimate tracker UI, application, validator, query, package, or
  support code solely because it is code.
- Turning every project-local packaged skill into an active canonical foundry
  skill.
- Mutating standalone product repositories without a separate approved task and
  product-boundary write plan.
- Publishing packages or creating runtime adapters for every supported agent
  environment in the first implementation.
- Patching system-level skill-creator instructions, personal skills, or Codex
  home configuration.
- Replacing previous workflow phases, JSON task tracking, phase guards, audit
  separation, or source-project isolation.
- Reopening completed predecessor tasks. Their artifacts remain design evidence
  for this revamp.
- Absorbing the personal README task or the GitHub checkpoint task.
- Committing or pushing repository changes without a later explicit checkpoint
  instruction.

## Further Notes

This PRD converts the previous negative rule—do not present commands as skills—
into a positive product contract: when the operator asks for a skill, the task
must produce and evaluate a real skill bundle.

The implementation should remain skills-first even while strengthening the
validator. Deterministic code enforces state and artifact contracts; it does not
become the operator-facing workflow or replace the skill instructions.

Current discovery drift is a concrete characterization case:
`workflow-tracker-ui` exists as a complete canonical skill bundle, but the
manually maintained workflow-help catalog omits it, and the validator's static
invocation-name list does not contain the same complete active set. The derived
catalog work must turn this current green-but-wrong state into a failing fixture
before fixing it.

No external project capability is attached to this task at PRD time. The local
repository, predecessor tasks, existing canonical skills, and current validator
provide enough evidence for the design. If implementation later needs a
Real Life Workflows pattern search or another project capability, it must be
added as an approved dependency step with a write plan and provenance before
use.

The next previous workflow phase is issue breakdown. Implementation remains unapproved.
