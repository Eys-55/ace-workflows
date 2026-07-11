# Issue 012: Ship Examples And The Integrated Release Gate

Type: AFK

## Parent

`health-007`

## User Stories Covered

Stories 14-21, 28-38.

## What To Build

Add compact beginner and deep-research packet examples, connect all scenario
and packet validators to the package validation flow, define the release
checklist, and create one integrated release gate. The gate must verify
scenario behavior, skill contracts, examples, source freshness, audit
readiness, package contents, and standalone runtime isolation.

## Read First

- Issues 001-011 and their verification evidence.
- Existing package, manifest, README, validators, and package smoke check.
- The release decisions in the Health 007 PRD.
- ECC eval-gate, reviewer-lane, output-artifact, project-state-preload, and
  human-boundary guidance.

## ECC Concepts To Apply

- **Eval gate:** release depends on complete behavioral evidence.
- **Reviewer lane:** open-ended quality and high-risk findings remain reviewed.
- **Output artifact:** examples demonstrate the canonical packet.
- **Project state preload:** release checks inspect all required product surfaces.
- **Human boundary:** passing automation cannot waive high-stakes review.
- **Parallel task context:** foundry provenance stays outside runtime artifacts.

## Acceptance Criteria

- [ ] Examples cover entity lookup, category comparison, provider deep dive,
      blocked coverage or claim questions, source authority, beginner intake,
      and deep research.
- [ ] Every example passes packet and evidence-audit validation.
- [ ] Package validation runs scenario, packet, skill-contract, artifact, and
      example checks.
- [ ] The release gate runs package dry-run and standalone dependency checks.
- [ ] Any foundry or Real Life Workflows runtime dependency blocks release.
- [ ] Critical or high audit findings cannot produce a ready release.
- [ ] Full validation, package dry-run, and release checks pass from a clean state.

## Blocked By

- Issues 005-011
