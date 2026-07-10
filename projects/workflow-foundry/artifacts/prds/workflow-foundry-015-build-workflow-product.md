# Build Workflow Product Skill PRD

## Problem Statement

Agent workflows currently ship primarily as repositories, Markdown instructions,
skills, scripts, and tracker state. Those artifacts can be technically complete
while remaining difficult for normal users to understand, operate, demonstrate,
or share. The operator wants every serious workflow project to be capable of
becoming a beautiful, highly interactive local product without turning the
Workflow Foundry into a hosted application, universal runtime, or component
library.

The present Foundry has no canonical workflow that can take natural-language
intent such as "create UI for this workflow" or "turn this into a proper
product" and reliably produce the correct end-to-end result. A fresh agent can
easily fall into one of several wrong outcomes: a generic card dashboard, a
shallow reskin, a mockup with no real actions, a second browser chat, unsafe
filesystem authority, a UI that replaces rather than accompanies the callable
workflow skills, or reusable components created inside the Foundry instead of
the target project.

The Foundry also needs to preserve its existing ownership and phase boundaries.
The private Foundry should teach Codex, Claude Code, and opencode how to build
the product. It should not contain the generated product itself. Each workflow
project owns its application, complete skill set, local runtime, package,
editable files, release lifecycle, and domain-specific visual identity.

## Solution

Create one model-invoked, Markdown-first `$build-workflow-product` skill. The
skill routes natural-language workflow-product intent into the existing tracked
task lifecycle, consumes the typed UI-plus-skill deliverable contracts owned by
the skill-first Foundry revamp, and guides a supported harness through product
discovery, experience definition, implementation, browser iteration,
verification, packaging, and handoff.

The skill keeps its universal sequence concise and progressively loads
Markdown references for product boundaries, workflow-to-UI contracts,
experience architecture, visual direction, interaction states, action safety,
local runtime design, package and harness parity, and evals. Its only required
non-Markdown artifact is Codex runtime metadata.

The skill never prebuilds components or application code in the Foundry. When
invoked under a separately tracked target-project task, it produces a dedicated
filesystem-first local product using React, Vite, TypeScript, Tailwind CSS, and
an on-demand loopback-only Node.js TypeScript companion server. The existing
Codex, Claude Code, or opencode conversation remains the agent surface. The
browser sidecar is the visual workflow surface and contains no competing chat,
model runtime, model credentials, or independent authority for consequential
actions.

Every generated interface begins with real workflow content and three concise
decisions: a visual thesis, content plan, and interaction thesis. Shared quality
rules establish accessibility, security, interaction completeness, and
verification, while the target project's domain determines its information
architecture, terminology, visual identity, component composition, and action
model. Browser-based review and representative workflow fixtures determine
whether the result is genuinely useful and visually intentional.

## User Stories

1. As a Foundry operator, I want natural-language UI requests to invoke one canonical skill, so that I do not need to remember a pack of overlapping builder skills.
2. As a Foundry operator, I want `$build-workflow-product` to remain distinct from the canonical skill-bundle authoring authority, so that product building and skill construction do not collide.
3. As a Foundry operator, I want the builder to create or select a tracked target-project task, so that product work respects Matt phases and explicit artifact approvals.
4. As a Foundry operator, I want the builder to consume the Foundry's typed deliverable contracts, so that UI, skill, runtime, package, and support artifacts retain distinct completion rules.
5. As a workflow author, I want the builder to read the complete target workflow and unfinished project state, so that the UI reflects the actual workflow rather than a generic interpretation.
6. As a workflow author, I want the builder to identify the primary user and job before choosing a layout, so that form follows the workflow's real use.
7. As a workflow author, I want a visual thesis before implementation, so that the product has a coherent mood, material, and energy.
8. As a workflow author, I want a content plan before implementation, so that every surface communicates real workflow information instead of filler copy.
9. As a workflow author, I want an interaction thesis before implementation, so that motion and state transitions reinforce the product's character and hierarchy.
10. As a workflow author, I want visual references used when direction is ambiguous, so that the model has concrete visual guardrails.
11. As a workflow author, I want disposable visual prototypes when paper reasoning cannot settle a question, so that uncertainty is resolved cheaply before production work.
12. As an end user, I want a domain-specific information architecture, so that the interface uses the concepts I understand rather than Foundry internals.
13. As an end user, I want the working surface to foreground orientation, state, evidence, and action, so that I can operate without reading implementation documentation.
14. As an end user, I want every control to map to an explicit action contract, so that clicks have predictable inputs, outputs, and side effects.
15. As an end user, I want visible idle, pending, success, partial, error, refusal, permission, recovery, offline, and unavailable states, so that I always understand what the workflow is doing.
16. As an end user, I want inspectable outputs and evidence, so that I can understand and verify workflow results.
17. As an end user, I want retry and recovery behavior, so that recoverable failures do not become dead ends.
18. As an end user, I want responsive keyboard-accessible interfaces, so that the product works across devices and access needs.
19. As an end user, I want intentional motion with reduced-motion support, so that transitions clarify state without becoming noise.
20. As an end user, I want safe local actions to be directly interactive, so that routine workflow operation feels like a real product.
21. As an end user, I want consequential actions returned to the harness for approval, so that the browser cannot independently publish, delete, spend, diagnose, prescribe, or use credentials.
22. As a security-conscious user, I want the sidecar bound only to loopback, so that the local project API is not silently exposed to the network.
23. As a security-conscious user, I want every browser-server boundary schema validated, so that malformed or hostile inputs fail safely.
24. As a security-conscious user, I want rendered content sanitized and logs redacted, so that local workflow data does not create XSS or disclosure risks.
25. As a harness user, I want chat to remain in Codex, Claude Code, or opencode, so that I do not manage two agent conversations or model states.
26. As a harness user, I want the installed project to expose the same workflow capabilities across supported harnesses, so that changing harnesses does not silently change the product.
27. As a project owner, I want all generated files in a normal editable folder outside `node_modules`, so that I can inspect and change everything I own.
28. As a project owner, I want Markdown, JSON, skills, fixtures, configuration, and project files to remain canonical, so that the UI does not hide source-of-truth state in an opaque database.
29. As a project owner, I want browser caches and indexes to be disposable, so that deleting derived state cannot destroy project truth.
30. As a project owner, I want databases introduced only for proven domain needs, so that simple local products remain understandable and portable.
31. As a project owner, I want installation and opening the project to remain process-free, so that nothing runs until I explicitly request the UI.
32. As a project owner, I want the UI-opening skill to start or reuse the server and report the URL, so that startup is predictable.
33. As a project owner, I want visible port-conflict and startup-failure handling plus an explicit stop path, so that the local runtime is controllable.
34. As a package consumer, I want the complete frontend, local runtime, skills, fixtures, and harness metadata included at publication time, so that installation does not generate or register missing pieces afterward.
35. As a package consumer, I want upgrades to detect local edits and produce a reviewable migration, so that my changes are never silently overwritten.
36. As a package consumer, I want removal to preserve user-created work unless I confirm deletion, so that package lifecycle operations are not destructive.
37. As a project owner, I want each workflow product independently versioned and released, so that an umbrella catalog cannot couple unrelated products.
38. As a project owner, I want the product to generate polished screenshot and demo states, so that its value is legible when shared publicly.
39. As a product designer, I want the interface to begin from composition and hierarchy rather than component count, so that it avoids generic dashboard-card mosaics.
40. As a product designer, I want shared accessibility and quality foundations but bespoke art direction, so that each workflow feels intentional without relearning basic correctness.
41. As a developer, I want React, Vite, TypeScript, and Tailwind CSS fixed across generated products, so that implementation and evals have a predictable foundation.
42. As a developer, I want Radix and Lucide to remain optional, so that accessible primitives are available without forcing one component-library appearance.
43. As a developer, I want a loopback Node.js TypeScript server as the sole browser bridge, so that filesystem and workflow actions have one controlled boundary.
44. As a developer, I want unit, integration, and critical-path browser tests, so that visual polish does not substitute for working behavior.
45. As a reviewer, I want deterministic, model, visual, accessibility, security, and human review lanes, so that no single grader can declare the product complete.
46. As a reviewer, I want build, type, lint, test, coverage, dependency, secret, and diff evidence, so that completion claims are inspectable.
47. As a skill maintainer, I want failing fresh-agent baselines before skill text is written, so that every instruction exists to correct an observed behavior gap.
48. As a skill maintainer, I want the core skill concise and branch details progressively disclosed, so that GPT-5.6-class models receive only task-relevant guidance.
49. As a skill maintainer, I want representative English, terse, and Taglish prompts, so that natural operator language routes reliably.
50. As a skill maintainer, I want regression scenarios for generic dashboards, embedded chat, unsafe authority, missing states, wrong ownership, and mock-only output, so that known failure modes stay fixed.

## Implementation Decisions

- Expose one model-invoked `$build-workflow-product` operator surface. Split a new public skill only if behavior evidence later proves an independently invoked leading action is necessary.
- Keep the universal workflow in the primary skill instructions and move branch-specific knowledge into directly linked Markdown references with explicit load conditions.
- Use the model-facing description to recognize create-UI, revamp-UI, workflow-product, sidecar, beautiful interface, and installable local product intent.
- Delegate callable skill-bundle construction to the sole Foundry skill-authoring authority rather than duplicating skill-generation behavior.
- Consume the versioned UI-plus-skill deliverable model from the skill-first Foundry revamp. Do not create a parallel task or artifact schema.
- Fail closed before implementation unless `workflow-foundry-006` has completed its validation-core, versioned-deliverable, derived-catalog, canonical-skill-builder, and mixed UI-plus-skill routing chain and those capabilities pass root validation. An operator-approved dependency reinterpretation must be explicit in task state; absence of the readiness signal is not permission to bypass the dependency.
- Require a selected target project and tracked task before product artifacts are approved. The builder may initiate or continue the task through existing lifecycle skills but cannot bypass phase guards.
- Keep Foundry implementation Markdown-first. The canonical bundle contains skill instructions, runtime metadata, and Markdown references only.
- Create application, runtime, package, fixture, and harness files only inside the separately approved target project.
- Fix the generated frontend stack to React, Vite, TypeScript, and Tailwind CSS.
- Keep Radix primitives and Lucide icons optional. Select them only when they materially improve accessibility, interaction semantics, or scanning without imposing a generic component-library appearance.
- Use an on-demand Node.js TypeScript companion server bound to the loopback interface as the browser's only project bridge.
- Give the React client no direct filesystem, shell, harness, credential, publishing, or consequential-action authority.
- Keep the harness as the only chat and agent surface. Do not embed a second chat, model runtime, model API key, or competing agent state in the browser.
- Keep generated products filesystem-first. Treat Markdown, JSON, skills, fixtures, configuration, and normal project files as canonical.
- Preserve capability provenance in canonical project files so generated artifacts retain their owning task, source skill, inputs, approval boundary, and artifact status.
- Treat browser storage, projections, search indexes, and caches as derived and disposable.
- Add database persistence only through a separately justified target-project decision based on data volume, concurrency, query, or integrity requirements.
- Package one independently versioned npm product per workflow project. npm is distribution and bootstrap, not the user-facing workflow interface.
- Materialize installation through an explicit bootstrap operation that names the destination and creates an editable user-owned directory outside `node_modules`. Never use a hidden `postinstall` process, never start the server during installation, and abort or offer a reviewable merge when the destination already contains content.
- Include complete project-local skill surfaces and runtime metadata for supported harnesses at publication time; do not generate or globally register them after installation.
- Exclude secrets, credentials, tokens, machine-specific paths, and private local state from generated and published artifacts.
- Use opening the installed directory in a harness as the skill-discovery boundary. Do not modify global harness configuration.
- Start or reuse the local sidecar only when the user explicitly invokes the included UI-opening skill. Provide visible startup, port, reuse, URL, failure, and stop behavior.
- Require an explicit workflow-to-UI contract containing data, state, evidence, actions, permissions, failure handling, and harness handoffs.
- Require each interactive control to declare validated inputs, visible lifecycle states, inspectable outputs, retry or recovery behavior, and side-effect classification.
- Require typed immutable state transitions, user-safe error boundaries and messages, and detailed diagnostics confined to the trusted local server.
- Route destructive, sensitive, clinical, financial, publishing, credential, and other consequential actions back to the harness for explicit approval.
- Produce a visual thesis, content plan, and interaction thesis before implementation.
- Before selecting architecture, identify the workflow category and target artifact families, define an observable visual-quality bar, and compare at least two credible interface approaches using the same fixed technical stack. Use a disposable prototype only when evidence cannot settle the choice on paper.
- Ground the design in actual workflow content and representative fixtures. Use visual references, moodboards, or generated concepts when they materially reduce ambiguity.
- Keep the Markdown design references explicit about interface archetypes, typography and color reasoning, responsive composition, motion, accessibility, critique, domain adaptation, and reusable target-project component quality.
- Prefer domain-specific workspace architecture and utility copy for operational products. Avoid marketing heroes unless the product job actually requires one.
- Start with composition, hierarchy, spacing, typography, and real evidence before decorative chrome or component count.
- Use shared quality foundations without imposing one universal visual theme, dashboard shell, or finished component set.
- Design responsive, keyboard, focus, reduced-motion, and assistive-technology behavior from the first slice.
- Treat loading, empty, partial, error, refusal, permission, recovery, offline, and unavailable states as product states rather than cleanup work.
- Use browser tools to inspect the rendered product at representative viewports and exercise hero workflows. Visual review must include actual behavior and state transitions.
- Keep prompts concise. Add reference material, examples, constraints, or tools only when an eval exposes a concrete reliability gap.
- Preserve upgrades through explicit reviewable merge or migration behavior. Never overwrite local edits silently.
- Preserve removal safety. User-created work cannot be deleted without confirmation.
- Keep a future catalog limited to discovery and installation. It cannot own product runtime, versioning, editable workspaces, or releases.
- Keep remote deployment optional and separately approved. A hosting deliverable must define its own authentication, network, data, secret, authorization, and external-write boundaries without weakening the local loopback product contract.

## Testing Decisions

- Test this Foundry task at the highest owned seam: a fresh supported harness receives a representative workflow project and raw product-building request, then emits the correct tracked route, versioned deliverable roles, visual/content/interaction theses, workflow-product and action contracts, target-project write plan, reference-driven decisions, downstream verification plan, and explicit forbidden-outcome handling.
- Keep actual React, server, package, and browser release behavior at the downstream target-project seam. `$build-workflow-product` must require those tests when invoked, but this Foundry task does not commit a generated product or claim that a downstream product passed.
- Allow disposable uncommitted target repositories during skill evaluation only when they are isolated from real projects and used to observe the agent's planned or generated behavior. Preserve evidence, not application code, in this repository.
- Use one shared scenario contract for baseline and post-skill runs. Each scenario records raw prompt, repository context, expected route, required outputs, forbidden outcomes, authority boundaries, observed result, runner identity, timestamp, and pass or fail.
- Begin implementation with RED fresh-agent runs before the new skill is visible. Record the agent's actual default behavior instead of inventing hypothetical failures.
- Cover English, terse, and Taglish invocations for create, revamp, and existing-product iteration.
- Include a Health-style operational workflow fixture to prove domain-specific design, sensitive-action gating, evidence visibility, and non-generic information architecture.
- Include a workflow with no UI to prove zero-to-one routing and a workflow with an existing UI to prove focused iteration rather than destructive replacement.
- Fail a scenario when the agent creates Foundry components or application code instead of target-project artifacts.
- Fail a scenario when UI code is allowed to satisfy the callable skill or workflow-pack deliverable.
- Fail a scenario when the browser embeds chat, model credentials, shell access, unvalidated file access, or independent consequential authority.
- Fail a scenario when the interface is a mock, screenshot, or read-only shell without real action contracts and workflow states.
- Fail a scenario when the output is a generic dashboard reskin without a domain-specific visual, content, and interaction thesis.
- Fail a scenario when required loading, failure, refusal, permission, recovery, or unavailable states are missing.
- Use deterministic checks in this task for bundle identity, runtime metadata, reference links, fixed-stack instructions, prohibited Foundry application code, lifecycle routing, dependency readiness, and derived discovery.
- Test the current canonical skill-bundle validator, task lifecycle and query surfaces, derived skill catalog consumers, and fresh-agent scenario runner. Use the root workflow-state validator plus the tracker workflow-state and generated-output tests as prior art for public-boundary state and projection checks.
- Require downstream target projects to use unit and integration tests for schema validation, filesystem boundaries, action contracts, state transitions, and error handling.
- Require downstream target projects to use Playwright-style end-to-end tests for startup, primary workflows, responsive behavior, keyboard navigation, consequential-action handoff, error recovery, and stop behavior.
- Require downstream evidence to retain screenshots, traces, and failure artifacts for visual and interaction review.
- Require downstream automated accessibility checks plus keyboard and focus inspection; automated accessibility alone is insufficient.
- Require downstream dependency, secret, injection, content-sanitization, and loopback-boundary checks for security review.
- Require downstream model and human critique for art direction, hierarchy, restraint, domain fit, and screenshot/demo quality.
- Require the skill to demand a downstream verification report covering build, typecheck, lint, unit tests, integration tests, end-to-end tests, available coverage, accessibility, security, package contents, harness parity, diff review, and remaining risks. This task verifies that contract rather than claiming those product checks ran.
- Run root workflow-state validation and tracker verification after every task-state or implementation slice.

## Out of Scope

- Building React components, CSS, templates, application code, local servers, npm packages, or backends inside the Foundry task.
- Shipping a universal public Foundry application or hosted SaaS builder.
- Replacing the existing read-only workflow tracker UI.
- Embedding chat, a model runtime, model credentials, or a second agent state in generated browser interfaces.
- Creating a Foundry component library, design-token package, UI starter repository, or reusable binary template.
- Supporting alternative frontend frameworks or styling systems in the initial contract.
- Requiring Electron or Tauri without a separately proven operating-system integration need.
- Requiring Radix, Lucide, or any specific component kit in every product.
- Adding a database by default.
- Automatically publishing npm packages or hosted deployments without an explicit external-write checkpoint.
- Coupling independent workflow packages through an umbrella runtime or release train.
- Silently overwriting edited installations or deleting user work.
- Reimplementing the typed deliverable schema or canonical skill-bundle builder owned by the skill-first Foundry revamp.

## Further Notes

The skill is intentionally capability-oriented rather than tied to one model
slug. Current OpenAI guidance documents stronger frontend layout, hierarchy,
design judgment, image fidelity, and intent understanding in GPT-5.6-class
models, while also recommending smaller prompts, task-relevant tools, explicit
authority boundaries, representative evals, and browser-based verification.
The bundle architecture should preserve those advantages without making older
supported harness models unusable.

The primary upstream process references are Matt Pocock's `to-prd`,
`to-issues`, `implement`, `tdd`, `code-review`, and `writing-great-skills`
skills. The primary construction references are ECC frontend, eval, security,
end-to-end testing, coding, and verification guidance, plus OpenAI's current
model and Codex frontend guidance.

Implementation remains dependent on the skill-first Foundry revamp's typed
deliverable, canonical skill-builder, derived catalog, and UI-plus-skill routing
capabilities. The issue plan must make that dependency explicit and cannot
silently bypass it.
