# Issue 004: Define Source Authority And Freshness

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 8-9, 12, 17-18, 25-27, 31-32, 35, and 38.

## What To Build

Define the source-authority hierarchy and claim-level freshness rules used by
all skills. Cover regulator and public-authority sources, PhilHealth,
HMO/insurer/provider publications, employer or HR materials, hospital billing
sources, brokers and marketplaces, and secondary explainers. Extend source
data and scenarios so the workflow can state what each source can and cannot
prove.

## Read First

- Issues 001 and 002.
- The standalone source atlas and existing source fields.
- The Health 006 review findings on authority and freshness.
- ECC input-contract, workflow-contract, human-boundary, and eval-gate guidance.

## ECC Concepts To Apply

- **Input contract:** source role and date constrain usable claims.
- **Workflow contract:** every skill applies the same authority vocabulary.
- **Human boundary:** unsupported or personal conclusions require verification.
- **Output artifact:** packet sources expose authority and freshness.
- **Eval gate:** stale or insufficient proof must fail relevant assertions.

## Acceptance Criteria

- [ ] Every required source role defines `can_prove`, `cannot_prove`,
      freshness expectations, verification owner, safe user action, and stale
      conditions.
- [ ] Authority and freshness are evaluated separately.
- [ ] A current provider page cannot pass as regulator authorization proof.
- [ ] A stale authoritative source cannot pass as current personal proof.
- [ ] Source fixtures cover contradictory, unavailable, stale, and insufficient
      evidence.
- [ ] Source-sensitive packets remain valid under Issue 002.

## Blocked By

- Issue 001: Define The V2 Scenario Foundation
- Issue 002: Define The Coverage Research Packet
