# Issue 004: README And Package Validator

## Parent

`real-life-workflows-004`

## What to build

Add deterministic validation for the new product surface. The validator should
check README count claims, package files, skill metadata, package dry-run
coverage, quarantine boundaries, and packet-write rules.

## Acceptance criteria

- [ ] Validator fails if the README says "171 repos."
- [ ] Validator fails if the README omits 19,000+, 171 curated doors, or 17 source repositories.
- [ ] Validator fails if the count artifact totals do not match README claims.
- [ ] Validator fails if the package lacks skill content or harness-facing metadata.
- [ ] Validator fails if package files include quarantined imported skill folders.
- [ ] Validator fails if the skill contract does not require caller-owned packet writes with provenance.
- [ ] Validator can be run from the repo root with Node.

## Blocked by

- Issue 001.
- Issue 002.
- Issue 003.
