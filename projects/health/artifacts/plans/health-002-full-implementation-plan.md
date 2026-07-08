# Health 002 Full Implementation Plan

## Parent Task

`health-002`

## Implemented Foundation

Health 002 already implemented the first two slices of the Philippines
insurance and HMO navigator foundation:

1. Canonical registry: PhilHealth, Insurance Commission-listed HMOs, and major
   insurance-company seed entities.
2. Product and benefit seed catalog: PhilHealth benefit categories, HMO product
   patterns, selected HMO product surfaces, and insurer health-protection
   surfaces.

These artifacts are the source of truth for later slices:

- `projects/health/artifacts/registries/philippines-health-coverage-registry.json`
- `projects/health/artifacts/product-catalog/philippines-health-coverage-product-catalog.json`

## Remaining Slices

### Slice 003: Source Atlas And Refresh Rules

Create a canonical source atlas that classifies regulator, public-payer,
provider-published, insurer-published, and workflow-packet sources. The atlas
defines which sources can prove entity authorization, which sources can describe
products, and which sources are only workflow-understanding evidence.

### Slice 004: Single-HMO Deep Dive

Create the first provider deep-dive packet for `maxicare-healthcare`. This tests
how the navigator should move from registry entity to product surfaces to user
verification questions without ranking or recommending a plan.

### Slice 005: Comparison Readiness Matrix

Create a matrix of normalized dimensions that can be compared safely across
PhilHealth, HMOs, and insurers. The matrix must block recommendation, ranking,
eligibility, coverage, and claims decisions.

### Slice 006: Navigator Drilling Flow

Create the educational drilling flow that asks the user what they are trying to
understand, routes to the correct entity or product family, and returns source-
grounded next questions for human verification.

### Slice 007: Eval Fixtures And Release Gate

Create deterministic eval fixtures that prove category separation, source
grounding, human boundaries, and refusal behavior before any user-facing
navigator skill is promoted.

## Guardrails

- Do not provide medical advice.
- Do not decide eligibility, coverage, reimbursement, claims, or purchasing.
- Do not rank providers or products.
- Do not treat provider marketing as regulator authorization.
- Do not treat real-life-workflows quarantine imports as callable skills.
- Require current public-source verification before external use.

## Validation

Run:

```bash
node projects/health/artifacts/evals/validate-philippines-health-coverage-slices.mjs
node projects/health/artifacts/registries/validate-philippines-health-coverage-registry.mjs
node projects/health/artifacts/product-catalog/validate-philippines-health-coverage-product-catalog.mjs
node scripts/validate-workflow-state.mjs
```
