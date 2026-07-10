# Workflow Product Contract

Use this contract before any target-product write. It fixes ownership,
deliverable, technical, package, and authority boundaries while leaving each
workflow's visual language and information architecture bespoke.

## Model Policy

Use GPT-5.6 Sol only for product planning, implementation, fresh-agent runs,
visual critique, and model grading. Record the exact runner and session for
every run. If GPT-5.6 Sol is unavailable, return
`model-runner-unavailable`, preserve zero-write evidence, and stop. Use no fallback model.

## Selected Target And Ownership

Require one selected target project and one tracked implementation task before
writing product artifacts. The task must declare create or update intent,
product owner, exact target surfaces, runtime visibility, supported harnesses,
artifact bindings, completion conditions, and artifact-specific phase
approvals. An update resolves exactly one existing product identity.

The target project owns the generated product, package, skills, configuration,
fixtures, user data, versioning, and release lifecycle. The Workflow Foundry
owns only the reusable `$build-workflow-product` instructions, Markdown
references, runtime metadata, tests, and evaluation evidence. Never place
React components, CSS, application code, a server, an npm product, templates,
assets, or reusable UI binaries in the Foundry for this capability.

## Independent Deliverables

Declare at least these primary deliverables independently:

| Deliverable | Required contract |
| --- | --- |
| Visual product | `ui-application`, owned by the target project, with an exact application surface and product verification plan. |
| Callable workflow | One `packaged-skill` per skill, or a workflow pack whose members each remain complete and independently invokable. |

The UI and skill or workflow pack may ship together in one project package,
but neither can satisfy the other's completion conditions. A screen, endpoint,
helper, command, or component is not a callable skill. Build or update every
skill through `$build-workflow-skill`, preserving matching identity, substantive
`SKILL.md`, runtime metadata, and supported-harness capability parity.

Runtime, package, fixtures, docs, and verification artifacts are separate
required or declared support artifacts. Bind every file to its deliverable and
phase approval. Product code may be emitted only into the selected target
project.

## Fixed Product Foundation

Every generated product uses:

- React for the browser interface;
- Vite for the frontend build and development surface;
- TypeScript across browser and companion runtime;
- Tailwind CSS for styling;
- an on-demand Node.js TypeScript companion bound to `127.0.0.1` or an
  equivalent loopback address as the browser's sole project bridge.

Do not infer, preserve, suggest, or implement an alternative frontend or
styling stack. A revamp migrates an out-of-contract UI only through the selected
task's explicit, reviewable plan. Radix primitives and Lucide icons remain
optional choices when they materially improve accessibility, semantics, or
scanning without creating a generic component-library appearance.

The default product is a local browser sidecar. A native wrapper, remote
hosting, authentication service, or external data plane requires its own
tracked decision, security boundary, and approval.

## Runtime And Filesystem Truth

Keep Markdown, JSON, complete skill bundles, fixtures, configuration, and
normal project files canonical. The companion performs only schema-validated,
allowlisted, reviewable file and workflow operations. Browser projections,
indexes, caches, and local view preferences are derived and disposable.

Use no database by default. Request a separate target-project decision only
when measured data volume, concurrency, querying, or integrity requirements
prove canonical files insufficient. A database never becomes a shortcut around
the workflow's existing source of truth.

The browser receives typed data and action results, not raw filesystem, shell,
harness, credential, publishing, or unrestricted process authority. Validate
requests and responses, restrict host and origin, sanitize rendered content,
redact logs, and expose user-safe errors while retaining detailed diagnostics
inside the trusted local companion.

## Harness And Chat Boundary

Codex, Claude Code, or opencode remains the conversation, model, file-editing,
and approval surface. The browser must not embed chat, a second agent state,
model credentials, or a model API key. For an action requiring reasoning,
credentials, publishing, deletion, spending, clinical or financial judgment,
or another consequential effect, the sidecar returns an inspectable request to
the harness for explicit human approval. It displays pending, accepted,
refused, completed, and failed handoff states without executing the approval
itself.

## One Package Per Project

Publish and version one independent npm package per workflow project. No
umbrella package, catalog, or Foundry runtime owns multiple projects' UI,
skills, files, versions, or release lifecycle. A future catalog may discover
and install products only.

The package contains the complete frontend, companion runtime, project files,
fixtures, safe configuration, full callable skill set, and every project-local
Codex, Claude Code, and opencode entrypoint and metadata file at publication
time. Installation never generates, translates, copies, or globally registers
missing skills afterward. Opening the editable project in a supported harness
is the discovery and activation boundary; global user configuration remains
unchanged.

npm is distribution and bootstrap, not the workflow interface. An explicit
bootstrap operation names a destination and materializes a normal user-owned,
editable project directory outside `node_modules`. Installation and opening the
directory start no server, postinstall process, or hidden background work. An
included callable UI-opening skill explicitly starts or reuses the loopback
companion, handles port conflicts and startup failure visibly, reports or opens
the local URL, and exposes an explicit stop path.

Upgrades detect local modifications and produce a reviewable merge or
migration. They never overwrite edited files silently. Removal preserves
user-created work unless the human confirms deletion. Package contents exclude
secrets, credentials, tokens, machine-specific paths, and private local state.

## Contract Record

Return the following complete, scan-friendly manifest before implementation.
Keep the literal field names so lifecycle tools and reviewers can recognize the
selected builder and fixed boundaries. A blocker follows this manifest; it
does not replace it. Reproduce every listed bullet, English acceptance token,
and state name without translating, condensing, or deleting it; replace only
angle-bracket placeholders and add contextual detail after the manifest.

## Deterministic Validation

```markdown
selected_builder: build-workflow-product
selected_target: <project>/<task>
operation: create | revamp

independent_deliverables:
- ui-application: <identity>
- packaged-skill | workflow-pack: <identity>
- separation: distinct contracts, independently verified

design_contract:
- visual thesis: <domain-specific composition and visual language>
- content plan: <real information hierarchy>
- interaction thesis: <focusing mechanism, transitions, reduced-motion parity>
- compared directions: <at least two same-stack directions and rationale>

fixed_foundation:
- React + Vite + TypeScript + Tailwind CSS
- Node.js TypeScript sidecar on loopback 127.0.0.1
- schema-validated requests and responses
- filesystem-first canonical Markdown, JSON, project files, and skill bundles
- no database by default; a database is opt-in through a separate decision

package_lifecycle:
- one npm package per project
- prepackaged complete skill set and supported-harness metadata
- explicit bootstrap to an editable project directory outside node_modules
- install performs no postinstall work and does not start the sidecar
- on-demand start, healthy reuse, local URL, port-conflict and startup-failure handling, and explicit stop
- reviewable upgrade merge or migration; no silent overwrite
- removal preserves user work and requires confirmation before deletion

harness_boundary:
- GPT-5.6 Sol only; no fallback
- the connected harness owns chat, model state, file editing, and approvals
- no embedded browser chat, model credentials, shell, or raw filesystem access
- consequential actions return an inspectable handoff for explicit human approval

action_contract:
- typed inputs/results, provenance, file scope, side effects, idempotency, concurrency, redaction, diagnostics, tests
- states: idle, loading, pending, confirmation, running, progress, partial, success, failure, error, cancel, retry, recovery, empty, refusal, permission, stale, offline, unavailable, awaiting harness approval

foundry_boundary:
- no Foundry product or application code
- the target project owns and receives every React, runtime, package, and product artifact

verification_plan:
- build, typecheck, lint, unit, integration, E2E, coverage
- accessibility, browser critique, security, dependency audit, secret scan
- package contents, editable-install smoke, harness parity, screenshots, traces, final diff review
```

## Context-Specific Contract Detail

After the manifest, record the context-specific detail at minimum:

- target project, task, operation, owner, package identity, and approved roots;
- distinct UI, skill, runtime, package, fixture, and verification artifacts;
- primary user, job, domain objects, decisions, evidence, actions, and human
  boundaries;
- visual thesis, content plan, interaction thesis, and representative fixtures;
- action inputs, results, side effects, full state transitions, recovery, and
  harness handoffs;
- canonical files, derived state, loopback protocol, validation, sanitization,
  logging, and secret boundaries;
- explicit install, on-demand start/reuse/URL/failure/stop, upgrade, removal,
  and supported-harness parity behavior;
- test, browser, accessibility, security, package, diff, critique, and human
  review gates.

Reject a contract that merges the UI and callable skill identity, lacks real
workflow content, grants browser authority, embeds chat, adds a database by
default, starts on installation, mutates global configuration, couples releases
through an umbrella runtime, or places target-product code in the Foundry.
