# Issue 011: Build The Evidence Audit Reviewer Lane

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 17-24, 28-32, 35, and 38.

## What To Build

Rebuild `coverage-evidence-audit` as the reviewer lane for packets and example
outputs. Add severity, release readiness, required fixes, reviewer questions,
source-claim fit checks, freshness checks, safety leakage checks, and routing
back to the producing skill.

## Read First

- Issues 002-010 and their passing scenario evidence.
- Existing evidence-audit skill and behavior fixtures.
- The audit and release decisions in the Health 007 PRD.
- ECC eval-gate, reviewer-lane, human-boundary, handoff, and output-artifact guidance.

## ECC Concepts To Apply

- **Reviewer lane:** audit is independent from primary research production.
- **Eval gate:** severity and readiness determine whether output may release.
- **Human boundary:** critical and high findings require explicit review.
- **Handoff:** required fixes route to the producing skill or reviewer.
- **Output artifact:** audit findings extend the packet without overwriting evidence.

## Acceptance Criteria

- [ ] A failing severity or safety-leak scenario is captured first.
- [ ] Severity supports critical, high, medium, and low.
- [ ] Release readiness supports blocked, needs-review, and
      acceptable-for-education.
- [ ] PHI, medical advice, eligibility, coverage, claims, network, ranking, and
      purchase leaks are critical and blocked.
- [ ] Unsupported authority, stale proof, and missing human boundaries are at
      least high.
- [ ] Audit output names required fixes and reviewer questions.
- [ ] Audit scenarios and full packet validation pass after implementation.

## Blocked By

- Issues 003-010
