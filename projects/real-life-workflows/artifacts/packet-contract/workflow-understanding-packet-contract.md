# Workflow Understanding Packet Contract

Status: Issue 001 contract artifact.

## Purpose

This contract defines the reader-first packet shape for the universal
workflow-understanding finder. A packet helps a reader understand relevant
workflow patterns before deciding whether to build, extract, rewrite, or promote
anything.

## Universal Intake Question

Ask this question when the user's request does not already name a clear work
area:

```text
What type of work or workflow are you trying to understand?
```

## Packet Rules

- Treat catalog rows as workflow doors, not finished workflows.
- Produce Markdown for reading and handoff to other agents.
- Do not inline full workflow or skill text by default.
- Include source links and local door/source paths for later extraction.
- Rank primarily by workflow usefulness.
- Show reliability as metadata, not as the primary sorter.
- Keep all four packet categories visible, even when empty.
- Keep broad packets readable; visible recommendations must not exceed about
  50.
- Preserve human review boundaries for high-stakes domains.

## Fixed Categories

1. Direct Matches
2. Strong Adjacent Matches
3. Supporting Building Blocks
4. Maybe Useful

## Recommendation Entry Shape

```md
### Workflow name

- Why it matters:
- Why it is here:
- What it does:
- Source link:
- Local door/source path:
- Reliability:
- Possible skill to extract:
```

## Fixture Coverage

The Issue 001 fixture set must include:

- `narrow`: a naturally small result set.
- `broad`: a result set with multiple visible recommendations.
- `supporting_building_blocks`: a result set where indirect workflows matter.
- `high_stakes`: a result set that preserves human review boundaries.

Run the contract validator with:

```bash
node projects/real-life-workflows/artifacts/packet-contract/validate-packet-fixtures.mjs
```
