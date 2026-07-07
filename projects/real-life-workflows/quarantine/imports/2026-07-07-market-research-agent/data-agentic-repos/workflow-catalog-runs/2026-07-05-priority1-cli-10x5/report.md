# Workflow Catalog CLI Run

Generated: 2026-07-05T10:43:14.571823+00:00

## Summary

- Run ID: `2026-07-05-priority1-cli-10x5`
- Selected doors: 50
- Chunks: 10
- Parsed rows: 50
- Parse errors: 0
- Unassigned Priority 1 doors: 2
- Remaining Priority 2 doors prepared: 106
- Remaining Priority 3 doors prepared: 13

## Source URL Status

| Status | Rows |
| --- | ---: |
| broken | 12 |
| canonicalized | 16 |
| exact_page_reachable | 20 |
| exact_page_sparse | 2 |

## Confidence

| Confidence | Rows |
| --- | ---: |
| high | 10 |
| low | 17 |
| medium | 22 |
| medium_high | 1 |

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
| agent-001 | 5 | Unable to complete evidence-grounded classification because the current environment has read-only filesystem and restricted network/tool access for these GitHub source pages in this turn. Returning the requested rows with source_url_status marked as broken and low confidence rather than inventing behavior. |
| agent-002 | 5 | Classified against the supplied source URLs, canonicalized once where the original path was not reachable, and lowered confidence where the evidence is only a reference pattern rather than a complete ECC workflow contract. |
| agent-003 | 5 | Read-only catalog classification. GitHub source pages were checked; broken or sparse links use one canonical fallback where available. |
| agent-004 | 5 | Read-only catalog classification. GitHub exact paths were checked; broken or sparse paths were grounded with one README/raw-file fallback where available. |
| agent-005 | 5 | Read-only classification of 5 requested doors. Classifications preserve input workflow_id values and are limited to source-visible folders, files, README fallback evidence, or sparse-source caveats. |
| agent-006 | 5 | Classified from the reachable GitHub category folders; evidence is limited to folder names and contained skill filenames, so rows avoid behavior claims beyond catalog fit. |
| agent-007 | 5 | Classified read-only from the exact GitHub pages where reachable, with local repo catalog used only as a consistency check. |
| agent-008 | 5 | Read-only classification. Exact URLs were checked; broken or sparse pages were grounded via the repository README or canonical directory when available. |
| agent-009 | 5 | Unable to complete evidence-grounded classification in this environment because network access to GitHub sources was unavailable and the workspace is read-only. I preserved the provided IDs and marked confidence low where source evidence could not be verified. |
| agent-010 | 5 | Read-only classification. Exact GitHub pages were checked where reachable; sparse or broken folder pages used one README fallback as requested. |

## Next Pass

The remaining manifests are prepared but not executed in this run:

- `remaining-priority1.json`
- `remaining-priority2.json`
- `remaining-priority3.json`
