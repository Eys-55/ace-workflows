# Issue 004: Six Skill Surfaces

## Parent

`health-005`

## What To Build

Create the six approved v1 skills for the standalone repo:
`coverage-source-research`, `coverage-entity-lookup`,
`coverage-provider-deep-dive`, `coverage-type-compare`,
`coverage-navigator`, and `coverage-evidence-audit`.

## Acceptance Criteria

- [ ] Every skill has `SKILL.md` with name/description frontmatter.
- [ ] Every skill has `agents/openai.yaml` with UI metadata and default prompt.
- [ ] Every skill states its job, input contract, artifact dependencies, output
      contract, stop conditions, and validation expectations.
- [ ] Skills load shared references instead of duplicating long contract or
      safety prose.
- [ ] No skill permits PHI, patient documents, medical advice, eligibility
      decisions, coverage determinations, claims decisions, rankings, or
      purchase recommendations.

## Blocked By

- Issue 003: Contract Foundation
