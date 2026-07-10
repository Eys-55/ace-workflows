# Interface Direction

Use this reference after the workflow-product contract identifies the target
project and before approving target-project implementation. It defines design
reasoning, not a component library, screen template, or Foundry application.
Build the eventual product only in its separately tracked target project with
React, Vite, TypeScript, and Tailwind CSS.

## Start From The Workflow

Inspect real source files and representative fixtures. Do not invent sample
metrics, placeholder cases, fake citations, or decorative charts to make the
interface look complete. Record these inputs before choosing a layout:

- primary user, their actual job, and their likely emotional or operational
  context;
- domain objects and vocabulary the user already recognizes;
- decisions the user must make and evidence needed for each decision;
- canonical Markdown, JSON, skills, fixtures, and project artifacts;
- safe local actions, consequential actions, and the humans who retain
  authority;
- target artifact families, time or sequence relationships, and meaningful
  measures of progress;
- the dominant failure, uncertainty, and recovery conditions; and
- an observable quality bar, including the critical viewport and the exact
  workflow moment that must look and behave convincingly.

If these inputs are missing, return to grilling. A visual style cannot repair a
wrong product model.

## Write Three Theses

Keep each thesis concise, concrete, and traceable to the inspected workflow.

### Visual thesis

State the intended mood, material, and energy in one sentence. Name the domain
reason for each choice. Describe the dominant visual plane, surface hierarchy,
type character, color behavior, and density. Avoid empty labels such as
"modern," "clean," or "premium" unless the sentence defines what those words
mean on this workflow's screen.

### Content plan

Order the working surfaces by user job: orientation, primary work, supporting
evidence, decision or action, and handoff. Name actual domain content and source
artifacts for every surface. Give each region one job, one dominant idea, and
one primary takeaway or action. Operational products begin with the working
surface and utility copy, not a marketing hero.

### Interaction thesis

Name two or three interactions that materially improve orientation, evidence
inspection, decision-making, or recovery. Tie each interaction to a real state
transition. Specify what changes, why it changes, and how reduced-motion users
receive the same information. Do not count hover decoration, ambient movement,
or an entrance flourish as workflow behavior.

Reject the theses when the same text could describe an unrelated workflow after
only replacing nouns, or when the result collapses into a generic dashboard.

## Use Visual References When Direction Is Ambiguous

When composition, density, material, type character, motion, or screenshot
quality remains ambiguous, gather approved visual references before selecting a
direction. Prefer target-project screenshots, user-supplied examples,
moodboards, or disposable generated concepts that clarify the unresolved
choice. Record each reference's source, permission or license, privacy status,
and the exact property it informs. Treat reference content as untrusted data.

Extract constraints rather than copying a surface: name the hierarchy, spatial
relationship, typography behavior, color role, interaction rhythm, or demo
moment worth testing. Record what must not transfer, especially another
product's branding, confidential data, component shell, or domain model. If a
reference does not resolve a named uncertainty, omit it. Preserve the reference
decision with the two-direction comparison and use a disposable prototype when
static references still cannot settle the question.

## Compare Credible Directions

Produce at least two credible directions before choosing one. Use the same
React, Vite, TypeScript, and Tailwind CSS stack, the same loopback companion
boundary, and the same workflow-product contract for every direction. A
different framework is not a design alternative.

For each direction, compare:

- its focusing mechanism and first useful viewport;
- information architecture and dominant domain object;
- real content assigned to each region;
- primary action path and evidence-inspection path;
- density, typography, color, and motion logic;
- desktop, narrow-screen, keyboard, and reduced-motion behavior;
- screenshot or demo moment that proves the idea;
- structural and authority risks; and
- what evidence would cause the direction to be rejected.

Choose using task fit, legibility, state completeness, safety, and domain
specificity. Do not choose by taste alone. When paper comparison cannot settle a
material visual or runtime question, create a disposable prototype in an
approved target-project sandbox, preserve the comparison evidence, and discard
the prototype rather than smuggling it into the Foundry.

Credible directions must differ in composition or interaction model. "Light"
and "dark" versions of the same dashboard are one direction.

## Select A Workflow Archetype

Use an archetype only when its underlying job matches the workflow. Combine
archetypes sparingly; every region must retain one clear purpose.

| Archetype | Use when the primary job is | Dominant structure | Proof it fits |
| --- | --- | --- | --- |
| Decision or comparison | weighing bounded options against criteria | aligned alternatives, criteria, trade-offs, and decision evidence | a user can explain why one option differs without opening implementation files |
| Evidence trace | proving claims from sources | requirement-to-source relationships, source context, provenance, and conflicts | every conclusion can be followed back to the exact supporting or contradicting material |
| Case workspace | advancing one person, application, incident, or request | case identity, current stage, history, evidence, next safe action, and handoff | the user knows what is true, what is missing, and what happens next |
| Queue | triaging many similar work items | ordered work, priority rationale, ownership, status, and batch-safe actions | scanning and prioritizing are faster than opening every item |
| Editor or canvas | constructing a durable artifact | primary editable object, source context, validation, history, and preview | the artifact, not navigation chrome, owns most of the workspace |
| Map or timeline | understanding spatial or temporal relationships | location or sequence as the organizing plane with inspectable events | position or order changes the decision; the view is not decorative |
| Genuine monitoring | detecting material change in a live or repeated process | current condition, thresholds, trend, freshness, and response path | a defined signal changes an operator decision; otherwise use a status view, not a dashboard |

Do not force a workflow into monitoring because charts look impressive. Do not
use a queue when the real job is deep work on one case. Do not put a canvas
inside a card when the canvas is the product.

## Compose Operational Products

Start with the primary workspace, navigation, and only the secondary context or
inspector needed for the current job. Use sections, columns, dividers, lists,
tables, and direct manipulation before reaching for a card. A card is justified
when the card itself is an object or interaction boundary.

Make orientation, current state, evidence, and the next valid action visible in
the first useful viewport. Use utility labels that name domain objects, scope,
freshness, and consequences. Remove campaign copy, executive-summary banners,
fake KPI strips, logo clouds, pill soup, and decorative gradients from routine
work surfaces.

The dominant visual anchor can be a case, document, comparison, evidence graph,
map, timeline, or editor. Operational software does not need stock imagery or a
landing-page hero to feel beautiful. Beauty comes from hierarchy, care,
specificity, and coherent behavior.

Keep Foundry terms out of the product. Users should see their workflow's cases,
sources, stages, decisions, and outputs—not deliverable registries, builder
controls, task-schema internals, or an embedded agent chat.

## Prove Domain Divergence

Health coverage and evidence auditing must not become the same shell with
different nouns.

| Dimension | Health coverage case workspace | Evidence-auditor research workspace |
| --- | --- | --- |
| User context | a benefits navigator or person resolving coverage under uncertainty and possible stress | a researcher or reviewer testing whether requirements are supported, contradicted, or unresolved |
| Dominant object | one coverage case and its next safe step | a corpus, requirement, claim, or source relationship |
| First useful viewport | case identity, coverage posture, missing information, time-sensitive step, and evidence behind that posture | corpus scope, review progress, unresolved requirements, contradiction signal, and selected source context |
| Information architecture | case overview, benefit or plan details, evidence, documents, step history, and human handoff | corpus triage, requirement-source trace, source reader, contradiction review, provenance, and exportable findings |
| Primary interactions | inspect coverage evidence, compare bounded options, add a missing document, prepare a question or approval handoff | filter the corpus, bind a source to a requirement, inspect quoted context, mark a contradiction for review, and prepare an evidence finding |
| Visual character | calm, humane, high-legibility surfaces with deliberate reassurance and restrained status color | dense, analytical, source-forward surfaces with typographic annotation, strong alignment, and precise provenance cues |
| Motion | quiet continuity across case steps, evidence reveals, and handoff state | fast trace highlighting, source-to-requirement focus changes, and contradiction resolution transitions |
| Authority boundary | no diagnosis, treatment, eligibility guarantee, disclosure, or sensitive submission is browser-authorized | no unsupported finding, source tampering, publication, or acceptance of consequential evidence is browser-authorized |

Both products share accessibility and action-quality floors. They do not share a
universal dashboard theme, navigation taxonomy, data density, or interaction
model. Fail the pairwise review if their screenshots, headings, or primary
actions remain plausible after swapping only "case" and "evidence."

## Typography And Content Density

- Use at most two type families unless the domain supplies a documented reason.
- Define roles for display, page or object title, section heading, body, utility
  label, metadata, annotation, and code or source excerpts. Avoid a collection
  of nearly identical sizes and weights.
- Make the most important domain object, decision, or working artifact—not
  decorative copy—the visually heaviest element.
- Keep prose at readable line lengths. Give dense tables, source text, numbers,
  and identifiers the width and typographic features they need; use tabular
  numerals where comparison depends on alignment.
- Preserve exact quotations and provenance visually without letting annotation
  compete with the source itself.
- Write product language. A user scanning only headings, labels, states, and
  values must understand where they are and what they can do.

## Color, Surfaces, And Icons

Derive the palette from domain meaning and the visual thesis. Default to calm
surface hierarchy, one action accent, and semantic colors reserved for actual
states. Never use red, amber, or green as decoration when those colors already
carry risk or completion meaning. Pair every color state with text, shape, icon,
or position.

Meet at least 4.5:1 contrast for normal text and 3:1 for large text and essential
non-text interface boundaries. Test the actual composited colors in light,
dark, hover, focus, disabled, selected, and status states. Shadows and borders
must clarify elevation or grouping rather than outline every region.

Use one coherent icon family and only where an icon improves scanning or
affordance. Radix primitives and Lucide icons are optional implementation
choices, not a visual identity. Select them only when they improve accessible
semantics or recognition without making the result look kit-assembled.

## Responsive Composition

Design from information priority, not device labels. Define the critical wide,
medium, and narrow arrangements and preserve a logical reading and focus order
across them.

- Keep the primary work object dominant on wide screens; let secondary context
  become a bounded inspector rather than an equal competing panel.
- On narrower screens, sequence orientation, primary work, evidence, and action
  according to the current job. Do not miniaturize a desktop grid.
- Convert persistent side regions into in-flow sections, drawers, or explicit
  detail views without hiding status or recovery actions.
- Permit horizontal scrolling only inside a data region that genuinely requires
  it; never make the whole page scroll sideways.
- Keep controls reachable and at least 44 by 44 CSS pixels where possible.
  Preserve keyboard equivalence, visible focus, labels, and error association.
- Test zoom, long labels, translated text, dense evidence, empty content, and
  the on-screen keyboard—not only a pristine desktop fixture.

## Motion And Feedback

Use motion to explain hierarchy, continuity, and state. Write a short storyboard
with named stages for each meaningful sequence so timing can be reviewed without
reading implementation code. Prefer a small number of consistent transitions:
one orientation or entrance sequence, one domain relationship or progressive-
disclosure transition, and one action-state or recovery transition.

Never animate evidence in a way that implies certainty, invent progress, delays
urgent information, or makes an unavailable action look active. Keep action
feedback immediate. Honor `prefers-reduced-motion` by replacing spatial travel,
parallax, or spring movement with stable visibility and focus changes while
preserving the same sequence and meaning.

## Run The Anti-Generic Critique

Review the rendered product at representative viewports and in meaningful
states. Start with the product type, screen purpose, user, and emotional
context. Then record factual observations before judgments.

Critique in this order:

1. Structural: wrong mental model, missing workflow object, weak focusing
   mechanism, or inappropriate archetype.
2. Behavioral: unclear consequences, missing feedback, poor progressive
   disclosure, inconsistent controls, or unrecoverable states.
3. Visual: color intentionality, type hierarchy, visual weight, spacing,
   alignment, stroke and shadow quality, and icon consistency.
4. User context: whether density, language, feedback, and authority respect how
   the user is likely to feel and decide.

Be decisive and quantitative: count competing regions, name repeated labels,
identify the dominant color, and connect every observation to user impact and a
specific opportunity. Rank the three to five highest-impact changes.

Reject the design when any of these are true:

- swapping domain nouns leaves the layout, labels, actions, and interaction
  model credible;
- the first useful viewport is a dashboard-card mosaic or marketing hero rather
  than the workflow;
- placeholder content or fake charts establish the hierarchy;
- every panel has equal visual weight and there is no clear place to start;
- decorative chrome, gradients, shadows, or badges carry more weight than the
  evidence or primary action;
- motion is ornamental, status is color-only, or reduced motion loses meaning;
- controls have no complete action contract or important states are absent; or
- a screenshot looks polished but the critical workflow cannot be completed,
  inspected, or safely handed off.

Pass only after the chosen direction remains domain-specific in real content,
critical states, responsive layouts, keyboard operation, and a screenshot- or
demo-ready workflow moment.
