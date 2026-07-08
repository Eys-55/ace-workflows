# Skill-First Runtime Surface PRD

## Problem Statement

The workflow foundry is drifting into command-first language and package-runner
examples when it should be building skills and workflow packs for agent
runtimes. Operator-facing docs can make it look like Ace is expected to call
workflow skills by running `npx`, `npm`, Python, or raw helper scripts. That is
the wrong operating model for this repo.

The intended model is skill-first. Ace uses Codex with `AGENTS.md` and
`.agents/skills`. Workflow products should be designed for agent runtimes such
as Codex, Claude Code, opencode, and Antigravity-style environments. Helper
commands can exist for deterministic validation, query helpers, package smoke
tests, or internal skill support, but they are not the product and must not be
presented as the normal way to call a skill.

## Solution

Make the skill-first, agent-runtime-first rule explicit at the foundry control
plane. The top-level `AGENTS.md` becomes the source of truth. Active workflow
skills repeat concise reminders where behavior could drift. Validation hard
fails where feasible when operator-facing workflow surfaces present raw command
execution as the primary skill-calling path.

The implementation should audit and classify existing command-like surfaces
before changing them. Deletion is not the default. Package metadata, bin
entries, and helper scripts may remain when they are justified as packaging,
validation, deterministic query helpers, or internal support called by a skill.
They must be clearly separated from operator-facing skill invocation.

The foundry uses a two-layer skill model:

1. `.agents/skills` is the active local Codex surface for normal Ace/Codex use.
2. Project-local packaged skills may exist as exportable skill-package
   artifacts for other agent runtimes, but their docs still lead with skill and
   runtime usage rather than command invocation.

## User Stories

1. As Ace, I want workflow docs to say which skill to use, so that I can operate through Codex instead of manually running commands.
2. As Ace, I want `AGENTS.md` to state the skill-first rule clearly, so that every future agent starts from the right operating model.
3. As Ace, I want active workflow skills to repeat the rule where needed, so that helper examples do not drift back into command-first usage.
4. As Ace, I want `npx`, `npm`, Python, and raw helper commands blocked as primary skill-calling examples, so that docs stop teaching the wrong workflow.
5. As Ace, I want validation to hard fail command-first skill usage where feasible, so that this does not rely on memory or taste.
6. As Ace, I want helper scripts allowed only when justified, so that deterministic validators and query helpers can still exist without becoming the product.
7. As Ace, I want project-local packaged skills to remain possible, so that workflow packs can be exported to other agent runtimes.
8. As Ace, I want packaged skill docs to stay skill-first, so that package surfaces still target Codex, Claude Code, opencode, and Antigravity-style environments.
9. As Ace, I want the audit to classify package and bin surfaces before deletion, so that useful packaging metadata is not removed blindly.
10. As Ace, I want command examples moved to developer verification or package smoke-test sections when they are valid, so that the operator path stays clean.
11. As Ace, I want invalid command-first examples repaired in the same task, so that root rules and real docs match.
12. As a future agent, I want a precise validator rule, so that I know when command-like text is acceptable and when it is a workflow-surface bug.
13. As a future agent, I want `.agents/skills` to remain the local active surface, so that I do not confuse project-local packaged skills with loaded Codex skills.
14. As a future agent, I want project README files to distinguish operator usage from developer packaging, so that package docs stay truthful without changing the operating model.
15. As a workflow package maintainer, I want `.mjs` helpers allowed only for validators, query helpers, or internal skill support, so that implementation code does not replace workflow instructions.
16. As a reviewer, I want an audit list of offending surfaces, so that implementation changes can be reviewed against concrete evidence.
17. As a reviewer, I want root rule changes, validator changes, and surface repairs tied to one task, so that validation failures are understandable.
18. As a workflow-foundry maintainer, I want the accepted rule to cover Codex, Claude Code, opencode, and Antigravity-style environments, so that the foundry is not overfit to a single CLI.

## Implementation Decisions

- Put the primary skill-first and agent-runtime-first rule in root `AGENTS.md`.
- Repeat concise reminders in active workflow skills when the rule affects behavior.
- Keep repeated reminders short and point back to root `AGENTS.md` instead of creating independent local policy.
- Treat `.agents/skills` as the active local Codex surface for normal Ace/Codex use.
- Treat project-local packaged skills as exportable skill-package artifacts, not as automatically active local Codex skills.
- Lead operator-facing docs with skill invocation and agent-runtime usage.
- Allow commands only under clearly labeled developer verification, package smoke test, deterministic validation, query-helper, or internal-support sections.
- Audit and classify existing package metadata, bin entries, CLI language, npm/npx examples, Python references, and raw helper command examples before deciding whether to rewrite, preserve, quarantine, or delete.
- Do not default to deletion. Delete or quarantine only after classification shows a surface violates the workflow contract and is not needed as packaging metadata, validation, or internal support.
- Sequence implementation as root rule plus validator first, then repair every audited violating surface approved for this task.
- The initial repair set should include active workflow skills, workflow-help text, relevant project-local packaged skill docs, project READMEs that are operator-facing, validation rules, and recent workflow-foundry artifacts where command-first skill-calling language appears.

## Testing Decisions

- Extend workflow-state validation to detect command-first skill-calling language in operator-facing sections.
- Prefer section-aware validation over broad string bans, because `npx`, `npm`, and helper commands may be valid in developer verification or package smoke-test contexts.
- Validate that headings such as `Call The Skill`, `Use`, `Run`, `Operator Usage`, or equivalent operator-facing sections do not present `npx`, `npm`, Python, or raw script calls as the primary invocation path.
- Validate that allowed command examples appear only under clearly labeled developer/package/verification/internal-helper sections.
- Add or update fixtures for malformed command-first skill docs and accepted developer-verification examples.
- Run `node scripts/validate-workflow-state.mjs` after changes.
- Run narrower package/readme validators when the implementation repairs project-local package surfaces.

## Out of Scope

- Publishing packages to any external registry.
- Installing or configuring Codex, Claude Code, opencode, or Antigravity.
- Deleting all package metadata or helper scripts by default.
- Rewriting every historical artifact if it is not part of an active operator-facing workflow surface.
- Promoting every project-local packaged skill into `.agents/skills`.
- Replacing deterministic validation or query helpers with prose-only instructions.

## Further Notes

This PRD preserves the distinction between workflow products and implementation
support. The foundry builds skills and workflow packs first. Helper code can
support those workflows, but the user-facing surface must not imply that Ace's
normal job is to manually run package or script commands to call skills.
