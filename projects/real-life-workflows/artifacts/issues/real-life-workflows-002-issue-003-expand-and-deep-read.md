# Issue 003: Expand matched doors and deep-read candidates

## Parent

`real-life-workflows-002` - Workflow Understanding Finder

## What to build

Extend the door-sweep path so matched doors can fan out into deeper workflow
candidates. This slice should prove that the finder can move beyond a shallow
171-row skim and inspect the strongest direct and adjacent candidates before
finalizing the packet.

The result should support broad searches where many relevant workflows are
found, while keeping the visible packet bounded at about 50 recommendations.

## Acceptance criteria

- [x] Matched doors can be expanded into deeper candidate workflows when the
      catalog indicates expansion is needed.
- [x] Strong direct matches are deep-read before the packet is finalized.
- [x] Promising adjacent matches are read enough to justify their category.
- [x] Broad result sets can include up to about 50 visible recommendations.
- [x] The packet remains organized under the four fixed categories.
- [x] Full workflow or skill text is not inlined into the packet by default.
- [x] The repo workflow-state validator still passes after this slice.

## Blocked by

- Issue 002: Build the 171-door sweep MVP

## User stories covered

- 4. Expand matched doors
- 5. Produce a deep packet by default
- 6. Allow up to about 50 recommendations
- 8. Explain why each workflow matters
- 13. Rank by workflow usefulness
- 14. Include supporting workflows when useful
- 16. Keep doors separate from leaf workflows
