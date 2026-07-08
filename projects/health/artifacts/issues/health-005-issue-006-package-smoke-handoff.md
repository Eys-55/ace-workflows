# Issue 006: Package Smoke And Handoff

## Parent

`health-005`

## What To Build

Add package smoke checks, final verification scripts, and handoff guidance for
installing or pushing the standalone `philippines-health-coverage` repo.

## Acceptance Criteria

- [ ] `scripts/package-smoke-check.mjs` verifies package metadata, manifest,
      required skills, interface files, artifacts, evals, references, and
      scripts.
- [ ] `npm pack --dry-run --json` includes all required shipped files.
- [ ] README usage is skill-first and keeps helper scripts under developer
      verification.
- [ ] Handoff notes explain that the shipped repo is standalone and has no
      runtime dependency on this foundry.

## Blocked By

- Issue 005: Evals And Safety Release Gate
