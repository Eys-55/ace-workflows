# Issue 006: Rebuild Coverage Navigator Routing

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 1-7, 10-15, 19-21, 33-35, and 38.

## What To Build

Rebuild `coverage-navigator` as the routing and packet-building skill behind
intake. It must select the correct next skill, record why the route was chosen,
preserve unresolved questions, and prevent routing from becoming a coverage,
claim, network, ranking, or purchase decision.

## Read First

- Issues 001-005.
- The current navigator artifact and existing navigator skill.
- The Health 007 PRD skill-role table.
- ECC workflow-contract, output-artifact, handoff, and human-boundary guidance.

## ECC Concepts To Apply

- **Workflow contract:** route choices and stop conditions are explicit.
- **Output artifact:** routing updates the shared packet.
- **Handoff:** each route names the next skill and required context.
- **Human boundary:** routing cannot imply a high-stakes decision.
- **Eval gate:** each scenario must reach the intended safe route.

## Acceptance Criteria

- [ ] A failing route scenario is captured before the rewrite.
- [ ] Routes cover intake, entity lookup, source research, provider deep dive,
      comparison, evidence audit, and human review.
- [ ] Route output explains why the next skill is appropriate.
- [ ] The navigator preserves packet state and unresolved questions.
- [ ] No route permits a blocked decision.
- [ ] Navigator scenarios and packet validation pass after implementation.

## Blocked By

- Issue 005: Build The Coverage Intake Front Door
