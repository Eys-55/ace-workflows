# Issue 002: Build the 171-door sweep MVP

## Parent

`real-life-workflows-002` - Workflow Understanding Finder

## What to build

Build the first end-to-end retrieval path from a raw workflow-understanding
request to a packet draft using only the 171 door rows. This slice should prove
that every request sweeps the full door catalog, ranks by workflow usefulness,
and produces a packet-shaped result without treating the doors as finished
workflows.

This slice does not need leaf expansion yet. It should make the door-router
layer observable and testable.

## Acceptance criteria

- [x] A raw request can be processed through all 171 workflow doors.
- [x] The result uses the packet contract from Issue 001.
- [x] Ranking is driven primarily by workflow usefulness, with reliability shown
      as metadata.
- [x] The result labels rows as doors/access points, not finished workflows.
- [x] The result includes local door/source paths for every visible
      recommendation.
- [x] The result avoids high-stakes conclusions from catalog text alone.
- [x] The repo workflow-state validator still passes after this slice.

## Blocked by

- Issue 001: Define the workflow-understanding packet contract

## User stories covered

- 3. Query all 171 doors
- 7. Use the same four categories
- 11. Include source links and local paths
- 12. Show reliability as a label
- 13. Rank by workflow usefulness
- 16. Keep doors separate from leaf workflows
- 20. Label broken or weak sources
