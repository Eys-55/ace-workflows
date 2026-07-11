# Issue 010: Rebuild Decision-Useful Coverage Comparison

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 3-6, 13-21, 27, 31-35, and 38.

## What To Build

Rebuild `coverage-type-compare` so users can understand meaningful
differences among PhilHealth, HMOs, private insurance, providers, and product
surfaces without rankings or purchase recommendations. Compare normalized
dimensions, assumptions, source authority, missing evidence, incomparable
fields, verification owners, and reviewer questions.

## Read First

- Issues 001, 002, 004, 007, and 008.
- Existing comparison-readiness artifact, catalog, registry, and comparison skill.
- The comparison role contract in the Health 007 PRD.
- ECC input-contract, output-artifact, eval-gate, human-boundary, and handoff guidance.

## ECC Concepts To Apply

- **Input contract:** comparison scope and entities must be comparable.
- **Output artifact:** differences and gaps extend the shared packet.
- **Eval gate:** usefulness is tested without ranking or recommendation.
- **Human boundary:** the skill never chooses an option for the user.
- **Handoff:** missing evidence routes to research; decisions route to reviewers.

## Acceptance Criteria

- [ ] A failing ranking or unlike-category scenario is captured first.
- [ ] Comparison dimensions include purpose, authority, verification owner,
      evidence needed, assumptions, and incomparable fields.
- [ ] Unsupported dimensions remain gaps rather than invented values.
- [ ] Ranking and purchase requests use safe refusal-to-handoff behavior.
- [ ] The result remains useful through reviewer questions and user next steps.
- [ ] Comparison scenarios and packet validation pass after implementation.

## Blocked By

- Issue 002: Define The Coverage Research Packet
- Issue 004: Define Source Authority And Freshness
- Issue 007: Rebuild Source-Heavy Coverage Research
- Issue 008: Rebuild Coverage Entity Lookup
