# Philippines Insurance and HMO Navigator PRD

## Problem Statement

Filipinos often need to understand PhilHealth, HMOs, and private insurance at
the same time, but the information is fragmented across government pages,
Insurance Commission lists, provider websites, product pages, FAQs, and agent
materials. The current task is to build a workflow foundation that can later
power a user-facing navigator without confusing entity names, duplicate brands,
unverified providers, plan marketing language, or unsupported recommendations.

## Solution

Build an agentic workflow system for Philippines health coverage literacy. The
system starts with a canonical registry and source atlas, then grows into plan
extraction, provider deep dives, comparison workflows, and a drilling-style
navigator.

The first build milestone is a canonical registry with PhilHealth as the
primary anchor, HMOs second, and major insurance companies third. The registry
must separate entity types, normalize aliases, cite sources, and support later
deduplication and extraction work.

## User Stories

1. As a Filipino consumer, I want to understand what PhilHealth is, so that I
   know how it differs from an HMO or private insurance.
2. As a Filipino consumer, I want to know whether a provider is an HMO,
   insurer, public payer, broker, or product brand, so that I do not compare
   unlike things.
3. As a Filipino consumer, I want a plain-English explanation of HMO vs health
   insurance vs PhilHealth, so that I can ask better questions before buying or
   enrolling.
4. As a Filipino consumer, I want to compare multiple HMOs, so that I can see
   differences in coverage type, network, reimbursement, and limitations.
5. As a Filipino consumer, I want to deep dive into one HMO, so that I can see
   its plans, source pages, and questions to verify.
6. As a Filipino employee, I want to understand my company HMO, so that I know
   what to ask HR, the HMO helpdesk, or a hospital billing desk.
7. As a self-employed Filipino, I want to understand individual/family HMO and
   insurance options, so that I can identify what sources to read next.
8. As an OFW or family member, I want to understand whether a product is local,
   travel, emergency, or broader medical coverage, so that I avoid false
   assumptions.
9. As a user with preferred doctors or hospitals, I want to know that provider
   network verification is a separate step, so that I do not assume coverage
   from a marketing page alone.
10. As a workflow operator, I want a canonical entity registry, so that repeated
    research does not create duplicates for the same HMO or insurer.
11. As a workflow operator, I want aliases and former names captured, so that
    source pages can be matched to the right canonical entity.
12. As a workflow operator, I want each entity tied to source evidence, so that
    the navigator can explain where its information came from.
13. As a workflow operator, I want every registry entry to have a last-checked
    date, so that currentness is visible.
14. As a workflow operator, I want to distinguish official regulator sources
    from provider marketing pages, so that confidence levels are explicit.
15. As a workflow operator, I want comparison output to cite normalized fields,
    so that the agent does not compare arbitrary prose.
16. As a workflow operator, I want deep-dive packets for specific HMOs, so that
    plan extraction can happen provider by provider.
17. As a workflow operator, I want eval gates for HMO vs insurance vs PhilHealth
    distinction, so that the agent does not blur regulated categories.
18. As a workflow operator, I want the system to refuse purchase, coverage, or
    claims decisions, so that the output remains educational.
19. As a workflow operator, I want future skills to be built on the registry,
    so that source discovery, extraction, comparison, and answer composition
    use the same canonical IDs.
20. As a workflow operator, I want the first milestone to be small and
    verifiable, so that later skills can safely build on it.

## Implementation Decisions

- Build PhilHealth, HMOs, and major insurance companies as separate entity
  types from day one.
- Treat PhilHealth as the primary anchor because users need to understand the
  public baseline before HMO or private insurance.
- Use the Insurance Commission as the authority source for regulated insurance
  and HMO entity lists.
- Use provider websites only as provider/product sources, not as proof that an
  entity is regulator-authorized.
- Record official source URLs and source categories on each registry entry.
- Store canonical IDs in lowercase kebab case.
- Store aliases, former names, brand names, and product names separately.
- Include source currentness metadata such as `last_checked_at`.
- Treat HMO product extraction, comparison, and navigator questions as later
  milestones after the registry exists.
- Do not build a recommender in the first milestone.
- Do not provide medical, legal, financial, claims, or coverage advice.

## Testing Decisions

- The first seam is the registry artifact itself.
- A deterministic validator should check schema shape, unique canonical IDs,
  unique entity/source IDs, required source evidence, entity type separation,
  and duplicate alias collisions.
- Tests should validate behavior at the artifact boundary, not internal
  implementation details.
- Later tests should add fixture comparisons for HMO vs insurer vs PhilHealth
  classification, source confidence, and duplicate prevention.

## Out Of Scope

- No user-facing navigator UI in the first milestone.
- No plan recommendation, ranking, purchase advice, or claims decisioning.
- No automated scraping of provider pages in the first milestone.
- No complete extraction of every plan from every HMO in the first milestone.
- No promotion of workflow packet evidence into active skills in this task.

## Further Notes

Initial source anchors include PhilHealth public pages, Insurance Commission
regulated-entity lists and HMO circulars, HMO provider pages, and Insurance
Commission performance reports for large insurer seed selection.
