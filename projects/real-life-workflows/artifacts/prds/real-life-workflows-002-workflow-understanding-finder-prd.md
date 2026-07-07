# Workflow Understanding Finder PRD

## Problem Statement

The project has a quarantined catalog with 171 workflow doors. Those rows are
not finished workflows. They are access points into a much larger workflow
universe that may contain thousands of leaf workflows.

The user needs a general-purpose way to ask, "What type of work or workflow am
I trying to understand?" and receive a deep, reader-first packet of relevant
workflow examples. The packet must help the user understand real-world workflow
patterns before deciding whether to build, extract, rewrite, or promote any
skill.

The current draft plan over-focuses on promoting doors into skills. That is a
later optional outcome. The primary product is a universal workflow-understanding
finder for any domain, work area, and reader.

## Solution

Build a workflow-understanding finder that treats the 171 rows as router doors.
For each user query, the system should:

1. Ask the universal intake question when needed: "What type of work or
   workflow are you trying to understand?"
2. Sweep all 171 doors.
3. Expand the best-matching doors into deeper candidate workflows.
4. Deep-read the strongest direct and adjacent candidates.
5. Produce a saved Markdown packet for the user to read and share with other
   agents.

The packet should be broad when the match set is broad. It may include up to
about 50 visible workflow recommendations when many matches are genuinely
relevant. It should still remain readable by grouping entries into four fixed
categories:

1. Direct Matches
2. Strong Adjacent Matches
3. Supporting Building Blocks
4. Maybe Useful

Every packet must include all four categories, even when a category is empty.

## User Stories

1. As a reader, I want to ask what type of work or workflow I am trying to
   understand, so that I can explore any domain without first knowing the exact
   workflow name.
2. As a reader, I want the finder to work for any work area, so that healthcare,
   education, finance, legal, logistics, research, sales, compliance, support,
   document work, and other domains all use the same intake model.
3. As a reader, I want the system to query all 171 doors, so that useful
   matches are not missed by a narrow first guess.
4. As a reader, I want the system to expand matched doors, so that the packet
   reflects the larger workflow universe behind the doors.
5. As a reader, I want a deep packet by default, so that I can understand the
   workflow landscape instead of receiving a shallow top-k list.
6. As a reader, I want up to about 50 visible recommendations when many results
   are relevant, so that broad searches are not artificially compressed.
7. As a reader, I want every packet to use the same four categories, so that I
   can compare packets across unrelated domains.
8. As a reader, I want every visible recommendation to explain why it matters,
   so that I can scan a large packet without opening every source.
9. As a reader, I want every recommendation to explain why it is here, so that
   I can distinguish direct matches from related patterns.
10. As a reader, I want every recommendation to summarize what it does, so that
    I can understand the workflow's practical job.
11. As a reader, I want source links and local door/source paths, so that I or
    another agent can later inspect or extract from the original material.
12. As a reader, I want reliability shown as a label, so that source quality is
    visible without becoming the main sorter.
13. As a reader, I want workflow usefulness to drive ranking, so that the most
    valuable patterns appear before merely well-sourced but less useful ones.
14. As a reader, I want related support workflows included when useful, so that
    supporting building blocks such as document processing, compliance, PHI,
    review, or evidence extraction are not lost.
15. As a reader, I want the packet saved as Markdown, so that I can read it
    later or hand it to another agent.
16. As a workflow operator, I want the 171 doors kept separate from the
    underlying leaf-workflow count, so that audits do not confuse access points
    with finished workflows.
17. As a workflow operator, I want the expanded workflow count quantified later,
    so that the system can prove whether the underlying corpus is closer to ten
    thousand workflows.
18. As a workflow operator, I want build, extraction, and skill creation treated
    as optional follow-up outcomes, so that discovery does not prematurely
    become implementation.
19. As a workflow operator, I want high-stakes domains to preserve human review
    boundaries, so that workflow packets do not imply medical, legal, financial,
    compliance, engineering, or safety conclusions.
20. As a workflow operator, I want broken or weak sources labeled rather than
    discarded automatically, so that useful but unverified patterns can still be
    considered with caution.

## Implementation Decisions

- The primary product is a universal workflow-understanding finder, not a
  domain-specific healthcare finder and not a skill-promotion pipeline.
- The 171 imported rows are workflow doors. They must be treated as router
  access points, not as finished workflows.
- The finder should use the door catalog as a search and routing layer.
- The search process should sweep all 171 doors for each user query.
- Matched doors should be expanded on query into deeper candidate workflows.
- Strong direct matches and promising adjacent matches should be deep-read
  before the packet is finalized.
- The default packet should be deep enough to reason across expanded candidates.
- The visible recommendation cap should be about 50 when many matches are
  genuinely useful.
- The packet should not inline full workflow or skill text. It should include
  links and local paths for later extraction.
- Reliability should be visible as metadata, but workflow usefulness should be
  the primary ranking concern.
- The packet should be reader-first Markdown, not machine-first JSON.
- The packet should always contain the four fixed categories: Direct Matches,
  Strong Adjacent Matches, Supporting Building Blocks, and Maybe Useful.
- Empty categories should still be shown.
- Every visible recommendation should include this entry shape:

```text
### Workflow name

- Why it matters:
- Why it is here:
- What it does:
- Source link:
- Local door/source path:
- Reliability:
- Possible skill to extract:
```

- The highest testing seam is the full behavior from a raw workflow-understanding
  request to a saved Markdown packet.
- The current quarantine remains untrusted. No imported skill should be promoted
  into the canonical `.agents/skills` surface as part of this PRD.
- The previous door-catalog properization draft is treated as inspection
  history. This PRD supersedes it for issue splitting.

## Testing Decisions

- Test the feature at the packet-output seam rather than at every internal
  ranking step.
- Use fixture queries that exercise different breadth levels:
  1. a narrow query with a small natural result set;
  2. a broad query that should produce many matches, capped near 50;
  3. a query that should surface supporting building blocks;
  4. a query in a high-stakes area that must preserve human boundaries.
- A valid packet must include all four fixed categories.
- A valid visible recommendation must include `Why it matters`.
- A valid packet must include source links and local door/source paths for each
  visible recommendation.
- A valid packet must label source reliability without sorting primarily by
  reliability.
- A valid packet must avoid claiming that the catalog text proves correctness,
  compliance, safety, or suitability.
- A future audit must separately verify the door count and expanded leaf
  workflow count.

## Out Of Scope

- Promoting imported quarantine skills into `.agents/skills`.
- Building a user interface.
- Repairing all broken source URLs.
- Proving all underlying leaf workflows in one pass.
- Creating medical, legal, financial, compliance, safety, or engineering
  conclusions from catalog text.
- Replacing the Matt Pocock task flow with imported phase-shim skills.
- Treating 171 doors as the final workflow count.

## Further Notes

This PRD intentionally keeps the workflow broad. Pilot queries may use a domain
such as healthcare, pediatrics, or earthquake public evidence for testing, but
those pilots do not define the product boundary.

The next step is to split this PRD into implementation issues. The first issue
should define the packet contract and fixtures before any search or expansion
logic is implemented.
