---
name: real-life-workflow-search
description: Search the Real Life Workflows source universe and write a full workflow-understanding packet. Use when an operator or developer asks to find real-world workflow examples, research workflow patterns, create a workflow packet, compare adjacent workflow doors, or prepare source-backed candidates for later skill extraction in Claude Code, Codex, opencode, or another agent harness.
---

# Real-Life Workflow Search

Use this skill to search the Real Life Workflows catalog and create a durable
workflow-understanding packet.

## Contract

- Start from the operator's workflow topic or job-to-understand.
- Search the curated workflow doors and adjacent source universe.
- Return a full packet by default, not only a ranked list.
- Write the packet to disk on every run.
- Report the packet path back to the operator.
- Include provenance in the packet.

## Packet Write Boundary

Before writing, identify the caller or primary project's approved artifact area.
Use that location as the output path.

Do not write packets into:

- `node_modules`
- dependency project trackers
- dependency `AGENTS.md` files
- dependency skill definitions
- this package's installed skill folder

If the caller has no approved artifact area, stop and ask for one. Do not pick
a dependency-owned path as a fallback.

## Run

Prefer the packaged helper when it is available:

```bash
npx real-life-workflow-search \
  --query "customer billing exception workflows" \
  --output projects/example/artifacts/workflow-packets/customer-billing-exceptions.md
```

Use a limit only when the operator asks for broader or narrower output:

```bash
npx real-life-workflow-search \
  --query "document evidence research workflows" \
  --limit 20 \
  --output projects/example/artifacts/workflow-packets/document-evidence.md
```

The helper refuses protected output paths and creates parent directories for
valid packet paths.

## Packet Shape

Every packet must include:

- query
- intake question
- visible recommendation count
- provenance
- human review boundary
- Direct Matches
- Strong Adjacent Matches
- Supporting Building Blocks
- Maybe Useful

Every visible recommendation must include:

- why it matters
- why it is here
- what it does
- source link
- local door or source path
- reliability
- possible skill to extract
- expansion candidates when available

## Quarantine Boundary

The packaged search data comes from a quarantined import. Treat it as source
evidence only.

Do not report quarantined imported `SKILL.md` files as active Real Life
Workflows skills. They are not active callable skills, not discoverable as
project skills, and not promotable as-is. Future skills must be rewritten
through a tracked task before becoming active.

## Human Boundary

Workflow packets are learning and design artifacts. They do not prove medical,
legal, financial, compliance, engineering, safety, eligibility, coverage, or
operational correctness. Require human review before external action or before
turning a packet into a reusable skill.
