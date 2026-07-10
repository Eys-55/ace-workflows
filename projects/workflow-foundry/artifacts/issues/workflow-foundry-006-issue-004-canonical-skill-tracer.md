# Issue 004: Build One Canonical Skill From Raw Intent

## Parent

`workflow-foundry-006` - Design skill-first Workflow Foundry revamp

## What to build

Take raw create-skill language through proposed contract approval, lifecycle
routing, the sole model-invoked `$build-workflow-skill` authority, a callable
canonical bundle, discovery, role-aware completion, and durable behavioral
evidence. The bundle must contain skill instructions and Codex runtime metadata
with consistent folder, frontmatter, trigger, and invocation identity. Selected
Matt Pocock and ECC guidance must be evidenced, and optional resources must be
justified and linked.

Python, JavaScript-only, `.mjs`-only, helper-only, thin-wrapper,
command-first, incomplete-metadata, mismatched-identity, decorative-eval, and
unreferenced-helper outcomes must fail instead of being reported as skills.
Existing-skill language must update the identified canonical skill rather than
create a duplicate.

Drive the live fresh-agent and deterministic fixture seams from one shared
scenario contract. Each scenario must carry the raw prompt, repository context,
expected route, ownership boundary, required bundle, allowed support,
forbidden outcomes, dependency behavior, phase behavior, and expected final
result so the two seams cannot test different interpretations.

## Acceptance criteria

- [x] Raw canonical create-skill language produces an approved primary skill contract before implementation.
- [x] Lifecycle and help routing delegate the contract to `$build-workflow-skill` as the single authoring authority.
- [x] The builder produces a lowercase hyphenated canonical bundle containing `SKILL.md` and `agents/openai.yaml`.
- [x] Folder identity, frontmatter name, trigger description, default invocation, target surface, and runtime visibility agree.
- [x] The bundle defines workflow inputs, outputs, decisions, failures, human boundaries, handoffs, and completion criteria before optional support resources are added.
- [x] Applicable Matt Pocock and ECC guidance is named and evidenced in the workflow or eval result.
- [x] Existing-skill wording updates one identified bundle without creating a duplicate identity.
- [x] Completion fails for Python, code-only, helper-only, thin-wrapper, command-first, incomplete-metadata, identity-mismatch, decorative-eval, and unreferenced-helper fixtures.
- [x] Quick Start, Getting Started, Example, and unheaded command examples fail by default unless each command is inside an explicitly classified developer verification, package smoke-test, deterministic validation, query, or internal-support section.
- [x] One shared scenario contract drives both live fresh-agent runs and deterministic disposable-repository fixtures.
- [x] Fresh-agent English, terse, and Taglish scenarios produce the expected contract and callable bundle without being told the intended classification.
- [x] Evidence records the raw prompt, repository context, runner identity, expected route, observed contract and artifacts, timestamp, builder-contract version, and result.
- [x] The new builder and resulting skill enter every derived catalog consumer without a manual inventory edit.
- [x] Root workflow-state validation and tracker verification pass.

## Blocked by

- `workflow-foundry-006-issue-003-derived-skill-catalog`

## User stories covered

- 1. Classify create-skill intent before coding begins
- 3. Route foundry skills to the canonical surface
- 5. Stop when the skill destination is ambiguous
- 8. Require the canonical skill bundle
- 9. Keep bundle identity and invocation consistent
- 10. Put the trigger contract in the skill description
- 11. Use one dedicated skill builder
- 12. Keep lifecycle skills focused on state and phases
- 13. Make the builder reachable from lifecycle and help skills
- 14. Give local policy precedence over conflicting global defaults
- 15. Exclude Python scaffolding from this repository
- 16. Classify JavaScript and deterministic helpers explicitly
- 17. Justify optional resources
- 23. Block implementation when the skill contract is incomplete
- 24. Block completion when primary artifacts or evidence are missing
- 25. Prove skill creation with fresh-agent behavior tests
- 26. Reject script-only and thin-wrapper substitutes
- 29. Keep help aware of the builder and active canonical skills
- 33. Expose completion criteria at each authoring step
- 34. Trace intent through artifacts, dependencies, evals, and review evidence
- 38. Make Codex the first executable target with portable contracts
- 41. Distinguish an existing-skill update from new creation
- 44. Record raw behavioral scenarios and observed results
