# PRD: LinkedIn Post Generation Workflow

Task: `linkedin-posts-002`
Status: Issues drafted

## Problem Statement

The user wants a repeatable way to turn real workflow-building activity into
LinkedIn posts that build personal credibility. The source context may be a
single task, multiple tasks, one project, multiple projects, foundry-level
work, or the whole system. The workflow needs to work across those scopes
without treating scope as the product.

The current process is ad hoc. A chat session can summarize work into a post,
but it does not consistently preserve source provenance, user voice, target
audience, post intent, or quality review. That creates two risks:

- generic LinkedIn copy that does not sound like the user;
- polished claims that are hard to trace back to source context.

The user wants short draft-only LinkedIn posts that sound like a humble builder,
show concrete implementation detail, and make personal credibility legible
without overclaiming or drifting into vague hype.

## Solution

Build a draft-only LinkedIn post generation workflow.

The workflow accepts an arbitrary selected context set. The context set may
include any mix of projects, tasks, foundry state, whole-system context, and an
optional rough draft. Scope is not constrained to one default mode. The invariant
is that every source used by a draft remains traceable in the output.

Each run includes a post-level planning step before drafting. The planning step
captures:

- selected source context;
- target audience;
- low, medium, or high personalness level;
- user intent and framing;
- the user's exact wording and phrasing;
- optional rough draft input;
- optional desired reader action, when useful.

The workflow creates multiple short-form candidate drafts with distinct angles.
Drafts target 900-1300 characters, with a hard maximum around 1500 characters.
The workflow does not create long-form variants.

Each candidate draft includes:

- the draft text;
- angle summary;
- source-backed claims;
- user reflections, separated from source-backed claims;
- provenance block naming source projects, tasks, and context claims;
- quality scores for credibility, voice match, evidence/provenance,
  specificity, and LinkedIn readability;
- red-team findings for cringe, overclaiming, vague bragging, and unsupported
  hype.

After generating and scoring candidates, the workflow recommends one winning
draft and explains why. Completed draft runs are stored as durable project
artifacts, not only returned in chat, so they can become examples, future test
fixtures, and evidence for voice-profile evolution.

The workflow creates and reuses a durable voice profile for the user. Current
run wording still influences each draft, but reusable voice-profile updates
require explicit manual approval. Draft runs may propose profile changes; they
must not silently mutate the profile.

The first version is draft-only. It must not post, schedule, send, publish, or
modify LinkedIn or any other third-party system.

## User Stories

1. As Ace, I want to select any project, task, foundry context, or whole-system
   context, so that I can draft posts from whatever work is currently worth
   sharing.
2. As Ace, I want to select multiple projects, so that a post can connect
   patterns across unrelated workflow work.
3. As Ace, I want to select multiple tasks, so that a post can explain a
   meaningful through-line instead of one isolated change.
4. As Ace, I want to provide a rough draft, so that the workflow can tighten an
   idea I already started.
5. As Ace, I want the workflow to generate from context without a rough draft,
   so that I can get candidate posts from raw work state.
6. As Ace, I want a planning step before drafting, so that the workflow captures
   what I actually mean before it writes.
7. As Ace, I want my wording during planning to influence the post, so that the
   output sounds like me.
8. As Ace, I want a reusable voice profile, so that the workflow gets better at
   matching my style over time.
9. As Ace, I want voice-profile updates to require manual approval, so that
   casual wording does not silently drift my reusable voice.
10. As Ace, I want the workflow to propose voice-profile updates, so that I can
    improve the profile deliberately.
11. As Ace, I want the current run's wording to override stale profile
    assumptions, so that the draft reflects the live intent of the post.
12. As Ace, I want the workflow to ask for target audience, so that it does not
    frame technical details for the wrong reader.
13. As Ace, I want to set a low, medium, or high personalness level, so that I
    can control how much personal reflection appears.
14. As Ace, I want desired reader action to be optional, so that not every post
    is forced into a call to action.
15. As Ace, I want the workflow to suggest a reader action when useful, so that
    I can decide whether the post needs one.
16. As Ace, I want short-form drafts only, so that the workflow produces concise
    posts rather than essays.
17. As Ace, I want a 900-1300 character target, so that drafts have room for
    implementation detail without bloating.
18. As Ace, I want a hard maximum around 1500 characters, so that drafts stay
    readable in the feed.
19. As Ace, I want multiple candidate drafts, so that I can compare different
    angles before choosing.
20. As Ace, I want candidate drafts to have distinct angles, so that the options
    are meaningfully different.
21. As Ace, I want the workflow to recommend a winner, so that it makes a
    judgment call instead of only handing me options.
22. As Ace, I want the winner rationale, so that I understand why one draft is
    stronger.
23. As Ace, I want posts optimized for personal credibility, so that readers see
    my judgment and automation ability.
24. As Ace, I want project usefulness to support credibility, so that the post
    is grounded in real work.
25. As Ace, I want a humble builder voice, so that the post feels concrete and
    credible rather than inflated.
26. As Ace, I want drafts to avoid emojis and hashtags by default, so that they
    do not feel like generic LinkedIn content.
27. As Ace, I want to explicitly request emojis or hashtags when I want them,
    so that the default can remain restrained.
28. As Ace, I want drafts to prefer implementation detail, so that my technical
    credibility comes from specifics.
29. As Ace, I want drafts to explain why implementation details matter, so that
    non-specialist readers can still follow the point.
30. As Ace, I want source-backed claims separated from personal reflection, so
    that the post can include interpretation without confusing it for evidence.
31. As Ace, I want unsupported reflection allowed, so that the post can still
    sound human.
32. As Ace, I want every candidate draft to include provenance, so that I can
    trace claims back to tasks and projects.
33. As Ace, I want provenance per candidate, so that one strong draft does not
    hide weak evidence in another.
34. As Ace, I want quality scores, so that weak drafts are easy to reject.
35. As Ace, I want quality scores for credibility, so that the workflow judges
    whether the post builds trust.
36. As Ace, I want quality scores for voice match, so that the workflow checks
    whether the post sounds like me.
37. As Ace, I want quality scores for evidence/provenance, so that unsupported
    claims are visible.
38. As Ace, I want quality scores for specificity, so that generic posts are
    penalized.
39. As Ace, I want quality scores for LinkedIn readability, so that drafts are
    suitable for the platform without becoming generic.
40. As Ace, I want a red-team pass, so that cringe, overclaiming, vague
    bragging, and unsupported hype are caught before recommendation.
41. As Ace, I want completed draft runs saved, so that good examples can become
    future references.
42. As Ace, I want completed runs to support regression fixtures, so that the
    workflow can improve without losing its original quality bar.
43. As Ace, I want completed runs to support voice-profile review, so that voice
    updates are based on concrete examples.
44. As a future maintainer, I want a clear draft-run contract, so that
    generation, scoring, red-team review, and artifact storage can be tested.
45. As a future maintainer, I want no external LinkedIn writes, so that the
    first version stays inside the repo's safe draft boundary.
46. As a future maintainer, I want the workflow to preserve source project
    boundaries, so that generating posts does not mutate source project
    trackers.
47. As a future maintainer, I want durable artifacts to capture inputs and
    outputs, so that later issues can use them as fixtures.
48. As a future maintainer, I want the PRD split into issues before
    implementation, so that each workflow slice can be built and reviewed
    independently.

## Implementation Decisions

- Treat the first version as draft-only.
- Do not integrate with LinkedIn posting, scheduling, messaging, or publishing.
- Accept arbitrary selected context scopes rather than one default scope.
- Preserve provenance for every included project, task, and system source.
- Keep source project trackers read-only by default during post generation.
- Support two input modes:
  1. generate from selected context plus planning;
  2. revise an existing rough draft using selected context plus planning.
- Use a post-level planning step for every run.
- Require target audience during planning.
- Require a low, medium, or high personalness level during planning.
- Do not require a desired reader action.
- Allow the workflow to suggest a reader action when useful.
- Treat user wording during planning as voice source material.
- Create and reuse a durable user voice profile.
- Require explicit manual approval before updating the reusable voice profile.
- Allow a run to propose voice-profile updates without applying them.
- Give current-run wording priority when it conflicts with reusable profile
  assumptions.
- Produce short-form drafts only.
- Target 900-1300 characters, with a hard maximum around 1500 characters.
- Generate multiple candidate drafts with distinct angles.
- Optimize primarily for the user's personal credibility.
- Use project or workflow usefulness as supporting evidence.
- Use a humble builder voice by default.
- Avoid emojis and hashtags by default unless explicitly requested.
- Prefer specific implementation details over broad strategic narrative.
- Explain why implementation details matter.
- Separate source-backed claims from user reflections.
- Permit personal reflection when it is labeled as reflection.
- Include a provenance block under each candidate draft.
- Score every candidate draft on credibility, voice match,
  evidence/provenance, specificity, and LinkedIn readability.
- Run a red-team pass before recommending a winner.
- Red-team for cringe, overclaiming, vague bragging, and unsupported hype.
- Recommend one winning draft with rationale.
- Store completed draft runs as durable project artifacts.
- Use completed draft runs as examples, voice-profile review material, and
  regression fixture candidates.
- The highest testing seam should be the full draft-run behavior: selected
  context and planning inputs in, durable draft-run artifact out.
- If deterministic helpers are needed, keep them as validation or query helpers
  rather than moving workflow logic out of the skill surface.

## Testing Decisions

- Test the workflow at the highest behavior seam: a full draft run from input
  context to saved draft-run artifact.
- Use fixtures that include one single-task context, one multi-task context,
  one multi-project context, and one rough-draft revision input.
- A valid run must record the selected context sources.
- A valid run must include target audience and personalness level.
- A valid run may omit desired reader action.
- A valid run must preserve user wording captured during planning.
- A valid run must use the reusable voice profile when available.
- A valid run must not update the reusable voice profile without explicit
  approval.
- A valid output must contain multiple candidate drafts with distinct angles.
- A valid candidate draft must be short-form and stay under the hard maximum.
- A valid candidate draft must avoid emojis and hashtags by default.
- A valid candidate draft must include source-backed claims separately from user
  reflection.
- A valid candidate draft must include a provenance block.
- A valid candidate draft must include quality scores for all required rubric
  dimensions.
- A valid run must include red-team findings before the winner is recommended.
- A valid run must recommend one winning draft with rationale.
- A valid run must store a durable artifact with inputs, candidates, scores,
  provenance, red-team findings, winner rationale, and voice-profile update
  proposal when applicable.
- A valid run must not perform external LinkedIn actions.
- A valid run must not mutate source project trackers by default.
- Good tests should assert external behavior and artifact shape rather than
  private prompt wording.
- Regression fixtures should focus on preventing generic voice, unsupported
  claims, missing provenance, forced calls to action, and long-form drift.

## Out of Scope

- Posting to LinkedIn.
- Scheduling LinkedIn posts.
- Sending LinkedIn messages.
- Updating third-party accounts or credentials.
- Creating long-form post variants.
- Requiring a desired reader action for every post.
- Silently updating the reusable voice profile.
- Silently inferring target audience.
- Mutating source project trackers as part of post generation.
- Generating generic authority-style thought leadership.
- Using emojis or hashtags by default.
- Treating personal reflection as source-backed evidence.
- Building a visual user interface.
- Building analytics for published LinkedIn performance.

## Further Notes

This workflow is about credibility through concrete work. The best drafts should
make a reader understand the user's judgment, taste, and automation capability.
They should not merely summarize that a project exists.

The next step is to split this PRD into implementation issues. The first issue
should define the draft-run artifact contract and fixtures before any drafting
logic is implemented.
