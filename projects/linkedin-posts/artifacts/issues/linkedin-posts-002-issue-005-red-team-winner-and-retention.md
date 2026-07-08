# Issue 005: Red-Team Review, Winner Recommendation, And Retention

## Parent

`linkedin-posts-002` - Create LinkedIn post generation workflow

## What to build

Complete the draft-run workflow by adding red-team review, winner
recommendation, durable artifact retention, and fixture-ready closeout. The
workflow should flag weak or risky drafts before recommending one winning
short-form draft with rationale.

The completed slice should produce a durable draft-run artifact that can be
used for review, voice-profile approval, and future regression testing.

## Acceptance criteria

- [ ] Every candidate draft receives a red-team pass before a winner is recommended.
- [ ] The red-team pass flags cringe, overclaiming, vague bragging, and unsupported hype.
- [ ] The workflow recommends one winning draft after reviewing candidate drafts.
- [ ] The winner rationale explains why the selected draft is strongest.
- [ ] The completed draft-run artifact stores inputs, selected context, candidates, scores, provenance, red-team findings, winner rationale, and voice-profile update proposal when applicable.
- [ ] Completed draft runs are stored as durable project artifacts and are not only returned in chat.
- [ ] Completed draft runs can be used as examples for future runs.
- [ ] Completed draft runs can be used as regression fixture candidates.
- [ ] Completed draft runs can support manual voice-profile update review.
- [ ] The completed workflow does not post, schedule, send, publish, or modify external LinkedIn state.
- [ ] The completed workflow does not mutate source project trackers by default.

## Blocked by

- `linkedin-posts-002-issue-004-candidate-drafting-provenance-scoring`

## User stories covered

- 21. Recommend a winner.
- 22. Winner rationale.
- 40. Red-team pass.
- 41. Completed draft runs saved.
- 42. Completed runs support regression fixtures.
- 43. Completed runs support voice-profile review.
- 45. No external LinkedIn writes.
- 46. Preserve source project boundaries.
- 47. Durable artifacts capture inputs and outputs.
- 48. PRD split into implementation issues.
