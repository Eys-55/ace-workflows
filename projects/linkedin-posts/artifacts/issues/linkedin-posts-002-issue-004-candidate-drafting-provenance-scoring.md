# Issue 004: Candidate Drafting, Provenance, And Scoring

## Parent

`linkedin-posts-002` - Create LinkedIn post generation workflow

## What to build

Generate multiple short-form LinkedIn candidate drafts from the ready-to-draft
run record. Each candidate should have a distinct angle, preserve source-backed
claim boundaries, label personal reflection, include per-candidate provenance,
and receive quality scores.

The completed slice should produce candidate drafts that are useful to review
without yet choosing a winner.

## Acceptance criteria

- [ ] The workflow generates multiple candidate drafts with distinct angles.
- [ ] Candidate drafts are short-form only.
- [ ] Candidate drafts target 900-1300 characters and stay under the hard maximum around 1500 characters.
- [ ] Candidate drafts optimize primarily for personal credibility.
- [ ] Project or workflow usefulness appears as supporting evidence, not the whole point.
- [ ] Candidate drafts use a humble builder voice by default.
- [ ] Candidate drafts avoid emojis and hashtags by default unless explicitly requested.
- [ ] Candidate drafts prefer specific implementation details over broad strategic narrative.
- [ ] Candidate drafts explain why implementation details matter.
- [ ] Source-backed claims are separated from user reflections.
- [ ] Personal reflection is allowed only when labeled as reflection.
- [ ] Each candidate draft includes a provenance block naming projects, tasks, and context claims that informed it.
- [ ] Each candidate draft includes quality scores for credibility, voice match, evidence/provenance, specificity, and LinkedIn readability.

## Blocked by

- `linkedin-posts-002-issue-001-draft-run-contract`
- `linkedin-posts-002-issue-002-intake-context-and-grilling`
- `linkedin-posts-002-issue-003-voice-profile-approval`

## User stories covered

- 19. Multiple candidate drafts.
- 20. Distinct candidate angles.
- 23. Optimize for personal credibility.
- 24. Project usefulness supports credibility.
- 25. Humble builder voice.
- 26. Avoid emojis and hashtags by default.
- 27. Explicitly request emojis or hashtags when wanted.
- 28. Prefer implementation detail.
- 29. Explain why implementation details matter.
- 30. Separate source-backed claims from personal reflection.
- 31. Unsupported reflection allowed.
- 32. Candidate provenance.
- 33. Provenance per candidate.
- 34. Quality scores.
- 35. Credibility score.
- 36. Voice match score.
- 37. Evidence/provenance score.
- 38. Specificity score.
- 39. LinkedIn readability score.
