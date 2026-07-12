# Issue 002: Define The Coverage Research Packet

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 14-21, 30-32, 35, and 38.

## What To Build

Define the canonical `coverage-research-packet` as the stable output and
skill-to-skill handoff contract. Specify field semantics, required and optional
states, empty-state behavior, skill-specific extensions, and deterministic
packet validation. Preserve compatible v1 fields while expanding the packet
into a people-facing research and handoff artifact.

## Read First

- Issue 001 scenario foundation and baseline results.
- The Health 007 PRD packet contract.
- The standalone workflow-contract reference and skill manifest.
- ECC workflow-contract, input-contract, output-artifact, handoff, and eval
  guidance.

## ECC Concepts To Apply

- **Output artifact:** the packet is the named user-visible product.
- **Workflow contract:** all skills share stable field meanings.
- **Input contract:** packet updates must preserve prior valid context.
- **Handoff:** the packet transfers work between skills and human reviewers.
- **Eval gate:** deterministic validation protects shape and invariants.

## Acceptance Criteria

- [ ] The packet defines every field required by the PRD.
- [ ] Every field has semantics, required status, empty-state behavior, and
      validation expectations.
- [ ] Skill-specific sections can extend but cannot fork shared semantics.
- [ ] Existing v1 output fields remain compatible or have an explicit migration.
- [ ] A failing fixture proves the validator rejects an incomplete packet.
- [ ] A complete representative packet passes deterministic validation.
- [ ] The contract states its ECC concepts and why each belongs.

## Blocked By

- Issue 001: Define The V2 Scenario Foundation
