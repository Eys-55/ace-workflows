# Health 006 Standalone Workflow Review

Task: `health-006`
Date: 2026-07-08
Reviewed product: `/Users/acecanacan/Documents/philippines-health-coverage`
Primary output boundary: standalone workflow product for people, not a foundry-local runtime.

## Executive Read

The standalone `philippines-health-coverage` repo is a credible v1 workflow
pack. It has the important foundations: six clear skills, explicit no-PHI and
no-medical-advice boundaries, package metadata, product data under `artifacts/`,
fixtures under `evals/`, deterministic validators under `scripts/`, and a
manifest that states it has no runtime dependency on this foundry or on
`real-life-workflows`.

The biggest gap is not safety or package structure. The biggest gap is product
experience. Today it is mostly a skill pack for an agentic engineer who already
knows what to invoke. It is not yet a full standalone workflow for ordinary
people trying to understand Philippine health coverage. It needs stronger user
journeys, guided intake, evidence freshness operations, output examples, audit
scoring, and a release gate that proves answers remain useful and safe across
real questions.

## Sources Reviewed

- Standalone repo: `README.md`, `AGENTS.md`, `package.json`,
  `skill-manifest.json`.
- Standalone skills: `coverage-source-research`, `coverage-entity-lookup`,
  `coverage-provider-deep-dive`, `coverage-type-compare`,
  `coverage-navigator`, `coverage-evidence-audit`.
- Standalone references: `workflow-contracts.md`, `safety-boundaries.md`,
  `artifact-map.md`.
- Standalone evals: `skill-behavior-fixtures.json`,
  `philippines-health-coverage-eval-fixtures.json`.
- Standalone validation: `npm run validate`, which passed with 39 entities, 15
  product surfaces, 4 source roles, 6 navigator routes, and 6 skill fixtures.
- Real Life Workflows packet:
  `projects/health/artifacts/workflow-packets/health-006-real-world-comparison-packet.md`.
- Existing Real Life Workflows reference packets:
  `healthcare-pediatrics.md`, `document-evidence.md`,
  `high-stakes-compliance.md`.
- Read-only catalog queries for insurance/claims/reimbursement evidence,
  public-source comparison audit, and human-review workflow patterns.

## Self-planning Decisions

Question: Who is this for?
Answer: People trying to understand Philippine health coverage, plus the agent
runtime helping them. The engineer is secondary. The current repo still speaks
more to the engineer than to the person.

Question: What is the one job the product must do?
Answer: Help a person turn a fuzzy coverage question into a source-grounded,
human-review-ready research packet without crossing into advice, eligibility,
claim, network, ranking, or purchase decisions.

Question: What should be true after a successful run?
Answer: The user has a plain-language explanation of what category they are
asking about, which sources support the answer, what remains unknown, who must
verify it, and what exact next questions they should ask HR, PhilHealth, an HMO,
an insurer, a hospital billing desk, or a licensed advisor.

Question: What real-world workflow pattern should govern this?
Answer: Evidence-packet plus navigator plus human-review handoff. The best
adjacent patterns are due diligence, public-source audit, compliance packet,
literature review, QA review, and document ingestion. Medical workflows are
useful for boundaries, but direct clinical workflow copying is inappropriate.

Question: What proves the product works?
Answer: Scenario fixtures, not only contract checks. The current validators
prove repo shape and artifact shape. The next proof should run the skills
against realistic question paths and verify source grounding, blocked decisions,
next questions, and human handoff quality.

## What Is Already Strong

1. Standalone boundary is explicit.

The manifest says `standalone: true`, `depends_on_foundry_paths: false`, and
`depends_on_real_life_workflows: false`. That is the right product contract.
The foundry is the factory; the shipped repo is the product.

2. Skill surface is coherent.

The six skills cover a sensible v1 ladder:

- find and classify sources
- classify an entity
- deep dive one provider or coverage surface
- compare coverage categories without ranking
- route questions through a navigator
- audit evidence and safety leakage

This is a good minimum viable workflow pack. It is not just one broad prompt.

3. Safety boundary is unusually clear for a healthcare-adjacent workflow.

The repo repeatedly blocks PHI, patient documents, medical advice, eligibility
decisions, coverage determinations, claims decisions, provider-network
verification, rankings, and purchase recommendations. That is essential for a
public-source health coverage literacy product.

4. Product data is inspectable.

The registry, product catalog, source atlas, comparison-readiness matrix,
navigator flow, Maxicare packet, and eval fixtures are stored as first-class
artifacts. This is better than hiding everything in prose.

5. Validation exists.

`npm run validate` passed. The package checks skill count, required support
files, artifacts, and skill contracts. This gives v1 a release baseline.

## Main Findings

### Finding 1: The product lacks a people-first entry experience

Current state:

The README lists skills and gives runtime prompts. That works for an agentic
engineer, but an ordinary user does not start with "which skill should I call?"
They start with a situation:

- "My employer says we have an HMO. What does that mean?"
- "Is PhilHealth enough?"
- "What should I ask before choosing a plan?"
- "Can this provider page prove coverage?"
- "I have a reimbursement question, where do I start?"

Real-world comparison:

The Real Life Workflows catalog repeatedly surfaces navigator, QA, due
diligence, compliance, and public-source audit patterns that start by routing a
messy request into an evidence path. A standalone product should expose that
route as the front door, not ask the user to pick among six skills.

Improvement:

Add a user-facing `coverage-intake` or strengthen `coverage-navigator` into the
default first-run skill. Its job should be to classify the user's situation,
refuse blocked decisions early, and route to the next skill with a packet
outline.

### Finding 2: The current output contract is structurally right but too thin

Current state:

Every skill must return:

```json
{
  "query": "",
  "sources_used": [],
  "confidence_boundary": "",
  "human_review_required": true,
  "blocked_decisions": [],
  "next_questions": []
}
```

This is a good shared core. But for people, it omits the fields that turn
research into action:

- `plain_language_summary`
- `what_this_can_help_with`
- `what_this_cannot_decide`
- `recommended_human_reviewer`
- `handoff_packet`
- `source_freshness`
- `evidence_gaps`
- `user_next_step`

Real-world comparison:

Due diligence, QA, compliance, and GRC workflow patterns do not stop at "sources
used". They produce issue logs, exception lists, review gates, and next-action
packets.

Improvement:

Keep the shared core, but add a people-facing `handoff` section to every skill
output. This should be validated by fixtures.

### Finding 3: The workflow has safety refusals but not enough safe redirects

Current state:

The stop conditions are strong. They prevent blocked behavior. The product is
less specific about what the user gets after refusal.

Example:

If the user asks "Will my hospital bill be covered?", the product should not
only refuse coverage determination. It should route the person to a
claim/coverage handoff checklist:

- plan document or certificate of coverage
- HMO hotline or member portal
- hospital billing desk
- HR benefits admin
- PhilHealth eligibility/channel check
- documents to ask for, without processing PHI

Real-world comparison:

Compliance and due diligence workflows use exception handling: blocked or
unknown items become reviewer questions. A blocked item is not a dead end; it is
a handoff.

Improvement:

Add refusal templates by blocked-decision type. Each template should return a
safe public-source explanation, reviewer role, and exact next questions.

### Finding 4: Freshness is acknowledged but not operationalized

Current state:

Skills say they should state `last_checked_at` and require current
verification before external use. The data has `last_checked_at`, but the
workflow does not yet provide a refresh protocol.

Real-world comparison:

Public-source audit and literature-review workflows need freshness windows,
source status, and recency gates. Security/GRC and due diligence patterns also
separate current evidence from stale reference material.

Improvement:

Add a `coverage-source-refresh` workflow or extend `coverage-source-research`
with refresh modes:

- `check-current-source`
- `refresh-entity`
- `refresh-product-surface`
- `mark-source-stale`
- `needs-human-verification`

Do not automate claims from web freshness alone. The output should say whether
the local artifact is stale, whether the public source was checked, and whether
human verification remains required.

### Finding 5: The product needs example outputs

Current state:

The README includes example prompts, but not example outputs. A user cannot see
what a good result looks like.

Real-world comparison:

Workflow packets, due diligence reports, literature reviews, QA audits, and
content review workflows are easier to trust when they show a representative
packet shape.

Improvement:

Add `examples/` with compact sample outputs for:

- entity lookup: Maxicare
- category comparison: PhilHealth vs HMO vs private insurance
- provider deep dive: Maxicare
- refusal: "Will my hospital bill be covered?"
- source audit: provider page vs regulator source

Each example should include the shared output fields and the new handoff
section.

### Finding 6: Coverage comparison is careful, but not yet decision-useful

Current state:

`coverage-type-compare` compares normalized fields and blocks ranking. This is
correct. But users still need a way to understand differences without being told
what to buy.

Real-world comparison:

Financing, capital markets, and due diligence workflows compare options through
assumptions, missing evidence, source traceability, and reviewer caveats. They
do not need to rank options to be useful.

Improvement:

Add comparison outputs that make differences legible:

- category purpose
- who usually verifies it
- source authority level
- typical documents to request
- questions to ask before relying on it
- fields that cannot be compared from public sources

This keeps the no-ranking boundary while giving people more value.

### Finding 7: The audit skill should produce severity and release-readiness

Current state:

`coverage-evidence-audit` can flag missing fields, source grounding, stale
evidence, and boundary leakage. It does not define severity levels or release
readiness.

Real-world comparison:

QA, test-suite, security/GRC, and documentation audit workflows use scoring,
severity, and release-gate language. That is useful here because health coverage
outputs are high-stakes even when they are educational.

Improvement:

Add audit severity:

- `critical`: PHI, medical advice, eligibility/coverage/claims decision,
  ranking, purchase recommendation
- `high`: unsupported authority claim, stale source used as current proof,
  missing human-review boundary
- `medium`: missing source role, unclear confidence boundary, weak next
  questions
- `low`: formatting or completeness issue

Add `release_readiness: blocked | needs_review | acceptable_for_education`.

### Finding 8: The standalone package lacks a scenario-level eval harness

Current state:

The package has fixtures and validators, but they mainly validate structure and
expected/forbidden behavior descriptions. They do not execute skill-like
scenario checks end to end.

Real-world comparison:

Test-suite and QA workflows evaluate whether the product behaves correctly from
the user's entry point through output. The current health product has enough
artifacts to support this.

Improvement:

Add scenario fixtures with expected JSON outputs or assertions:

- fuzzy user asks "I need to understand my company HMO"
- blocked claims question
- provider page authority overclaim
- comparison request with "which is best"
- unknown entity lookup
- stale artifact/source question

Add a deterministic `validate-scenarios.mjs` that checks required fields,
blocked decisions, reviewer handoff, source role, and next questions.

### Finding 9: The workflow has no explicit user roles

Current state:

The skills accept optional context such as user role, but the product does not
define user personas or role-specific handoffs.

Real-world comparison:

Operational workflows usually know who is acting: consumer, HR admin, benefits
broker, hospital billing staff, provider support, researcher, auditor. Role
affects the right handoff and the questions to ask.

Improvement:

Define safe personas:

- employee/member trying to understand employer HMO
- individual researching PhilHealth/HMO/insurance categories
- HR/admin preparing educational benefits material
- researcher/auditor checking public-source evidence
- agentic engineer extending the package

Do not add patient-specific personas requiring PHI or documents.

### Finding 10: The source atlas needs authority hierarchy and freshness policy

Current state:

The source atlas has 4 source roles. That is a start. The review evidence shows
the product needs stronger authority distinctions:

- regulator/public authority
- public payer
- HMO/insurer/provider-published
- employer/HR document
- broker/marketplace
- hospital/provider billing desk
- secondary explainer

Real-world comparison:

Public-source audit and literature review patterns distinguish source type,
authority, recency, and what claims the source can support.

Improvement:

Expand the source atlas with:

- `can_prove`
- `cannot_prove`
- `freshness_window`
- `verification_owner`
- `safe_user_action`
- `stale_if`

### Finding 11: The product is currently Philippines-first but not
expansion-ready in its UX

Current state:

The manifest and package identity are Philippines-first. That is right. The
schemas could later extend to other countries, but the user experience does not
yet explain why Philippines-specific sources matter.

Improvement:

Add a short user-facing reference:

- what PhilHealth is in this workflow
- what an HMO is in this workflow
- what private health insurance is in this workflow
- how employer benefits, hospital billing, and provider networks fit
- why the agent cannot decide eligibility or claims

This should be educational, not legal, medical, or financial advice.

### Finding 12: The workflow needs a "packet first" product mode

Current state:

Each skill describes an output, but there is no single named artifact a person
is trying to obtain.

Real-world comparison:

The strongest adjacent workflows produce named packets: due diligence packet,
evidence audit packet, literature review packet, QA report, closing checklist,
financing comparison table.

Improvement:

Define the primary output as a `coverage-research-packet`:

- user question
- route taken
- entities/categories involved
- public sources used
- source roles and freshness
- plain-language summary
- what is known
- what is not known
- blocked decisions
- reviewer handoff
- next questions

Then make each skill either create, enrich, compare, route, or audit that
packet.

## Comparison Matrix

| Real-world pattern | What it teaches | Health product status | Improvement |
| --- | --- | --- | --- |
| Due diligence | Multi-lane evidence, issue logs, reviewer gates | Partially present through source atlas and audit | Add evidence gaps, reviewer owner, and handoff packet |
| Compliance/GRC | Severity, audit readiness, approval gates | Boundary rules present | Add severity and release readiness |
| Literature review | Source search, citation/provenance, synthesis limits | Source grounding present | Add source freshness and citation-style examples |
| Document ingestion | Preserve source identity and extraction confidence | No document handling by design | Copy confidence/caveat pattern without handling PHI |
| QA/test-suite | Scenario coverage and release gate | Structural validation exists | Add scenario-level eval harness |
| UX audit | User journey, accessibility, screen/output quality | Not present | Add people-first README and examples |
| Financing/comparison | Compare without deciding for user | Comparison skill blocks ranking | Add assumptions, missing evidence, and reviewer questions |
| Security/GRC | Evidence-first report and high-stakes boundary | Good safety boundary | Add audit severity and release readiness |
| Public service navigator | Route fuzzy user needs to forms/sources/roles | Navigator exists | Make navigator the default entry point |
| Medical document workflows | Packet assembly and review handoff | PHI blocked correctly | Copy packet/handoff structure, not patient-document handling |

## Product Boundary Recommendation

Keep these in the standalone repo:

- skills and runtime interfaces
- source atlas, registry, catalog, navigator, comparison matrix
- example outputs
- scenario fixtures
- validators and package smoke checks
- user-facing README and safety references
- release checklist

Keep these in the foundry:

- manufacturing review artifacts
- Real Life Workflows comparison packets
- task trackers
- dependency provenance
- future planning notes before they are promoted

Do not make the standalone repo depend on:

- `projects/health/`
- `projects/real-life-workflows/`
- foundry tracker JSON
- quarantined imported skills

## Priority Recommendations

1. Make `coverage-navigator` the default people-first entry point.
2. Define `coverage-research-packet` as the canonical output artifact.
3. Add refusal-to-handoff templates for blocked decisions.
4. Expand the source atlas with authority hierarchy and freshness policy.
5. Add example outputs for the top five user journeys.
6. Add scenario-level eval fixtures and a deterministic scenario validator.
7. Upgrade `coverage-evidence-audit` with severity and release readiness.
8. Add a user-facing `references/philippines-coverage-primer.md`.
9. Add a release checklist that combines validation, scenario evals, source
   freshness, package dry-run, and evidence audit.
10. Later, add optional UI or CLI wrappers only after the skill workflows are
    proven by examples and scenario evals.

## What Not To Do

- Do not turn the product into medical, claims, or coverage advice.
- Do not accept PHI or patient documents.
- Do not rank HMOs or insurers.
- Do not present public marketing pages as regulator proof.
- Do not copy quarantined workflow material as active skills.
- Do not make the standalone repo read foundry-local paths at runtime.
- Do not build a UI before the packet contract and scenario evals are stronger.

## Bottom Line

This is a good v1 skill pack. To become a standalone workflow for people, it
needs to stop presenting itself primarily as six skills and start presenting
itself as a guided coverage-research workflow that produces a safe,
source-grounded, human-review-ready packet.
