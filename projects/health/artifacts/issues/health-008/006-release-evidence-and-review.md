# Release evidence and two-axis review

Type: HITL

## What to build

Produce fresh release evidence against the committed candidate, then review the
diff independently on Standards and Spec axes. Record build, typecheck, lint,
unit, integration, E2E, coverage, accessibility, security, dependency, secret,
package, lifecycle, harness-parity, screenshot, trace, and final-diff results in
the Health review artifact. Push only after all critical and important findings
are resolved.

## Acceptance criteria

- [ ] Every required verification command, version, timestamp, result, and artifact is recorded.
- [ ] Coverage is at least 80 percent for lines, branches, functions, and statements where reported, with no untested authority path.
- [ ] A fresh GPT-5.6 Sol evaluator exercises the opener skill and records unique session evidence without fallback.
- [ ] Standards, Spec, security, accessibility, and visual lanes are independent and have no unresolved critical or important findings.
- [ ] `npm run release:check` and foundry workflow-state validation pass against the final diff.
- [ ] The standalone and foundry commits contain no secrets, generated residue, unrelated edits, or untracked required evidence before push.

## User stories covered

All PRD user stories; especially US-36 through US-40.

## Blocked by

Issues 001 through 005.
