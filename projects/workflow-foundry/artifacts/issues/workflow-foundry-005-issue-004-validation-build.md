# Issue 004: Add snapshot validation and build workflow

## Parent

`workflow-foundry-005` - Astro Project Task Tracker

## What to build

Add the validation and build workflow that makes the Astro tracker reliable as
a generated snapshot. The operator should have a clear command path for
building the tracker after JSON changes, and validation should catch broken
project/task state rather than generating a misleading page.

This slice should make the tracker safe to keep as a workflow-foundry artifact
without weakening the existing JSON task model.

## Acceptance criteria

- [ ] There is a clear command to generate or build the tracker snapshot.
- [ ] The build or validation path fails on malformed required project/task
      JSON.
- [ ] The generated tracker shows snapshot metadata such as generation time or
      source summary.
- [ ] Validation confirms representative required task fields appear in the
      generated output.
- [ ] No Python is introduced.
- [ ] The repo workflow-state validator passes after this slice.

## Blocked by

- Issue 003: Add theme and project view controls

## User stories covered

- 12. Make stale snapshots obvious
- 14. Fail on invalid or missing tracker state
- 15. Preserve JSON as source of truth
