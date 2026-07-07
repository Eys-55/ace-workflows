# Issue 001: Build the Astro tracker shell

## Parent

`workflow-foundry-005` - Astro Project Task Tracker

## What to build

Create the first demoable Astro-generated tracker page for workflow-foundry.
The page should render a static, read-only view from the repo task model using
real project/task JSON, with enough structure to prove the data path and UI
surface are viable before broadening coverage.

This slice should establish the tracker as a generated snapshot, not a live
editor or runtime JSON app.

## Acceptance criteria

- [ ] The tracker can be generated as a static Astro output.
- [ ] The generated tracker renders at least one real project and one real
      task from JSON state.
- [ ] The generated tracker visibly identifies itself as a read-only snapshot.
- [ ] The page includes the core operational layout for project summary and
      task rows or task cards.
- [ ] The tracker does not provide browser controls that edit source JSON.
- [ ] The repo workflow-state validator still passes after this slice.

## Blocked by

None - can start immediately.

## User stories covered

- 3. Read-only tracker
- 4. See each task status
- 5. See each task kind
- 6. See each Matt phase
- 11. Compact visual summary
- 15. Preserve JSON as source of truth
