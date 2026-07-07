# Issue 002: Npm Package Surface

## Parent

`real-life-workflows-004`

## What to build

Add the minimal npm-style package surface that makes local installation claims
truthful. The package should expose the README, count artifact, hero asset,
skill manifest, callable skill files, and the data needed by the packaged
workflow search helper.

## Acceptance criteria

- [ ] Package metadata supports local installation with npm.
- [ ] Package metadata does not claim the package is already published.
- [ ] Package exposes the callable `real-life-workflow-search` skill content.
- [ ] Package files include the README, hero asset, count artifact, skill manifest, skill files, finder reference, and read-only search data.
- [ ] Package files exclude quarantined imported skill folders.
- [ ] `npm pack --dry-run --json` can verify the package shape.

## Blocked by

- Issue 001 for the README, hero, and count artifact.
