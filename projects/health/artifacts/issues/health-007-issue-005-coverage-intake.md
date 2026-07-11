# Issue 005: Build The Coverage Intake Front Door

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 1, 10-15, 19-24, 33-35, and 38.

## What To Build

Create `coverage-intake` as the beginner-facing front door. It must interpret
ordinary language, start a valid coverage research packet, identify blocked
requests before collecting unsafe context, ask at most one necessary
clarifying question, and hand off evidence acquisition without performing deep
research itself.

## Read First

- Issues 001-003.
- The Health 007 PRD skill-role table.
- The current navigator flow and skill interface conventions.
- Skill-creator and ECC progressive-disclosure guidance.

## ECC Concepts To Apply

- **Input contract:** intake accepts only safe, minimal context.
- **Workflow contract:** answer, clarify, route, and block decisions are explicit.
- **Output artifact:** intake initializes the canonical packet.
- **Human boundary:** unsafe requests stop before data collection.
- **Handoff:** evidence-heavy work routes to the responsible skill.
- **Eval gate:** fuzzy and blocked prompts must produce expected routes.

## Acceptance Criteria

- [ ] A failing intake scenario is recorded before the skill is created.
- [ ] The skill description triggers from ordinary beginner questions.
- [ ] The skill starts a valid packet and records the route decision.
- [ ] It answers from adequate loaded evidence, asks one necessary clarification,
      or hands off; it does not perform deep search.
- [ ] PHI, medical-advice, and decision requests use Issue 003 handoffs.
- [ ] Interface metadata and the skill manifest expose the seventh skill.
- [ ] Intake scenarios pass after implementation and existing safety
      regressions remain green.

## Blocked By

- Issue 002: Define The Coverage Research Packet
- Issue 003: Turn Refusals Into Safe Handoffs
