# Issue 009: Rebuild Provider Deep-Dive Research

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 8-9, 12-13, 17-18, 20-21, 25-26, 31-35, and 38.

## What To Build

Rebuild `coverage-provider-deep-dive` as a source-heavy synthesis skill for a
named provider, HMO, insurer, or product surface. It must combine multiple
source roles, preserve contradictions and freshness limits, distinguish
organization facts from product claims, and prepare exact human-review questions.

## Read First

- Issues 001, 002, 004, and 007.
- Existing registry, product catalog, source atlas, Maxicare packet, and
  provider-deep-dive skill.
- The provider role contract in the Health 007 PRD.
- ECC workflow-contract, output-artifact, eval-gate, human-boundary, handoff,
  and reviewer-lane guidance.

## ECC Concepts To Apply

- **Workflow contract:** deep-dive lanes and stopping rules are explicit.
- **Output artifact:** synthesis enriches one shared packet.
- **Eval gate:** multi-source support and contradiction handling are tested.
- **Human boundary:** public evidence cannot decide personal coverage or networks.
- **Handoff and reviewer lane:** unresolved contractual questions route by role.

## Acceptance Criteria

- [ ] A failing provider authority or stale-evidence scenario is captured first.
- [ ] The skill uses multiple appropriate source roles for substantive claims.
- [ ] Organization identity and product-surface claims remain distinct.
- [ ] Contradictions, stale evidence, and missing proof remain explicit.
- [ ] Output includes reviewer questions without making personal decisions.
- [ ] Deep-dive scenarios and packet validation pass after implementation.

## Blocked By

- Issue 002: Define The Coverage Research Packet
- Issue 004: Define Source Authority And Freshness
- Issue 007: Rebuild Source-Heavy Coverage Research
