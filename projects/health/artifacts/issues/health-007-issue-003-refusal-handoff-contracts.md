# Issue 003: Turn Refusals Into Safe Handoffs

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 6-7, 19-24, 28, 31-32, 35, and 38.

## What To Build

Define reusable refusal-to-handoff templates and corresponding blocked
scenarios for PHI or patient documents, medical advice, eligibility, coverage,
claims, provider-network verification, rankings, and purchase recommendations.
Each refusal must remain useful by identifying safe evidence, the appropriate
reviewer role, and exact next questions.

## Read First

- Issues 001 and 002.
- The standalone safety-boundaries and workflow-contract references.
- Healthcare PHI compliance guidance.
- ECC human-boundary, handoff, reviewer-lane, and eval-gate guidance.

## ECC Concepts To Apply

- **Human boundary:** prohibited decisions stop before unsafe processing.
- **Handoff:** a blocked request becomes an actionable next step.
- **Reviewer lane:** each decision class routes to an appropriate human role.
- **Output artifact:** refusals still produce a valid research packet.
- **Eval gate:** blocked scenarios fail on advice or decision leakage.

## Acceptance Criteria

- [ ] Every blocked-decision class has a distinct template.
- [ ] Every template contains a concise boundary, safe public-source
      explanation, source or document types to request, reviewer role, and next
      questions.
- [ ] Templates do not ask the user to submit PHI or patient documents.
- [ ] Blocked scenario fixtures fail on guarantees, advice, rankings,
      recommendations, or decision leakage.
- [ ] Every refusal produces a packet valid under Issue 002.
- [ ] Human-review routing is role-specific rather than a generic disclaimer.

## Blocked By

- Issue 001: Define The V2 Scenario Foundation
- Issue 002: Define The Coverage Research Packet
