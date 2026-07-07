# Workflow Catalog CLI Run

Generated: 2026-07-05T10:53:22.818253+00:00

## Summary

- Run ID: `2026-07-05-remaining-cli-25x5`
- Selected doors: 121
- Chunks: 25
- Parsed rows: 121
- Parse errors: 0
- Unassigned Priority 1 doors: 0
- Remaining Priority 2 doors prepared: 0
- Remaining Priority 3 doors prepared: 0

## Source URL Status

| Status | Rows |
| --- | ---: |
| broken | 24 |
| canonicalized | 31 |
| exact_page_reachable | 43 |
| exact_page_sparse | 23 |

## Confidence

| Confidence | Rows |
| --- | ---: |
| high | 54 |
| low | 36 |
| medium | 21 |
| medium-high | 2 |
| medium-low | 8 |

## Required Field Gaps

| Field | Missing Rows |
| --- | ---: |
| `workflow_id` | 0 |
| `source_url_status` | 0 |
| `canonical_source_url` | 0 |
| `evidence_basis` | 0 |
| `input_contract` | 0 |
| `output_artifact` | 0 |
| `validation_gate` | 0 |
| `safety_boundary` | 0 |
| `confidence` | 0 |

## Agent Outputs

| Agent | Rows | Quality Note |
| --- | ---: | --- |
| agent-001 | 5 | Unable to browse or inspect external source pages in this environment because network access is restricted and filesystem is read-only. Classifications below are therefore grounded in the supplied local catalog hints only, with honest fallback status and reduced confidence. |
| agent-002 | 5 | Read-only classification. Source pages were checked live; sparse pages are marked with lower confidence and fallback basis where appropriate. |
| agent-003 | 5 | Read-only classification. Source links were checked directly; n8n folder names were canonicalized from display labels with spaces to the repository's underscore folder paths where needed. |
| agent-004 | 5 | Read-only classification. Source pages were checked through GitHub search/open where available; GitHub folder pages are treated as category-level evidence, with README fallback for overall repo/catalog context. Confidence is lower where exact category pages expose only a directory listing rather than individual workflow semantics. |
| agent-005 | 5 | Evidence checked against the specified GitHub pages. Folder doors are classified from visible category file listings; docs/index.md and llms.txt are classified from their repository index text. No files were edited. |
| agent-006 | 5 | Source access unavailable in this run; classification uses the supplied local catalog hints only, so all rows are marked as local fallback with reduced confidence. |
| agent-007 | 5 | Unable to perform live source verification in this turn; classifications use the supplied catalog hints as fallback context, so all confidence values are lowered and source status is marked honestly. |
| agent-008 | 5 | Could not browse in this read-only/restricted environment, so classifications use the supplied catalog hints as fallback context and confidence is lowered. |
| agent-009 | 5 | Evidence checked against GitHub exact folder pages where reachable. The README blob URL returned 404, so surface-0129 uses the repository root README rendering as the canonical fallback. No files were edited. |
| agent-010 | 5 | Read-only classification. Source links were checked directly; where GitHub directory/blob pages were inaccessible or sparse through the fetcher, classification stays close to the supplied catalog hints and confidence is lowered. |
| agent-011 | 5 | Read-only classification. Exact links were checked; surface-0012 original path returned 404 and was canonicalized to CaseMark's hyphenated SKILL-SPEC.md path. Sparse/template pages are marked accordingly. |
| agent-012 | 5 | Read-only classification using supplied catalog hints as fallback because live source access was not available in this environment. Confidence is lowered where page-specific behavior could not be verified. |
| agent-013 | 5 | Classified 5 requested catalog doors using read-only source inspection. Exact GitHub pages were reachable for four doors; the agno-examples path failed in the browser, so the repository README Agno section was used as a canonical fallback. |
| agent-014 | 5 | Read-only classification of 5 workflow-catalog doors. Exact source pages were checked where reachable; broken main-branch links were canonicalized to reachable master/repo pages or marked as broken with README fallback. |
| agent-015 | 5 | Read-only classification. Source links were checked directly; broken/sparse links use a single canonical fallback as requested. No files edited. |
| agent-016 | 5 | Classified the five requested doors using the exact GitHub page where reachable. For the one stale path, canonicalized to the repository's actual top-level specialized folder and kept the classification narrow. |
| agent-017 | 5 | Unable to complete source verification because this session is read-only with restricted network access, so all five rows are classified from the supplied catalog hints as fallback context with lowered confidence. |
| agent-018 | 5 | Classified 5 requested doors using the linked GitHub pages; canonical raw SKILL.md was used once where the directory page was sparse. |
| agent-019 | 5 | Unable to verify the GitHub source pages live in this read-only classification pass, so rows are grounded in the supplied local catalog hints and marked with lowered confidence. |
| agent-020 | 5 | Read the requested GitHub pages and canonical raw skill files where a specific SKILL.md was the clearer source. Sparse category folders are kept conservative and marked as category-folder evidence. |
| agent-021 | 5 | Read-only classification based on each GitHub combo folder plus its canonical raw SKILL.md file. Exact folder pages were shallow directory listings, so canonical raw skill files were used for evidence. |
| agent-022 | 5 | Read-only catalog classification. Source evidence was checked against the linked GitHub pages where reachable; sparse or missing pages are marked with lower confidence and fallback basis. |
| agent-023 | 5 | Read-only classification. Exact GitHub pages were checked where reachable; the agency-agents engineering link was canonicalized from the supplied broken /agents/engineering path to the repository's /engineering division evidence. |
| agent-024 | 5 | Read the supplied GitHub pages and raw canonical files where useful. Sparse folder pages are marked honestly; no files were edited. |
| agent-025 | 1 | Cannot complete evidence-grounded classification in this environment because network access for the GitHub source was unavailable and no local fallback file was provided in the prompt beyond catalog hints. |

## Next Pass

The remaining manifests are prepared but not executed in this run:

- `remaining-priority1.json`
- `remaining-priority2.json`
- `remaining-priority3.json`
