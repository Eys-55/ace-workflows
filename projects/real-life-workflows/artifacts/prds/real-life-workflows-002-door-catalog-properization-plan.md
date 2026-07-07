# Door Catalog Properization Plan

## Problem Statement

The quarantined import contains 171 workflow doors, not 171 finished workflows.
Each door is an entry point into a possible real-world workflow family or source
surface. The current material is useful, but it is not yet a proper ECC workflow
surface because source quality, skill architecture, validation, and promotion
rules are not enforced.

The project needs a controlled path from quarantined doors to validated Codex
skills. That path must keep the quarantine untrusted, inspect the real source
evidence for each candidate, and promote only workflows that have a concrete
operator job, input contract, output artifact, eval gate, handoff, and human
boundary.

## Inspection Findings

Catalog shape:

- `workflow-door-catalog.json` has 171 rows.
- `workflow-search-index.json` has 171 rows.
- `workflow-classifications-all.json` has 171 rows and 171 unique workflow ids.
- All three inspected JSON surfaces have complete required fields for their
  current row shapes.
- The door catalog is a router surface. Its rows include `door`,
  `door_level`, `input_contract_hint`, `output_artifact_hint`,
  `source_url`, `needs_second_pass`, and safety boundaries.
- The search index is closer to an ECC contract draft. It includes
  `real_life_job`, `input_contract`, `output_artifact`, `trigger`,
  `validation_gate`, `human_review_boundary`, `safety_boundary`,
  `what_to_copy`, and `what_to_ignore`.

Door distribution:

- Primary domains: 46 `agent_workflows`, 41 `general`, 21 `automation`,
  18 `real_estate`, 14 `document_processing`, 9 `healthcare`, 6 `research`,
  6 `legal`, 5 `finance_or_crm`, 3 `public_evidence`, and 2 `education`.
- Search-index normalized domains: 51 `agent_workflows`, 39
  `public_evidence`, 24 `automation`, 20 `document_processing`, 16
  `real_estate`, 9 `healthcare`, 4 `legal_casework`, 4 `finance_crm`,
  2 `education`, 1 `research`, and 1 `general`.
- Door priority counts: 52 priority-1 doors, 106 priority-2 doors, and
  13 priority-3 doors.

Source quality:

- Source status counts: 63 `exact_page_reachable`, 47 `canonicalized`,
  36 `broken`, and 25 `exact_page_sparse`.
- Quality tiers: 67 `gold`, 43 `silver`, and 61 `needs_verification`.
- Confidence counts: 64 `high`, 43 `medium`, 53 `low`, 8 `medium-low`,
  and 3 `medium-high`.
- There are no duplicate `workflow_id` values and no duplicate `source_url`
  values in the search index.
- There are duplicate `canonical_source_url` clusters, including repeated
  references to `contentforge`, `500-AI-Agents-Projects`, and `marie-ai`.
  Those should be handled as source clusters, not independent proof.

Imported skill surface:

- The quarantine contains 18 `SKILL.md` files.
- All 18 have `name` and `description` frontmatter, and every frontmatter
  `name` matches its folder name.
- Only a subset have `agents/openai.yaml` metadata.
- Two imported skills include `commands.md` internal adapter references.
- Several imported skills are phase shims such as `workflow-to-prd`,
  `workflow-to-issues`, `workflow-implement`, and `workflow-code-review`.
  This repo explicitly says not to create separate repo-local skills for Matt
  PRD, issue, implement, or review phases.
- Many imported skills assume the old `skills/` surface, while this repo's
  canonical surface is `.agents/skills/`.
- Several skills refer to source data, reports, and validation commands that
  were not copied into an active project contract here. They cannot be promoted
  without dependency reconciliation.

## Solution

Treat the import as a two-layer quarantine:

1. Door catalog: a search and routing layer that proposes candidate workflow
   families and source surfaces.
2. Legacy skill candidates: untrusted workflow text that may contain useful
   patterns, but cannot be copied into `.agents/skills/` until rewritten
   against this repo's ECC and Matt rules.

The properized system should produce a promotion pipeline:

`door -> source verification -> ECC contract -> fixture/eval -> draft skill -> review -> canonical skill`

No door should become a skill just because it is marked `gold`. `gold` means it
is a better candidate for source verification, not that the workflow contract is
done.

## User Stories

1. As the workflow operator, I want to search the 171 doors by real-world job,
   so that I can find candidate workflows without browsing randomly.
2. As the workflow operator, I want each door to say what is verified and what
   is not verified, so that I do not over-trust generated catalog text.
3. As the workflow operator, I want broken and sparse source links separated
   from reachable sources, so that audit effort goes to the right place first.
4. As the workflow operator, I want every promoted workflow to name its input
   contract and output artifact, so that the skill has a clear job.
5. As the workflow operator, I want every promoted workflow to include an eval
   gate, so that I can tell whether it works.
6. As the workflow operator, I want the human boundary to be explicit, so that
   high-stakes domains do not imply autonomous conclusions.
7. As the workflow operator, I want legacy imported skills classified as
   migrate, rewrite, merge, archive, or delete, so that stale material does not
   leak into the canonical surface.
8. As the workflow operator, I want phase-shim skills removed from the
   migration path, so that Matt Pocock phases remain task state instead of
   duplicated local skills.
9. As the workflow operator, I want a first promoted pilot workflow, so that
   the promotion pipeline is proven on one narrow vertical slice before scaling.

## Implementation Decisions

- Keep quarantine material under `projects/real-life-workflows/quarantine`.
- Do not move imported skills directly into `.agents/skills`.
- Treat `workflow-door-catalog.json` as the door/router index.
- Treat `workflow-search-index.json` as a contract-draft index, not a final
  contract.
- Create an audit ledger before writing any canonical skills.
- The audit ledger should classify each door with at least source status,
  ECC readiness, safety level, promotion decision, and next action.
- Use Markdown and JSON for audit artifacts. If deterministic validation is
  needed, use `.mjs` helpers only; do not add Python.
- Promote only one pilot workflow first. The strongest pilot candidate should
  come from a reachable or canonicalized source, have high operator value, and
  avoid high-stakes autonomous conclusions.
- Do not preserve imported slash-command surfaces as active operator
  interfaces. If adapter vocabulary is useful, keep it as reference text behind
  a skill pointer.
- Collapse imported phase shims into this repo's existing Matt task flow rather
  than promoting them.

## Testing Decisions

- Validate the quarantine inventory with deterministic counts:
  171 doors, 171 search-index rows, 18 imported `SKILL.md` candidates.
- Validate every promoted skill against this repo's skill rules:
  lowercase folder name, matching frontmatter `name`, model-facing
  `description`, canonical `.agents/skills` placement, and no forbidden
  command/prompt surfaces.
- Validate ECC readiness with a machine-readable checklist:
  workflow contract, input contract, output artifact, eval gate, human
  boundary, handoff, and source verification.
- Validate source quality separately from skill quality. A good skill contract
  with a broken source remains blocked.
- Validate high-stakes domains with stricter gates for legal, medical,
  financial, compliance, safety, and public-evidence claims.

## Vertical Slices

Slice 1: Audit ledger foundation

- Build a project-local JSON ledger for all 171 doors.
- Include source status, quality tier, confidence, domain, priority, duplicate
  source cluster, and promotion decision fields.
- Acceptance: ledger row count equals 171 and every row maps back to one door.

Slice 2: Skill-candidate audit matrix

- Classify the 18 imported skills as migrate, rewrite, merge, archive, or
  delete.
- Flag phase shims, legacy `skills/` references, missing `agents/openai.yaml`,
  missing eval gates, and unresolved dependencies.
- Acceptance: every imported `SKILL.md` has one disposition and one reason.

Slice 3: ECC promotion gate

- Define the promotion checklist and validator for one candidate workflow.
- Acceptance: a candidate cannot pass without input contract, output artifact,
  eval gate, human boundary, handoff, and verified source evidence.

Slice 4: Pilot workflow promotion

- Select one low-risk, high-value door and rewrite it into a proper draft skill
  under project review.
- Acceptance: draft skill passes repo validation and has fixture or example
  input/output evidence.

Slice 5: Catalog search surface

- Define how operators query the 171 doors from Codex chat without making the
  catalog canonical truth.
- Acceptance: a query returns candidate doors, source status, risks, and the
  next verification action.

## Out Of Scope

- Promoting all 171 doors in one pass.
- Activating any imported skill directly from quarantine.
- Copying old slash-command or prompt surfaces into this repo.
- Making legal, medical, engineering, financial, compliance, or safety
  conclusions from catalog text alone.
- Repairing every broken source URL before the pilot workflow is proven.

## Next Step

Move this task from PRD to issues by splitting the plan into the five vertical
slices above. Publish one issue artifact per slice only after confirming the
slice granularity.
