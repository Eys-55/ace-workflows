# Issue 006: Navigator Drilling Flow

## Parent

health-004

## What To Build

Create an educational navigator flow that starts with the user's job to
understand, asks narrow drilling questions, routes to the correct artifact, and
returns source-grounded explanations plus human verification prompts.

## Acceptance Criteria

- [x] Flow separates public-payer, HMO, insurer, provider-network, employee
      HMO, and claims/reimbursement questions.
- [x] Flow routes to registry, product catalog, source atlas, deep-dive packet,
      or comparison-readiness matrix.
- [x] Flow includes refusal boundaries for medical, eligibility, coverage,
      purchase, and claims decisions.
- [x] Flow produces next questions for humans rather than final decisions.
- [x] Validator checks route targets and refusal boundaries.

## Blocked By

None. Source atlas, deep-dive, and comparison-readiness artifacts are created in
this implementation checkpoint.
