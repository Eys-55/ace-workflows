---
name: audit-foundry
description: Produce an evidence-backed Markdown audit of the ace-workflows foundry, project configuration, optional status ledgers, skill surfaces, and validation health. Use for durable current-state and control-plane audits.
---

# Audit Foundry

Create a read-only audit from current repository evidence.

## Procedure

1. Read root instructions, the project-instruction registry, project metadata,
   active skill bundles, deterministic helpers, and relevant package manifests.
2. Read optional task indexes and referenced details when they exist.
3. Run read-only state queries and validation; record exact commands and output.
4. Check JSON consistency, registered instructions, dependency integrity,
   testing-session safety, skill structure, path boundaries, and Git drift.
5. Separate observed facts from inferences and recommendations.
6. Write the report under the nearest existing audit or review artifact home.

Do not mutate source, ledger state, Git state, or external systems. Do not treat
the absence of task records as a defect unless tracking was explicitly required.

## Report Contract

Include timestamp, scope, sources, commands, findings by severity, evidence
paths, validation results, cleanup recommendations, and residual uncertainty.
Recommend `$audit-review` when prioritization is needed or `$audit-cleanup` when
the user has already authorized remediation.
