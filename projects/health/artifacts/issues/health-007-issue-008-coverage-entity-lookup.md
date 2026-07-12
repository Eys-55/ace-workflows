# Issue 008: Rebuild Coverage Entity Lookup

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 3-4, 10, 13-18, 25, 31-35, and 38.

## What To Build

Rebuild `coverage-entity-lookup` as a classification and packet-building
skill. It must distinguish public payers, HMOs, insurers, brokers, providers,
and product brands; use loaded registry evidence when adequate; request source
research when classification is uncertain or current authority is needed; and
state what classification cannot prove.

## Read First

- Issues 001, 002, 004, and 007.
- Existing registry, source atlas, and entity-lookup skill.
- The classification role contract in the Health 007 PRD.
- ECC input-contract, workflow-contract, output-artifact, handoff, and eval guidance.

## ECC Concepts To Apply

- **Input contract:** entity name, aliases, and requested claim define lookup scope.
- **Workflow contract:** lookup, search escalation, and unknown behavior are explicit.
- **Output artifact:** the packet records normalized type and evidence.
- **Handoff:** uncertain or current claims route to source research.
- **Eval gate:** unlike entities must not collapse into one category.

## Acceptance Criteria

- [ ] A failing ambiguous or unknown-entity scenario is captured first.
- [ ] Known entities use adequate loaded evidence without unnecessary search.
- [ ] Unknown or uncertain entities route to source research with a clear gap.
- [ ] Output includes normalized type, aliases, relationships, source support,
      uncertainty, and cannot-prove boundaries.
- [ ] Classification never implies authorization, coverage, ranking, or recommendation.
- [ ] Entity scenarios and packet validation pass after implementation.

## Blocked By

- Issue 002: Define The Coverage Research Packet
- Issue 004: Define Source Authority And Freshness
- Issue 007: Rebuild Source-Heavy Coverage Research
