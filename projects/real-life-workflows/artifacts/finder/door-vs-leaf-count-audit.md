# Door vs Leaf Count Audit

The quarantine currently exposes 171 access doors. This is not the final workflow count.

- Workflow link count in seed file: 171
- Search index row count: 171
- Expanded leaf-workflow count status: not fully materialized in the quarantine import
- User-reported expected scale: almost ten thousand workflows

## Candidate Types

- category: 114
- lane: 4
- manifest: 18
- skill: 3
- template: 6
- workflow: 26

## Safety Boundaries

- Treat the 171 rows as access doors, not finished workflows.
- Do not claim the expanded leaf-workflow count until a deeper expansion pass quantifies it.
- Do not copy full source workflow text into reader packets; store links and descriptions for extraction.
- High-stakes packets do not prove compliance, clinical correctness, legal sufficiency, or safety.
