# People-First Philippine Health Coverage Multi-Skill Rebuild PRD

Task: `health-007`
Generated: 2026-07-10
Status: PRD

## Problem Statement

People who do not already understand Philippine health coverage often begin
with an ordinary question: what their employer HMO means, whether PhilHealth
and an HMO are the same, what a named company actually is, whether a source is
authoritative, or what they should ask before relying on a coverage claim.

The current standalone product exposes six valid but thin skills. It assumes
the user or agent already knows which skill to invoke, and its shared output is
too small to carry a person from confusion to a useful next step. The skills
mostly describe contracts instead of providing a complete, scenario-proven
skill set with progressive disclosure, source-search judgment, safe refusals,
reviewer handoffs, and reusable research artifacts.

The current validators also reward structural and keyword compliance more than
real behavior. They can prove that files and fields exist, but not that an
agent can take a fuzzy question, search deeply when necessary, distinguish
source authority, avoid high-stakes decisions, and produce a clear packet for
the right human reviewer.

## Solution

Rebuild the standalone product as a people-first, seven-skill workflow for
Philippine health coverage literacy. Add `coverage-intake` as the default front
door, keep the six existing skill identities, and rebuild all seven around
concrete user scenarios and one canonical `coverage-research-packet`.

The product will remain intuitive for a beginner while supporting full-scale
public-source research when the question requires it. It will not expose
mandatory beginner and research modes. Instead, every skill will explicitly
decide whether to use loaded artifacts, ask one clarifying question, search,
or hand off to a source-heavy skill.

The build will be eval-first. Scenario fixtures and expected behavior come
before packet contracts, safety handoffs, source-authority rules, validators,
and skill rewrites. Every design and implementation slice must route back to
named Everything Claude Code (ECC) concepts and state why those concepts apply.

The successful user outcome is a plain-language, source-grounded,
human-review-ready packet that says what is known, what the evidence cannot
prove, what decisions are blocked, who should review the question, and what the
user should ask next.

## User Stories

1. As a person unfamiliar with Philippine health coverage, I want to describe
   my situation in ordinary language, so that I do not need to know which skill
   to invoke.
2. As an employee, I want to understand what my company HMO means, so that I
   can ask HR and the HMO useful follow-up questions.
3. As a beginner, I want to understand whether PhilHealth and Maxicare are the
   same kind of thing, so that I do not compare unlike entities.
4. As a consumer, I want to know whether an organization is a public payer,
   HMO, insurer, broker, provider, or product brand, so that I understand its
   role before relying on its claims.
5. As a consumer, I want a plain-language comparison of PhilHealth, HMOs, and
   private insurance, so that I can understand their different purposes without
   receiving a ranking or purchase recommendation.
6. As a user asking which HMO is best, I want the workflow to refuse the
   ranking but still help me identify evidence, comparison questions, and the
   right human reviewer.
7. As a user asking whether my hospital bill will be covered, I want a safe
   handoff checklist instead of a coverage determination.
8. As a user looking at a provider page, I want to know what that page can and
   cannot prove, so that I do not mistake marketing content for regulatory
   authorization or current network verification.
9. As a user relying on an older source, I want the workflow to explain its
   freshness boundary, so that I know whether current verification is needed.
10. As a user with a simple question, I want a direct and understandable answer
    from already loaded, adequate evidence, so that unnecessary research does
    not make the experience harder.
11. As a user with an ambiguous question, I want the workflow to ask the
    smallest useful clarifying question, so that it searches the correct topic.
12. As a user with a source-heavy question, I want the responsible skill to
    perform thorough public-source research, so that the answer is not limited
    to a thin local artifact.
13. As a user with a question outside a skill's search responsibility, I want
    a clean handoff to the correct source-heavy skill, so that workflow logic is
    not duplicated or improvised.
14. As a user, I want every result to use the same packet shape, so that I can
    understand outputs from any of the seven skills.
15. As a user, I want the packet to state the route taken, so that I can see why
    the workflow answered, clarified, searched, or escalated.
16. As a user, I want the packet to separate a plain-language summary from
    evidence details, so that I can start simply and inspect deeper research
    only when needed.
17. As a user, I want every source to include its role and freshness boundary,
    so that I can judge what kind of claim it may support.
18. As a user, I want evidence gaps and confidence limits stated explicitly, so
    that uncertainty is not hidden behind polished prose.
19. As a user, I want blocked decisions named explicitly, so that an
    educational answer is not mistaken for advice or authorization.
20. As a user, I want the recommended human reviewer named by role, so that I
    know whether to ask PhilHealth, HR, an HMO, an insurer, hospital billing, a
    licensed adviser, or another appropriate reviewer.
21. As a user, I want exact next questions in the handoff packet, so that a
    refusal still moves my problem forward.
22. As a privacy-conscious user, I want the workflow to stop before accepting
    PHI or patient documents, so that public-source research does not become a
    patient-data workflow.
23. As a user asking for medical advice, I want a clear boundary and safe human
    handoff, so that educational coverage research does not become clinical
    guidance.
24. As a user asking about eligibility, claims, coverage, or provider networks,
    I want the workflow to explain what public evidence can support without
    making the decision itself.
25. As a researcher, I want a provider deep dive to synthesize multiple source
    roles, freshness limits, contradictions, and evidence gaps, so that the
    result supports serious research.
26. As a researcher, I want source discovery to expand when the loaded source
    set is inadequate, so that deep research is available without a separate
    product mode.
27. As a researcher, I want comparison outputs to expose assumptions and
    incomparable fields, so that usefulness does not depend on ranking.
28. As an auditor, I want unsupported authority claims, stale evidence, missing
    handoffs, and safety leakage assigned severity, so that release risk is
    visible.
29. As an auditor, I want release readiness expressed as blocked, needs review,
    or acceptable for education, so that quality decisions are consistent.
30. As a maintainer, I want scenario fixtures defined before skill rewrites, so
    that implementation is driven by observable user behavior.
31. As a maintainer, I want deterministic validators for packet shape, scenario
    behavior, examples, and standalone boundaries, so that regressions fail
    consistently.
32. As a maintainer, I want open-ended answer quality reviewed through a
    documented reviewer lane, so that deterministic checks are not mistaken for
    complete evaluation.
33. As a skill author, I want concise core skill instructions with directly
    linked references, so that the agent loads detailed domain material only
    when needed.
34. As a skill author, I want trigger descriptions to name real user requests,
    so that the correct skill activates without requiring users to understand
    the internal taxonomy.
35. As a skill author, I want each implementation issue to say what to build,
    what to read first, which ECC concepts to apply, why they apply, and what
    acceptance check proves the work, so that ECC remains the build system.
36. As a product maintainer, I want examples of good beginner and deep-research
    packets, so that users and agents can inspect the expected quality bar.
37. As a product maintainer, I want a release gate that combines scenario
    evaluation, safety audit, source freshness, example validation, and package
    isolation, so that a structurally valid but behaviorally weak skill pack
    cannot ship.
38. As a product owner, I want the shipped repo to remain independent of the
    foundry and Real Life Workflows at runtime, so that it is a real standalone
    workflow product.

## Implementation Decisions

### Product And Skill Surface

- Preserve the standalone product boundary. Foundry trackers, Real Life
  Workflows data, and manufacturing artifacts must not become runtime
  dependencies.
- Keep the six existing skill identities and add `coverage-intake` as the
  beginner-facing front door.
- Treat `coverage-intake` and `coverage-navigator` as separate responsibilities.
  Intake interprets a fuzzy request and starts the packet; navigator selects
  and records the workflow route.
- Do not add mandatory named beginner and research modes. Search depth is a
  conditional workflow decision based on the question, evidence adequacy,
  authority needs, freshness, and requested research depth.
- Make every skill create or update the same `coverage-research-packet`.
  Skill-specific sections may extend the packet but may not fork its shared
  fields or semantics.
- Keep core `SKILL.md` instructions concise and imperative. Put domain-heavy
  schemas, source rules, refusal templates, and examples in directly linked
  references to implement progressive disclosure.
- Treat deterministic scripts as validators and query helpers only. Workflow
  judgment, search policy, handoff behavior, and domain reasoning remain
  explicit in skills and references rather than being hidden in JavaScript.

### Canonical Packet Contract

The shared packet must include:

- query
- user context level
- route taken
- plain-language summary
- entities or categories
- sources used
- source freshness
- confidence boundary
- evidence gaps
- blocked decisions
- human review required
- recommended human reviewer
- handoff packet
- user next step
- next questions
- skill-specific sections

The packet is both the user-visible result and the handoff interface between
skills. Every field must have defined semantics, required/optional status,
empty-state behavior, and validation expectations.

### Skill Role Contracts

| Skill | ECC role | Search responsibility | Escalation boundary | Packet contribution | Eval gate | Human boundary |
| --- | --- | --- | --- | --- | --- | --- |
| `coverage-intake` | Routing and intake | Use loaded routing and safety references; do not conduct deep research | Hand off source-heavy questions after one necessary clarification | Start query, context level, blocked decisions, initial route, and next step | Correct route and early boundary detection for fuzzy prompts | Stop PHI, medical advice, and decision requests before collection |
| `coverage-navigator` | Routing and packet-building | Inspect available packet and route artifacts | Hand off evidence acquisition to the responsible source-heavy skill | Record route taken, dependencies, unresolved questions, and next skill | Route is compatible with scenario intent and safety class | Never convert routing into eligibility, coverage, claim, ranking, or purchase decisions |
| `coverage-source-research` | Source-heavy | Search public sources deeply when authority, freshness, missing evidence, or operator depth requires it | Escalate unsupported decision claims to the appropriate human reviewer | Add source roles, freshness, can/cannot-prove boundaries, contradictions, and evidence gaps | Sources satisfy authority, freshness, provenance, and claim-support assertions | Public research cannot prove personal eligibility, coverage, claims, or current network status |
| `coverage-entity-lookup` | Packet-building and classification | Search only when loaded registries cannot classify the entity confidently or current authority evidence is required | Hand off broad source acquisition to source research | Add normalized entity type, aliases, relationships, source support, and uncertainty | Entity classification is supported and unlike entities remain distinct | Classification is not authorization, recommendation, or coverage verification |
| `coverage-provider-deep-dive` | Source-heavy and packet-building | Perform multi-source provider or product-surface research | Escalate personal, contractual, or current network conclusions to human review | Add provider synthesis, product surfaces, contradictions, freshness, and open questions | Deep dive uses multiple appropriate source roles and preserves uncertainty | No personal coverage, claims, medical, ranking, or purchase conclusion |
| `coverage-type-compare` | Comparison | Search when normalized evidence is missing, stale, or incomparable; otherwise use packet evidence | Hand off source gaps to source research and decision requests to a human reviewer | Add comparison dimensions, assumptions, incomparable fields, and reviewer questions | Comparison remains source-grounded, non-ranking, and decision-useful | Never choose, rank, or recommend a plan or provider |
| `coverage-evidence-audit` | Reviewer lane | Verify cited evidence and freshness when audit claims require it; do not become the primary research workflow | Return required fixes to the producing skill or escalate critical/high findings to human review | Add severity, release readiness, required fixes, and reviewer questions | Critical leakage blocks release; unsupported authority and stale proof cannot pass | Audit may judge artifact readiness, not the user's eligibility, coverage, claim, or purchase decision |

### ECC Routing Contract

Every issue and rebuilt artifact must explicitly declare the applicable ECC
concepts, why they belong, and the external acceptance evidence. Multiple ECC
concepts should be used when the behavior crosses multiple boundaries.

| Product module | ECC concepts | Why the concepts belong |
| --- | --- | --- |
| Scenario foundation | Workflow contract, input contract, eval gate | Scenarios define what users may ask, what observable behavior is required, and what fails before implementation starts |
| Coverage research packet | Output artifact, workflow contract, input contract, handoff | The packet is the stable result, shared state, and skill-to-skill interface |
| Refusal-to-handoff templates | Human boundary, handoff, reviewer lane | Blocked decisions must become safe, role-specific next actions instead of dead ends or leaked advice |
| Source authority and freshness rules | Input contract, workflow contract, human boundary | Source type and date determine which claims may be synthesized and which require current human verification |
| Packet and scenario validators | Eval gate, output artifact | Deterministic checks protect the shared schema and observable safety invariants |
| Seven skill rewrites | Workflow contract, input contract, output artifact, handoff | Each skill needs explicit trigger, inputs, decision path, packet contribution, and transfer boundary |
| Evidence audit and release gate | Eval gate, reviewer lane, human boundary | Open-ended quality and high-stakes leakage require graded review and release blocking |
| Real Life Workflows dependency use | Project state preload, parallel task context, handoff | Manufacturing evidence must retain provenance and remain separate from the standalone runtime |

Each implementation issue must contain four explicit instructions:

1. What to build.
2. What references and prior artifacts to read first.
3. Which ECC concepts to apply and why.
4. Which acceptance checks or evals prove the concepts were applied.

### Eval-First Build Order

Build in this order:

1. Define scenario fixtures and expected packet behavior.
2. Define the canonical coverage research packet.
3. Define refusal-to-handoff templates.
4. Define source authority and freshness rules.
5. Build deterministic packet and scenario validators.
6. Establish baseline failures against the current v1 skills.
7. Rewrite intake and routing skills.
8. Rewrite source-heavy, classification, deep-dive, and comparison skills.
9. Rewrite the evidence-audit reviewer lane.
10. Add validated examples and the release gate.

Do not rewrite a skill before the scenarios, packet fields, safety boundaries,
and validators relevant to that skill are defined.

### Safety, Authority, And Handoff

- Define reusable refusal-to-handoff templates for PHI, patient documents,
  medical advice, eligibility, coverage, claims, provider-network verification,
  rankings, and purchase recommendations.
- Require every refusal template to include a brief boundary, safe
  public-source explanation, evidence or documents the user may request without
  sharing them with the workflow, the appropriate reviewer role, and exact next
  questions.
- Define what regulator and public-authority sources, PhilHealth sources,
  HMO/insurer/provider publications, employer or HR materials, hospital billing
  sources, broker or marketplace pages, and secondary explainers can and cannot
  prove.
- Treat source freshness as a claim-level boundary, not a generic date label.
  A current page can still be insufficient authority, and an authoritative old
  source can still require current verification.
- Require public-source explanations to remain educational. The product must
  never process PHI or make medical, eligibility, coverage, claims, network,
  ranking, or purchase decisions.

### Audit And Release

- Use severity levels `critical`, `high`, `medium`, and `low`.
- Treat PHI handling, medical advice, eligibility or coverage determinations,
  claims decisions, network verification, rankings, and purchase recommendations
  as critical release blockers.
- Treat unsupported authority claims, stale evidence presented as current
  proof, and missing human-review boundaries as at least high severity.
- Use release readiness states `blocked`, `needs_review`, and
  `acceptable_for_education`.
- Keep human review mandatory for open-ended answer quality, source-claim fit,
  and high-stakes boundary interpretation even when deterministic validators
  pass.
- Add compact example packets for entity lookup, category comparison, provider
  deep dive, blocked coverage or claim questions, and source-authority checks.
- Require the release gate to verify packet contracts, scenario behavior,
  example drift, source freshness, evidence-audit results, package contents,
  and absence of foundry runtime dependencies.

## Testing Decisions

- Test external behavior from realistic user prompts, not internal wording or
  incidental Markdown structure.
- Define capability evals before implementation and regression evals for the
  current valid v1 behavior.
- Include at minimum these scenario families: employer HMO understanding,
  PhilHealth versus HMO confusion, entity classification, category comparison,
  ranking request, hospital-bill coverage request, provider-page authority
  request, and stale-source reliance.
- Add unknown-entity, contradictory-source, insufficient-authority,
  source-unavailable, and unnecessary-search cases so that happy paths are not
  the only evaluated behavior.
- Require every scenario to assert the shared packet fields, route choice,
  source role, freshness boundary, confidence boundary, blocked decisions,
  reviewer handoff, user next step, and next questions as applicable.
- Use code-based graders for packet shape, enumerated values, prohibited output
  classes, required handoff fields, package isolation, and fixture coverage.
- Use model-based or rubric review for plain-language quality, source-claim fit,
  comparison usefulness, and whether a refusal remains genuinely helpful.
- Use a human reviewer lane for safety-boundary ambiguity, source-authority
  disputes, and release decisions involving critical or high findings.
- Capture baseline failure signatures before skill rewrites so that later
  passes demonstrate behavioral improvement instead of only new file presence.
- Require critical safety and standalone-boundary regression scenarios to pass
  repeatedly, not only once.
- Run the narrow scenario and packet validators during each issue, then the
  full validation and release gate before review.
- Forward-test the rebuilt skill set on fresh agent contexts using raw prompts
  and product artifacts without leaking expected answers or prior diagnoses.

## Out Of Scope

- Medical advice, diagnosis, treatment recommendations, or clinical workflows.
- PHI handling, patient documents, patient records, or patient-context research.
- Personal eligibility, coverage, claims, authorization, or provider-network
  determinations.
- HMO, insurer, plan, provider, or product rankings and purchase recommendations.
- A mandatory beginner-versus-research mode switch.
- A UI, hosted application, database, or command-first product surface.
- Runtime dependence on the workflow foundry, Real Life Workflows, tracker JSON,
  or quarantined imported skills.
- Copying Real Life Workflows source material directly into active standalone
  skills.
- Expanding to other countries before the Philippines-first v2 behavior and
  release gate are proven.

## Further Notes

The Real Life Workflows capability dependency is manufacturing evidence only.
Any packet used during issue design must retain task, dependency, query, phase,
artifact, and timestamp provenance. The standalone repo receives promoted
product decisions and self-contained artifacts, never dependency-project paths
or runtime calls.

The next Matt phase should split this PRD into independently verifiable issues
in the eval-first order. Issue boundaries should follow observable workflow
contracts and risk, not simply one issue per file or one issue per existing
skill.
