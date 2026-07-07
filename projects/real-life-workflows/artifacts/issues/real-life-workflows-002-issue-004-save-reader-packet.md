# Issue 004: Save the reader-first Markdown packet

## Parent

`real-life-workflows-002` - Workflow Understanding Finder

## What to build

Make the finder produce a durable Markdown packet that the user can read later
or hand to another agent. This slice should turn the retrieval result into a
saved artifact with stable structure, clear source paths, and concise
recommendation summaries.

The packet should be useful on its own without requiring the reader to inspect
the raw catalog first.

## Acceptance criteria

- [x] A completed run saves a Markdown packet artifact.
- [x] The saved packet includes the original request and any clarified workflow
      understanding target.
- [x] The saved packet includes all four fixed categories, even when empty.
- [x] Each visible workflow recommendation includes `Why it matters`.
- [x] Each visible workflow recommendation includes source links and local
      door/source paths for later extraction.
- [x] The packet is readable when it contains a broad result set.
- [x] The repo workflow-state validator still passes after this slice.

## Blocked by

- Issue 003: Expand matched doors and deep-read candidates

## User stories covered

- 5. Produce a deep packet by default
- 6. Allow up to about 50 recommendations
- 7. Use the same four categories
- 8. Explain why each workflow matters
- 11. Include source links and local paths
- 15. Save as Markdown
- 18. Treat build and extraction as follow-up outcomes
