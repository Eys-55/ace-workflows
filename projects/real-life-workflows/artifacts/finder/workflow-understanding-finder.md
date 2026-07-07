# Workflow Understanding Finder

Use this finder when a reader asks what type of work or workflow they want to understand. The current source is the quarantined market-research-agent catalog under `projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/`.

## Intake

Ask one universal first question:

> What type of work or workflow are you trying to understand?

Use the answer as a broad query. Do not ask what the reader wants to build until after the first understanding packet exists.

## Output Contract

Every saved packet must include the four visible categories:

- Direct Matches
- Strong Adjacent Matches
- Supporting Building Blocks
- Maybe Useful

Each visible recommendation must include why it matters, why it is here, what it does, a source link, a local door/source path, reliability, and a possible skill to extract.

Keep the packet readable. The default result set should be 5 to 12 recommendations when the catalog is narrow. Broad searches may show up to 50 visible recommendations.

## Query Helper

Run a search packet from the repo root:

```bash
node projects/real-life-workflows/artifacts/finder/workflow-understanding-finder.mjs --query "healthcare pediatrics" --limit 12
```

Save a packet:

```bash
node projects/real-life-workflows/artifacts/finder/workflow-understanding-finder.mjs --query "document evidence" --limit 12 --output projects/real-life-workflows/artifacts/finder/packets/document-evidence.md
```

Run the door-count audit:

```bash
node projects/real-life-workflows/artifacts/finder/workflow-understanding-finder.mjs --audit
```

The helper also reads `workflow-link-seed.json` and attaches up to three seed expansion candidates to each visible recommendation when the quarantined import exposes them. Treat these as next-read pointers, not verified leaf workflow bodies.

## Human Boundary

Reader packets are learning artifacts. They do not prove compliance, medical correctness, legal sufficiency, eligibility, coverage, safety, or readiness for external action. Before extracting a reusable skill, read the linked source material directly and validate the resulting skill against the packet contract and project task acceptance checks.
