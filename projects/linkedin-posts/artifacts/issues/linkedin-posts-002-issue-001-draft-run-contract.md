# Issue 001: Draft Run Contract And Fixtures

## Parent

`linkedin-posts-002` - Create LinkedIn post generation workflow

## What to build

Define the durable draft-run artifact contract and fixture set for the
LinkedIn post generation workflow. A completed draft run should have a stable
shape that records inputs, selected context, generated candidates, provenance,
quality scores, red-team findings, recommended winner, and any proposed voice
profile update.

The completed slice should make later drafting behavior testable before any
generation logic is implemented.

## Acceptance criteria

- [ ] The draft-run artifact contract records selected source context across projects, tasks, foundry context, and whole-system context.
- [ ] The contract supports both generation from context and revision of an existing rough draft.
- [ ] The contract records target audience, personalness level, optional reader action, and captured user wording.
- [ ] The contract has fields for candidate drafts, angle summaries, source-backed claims, user reflections, provenance blocks, quality scores, red-team findings, winner rationale, and proposed voice-profile updates.
- [ ] The contract marks LinkedIn posting, scheduling, sending, and publishing as out of scope.
- [ ] Fixture examples cover one single-task context, one multi-task context, one multi-project context, and one rough-draft revision input.
- [ ] Fixture examples can be used later as regression tests for generic voice, unsupported claims, missing provenance, forced calls to action, and long-form drift.

## Blocked by

None - can start immediately.

## User stories covered

- 1. Select any project, task, foundry context, or whole-system context.
- 2. Select multiple projects.
- 3. Select multiple tasks.
- 4. Provide a rough draft.
- 5. Generate from context without a rough draft.
- 16. Short-form drafts only.
- 17. 900-1300 character target.
- 18. Hard maximum around 1500 characters.
- 44. Clear draft-run contract.
- 45. No external LinkedIn writes.
- 47. Durable artifacts capture inputs and outputs.
