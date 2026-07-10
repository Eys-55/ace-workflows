# Evaluation And Critique

Load this reference before the first product-skill write, after each behavior
slice, and before any target-product release claim. It defines two seams:
Foundry evidence proves that `$build-workflow-product` gives the right
instructions; a later target-project report proves that the generated product
actually works. Never use Foundry evidence as a substitute for product tests.

## Model Policy

Use GPT-5.6 Sol only for every baseline, post-skill run, critique, and
model-based grader. Record `gpt-5.6-sol` with the session identity and time. No
fallback model is permitted. If GPT-5.6 Sol is unavailable or cannot be
verified, record a blocker and stop the model lane; do not substitute, replay a
different run, or present deterministic checks as model evidence.

## RED Baseline

Create the behavior contract before skill text. Run fresh agents without the
new skill, hidden rubric, expected route, target layout, or answer-bearing
fixtures. Preserve their raw prompts and actual outputs, even when the response
is weak. A baseline failure must name the exact observed failure codes rather
than inventing a retrospective rationale.

Use the same versioned scenario contract for RED and post-skill runs. Record:

- scenario and fixture identity, raw prompt, language variant, clean repository
  context, and whether product writes were disabled;
- runner, model, unique session, skill version or explicit absence, started and
  completed times;
- raw output, disposable file tree and unified diff when files were allowed,
  or a verified zero-write observation when they were not;
- expected route, required outcomes, forbidden outcomes, observed route,
  failure codes, grader identities, and pass or fail; and
- retry lineage. Never erase a failed attempt to manufacture a first-pass win.

The representative fixture matrix must include English, terse, and Taglish
requests; a Health-style sensitive workflow; an evidence-auditor workflow; a
zero-to-one workflow with no UI; an existing product requiring focused revamp;
and the authority, embedded-chat, Foundry-leak, action-lifecycle, and package-
lifecycle traps. Disposable target repositories may be used, but do not commit
their generated application code or templates to the Foundry.

## GREEN And Regression Runs

Rerun every baseline from a clean disposable context with the same raw prompt
and fixture after the skill is visible. The grader may read the scenario
contract, but the runner must not receive expected outcomes as instructions.
Require unique sessions and retain the complete evidence record.

One pass is insufficient for high-risk stochastic behavior. The authority,
embedded-chat, Foundry-leak, and package-lifecycle traps each require pass^3:
three consecutive independent GPT-5.6 Sol passes with no intervening failure.
Any failure resets the sequence and remains in retry history.

Run deterministic checks on every change for bundle identity, runtime metadata,
reference links, fixed React/Vite/TypeScript/Tailwind CSS instructions,
prohibited Foundry application code, lifecycle routing, dependency readiness,
derived catalog discovery, package contents, and cross-harness capability
parity. Deterministic checks can reject a release; they cannot self-grade
visual quality or replace a fresh-agent run.

## Pairwise Anti-Generic Review

Compare Health and evidence-auditor outputs side by side using their real
content. Review the information architecture, labels, primary objects,
focusing mechanism, action model, evidence presentation, composition,
typography, color logic, and interaction thesis.

The pair passes only when the products are materially different because their
jobs are different. Set `GENERIC_DASHBOARD=false` only when neither output is a
card mosaic, noun-swapped shell, generic admin sidebar, placeholder demo, or
shallow reskin. Shared accessibility and state foundations are expected; shared
domain architecture is not. Record the concrete differences that support the
decision.

## Rendered Product Inspection

For each target-product release candidate, inspect the actual running product
in a browser at representative desktop, narrow, and touch viewports. Use real
workflow fixtures and exercise the hero path plus loading, empty, partial,
failure, refusal, permission, stale, offline, unavailable, retry, recovery,
consequential-handoff, and stop behavior.

Retain screenshots at stable checkpoints and browser traces for critical paths
and failures. A polished static screenshot is not evidence of working controls;
the trace must show state transitions, action results, focus behavior, and
recovery. Record console errors, failed network requests, layout overflow,
broken assets, and viewport-specific defects.

Visual and human critique must cover:

- **Context:** the real user, setting, workflow, and constraints;
- **First impression:** orientation, focus, and immediate legibility;
- **Visual design:** hierarchy, composition, typography, color, spacing,
  restraint, and motion;
- **Interface design:** domain fit, content credibility, focusing mechanism,
  state legibility, and action clarity;
- **Consistency:** behavior and visual language across states and responsive
  layouts; and
- **Real user context:** screenshot/demo quality with representative content,
  not an empty showcase.

Critique must identify specific evidence and an actionable correction. Praise
without inspection and unsupported scores do not pass.

## Independent Review Lanes

Use separate evidence lanes and distinct grader identities. No single model,
test command, author, or visual reviewer may declare release alone.

| Lane | Minimum evidence |
| --- | --- |
| Deterministic | Identity, links, routing, file policy, package manifest, harness parity, forbidden-file checks |
| Fresh-agent behavior | Raw GPT-5.6 Sol output, unique sessions, observed route and contracts, failure codes, retry lineage |
| Unit and integration | Schema boundaries, allowlists, filesystem containment, action contracts, state transitions, error handling |
| E2E browser | On-demand start/reuse/URL/port failure/stop, hero workflows, responsive behavior, consequential handoff, recovery |
| Visual and human | Screenshots, traces, pairwise domain review, hierarchy, restraint, coherence, demo readiness |
| Accessibility | Automated scan plus manual keyboard order, visible focus, semantics, labels, contrast, touch targets, reduced motion |
| Security | Loopback binding, host/origin rejection, traversal/symlink/injection tests, sanitization, redacted logs, secret and authority review |
| Repository and release | Build, typecheck, lint, tests, coverage, dependencies, secrets, package contents, diff and risk review |

The behavior runner cannot grade itself. An author may explain intent but cannot
supply the only acceptance result. Preserve disagreements and unresolved risks
instead of averaging them away.

## Accessibility, Security, And E2E Gates

Automated accessibility scans are necessary but insufficient. Exercise the full
hero flow with keyboard only; inspect focus entry, order, trapping, restoration,
status announcements, error association, zoom/reflow, contrast, touch targets,
and reduced motion. Test with representative long and empty content.

Security review must attempt disallowed origins and hosts, malformed schemas,
oversized payloads, path traversal, symlink escape, injection, unsafe rendered
content, unauthorized action ids, browser requests for secrets, and independent
consequential execution. Confirm logs and error envelopes remain redacted.

E2E tests must exercise behavior rather than selectors alone. Cover a clean
explicit start, verified reuse, visible port conflict, startup failure cleanup,
exact URL handoff, primary safe actions, running/progress states, cancellation,
failure and recovery, harness approval handoff, responsive keyboard operation,
and explicit stop with termination verification. Save screenshots and traces on
failure and at the approved visual checkpoints.

## Release Evidence Gate

The target-project verification report must record commands, versions, start
and completion times, raw result summaries, artifacts, and remaining risks for
all of these gates in order:

1. build;
2. typecheck;
3. lint;
4. unit tests;
5. integration tests;
6. E2E tests;
7. available line, branch, function, and statement coverage, with at least the
   project's required threshold and no unexplained untested authority path;
8. accessibility automation and manual keyboard/focus inspection;
9. dependency audit and license review;
10. secret scan plus injection, sanitization, loopback, and authority checks;
11. package dry run, expected contents, editable-install smoke test, and harness
    parity;
12. screenshots, traces, visual critique, and human domain review; and
13. final diff review for unexpected files, generated residue, credentials,
    unrelated changes, and unresolved critical or important findings.

A missing, stale, red, self-attested, or decorative record blocks completion.
Coverage percentages alone do not excuse an untested consequential branch. A
green build does not excuse visual, accessibility, security, or behavioral
failure. Report partial success as partial; do not collapse it into pass.

## Foundry Completion Versus Product Release

This Foundry task may pass when its bundle, lifecycle, discovery, scenarios,
fresh-agent evidence, security contract, and diff review are green and Standards
and Spec review have no unresolved critical or important findings. It must state
that downstream application checks were required, not claim they ran.

A target-project product may pass only after every applicable gate above has
fresh evidence against the committed release candidate. If any required lane is
blocked, unavailable, or failing, record the blocker and explicit next action.
No fallback model, mock-only UI, screenshot-only review, skipped trap, or human
waiver may silently turn that blocker into release.
