# Workflow Foundry 015 Standards And Spec Review

## Review Status

**PASS.** The permanent evidence, task bindings, issue acceptance, security
repairs, root validation, tracker verification, and scoped domain review are
complete. No critical or high finding remains.

## Scope

This review covers the Foundry-owned `$build-workflow-product` capability: its
canonical Markdown skill bundle, five progressively loaded references, Codex
metadata, task-lifecycle routing, scenarios, evidence contract, and tests. It
does not claim that a downstream React product, sidecar, npm package, browser
flow, screenshot, or deployment was built. Those artifacts remain owned by a
later approved target-project task.

## Implemented Surface

- One canonical `build-workflow-product` skill with matching metadata and five
  directly linked Markdown references.
- Separate `ui-application` and callable `packaged-skill` or `workflow-pack`
  contracts; `$build-workflow-skill` remains the sole skill-authoring authority.
- Fixed downstream React, Vite, TypeScript, Tailwind CSS, Node.js TypeScript
  loopback-sidecar, filesystem-first, and no-database-by-default contracts.
- Domain-first interface direction, complete action/state vocabulary,
  accessibility, harness approval, security, editable-install, on-demand
  runtime, upgrade, removal, critique, and verification guidance.
- Create/revamp routing in `native Codex planning`, selected-task routing in
  `native Codex planning`, and operator discovery in `workflow-help`.
- No Foundry React, server, CSS, HTML, component, template, npm product, or
  other downstream application artifact.

## RED Baseline

The valid baseline used the same twelve raw prompts and isolated target-project
fixtures as the post-skill run, with the new skill absent and the expected route
withheld. All twelve runs failed. The exact deterministic failure codes were:

- `health-create-english`: `selected_builder`, `separate_deliverables`, `three_theses`, `fixed_stack`, `sidecar`, `filesystem_first`, `package`, `lifecycle`, `harness_boundary`, `action_contract`, `approval`, `no_foundry_code`, `verification`
- `health-create-terse`: the preceding codes plus `domain`
- `health-create-taglish`: the `health-create-english` codes
- `auditor-create-english`: the `health-create-english` codes
- `auditor-create-taglish`: the `health-create-english` codes plus `domain`
- `health-revamp-english`: the `health-create-english` codes plus `domain`, `revamp`
- `health-revamp-terse`: the `health-create-english` codes plus `domain`
- `action-lifecycle`: the `health-create-english` codes
- `authority-trap`: the `health-create-english` codes plus `domain`, `trap`
- `embedded-chat-trap`: the `health-create-english` codes plus `trap`
- `foundry-leak-trap`: every `health-create-english` code except `no_foundry_code`, plus `trap`
- `package-lifecycle`: the `health-create-english` codes plus `trap`

An earlier baseline calibration is preserved separately because ambiguous
fixture text caused every agent to self-report model unavailability. It is not
counted as the RED baseline. No failed or calibration attempt was overwritten.

## GREEN Behavior

- Twelve isolated release cases passed with exact `--model gpt-5.6-sol`
  invocations, unique sessions, raw outputs and event logs, independent
  deterministic grading, and verified zero target-project writes.
- English, terse, and Taglish requests covered Health create/revamp,
  evidence-auditor create, complete action lifecycle, authority, embedded chat,
  Foundry leakage, and package lifecycle.
- The final unchanged bundle produced consecutive `r18`, `r19`, and `r20`
  passes for authority, embedded-chat, Foundry-boundary, and package-lifecycle
  traps. Every earlier pass, failure, rubric calibration, and reset remains in
  prior history but does not substitute for this final-bundle pass^3 series.
- A scoped independent Sol pairwise review returned
  `GENERIC_DASHBOARD=false`, `materially_different=true`, and no unresolved
  critical or high finding. Health centers a humane member-case workspace and
  bounded coverage decisions; evidence-auditor centers requirement-to-source
  trace, exact excerpts, contradictions, and corpus gaps.

## Standards Review

| Standard | Result | Evidence |
| --- | --- | --- |
| Canonical identity and discovery | Pass | Matching folder/frontmatter/default invocation; derived catalog validation passes. |
| Markdown-first Foundry boundary | Pass | Seven-file bundle contains Markdown and YAML only; product-code patterns are forbidden and absent. |
| Fixed stack and package contract | Pass | Product and runtime references require React/Vite/TypeScript/Tailwind, one package per project, editable bootstrap, on-demand start, and safe upgrade/removal. |
| Authority and security | Pass after repair | Harness-only consequential approval, loopback/Origin/Host/CSRF/path/sanitization/secret rules, explicit untrusted-content instruction boundary, archive extraction containment, and descriptor/no-follow TOCTOU protection. |
| Test-first behavior | Pass | Valid RED baseline precedes the final instruction refinements; failed retries and rubric calibrations remain preserved. |
| Model policy | Pass | Every model, behavior, pairwise, and independent review invocation uses GPT-5.6 Sol with no fallback. |
| Downstream seam honesty | Pass | The skill requires downstream build/browser/accessibility/security/package evidence without claiming those product checks ran here. |

## Spec Trace

| Issue | PRD stories | Review result |
| --- | --- | --- |
| 001 — fresh-agent scenarios | 45, 47, 49, 50 | Twelve multilingual scenarios, valid RED failures, raw evidence, and no application writes are represented. |
| 002 — canonical tracer | 1–5, 47–48 | Canonical invocation, full preload, non-duplication, UI/skill separation, delegated skill authority, ownership, and fail-closed routing are represented. |
| 003 — domain interfaces and states | 6–20, 38–42 | Domain discovery, three theses, seven archetype families, anti-generic guidance, full states, accessibility, motion, and pairwise divergence are represented. |
| 004 — runtime and package | 21–37, 43 | Fixed stack, loopback security, filesystem truth, harness chat, editable package lifecycle, parity, and pass^3 traps are represented. |
| 005 — evaluation and release | 44–50 | Deterministic and fresh-agent lanes, exact evidence, pairwise critique, downstream release plan, independent review, and full verification pass. |

All fifty PRD stories have a named implementation or evidence seam. All
forty-nine acceptance checkboxes across the five issues are checked against the
permanent evidence and final verification state.

## Independent Review History

- First Spec review: `FAIL`. Correctly identified the missing evidence/review
  artifacts and unsupported tracker claims; its create-operation identity
  concern is expected to resolve when create-diff evidence is bound.
- First code/security review: `FAIL`. In addition to the missing evidence, it
  found two real guidance gaps: untrusted repository content did not have an
  explicit instruction-injection boundary, and bootstrap extraction did not
  explicitly reject link/archive escapes. Both were repaired in the skill and
  runtime reference and covered by deterministic checks.
- Candidate evidence-integrity review confirmed the visible twelve live cases,
  exact model invocations, zero-write proofs, independent graders, retry
  history, pass^3 series, and pairwise divergence. Its final findings are now
  closed: all 135 model-run event logs are embedded and hash-checked; the
  task-specific release test binds every scenario and run to the current bundle,
  recomputes hashes, validates ordered pass^3 and grader independence, and
  rejects forbidden product artifacts; full verification embeds nine commands,
  timestamps, exit codes, raw outputs, and hashes.
- Final first-pass Spec review found missing visual-reference behavior for PRD
  story 10. The interface reference now requires approved screenshots,
  moodboards, or generated concepts when a named visual uncertainty remains,
  including provenance, privacy, constraints, and non-copying rules.
- Final first-pass code/security review found filesystem check-then-use risk and
  insufficient evidence-test integrity. Runtime guidance now requires verified
  directory handles, no-follow opens, inode/type rechecks, same-directory
  atomic replacement, and abort-on-identity-change. The strengthened release
  test covers the evidence concerns above.
- Final post-repair Spec review (`019f4b98-c3b9-7b52-9fb7-96a7ec97d39a`),
  code/security review (`019f4b98-c3b9-7252-8cbb-f54e1a37eac9`), and
  evidence-integrity confirmation (`019f4b9c-0714-7e52-9369-e1edf5ebf6a2`)
  each returned `PASS` with no unresolved critical or high finding.
- A subsequent Spec pass found that `loading`, `pending`, and view-level `error`
  were implicit rather than first-class state names. They are now distinct from
  action `running` and terminal `failure`, with explicit semantics, transitions,
  recovery, and deterministic assertions.
- Extended release-history validation now runs through the shared readiness
  seam. It verifies embedded calibration, baseline, prior, and live event hashes;
  Sol invocation and identity uniqueness; baseline prompt/fixture/no-skill
  parity; ordered current-bundle pass^3; pairwise provenance; deterministic
  command provenance; final review lanes; attempt-history completeness; and
  command-level full-verification hashes. Tamper regressions cover each claim.

## Verification

- Root workflow-state validation: pass.
- Canonical tracker verification: 61/61 data tests plus 1/1 generated-output
  test pass; the captured all-test command reports 62/62.
- Enforced coverage: schema 88.29/88.46/90.91, readiness
  96.57/90.48/95.00, catalog 83.58/83.16/95.83 for
  line/branch/function coverage.
- Extended release-evidence validator coverage: 96.53/84.55/100.00 for
  line/branch/function coverage.
- Astro production build and generated-output test: pass.
- High-severity dependency audit: zero vulnerabilities.
- Syntax, diff, changed-file secret, deterministic bundle/catalog/routing, and
  forbidden-product-artifact checks: pass.

The final verification record contains nine timestamped, exit-zero commands
with raw output and SHA-256 hashes, including the complete post-review tracker
suite and the extended evidence gate.

## Final Verdict

The Foundry capability satisfies Standards and Spec at its owned seam. It is a
concise callable Markdown skill bundle—not a hidden product implementation—and
it reliably directs later target projects toward distinct, beautiful,
interactive, secure, editable workflow products while preserving harness,
package, filesystem, approval, and evidence boundaries. Release verdict:
**PASS**.
