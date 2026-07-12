# Philippines Health Coverage Standalone Repo PRD

## Problem Statement

People researching health coverage in the Philippines need a reliable way to
understand PhilHealth, HMOs, insurers, product brands, provider pages, source
evidence, and comparison boundaries without receiving medical advice, coverage
decisions, claims decisions, rankings, or purchase recommendations.

The current Health project has enough source-grounded foundation to manufacture
a standalone workflow repo, but that product must not depend on this foundry,
project trackers, or the `real-life-workflows` dependency at runtime. It needs
to ship as its own repo with skills, product artifacts, references, evals,
validators, package metadata, and clear safety boundaries.

## Solution

Build `philippines-health-coverage` as a standalone, Philippines-first,
public-source workflow repo for agent runtimes. It will contain a full v1
multi-skill workflow product for researching Philippine health coverage
concepts, entities, sources, provider/product surfaces, comparison readiness,
navigator routing, and evidence quality.

The repo will be manufactured from the Health project foundation, but the
shipped product will be self-contained. Its runtime behavior will depend on
repo-local skills and validated product artifacts, not foundry paths or
dependency-project state.

The v1 product includes six skills:

- `coverage-source-research`
- `coverage-entity-lookup`
- `coverage-provider-deep-dive`
- `coverage-type-compare`
- `coverage-navigator`
- `coverage-evidence-audit`

Each skill must be contract-first. Every skill defines required inputs,
optional inputs, artifact dependencies, stop conditions, and the shared output
contract. The shared output contract includes `query`, `sources_used`,
`confidence_boundary`, `human_review_required`, `blocked_decisions`, and
`next_questions`.

## User Stories

1. As a Filipino consumer, I want to understand what PhilHealth is, so that I
   can distinguish the public payer baseline from HMOs and private insurance.
2. As a Filipino consumer, I want to know whether a named organization is an
   HMO, insurer, broker, provider, or product brand, so that I do not compare
   unlike things.
3. As a Filipino employee, I want to research my company HMO using public
   sources, so that I know what to ask HR, the HMO helpdesk, or a hospital
   billing desk.
4. As a self-employed Filipino, I want to research individual and family HMO or
   insurance surfaces, so that I can collect source-grounded questions before
   talking to a licensed advisor or provider.
5. As an OFW or family member, I want to understand whether a product appears
   to be local coverage, travel coverage, emergency coverage, or broader health
   protection, so that I avoid false assumptions.
6. As a user with preferred doctors or hospitals, I want the workflow to tell
   me that provider-network verification is a separate human check, so that I
   do not assume coverage from a marketing page.
7. As a user comparing PhilHealth, HMOs, and insurers, I want normalized
   comparison dimensions, so that I can understand categories without receiving
   rankings or purchase recommendations.
8. As a user asking "Which plan is best?", I want the workflow to refuse the
   decision and redirect me to evidence, questions, and human review steps.
9. As a workflow operator, I want all skills to share the same output contract,
   so that outputs are easy to inspect, audit, and evaluate.
10. As a workflow operator, I want every skill to declare its input contract, so
    that agents do not improvise requirements or hidden dependencies.
11. As a workflow operator, I want seeded registry data in shipped product
    artifacts, so that the repo can run without this foundry.
12. As a workflow operator, I want source-atlas data in shipped product
    artifacts, so that source authority and source limitations remain explicit.
13. As a workflow operator, I want product-catalog data in shipped product
    artifacts, so that skill outputs can distinguish public benefits, HMO
    surfaces, and insurer health-protection surfaces.
14. As a workflow operator, I want deep-dive examples in shipped artifacts, so
    that provider/HMO research has a concrete pattern to follow.
15. As a workflow operator, I want comparison-readiness data in shipped
    artifacts, so that comparison workflows can block unsupported rankings and
    decisions.
16. As a workflow operator, I want navigator-flow data in shipped artifacts, so
    that user questions route to the correct research workflow.
17. As a workflow operator, I want eval fixtures separated from product
    artifacts, so that tests can check behavior without being mistaken for
    source data.
18. As a workflow operator, I want deterministic validator scripts, so that
    artifact shape and skill contracts can be checked without manual review
    alone.
19. As a maintainer, I want package smoke checks, so that the shipped repo has
    the skills, artifacts, evals, references, scripts, manifest, and package
    files required for installation.
20. As a maintainer, I want the README and AGENTS guidance to state the
    standalone boundary, so that users do not need this foundry or
    `real-life-workflows` at runtime.
21. As an agent runtime user, I want skill-first usage instructions, so that I
    can invoke the installed skills directly instead of relying on raw helper
    commands.
22. As an evaluator, I want fixtures for category separation, source grounding,
    comparison without ranking, deep-dive expectations, and refusal behavior,
    so that regressions are visible before release.
23. As a reviewer, I want an evidence-audit skill, so that outputs can be
    checked for source grounding, currentness, boundary leakage, and missing
    human-review steps.
24. As a future maintainer, I want the Philippines-first design to remain
    extensible, so that later countries can be added without weakening the v1
    product boundary.

## Implementation Decisions

- The shipped product is the standalone repo `philippines-health-coverage`.
- The foundry is only the manufacturing environment; the shipped repo must not
  depend on foundry paths, project trackers, or dependency-project state.
- V1 is Philippines-first and public-source only.
- V1 does not handle PHI, patient documents, or patient context.
- The repo contains top-level product guidance, package metadata, skill
  manifest metadata, skill folders, references, product artifacts, eval
  fixtures, and validation scripts.
- Seeded registry, product catalog, source atlas, deep-dive, comparison
  readiness, and navigator flow data ship as product artifacts.
- Eval fixtures and expected behaviors are separate from product artifacts.
- Deterministic validation and package smoke checks live in executable scripts.
- The v1 skill surface is multi-skill, not a one-skill MVP.
- Every skill has a `SKILL.md` and Codex-compatible interface metadata.
- Every skill declares required inputs, optional inputs, artifact dependencies,
  source freshness expectations, stop conditions, and output/handoff behavior.
- Every skill returns the shared output contract with `query`, `sources_used`,
  `confidence_boundary`, `human_review_required`, `blocked_decisions`, and
  `next_questions`.
- Skills may add job-specific output fields only when the shared contract
  remains intact.
- Skill invocation is the primary operator surface; command shims are out of
  scope unless a later task explicitly requires them.
- The product must preserve educational, evidence-first behavior and human
  review boundaries across all skills.

## Testing Decisions

- The highest useful test seam is the shipped repo package boundary: manifest,
  exported files, skill contracts, product artifacts, eval fixtures, and package
  smoke output.
- Artifact validation should check schema shape, repo-local references, source
  grounding metadata, date fields, category separation, and blocked decision
  language.
- Skill contract validation should check that all six skills define input
  contracts, stop conditions, artifact dependencies, and the shared output
  contract.
- Safety validation should fail if a skill permits PHI, patient documents,
  medical advice, eligibility decisions, coverage determinations, claims
  decisions, provider rankings, or purchase recommendations.
- Eval fixtures should test external behavior, not internal phrasing.
- Fixture coverage must include entity/category separation, source grounding,
  comparison without ranking, provider deep-dive expectations, navigator
  routing, refusal behavior, and evidence audit behavior.
- Package smoke checks should verify the manifest, package files, required
  skill folders, interface files, product artifacts, eval fixtures, references,
  and validation scripts.

## Out Of Scope

- No medical diagnosis, treatment advice, or clinical recommendations.
- No PHI, patient documents, patient records, or patient-context workflows.
- No eligibility decisions, coverage determinations, claims decisions, provider
  network verification, product rankings, or purchase recommendations.
- No runtime dependency on this foundry or `real-life-workflows`.
- No country-agnostic framework in v1.
- No UI, browser app, chat app shell, database, hosted service, or external
  publishing workflow.
- No command-first operator surface.

## Further Notes

The implementation plan for this PRD exists as the companion planning artifact
for `health-005`. The next previous workflow phase should split this PRD into issue slices
for repo skeleton, artifact migration, contract foundation, six skill surfaces,
eval/safety release gates, and package smoke/handoff.
