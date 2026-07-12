# Foundational Philippines Health Coverage UI PRD

Task: `health-008`
Generated: 2026-07-12
Status: PRD

## Problem Statement

A person who is new to Philippine health coverage can open the standalone
workflow product today, but there is no visual surface that explains what the
product can help with, teaches the basic differences among PhilHealth, HMOs,
and private insurance, or lets the person begin a safe workflow without knowing
an internal skill name.

A blank assistant screen would force the user to invent the right question.
A technical dashboard would expose internal workflow language before the user
understands the domain. A wizard-only experience would hide useful educational
content until the user commits to a path. None of those approaches satisfies
the need for a beginner-friendly product that is immediately useful, visibly
navigable, and still grounded in the existing callable workflow.

The first UI milestone must therefore prove the real product boundary rather
than simulate a polished shell. A beginner must be able to orient themselves,
start one real intake workflow through the CLI and skill surface, understand
what is happening, and receive a valid coverage research packet. The browser
must not become a second agent, raw shell, source of medical or coverage
decisions, or collector of protected health information.

## Solution

Build a foundational local browser sidecar as a calm beginner learning hub.
The opening surface combines a prominent guided starting action with scannable
coverage-basics cards and a clear preview of the safe jobs the product can do.
It is useful before the user submits anything and remains navigable without
forcing a chat-first or wizard-only journey.

The tracer flow begins with the existing employer-HMO beginner scenario. The
user selects that they want to understand their company HMO, supplies only a
safe non-PHI question, and submits a typed workflow request. The local
companion maps that request to the existing `coverage-intake` and
`coverage-navigator` contracts through the CLI/harness boundary. The UI shows
truthful lifecycle states and then renders the canonical
`coverage-research-packet` using progressive disclosure.

The result begins with a plain-language explanation and one safe next step.
Evidence gaps, source freshness, confidence limits, blocked decisions, and the
human handoff remain visible but do not overwhelm the first reading. An
optional technical detail identifies the skill route and run provenance. Raw
commands are not the primary interface, and any reasoning, approval, sensitive,
or consequential action returns to the connected harness.

This PRD defines the foundational product only. It establishes the application
shell, one end-to-end workflow, the packet presentation model, the CLI
companion boundary, the callable UI-opening skill, and the critical verification
seams. It does not attempt to expose every Health skill or finish the full
visual product in the first slice.

## User Stories

1. As a person new to Philippine health coverage, I want the opening screen to
   explain what I can learn, so that I am not confronted by an empty prompt.
2. As a beginner, I want to browse basic concepts before starting a workflow,
   so that I can form a better question.
3. As a beginner, I want to see PhilHealth, HMO, and private-insurance concepts
   described as different categories, so that I do not treat them as
   interchangeable.
4. As an employee, I want a visible starting choice for understanding my
   employer HMO, so that I do not need to know the `coverage-intake` skill name.
5. As a user, I want starter choices written in ordinary language, so that the
   interface does not expose internal workflow taxonomy.
6. As a user, I want the UI to work even when I do not type a custom prompt, so
   that common beginner journeys are easy to start.
7. As a user, I want to enter a safe non-PHI question in my own words, so that
   the workflow still reflects my intent.
8. As a privacy-conscious user, I want the UI to tell me not to submit patient
   records, medical documents, claim forms, or sensitive identifiers.
9. As a user, I want unsafe or patient-specific input refused before it enters
   the workflow, so that a public-source learning product does not become a
   patient-data system.
10. As a user, I want the browser to show that my request is being prepared for
    the Health workflow, so that I understand what has and has not started.
11. As a user, I want truthful pending, running, progress, and completion
    states, so that a queued CLI handoff is not presented as completed work.
12. As a user, I want to know which safe workflow route was selected, so that I
    can inspect why the system used intake and navigation.
13. As a nontechnical user, I want skill and CLI details hidden by default, so
    that the product remains approachable.
14. As an advanced user, I want an optional route-and-provenance detail, so
    that I can verify the underlying callable workflow.
15. As a user, I want the final packet to lead with a plain-language summary,
    so that I can understand the result before inspecting evidence.
16. As an employee, I want the result to explain what an employer HMO is and
    what information remains organization-specific.
17. As a user, I want one concrete safe next step, so that the workflow moves
    me forward instead of ending with a disclaimer.
18. As a user, I want the packet to name the right human reviewers, so that I
    know whether to ask HR, HMO support, PhilHealth, or another responsible
    party.
19. As a user, I want exact questions to take to those reviewers, so that the
    handoff is actionable.
20. As a user, I want evidence gaps and confidence boundaries preserved, so
    that a polished interface does not imply certainty the sources do not
    support.
21. As a user, I want source freshness and source-role details available on
    demand, so that I can inspect what the result can and cannot prove.
22. As a user, I want blocked decisions called out plainly, so that educational
    output is not mistaken for coverage, eligibility, claims, ranking, or
    purchase advice.
23. As a user, I want refusal to preserve my intent and offer a safe next step,
    so that a boundary does not become a dead end.
24. As a user, I want partial results preserved when a later stage fails, so
    that valid information is not discarded.
25. As a user, I want offline and unavailable states to explain what is cached,
    what cannot run, and how to recover.
26. As a keyboard user, I want every starting choice, disclosure, action, and
    recovery path to be operable without a pointer.
27. As a low-vision user, I want readable type, visible focus, strong contrast,
    zoom resilience, and information that does not depend on color alone.
28. As a motion-sensitive user, I want state changes to remain understandable
    with reduced motion enabled.
29. As a mobile user, I want the learning cards, guided action, status, packet,
    and recovery controls to remain usable at narrow widths.
30. As a maintainer, I want the foundational UI to use the existing employer-HMO
    scenario and packet fixture, so that it proves real workflow behavior rather
    than invented demo content.
31. As a maintainer, I want the browser request and result boundaries validated
    by versioned schemas, so that malformed or hostile payloads fail closed.
32. As a maintainer, I want the UI action to map to one declared capability
    owner, so that helper code cannot silently replace the Health skill.
33. As a maintainer, I want the companion bound only to loopback, so that a
    foundational demo does not expose the product to the network.
34. As a maintainer, I want start, reuse, port-conflict, startup-failure, URL
    handoff, and stop behavior owned by a callable UI-opening skill.
35. As a product owner, I want the UI and callable opening skill verified as
    separate deliverables, so that a working screen cannot substitute for an
    actual skill surface.
36. As a product owner, I want the Health workflow skills to remain owned by
    `health-007`, so that UI work does not rewrite or weaken their contracts.
37. As a reviewer, I want screenshots and traces for the full action lifecycle,
    so that review covers more than an attractive idle state.
38. As a reviewer, I want refusal, failure, offline, and recovery behavior
    reviewed alongside success, so that the product cannot pass on a happy path
    alone.
39. As a security reviewer, I want no model credentials, raw filesystem access,
    generic shell endpoint, or sensitive content in browser state or logs.
40. As a release reviewer, I want deterministic, browser, accessibility,
    security, package, and human-review gates before the foundational UI is
    called ready.

## Implementation Decisions

### Selected Product Direction

- Choose a beginner learning hub over a wizard-only flow and a technical tool
  dashboard.
- Make the guided starting action visually prominent without hiding the
  browsable learning surface.
- Use real Health concepts and fixtures. Do not add decorative metrics,
  fabricated providers, fake citations, or placeholder results.
- Limit the first milestone to one complete tracer: employer-HMO intake through
  packet rendering.
- Keep additional provider research, entity lookup, comparisons, evidence
  audit, and source-heavy workflows visible only as honest future capabilities
  or disabled previews when appropriate; do not imply they are implemented in
  the foundational slice.

### Visual Thesis

- The interface should feel like a calm public-service learning guide: warm,
  legible, reassuring, and evidence-aware rather than clinical, financial, or
  dashboard-heavy.
- The dominant plane is the learning and guided-start surface. Results become
  the focused working plane only after a workflow begins.
- Use generous spacing, readable editorial typography, soft category color,
  and restrained emphasis. Safety, freshness, and uncertainty must remain
  visible without turning the screen into warning chrome.
- Avoid generic admin cards, dense tables, decorative charts, chat bubbles,
  glassmorphism, and marketing-hero composition.

### Content Plan

- Orientation: explain that the product helps people understand Philippine
  health coverage using public evidence and human handoffs.
- Beginner basics: provide scannable entries for PhilHealth, HMOs, private
  health insurance, and evidence or verification basics.
- Guided start: ask what the user wants to understand and offer the employer-HMO
  tracer as the first working path.
- Capability preview: show the real safe jobs represented by the seven-skill
  product without presenting unimplemented UI paths as active.
- Workflow status: show the selected intent, capability owner, run identity,
  truthful state, and recovery action.
- Result: lead with the plain-language summary and one next step, followed by
  categories, confidence and gaps, source details, blocked decisions, and the
  human handoff.
- Technical detail: expose route and provenance in an optional disclosure, not
  as the main user experience.

### Interaction Thesis

- Starter choices prefill a safe intent and reduce the burden of composing a
  prompt from nothing.
- Progressive disclosure lets beginners read the summary first while keeping
  evidence, freshness, uncertainty, and provenance inspectable.
- The result view preserves the user's location and valid partial output while
  status, refusal, offline, or recovery information changes.
- Motion may reinforce focus and sequence but never carry unique meaning.
  Reduced-motion users receive equivalent text, focus, and visibility changes.

### Workflow And CLI Boundary

- The browser submits only versioned, schema-validated named actions. It has no
  generic command, terminal, filesystem, model, credential, or agent endpoint.
- The foundational action is owned by `coverage-intake`, with
  `coverage-navigator` recorded when the workflow selects the next route.
- The local companion mediates the typed request and result boundary on
  loopback. The connected harness remains the conversation, reasoning, file
  editing, and approval authority.
- The UI shows `awaiting harness approval` or another truthful handoff state
  when a request requires the harness. It never equates browser submission with
  completed reasoning or human approval.
- The browser renders only validated packet data and user-safe error envelopes.
  Internal diagnostics remain in redacted server-side logs.

### Foundational Action Contract

- Input: one safe beginner intent, optional non-PHI clarification, source
  revision, action id, and idempotency key.
- Capability owner: `coverage-intake`; `coverage-navigator` may extend the
  recorded route.
- Output: one valid coverage research packet plus run identity, timestamps,
  source revision, validation result, and route provenance.
- Side effects: no external write, purchase, claim, coverage determination,
  provider-network verification, or medical action. Derived run state may be
  stored locally and safely discarded.
- Concurrency: prevent accidental duplicate submission for the same run; a new
  intent creates a new run identity.
- Cancellation: permit cancellation before an irreversible or protected stage;
  report persisted partial output and confirmed cancellation state.
- Recovery: allow correction of safe input, companion reconnect, source reload,
  retry of explicitly transient failures, or return to the harness.

### State Model

- Support idle, loading, pending, confirmation, running, progress, partial,
  success, failure, error, cancel, retry, recovery, empty, refusal, permission,
  stale, offline, unavailable, and awaiting-harness-approval.
- The foundational critical path must visibly exercise idle, loading or pending,
  running or progress, and success.
- Tests must also exercise refusal, failure, offline, unavailable, stale, and
  recovery. A generic error screen cannot substitute for these states.
- Preserve the last verified packet or page state when a later transition
  fails. Do not collapse action failures into global application failures.

### Packet Presentation

- Preserve all canonical packet fields and nested contracts without renaming
  them in persisted output.
- The summary plane shows the plain-language summary, normalized categories,
  one safe next step, and human-review requirement.
- The evidence plane shows sources, source roles, checked dates, freshness,
  supported claims, cannot-prove limits, confidence boundaries, and gaps.
- The handoff plane shows reviewer roles, exact questions, documents to request,
  and data the user must not submit.
- Blocked decisions remain explicit even when the result is otherwise helpful.
- Skill-specific sections may render domain details but cannot fork the shared
  packet shape.

### Runtime, Packaging, And Ownership

- Use the fixed React, Vite, TypeScript, and Tailwind browser foundation with a
  project-local Node.js TypeScript loopback companion.
- Keep files, skills, fixtures, examples, and packet JSON canonical. Browser
  caches and projections are disposable. Add no database.
- Start or reuse the UI only through the separate callable UI-opening skill.
  Installation and opening the project start no server or hidden process.
- Handle server identity, project-root matching, health checks, port conflicts,
  startup failure, local URL reporting, and explicit stop behavior visibly.
- Keep the standalone Health product as owner of its UI, runtime, package,
  opening skill, fixtures, versioning, and release lifecycle. The foundry owns
  only tracker and lifecycle evidence.
- Preserve the seven Health workflow skills as an independent dependency owned
  by `health-007`.

### Security And Human Boundaries

- Bind only to loopback and validate host, origin, session, CSRF, request,
  response, size, and action allowlists.
- Reject traversal, absolute browser-supplied paths, unsafe links, unexpected
  symlinks, hostile rendered content, and unknown fields.
- Sanitize rendered Markdown or HTML and apply a restrictive content security
  policy.
- Keep secrets, cookies, tokens, model credentials, PHI, and private document
  content out of client payloads, fixtures, URLs, and logs.
- Refuse PHI, medical advice, eligibility, coverage, claims, network, ranking,
  and purchase decisions. Preserve intent and produce the correct human handoff.
- Treat browser confirmation as interface acknowledgement, never as authority
  for consequential action.

## Testing Decisions

- Prefer one high external seam: submit a beginner intent through the browser
  action contract and assert the rendered, validated packet and lifecycle
  states. Avoid tests coupled to component internals.
- Reuse the existing employer-HMO scenario and beginner packet example as the
  foundational fixture. Do not create fake demo evidence.
- Unit tests cover schema parsing, immutable state transitions, packet
  projection, refusal classification, redaction, and recovery decisions.
- Integration tests cover browser-to-companion request validation, action
  allowlisting, route provenance, packet validation, duplicate prevention,
  cancellation, stale source handling, and user-safe error envelopes.
- End-to-end tests cover opening the local UI, browsing basics, selecting the
  employer-HMO start, submitting a safe intent, observing truthful lifecycle
  states, receiving the packet, expanding evidence and handoff details, and
  stopping the UI.
- Negative end-to-end cases cover PHI-like input refusal, companion offline,
  missing capability, malformed packet, and a retryable failure.
- Accessibility checks cover keyboard operation, focus order and restoration,
  visible focus, form labels and errors, live-region announcements, contrast,
  zoom, touch targets, narrow layouts, and reduced-motion parity.
- Security checks cover loopback binding, host and origin rejection, CSRF,
  unknown action ids, schema limits, rendered-content sanitization, path
  traversal, symlink boundaries, redacted logs, secret scanning, and dependency
  audit.
- Visual review uses real Health content at desktop and narrow mobile
  viewports. It must review the idle learning surface, active workflow,
  successful packet, refusal, offline, and recovery states.
- Release evidence must report build, typecheck, lint, unit, integration, E2E,
  coverage, accessibility, browser critique, security, dependency, secret,
  package-content, editable-install, harness-parity, screenshot, trace, and diff
  results.
- GPT-5.6 Sol is required when the workflow-product builder performs product
  planning, implementation, fresh-agent evaluation, model grading, or visual
  critique. If unavailable at that invocation, stop with
  `model-runner-unavailable`; do not silently substitute another model.

## Out of Scope

- Implementing UI, runtime, package, tests, or the opening skill during the PRD
  phase.
- Rewriting or completing the seven Health workflow skills owned by
  `health-007`.
- Exposing every skill as an active UI workflow in the foundational slice.
- Provider rankings, plan recommendations, purchase guidance, eligibility,
  coverage, claims, network verification, or medical advice.
- Uploading or processing patient records, medical documents, claim forms, or
  other PHI.
- Embedded browser chat, model runtime, model API keys, generic shell, terminal,
  raw filesystem browser, or independent approval authority.
- Remote hosting, authentication service, native desktop wrapper, database, or
  external data plane.
- Publishing, npm release, deployment, global harness configuration changes, or
  background startup.
- Full installation, upgrade, migration, and removal implementation beyond the
  contracts required to avoid blocking the foundational architecture.
- Final visual polish for every future learning topic and workflow.

## Further Notes

- The selected beginner learning hub was compared against a wizard-first flow
  and a technical tool dashboard. It best preserves the approved combination of
  guided help and browsable content while keeping workflow internals secondary.
- The employer-HMO tracer is selected because the existing scenario already
  exercises beginner language, one clarifying question, intake-to-navigation
  routing, evidence gaps, current-plan uncertainty, and a concrete HR or HMO
  handoff without requiring fresh public research.
- The next Matt phase is issue decomposition. No issue artifact or
  implementation path is approved by this PRD alone.
- `health-007` must supply a durable, reviewed seven-skill and packet baseline
  before the foundational UI implementation may claim dependency readiness.
- The separate UI-opening skill is required so starting the sidecar remains a
  callable workflow action rather than an npm command presented as the product
  interface.
