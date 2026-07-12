# Issue 007: Rebuild Source-Heavy Coverage Research

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 8-9, 12-13, 17-18, 25-26, 31-35, and 38.

## What To Build

Rebuild `coverage-source-research` as the primary source-heavy skill. It must
decide when loaded evidence is adequate, when current public search is needed,
how deep to search, how to record provenance and contradictions, and when a
claim must be handed to a human reviewer.

## Read First

- Issues 001, 002, and 004.
- Existing source atlas, registry, product catalog, and source-research skill.
- The source-heavy role contract in the Health 007 PRD.
- ECC workflow-contract, input-contract, output-artifact, eval-gate, handoff,
  and reviewer-lane guidance.

## ECC Concepts To Apply

- **Workflow contract:** search triggers, stopping rules, and escalation are explicit.
- **Input contract:** query, desired depth, evidence gaps, and loaded sources
  determine the search plan.
- **Output artifact:** research enriches sources, freshness, contradictions, and gaps.
- **Eval gate:** source-claim fit and search necessity are tested.
- **Human boundary and reviewer lane:** public research cannot decide personal outcomes.

## Acceptance Criteria

- [ ] A failing deep-research or stale-source scenario is captured first.
- [ ] The skill can use adequate loaded evidence without unnecessary search.
- [ ] The skill performs broader search when authority, freshness, gaps, or the
      operator's research depth requires it.
- [ ] Sources include role, URL, checked date, claim support, and limitations.
- [ ] Contradictory or unavailable evidence remains visible.
- [ ] Personal decisions route to the appropriate human reviewer.
- [ ] Source scenarios and packet validation pass after implementation.

## Blocked By

- Issue 002: Define The Coverage Research Packet
- Issue 004: Define Source Authority And Freshness
