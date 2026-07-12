# Issue 003: Discover Testing Sessions During Project Preload

## Parent

`workflow-foundry-008` - Project Testing Sessions

## What to build

Make testing-session state discoverable from the normal project preload path.
When a project has a testing-session index, the workflow state query and task
continuation surfaces should be able to detect it and expose lightweight
session summaries and pointers without loading full event streams by default.

This slice makes prior testing sessions easy for future agents to find before
they make workflow decisions.

## Acceptance criteria

- [x] Project preload can detect whether a project has a testing-session
      index.
- [x] Project preload exposes lightweight testing-session summaries and
      pointers when an index exists.
- [x] Project preload does not load full event streams by default.
- [x] The query workflow state helper can surface testing-session index
      summaries for a project.
- [x] native Codex planning and native Codex planning instructions mention testing-session
      discovery during preload.
- [x] Existing projects without a testing-session index continue to load
      normally.
- [x] Workflow-state validation still passes after this slice.

## Blocked by

- `workflow-foundry-008-issue-001-start-session`

## User stories covered

- 10. Discover prior sessions during project preload
- 11. Keep the index lightweight
- 14. Let future agents consider prior captured runs
- 15. Reconstruct behavior from structured logs when needed
- 18. Keep testing-session state reliable
