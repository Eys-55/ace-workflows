# States And Actions

Use this reference to define the workflow-to-UI action boundary before writing
target-project controls. It is a behavior contract, not a component or state-
management template. The browser is an interactive workflow surface; it is not
a shell, raw filesystem client, agent chat, model runtime, or source of human
approval.

## Inventory Actions Before Controls

Map every proposed control to one named project capability. Delete controls that
have no capability, source of truth, or useful outcome. Record this contract for
each action:

- stable action identifier, user-facing verb, intent, and owning skill or
  workflow capability;
- capability provenance, owning task, and the canonical files or artifacts it
  may read or change;
- typed input schema, defaults, validation, preconditions, and source revision;
- typed output schema, canonical result or artifact, evidence, and provenance;
- side-effect class, reversibility, authority owner, and required approval;
- idempotency key, duplicate-submission behavior, concurrency rule, and stale
  input guard;
- expected states, progress semantics, cancellation boundary, timeout, and
  offline behavior;
- stable refusal and failure codes, user-safe messages, recovery owner, retry
  policy, and retained partial outputs;
- audit event, redaction rule, and diagnostics location; and
- the unit, integration, and critical-path browser checks that prove the
  contract.

Validate requests and responses at the React-to-loopback boundary. Render
untrusted Markdown, source excerpts, filenames, URLs, and workflow output only
through sanitizing paths. Keep detailed diagnostics on the trusted local
companion server and show redacted, actionable messages in the browser.

## Classify Authority

Use the least authority that completes the job.

| Class | Examples | Browser behavior |
| --- | --- | --- |
| Read or derive | inspect a source, filter a queue, calculate a disposable projection | call the validated loopback contract and show freshness and provenance |
| Reversible local preference | change a view, save a disposable filter, alter derived presentation state | apply locally with visible reset behavior; never make it canonical by accident |
| Bounded canonical project write | save an approved draft, add a reviewed local note, update an explicitly scoped project artifact | require schema validation, exact file scope, revision checks, visible diff or output, and recovery behavior |
| Consequential | delete or overwrite work; publish, send, spend, diagnose, prescribe, disclose sensitive data, use credentials, accept a legal or financial decision, or perform another external or high-impact action | prepare a bounded handoff and return to the harness for explicit human approval; the browser cannot execute or authorize it |

A browser confirmation click is not human approval for a consequential action.
Codex, Claude Code, or opencode remains the conversation and approval surface.
The browser may show a read-only preview of the proposed action, scope, inputs,
expected effects, risks, and provenance, then emit a handoff payload to the
harness. Only the harness may obtain explicit approval from the responsible
human and perform or coordinate the approved action. Never accept a browser-
fabricated approval flag, cached consent, or broad standing permission.

## Use Immutable Typed State

Represent action state as an explicit tagged state with a run identifier,
action identifier, source revision, timestamps, and state-specific data. Every
transition creates a new immutable state value; do not mutate shared objects or
scatter lifecycle meaning across unrelated booleans. Derive button labels,
disabled behavior, progress, messages, and available recovery actions from that
single state.

Keep canonical workflow state separate from transient UI state. A successful
server response updates the UI only after its output schema and resulting file
revision validate. Browser caches and optimistic projections remain disposable
and never outrank project files.

## Required State Semantics

| State | Meaning | Required interface behavior |
| --- | --- | --- |
| `idle` | the action is ready or not yet requested | show prerequisites, current source freshness, expected effect, and the valid next action; do not imply work has started |
| `loading` | the interface is acquiring the first trusted projection before work can be shown | identify the content or capability being loaded, retain stable layout where possible, provide an honest activity cue, timeout or offline path, and never fabricate placeholder results |
| `pending` | validated work is queued, scheduled, or awaiting a named prerequisite but has not started | show the queue or prerequisite reason, submitted time, cancellation or withdrawal behavior, and the transition that will start or refuse the action; do not label pending work as running |
| `confirmation` | a bounded safe local action needs an informed preview before submission | name the action, exact scope, side effects, reversibility, and cancel path; consequential work must switch to a harness handoff instead of treating this state as approval |
| `running` | the companion accepted one validated run | show the action, run identity, start time, current stage, and whether cancel is supported; prevent accidental duplicate submission |
| `progress` | the run has truthful measurable advancement | show completed and total work, named stage, or another real unit with freshness; use indeterminate progress when no meaningful measure exists and never invent percentages |
| `partial` | valid output exists but the requested result is incomplete | preserve and label usable outputs, omitted scope, failed items, uncertainty, and whether completion, retry, recovery, or human review is possible |
| `success` | the validated outcome and any canonical write completed | state what changed, where it lives, its revision and provenance, evidence produced, and the useful next step; do not celebrate before persistence verifies |
| `failure` | the run could not produce the promised outcome | show a stable code, user-safe cause, affected scope, retained outputs, diagnostic reference, recovery owner, and only valid retry or recovery paths |
| `error` | a view, projection, schema boundary, or unexpected client/server condition prevents the interface from representing a valid action state | preserve the last verified state, identify the affected region and stable error code, expose safe diagnostics and recovery, and do not collapse a failed action into a generic view error or vice versa |
| `cancel` | the user requested cancellation or the run reached a confirmed cancelled state | distinguish `cancel-requested` from `cancelled`; keep listening until the companion confirms the boundary and report any work that could not be rolled back |
| `retry` | a new bounded attempt follows a retryable failure or partial result | preserve the prior run, link the new run, reuse the idempotency policy, revalidate current inputs, and state what changed between attempts |
| `recovery` | the system or user is taking a defined path back to a valid state | name the repair step, responsible actor, preserved evidence, rollback or resume point, and success condition; never reduce recovery to "try again" |
| `empty` | a successful read or query has zero matching results | explain the scope that was searched, freshness, and how to broaden, create, import, or return; do not present empty as failure or fabricate sample content |
| `refusal` | policy, safety, provenance, or authority forbids the requested action | state the stable reason without leaking sensitive internals, preserve the user's intent, and offer the allowed harness or human handoff; never disguise refusal as a technical error |
| `permission` | the current capability lacks a required file scope, approval, credential owner, or operating-system permission | identify the missing permission and its owner, request the narrowest recovery path, and never prompt for secrets in the browser |
| `stale` | a source hash, revision, or assumption changed after the view or action was prepared | block writes, show what changed, preserve the draft, and require reload, comparison, rebase, or renewed confirmation against the current source |
| `offline` | the browser lost the loopback companion or another required connection | label cached data and its age, disable writes and action claims, preserve unsent local input safely, and provide reconnect or export behavior without pretending the workflow is live |
| `unavailable` | the capability, dependency, project file, server feature, or runtime is not present or cannot start | name the unavailable dependency, observed reason, recovery owner, and safe alternatives; do not show an enabled control that can never run |

Do not overload `loading` or `pending` as `running`, and do not use a generic
`error` surface when the action contract can report the more precise `failure`,
`refusal`, `permission`, `stale`, `offline`, or `unavailable` state.

## Validate Transitions

Allow only transitions supported by the action contract and companion response.
At minimum, review these paths:

- `idle` through `loading` to a verified projection, or through `pending` when
  validated work is queued but has not started;
- `idle` to `confirmation` to `running`, with cancellation back to a stable
  state for bounded safe local actions;
- `idle` or `confirmation` to a harness handoff for consequential actions;
- `running` through truthful `progress` to `success`, `partial`, `failure`,
  `cancel`, `stale`, `offline`, or `unavailable`; a boundary-level `error`
  preserves the last verified state and must recover before another transition;
- `partial` to inspect, continue, retry, recovery, or human review without
  discarding valid output;
- `failure` to a contract-approved `retry`, `recovery`, or stable `idle` state;
- `refusal` or `permission` to an allowed human or harness handoff, not a bypass;
- `stale` to compare and reload or rebase before any renewed confirmation;
- `offline` to reconnect and resynchronize before actions become available; and
- `unavailable` to a verified dependency recovery before returning to `idle`.

Reject impossible transitions and duplicate terminal events. Treat unknown
states, missing run identifiers, schema mismatches, out-of-order responses, and
responses for another source revision as failures at the boundary. Keep the
last verified state visible while explaining the new problem.

## Confirmation And Consequential Handoff

Use confirmation only when it helps the user understand a bounded action. It
must show the verb, affected objects or files, before-and-after meaning,
reversibility, duration when known, and how to cancel. Never hide consequences
behind generic labels such as "Continue" or "Are you sure?"

For a consequential action, create an inspectable harness handoff containing:

- user intent and action identifier;
- exact proposed inputs, target scope, and source revisions;
- supporting evidence and capability provenance;
- expected external or irreversible effects;
- sensitive fields omitted or redacted from browser-visible logs;
- the responsible human and the approval question they must answer; and
- expiration or invalidation conditions, including source changes.

Show `awaiting harness approval` as a handoff status, not as `running`. The UI
may observe a separately validated result afterward, but it never claims that
approval or execution occurred merely because the handoff was created.

## Progress, Partial Output, And Evidence

Progress must use real work units: sources inspected, records validated, files
processed, stages completed, or another domain measure. Show stage names and the
latest trusted timestamp. An indeterminate operation uses honest activity text
and elapsed time rather than a fabricated percent.

Every result exposes an inspectable output path or structured view, source
revision, action and run identifiers, time, provenance, validation result, and
scope. Keep summaries linked to underlying evidence. Preserve partial output
when safe and clearly separate completed, failed, skipped, and unattempted work.
Never let a success toast become the only record of what happened.

## Cancellation, Retry, And Recovery

Define the last cancellable boundary for every long-running action. Cancellation
is a request until the server confirms it. If an operation cannot be interrupted
safely, explain that before it starts and show the current protected stage.
Report persisted output and remaining side effects after cancellation.

Retry only transient or explicitly retryable failures. Revalidate inputs,
permissions, source revision, and authority first. Give the new run its own
identity while retaining a link to the prior run. Use idempotency to prevent a
double write, duplicate publication, repeated charge, repeated message, or
another repeated effect.

Recovery is specific. Name whether the user should correct an input, reconnect,
reload changed files, rebase a draft, restore a backup, choose a safe alternate
output, ask the project owner, or return to the harness. Preserve evidence and
user work throughout the path.

## Concurrency And Staleness

Read actions may refresh against the latest verified state. Write actions must
carry the source revision they were prepared from. If the canonical artifact
changes, enter `stale`, display the changed scope, and block the write until the
user reloads or reviews a merge. Never silently apply an old browser projection
over newer project files.

One action contract defines whether parallel runs are independent, serialized,
or mutually exclusive. Enforce that rule on the companion server as well as in
the interface. Disabling a button is feedback, not a concurrency guarantee.

## Accessible State Feedback

- Keep state names and consequences in visible text; never rely on color,
  animation, icon, or toast alone.
- Announce meaningful progress and terminal changes through an appropriate live
  region without repeating every low-level update. Reserve assertive
  announcements for urgent failures or safety messages.
- Move focus only when a new decision or blocking message requires it. On modal
  confirmation, trap focus correctly and return it to the invoking control on
  cancel or completion.
- Make every action and recovery path keyboard operable, preserve a visible
  focus indicator, use explicit labels, associate errors with their inputs, and
  keep touch targets at least 44 by 44 CSS pixels where possible.
- Communicate disabled controls with a visible reason and available recovery.
  Do not use `disabled` to conceal refusal, permission, offline, stale, or
  unavailable states.
- Honor reduced motion. Replace spatial progress or animated transitions with
  stable text, visibility, and focus changes that preserve sequence and meaning.
- Keep critical status and recovery usable at narrow widths, high zoom, long
  labels, and with assistive technology.

## Failure And Refusal Language

Lead with what happened, what remains safe, and what the user can do. Keep a
stable machine-readable code behind a plain-language message. Name the affected
scope and recovery owner. Do not expose stack traces, secrets, tokens,
machine-specific private paths, or raw hostile content.

Use refusal for a disallowed outcome, permission for missing authority, stale
for changed truth, offline for lost connectivity, unavailable for a missing
capability, and failure for an attempted action that did not meet its contract.
These states are not interchangeable.

## Verification Matrix

Before a target project calls an action complete, verify:

- every control resolves to one declared action contract and capability owner;
- valid, malformed, boundary, and hostile inputs receive schema-validated
  outcomes;
- the success, failure, partial, refusal, permission, stale, offline,
  unavailable, cancel, retry, and recovery paths render with inspectable output;
- duplicate submission, delayed response, out-of-order response, source change,
  reconnect, and restart preserve correct immutable state;
- consequential actions stop at the harness human-approval boundary;
- keyboard, focus, live-region, touch-target, contrast, zoom, and reduced-motion
  behavior work in the critical path;
- rendered workflow content is sanitized and logs are redacted;
- screenshots and traces show the action lifecycle, not only the idle screen;
  and
- unit, integration, and stable end-to-end checks retain failure artifacts for
  diagnosis.

Do not claim readiness when the attractive state works but refusal, permission,
partial output, or recovery remains undefined.
