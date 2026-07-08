# Philippines Health Coverage Standalone Repo Implementation Plan

## Parent Task

`health-005`

## Product Boundary

Build `philippines-health-coverage` as a standalone workflow repo. This foundry
is only the factory that designs and manufactures the repo. The shipped repo
must not require foundry paths, project trackers, or the `real-life-workflows`
dependency at runtime.

The repo is Philippines-first and public-source only. It covers PhilHealth,
HMOs, insurers, source evidence, comparison readiness, provider deep dives, and
educational navigation. It must not handle PHI, patient documents, patient
context, medical advice, eligibility decisions, claims decisions, coverage
determinations, provider rankings, or purchase recommendations.

## Shipped Repo Shape

```text
philippines-health-coverage/
  AGENTS.md
  README.md
  package.json
  skill-manifest.json
  skills/
  references/
  artifacts/
  evals/
  scripts/
```

`artifacts/` contains validated product data. `evals/` contains fixtures and
expected behavior. `scripts/` contains deterministic validators and package
smoke checks. `references/` contains explanatory material that skills load only
when needed.

## Seed Product Data

Copy and normalize these Health artifacts into the standalone repo:

- Registry: 39 PhilHealth, HMO, insurer, broker, and product-brand entities.
- Product catalog: 15 seed product or benefit surfaces.
- Source atlas: source roles and verification boundaries.
- Deep-dive packet: first provider/HMO packet for Maxicare.
- Comparison readiness matrix: safe comparable dimensions and blocked outputs.
- Navigator flow: entry questions, routes, and refusal triggers.
- Eval fixtures: category separation, source grounding, refusal behavior,
  comparison readiness, and deep-dive expectations.

The copied artifact paths in the shipped repo must be self-contained. JSON
references must point to repo-local paths, not foundry project paths.

## Approved V1 Skills

### `coverage-source-research`

Job: find, classify, and summarize public sources for a Philippines health
coverage research question.

Inputs:
- Required: user research query.
- Optional: entity name, source type, freshness requirement.
- Artifacts: source atlas, registry, product catalog.
- Stop conditions: asks for medical advice, patient records, claims decisions,
  eligibility decisions, coverage determination, or source freshness that cannot
  be verified.

### `coverage-entity-lookup`

Job: identify whether a name is PhilHealth, HMO, insurer, broker, provider,
product brand, or unknown.

Inputs:
- Required: entity or product name.
- Optional: aliases, source URL, user-provided context.
- Artifacts: registry, source atlas.
- Stop conditions: asks to decide legitimacy beyond cited source evidence,
  recommend a provider, or infer authorization without an authority source.

### `coverage-provider-deep-dive`

Job: create an educational deep dive for one HMO, insurer, or provider surface.

Inputs:
- Required: canonical entity id or entity name.
- Optional: product family, source URLs, comparison dimensions.
- Artifacts: registry, product catalog, source atlas, deep-dive examples.
- Stop conditions: asks to recommend the entity, verify individual coverage,
  confirm provider network access, or decide claims.

### `coverage-type-compare`

Job: compare coverage categories and normalized fields without ranking or
recommending.

Inputs:
- Required: two or more category/entity/product surfaces to compare.
- Optional: user goal, comparison dimensions.
- Artifacts: comparison readiness matrix, registry, product catalog, source
  atlas.
- Stop conditions: asks for best plan, cheapest adequate plan, guaranteed
  coverage, eligibility, claims result, or purchase advice.

### `coverage-navigator`

Job: route user questions to the right research workflow and return next
questions for human verification.

Inputs:
- Required: user question.
- Optional: known entity, user role, desired output type.
- Artifacts: navigator flow, registry, source atlas, comparison matrix.
- Stop conditions: asks for patient-specific, medical, claims, eligibility,
  coverage, or purchase decisions.

### `coverage-evidence-audit`

Job: audit an output or packet for source grounding, currentness, category
separation, human-review boundaries, and blocked decision leakage.

Inputs:
- Required: output or artifact to audit.
- Optional: fixture id, expected behavior, source URLs.
- Artifacts: eval fixtures, release gate, source atlas.
- Stop conditions: asks to certify legal, medical, financial, regulatory, or
  claims correctness.

## Shared Input Contract

Every `SKILL.md` must define:

- required inputs
- optional inputs
- artifact dependencies
- source freshness expectations
- stop conditions
- output path or handoff behavior when artifacts are written

## Shared Output Contract

Every skill output must include:

```json
{
  "query": "",
  "sources_used": [],
  "confidence_boundary": "",
  "human_review_required": true,
  "blocked_decisions": [],
  "next_questions": []
}
```

Skills may add job-specific fields, but they must not remove or rename the
shared contract fields.

## Packaging Plan

Create the standalone repo package with:

- `package.json` using the repo identity `philippines-health-coverage`.
- `skill-manifest.json` listing all six skills, their paths, interface files,
  artifact dependencies, and default output contracts.
- `skills/<skill-name>/SKILL.md` for every approved skill.
- `skills/<skill-name>/agents/openai.yaml` for Codex-compatible UI metadata.
- `artifacts/` containing copied and repo-localized product data.
- `evals/` containing fixtures and expected behaviors.
- `scripts/validate-artifacts.mjs` for JSON artifact checks.
- `scripts/validate-skill-contracts.mjs` for skill input/output contract checks.
- `scripts/package-smoke-check.mjs` for installable-package surface checks.

Do not add command shims unless a later task explicitly requires cross-harness
compatibility. Skill invocation is the primary runtime surface.

## Validation Gates

The standalone repo is not ready until all gates pass:

1. Artifact gate: seeded JSON data is valid, repo-local, and source-grounded.
2. Skill contract gate: every skill has input contracts, stop conditions, and
   the shared output contract.
3. Safety gate: no skill permits PHI, patient documents, medical advice,
   eligibility decisions, coverage determinations, claims decisions, rankings,
   or purchase recommendations.
4. Eval gate: fixtures cover category separation, source grounding, comparison
   without ranking, deep-dive expectations, and refusal behavior.
5. Package gate: manifest, exports, file list, and dry-run package contents
   include all required skills, artifacts, evals, references, and scripts.

## Implementation Slices

### Slice 001: Repo Skeleton And Product Boundary

Create the standalone repo structure, top-level `AGENTS.md`, `README.md`,
`package.json`, and `skill-manifest.json`. Encode the no-foundry-runtime
boundary in the shipped repo docs.

### Slice 002: Artifact Migration

Copy existing Health JSON artifacts into the standalone repo's `artifacts/`
tree. Rewrite internal references to repo-local paths. Add the artifact
validator.

### Slice 003: Contract Foundation

Create shared contract reference material and the skill-contract validator.
Define the shared input and output contracts before writing the six skill bodies.

### Slice 004: Six Skill Surfaces

Create the six approved skills with `SKILL.md` and `agents/openai.yaml` files.
Each skill must name its job, input contract, artifact dependencies, output
contract, stop conditions, and validation expectations.

### Slice 005: Evals And Safety Release Gate

Move fixture data into `evals/`, extend expected behaviors for the six-skill
surface, and implement the package safety gate.

### Slice 006: Package Smoke And Handoff

Add package smoke checks, verify installable files, document runtime usage, and
write a handoff that explains how to export or push the standalone repo.

## Out Of Scope

- No PHI or patient document workflows.
- No medical, legal, financial, claims, eligibility, coverage, provider-network,
  purchase, or ranking decisions.
- No dependency on this foundry or `real-life-workflows` after shipment.
- No country-agnostic workflow framework in v1.
- No UI, browser app, or chat app shell.

## Verification Commands

Foundry-side validation before implementing the standalone repo:

```bash
node scripts/validate-workflow-state.mjs
```

Expected shipped-repo validation after implementation:

```bash
node scripts/validate-artifacts.mjs
node scripts/validate-skill-contracts.mjs
node scripts/package-smoke-check.mjs
npm pack --dry-run --json
```
