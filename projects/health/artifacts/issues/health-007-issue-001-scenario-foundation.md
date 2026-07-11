# Issue 001: Define The V2 Scenario Foundation

Type: HITL

## Parent

`health-007`

## User Stories Covered

Stories 1-13, 22-30, 35, and 38.

## What To Build

Define the scenario-fixture contract that will drive the complete v2 rebuild.
Cover ordinary beginner questions, deep-research requests, blocked decisions,
source-authority failures, stale evidence, unknown entities, contradictory
sources, unavailable sources, and cases where searching would be unnecessary.
Capture the current v1 baseline failures before rewriting any skill.

## Read First

- The Health 007 PRD.
- The Health 006 standalone workflow review and improvement roadmap.
- The current standalone behavior fixtures and workflow contracts.
- ECC agentic-engineering and eval-harness guidance.
- Matt's upstream `to-issues` and `tdd` guidance.

## ECC Concepts To Apply

- **Workflow contract:** scenarios define observable product behavior.
- **Input contract:** every fixture states the user prompt and allowed context.
- **Eval gate:** every later slice must prove behavior against these scenarios.
- **Human boundary:** fixtures must identify requests that cannot be decided.
- **Reviewer lane:** open-ended answer quality must identify human review needs.

## Acceptance Criteria

- [ ] Fixtures cover all eight required normal-user questions from the PRD.
- [ ] Fixtures cover unknown entities, contradictory sources, unavailable
      sources, inadequate authority, and unnecessary-search behavior.
- [ ] Every scenario declares expected route, packet fields, search decision,
      blocked behavior, reviewer role, and external success assertions.
- [ ] Capability and regression scenarios are distinguishable.
- [ ] A baseline run records which current v1 behaviors fail and why.
- [ ] No standalone skill is rewritten in this slice.
- [ ] No fixture permits PHI processing, medical advice, eligibility, coverage,
      claims, current network verification, ranking, or purchase decisions.

## Blocked By

None - can start immediately.
