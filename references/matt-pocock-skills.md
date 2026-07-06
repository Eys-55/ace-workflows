# Matt Pocock Skills Reference

Canonical upstream:

- Repository: https://github.com/mattpocock/skills
- Inspected commit: `66f92b61f5b1434a1c7422f6fbd8efc5ee0c0214`
- Local inspection path used during setup: `/tmp/mattpocock-skills-inspect`

This repo uses Matt Pocock's skills as the operating process for planning,
grilling, issue shaping, implementation, TDD, review, and handoff.

## Main Flow

Use the `ask-matt` flow as the process router.

```text
grill-with-docs -> to-prd -> to-issues -> implement -> code-review
```

For multi-session work:

```text
grill-with-docs -> to-prd -> to-issues -> fresh session per issue -> implement
```

`implement` drives `tdd` internally and finishes with `code-review`.

## Required Matt Files To Check

When building or editing workflows, inspect the matching upstream skill or doc:

- `skills/engineering/ask-matt/SKILL.md`
- `skills/engineering/grill-with-docs/SKILL.md`
- `skills/productivity/grilling/SKILL.md`
- `skills/engineering/to-prd/SKILL.md`
- `skills/engineering/to-issues/SKILL.md`
- `skills/engineering/implement/SKILL.md`
- `skills/engineering/tdd/SKILL.md`
- `skills/engineering/code-review/SKILL.md`
- `skills/productivity/handoff/SKILL.md`
- `skills/productivity/writing-great-skills/SKILL.md`

## Local Interpretation For This Repo

Until a GitHub remote and issue tracker are configured, use project-local JSON
trackers as the issue tracker:

```text
projects/<project-slug>/tasks/index.json
projects/<project-slug>/tasks/<task-id>.json
```

Each project task should behave like an issue:

- it has an id
- it has a status
- it has acceptance criteria
- it can be independently implemented or reviewed
- it links to the workflow files, skills, chains, fixtures, and evals it changes

## Grilling Rule

Use Matt's grilling primitive before building when the request has unresolved
decisions. Ask one blocking question at a time. Explore the repo instead of
asking when the repo can answer the question.

Do not start implementation until the shared understanding is explicit.
