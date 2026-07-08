# Issue 003: Voice Profile And Manual Approval

## Parent

`linkedin-posts-002` - Create LinkedIn post generation workflow

## What to build

Add reusable voice-profile support to the draft-run workflow. The run should be
able to read an approved user voice profile, use current-run wording as fresh
style input, and propose profile updates without applying them automatically.

The completed slice should preserve user control over voice drift. Current-run
wording can shape drafts immediately, but reusable profile changes require
explicit approval.

## Acceptance criteria

- [ ] A draft run can read a reusable voice profile when one exists.
- [ ] Current-run wording is captured separately from the reusable voice profile.
- [ ] Current-run wording can override stale profile assumptions for that run.
- [ ] The run can propose voice-profile updates based on completed draft evidence.
- [ ] Proposed voice-profile updates are stored as proposals, not applied changes.
- [ ] Reusable voice-profile updates require explicit manual approval.
- [ ] Casual grilling wording cannot silently mutate the reusable voice profile.
- [ ] Voice-profile evidence can point back to completed draft-run artifacts.

## Blocked by

- `linkedin-posts-002-issue-001-draft-run-contract`
- `linkedin-posts-002-issue-002-intake-context-and-grilling`

## User stories covered

- 7. User wording influences the post.
- 8. Reusable voice profile.
- 9. Manual approval for voice-profile updates.
- 10. Proposed voice-profile updates.
- 11. Current wording overrides stale profile assumptions.
- 25. Humble builder voice.
- 26. Avoid emojis and hashtags by default.
- 27. Explicitly request emojis or hashtags when wanted.
- 41. Completed draft runs become future references.
- 43. Completed runs support voice-profile review.
