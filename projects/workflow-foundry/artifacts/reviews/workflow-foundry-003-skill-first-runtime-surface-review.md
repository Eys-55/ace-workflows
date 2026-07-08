# Workflow Foundry 003 Review: Skill-First Runtime Surface

## Scope

Reviewed the implementation for `workflow-foundry-003` against the PRD and
issue artifacts:

- root `AGENTS.md` skill-first runtime rule
- active `.agents/skills` guidance updates
- Real Life Workflows README and packaged skill wording
- Real Life Workflows package-surface validator
- workflow-state validator command-first guard
- audit report artifact ownership cleanup

## Findings

No blocking issues found.

## Spec Review

- Root instructions now explicitly define the foundry as skill-first and
  agent-runtime-first for Codex, Claude Code, opencode, and
  Antigravity-style environments.
- Active workflow skills repeat concise guidance without creating a separate
  local policy that conflicts with root `AGENTS.md`.
- Real Life Workflows now leads with agent-runtime skill usage and moves
  `npx real-life-workflow-search` to a package smoke-test section.
- Package/bin surfaces were classified and retained as packaging or smoke-test
  support, not deleted.
- The command-first validator is section-aware and scans root instructions,
  active repo skills, project READMEs, and direct project-local packaged skill
  docs.

## Standards Review

- Python remains forbidden.
- The new validator logic stays in `.mjs` and is limited to deterministic
  validation.
- The implementation preserves Markdown/JSON as the workflow artifact surface.
- Existing dirty unrelated work was not reverted.
- The two existing audit-foundry report artifacts were linked to their owning
  open audit task instead of being hidden or deleted.

## Validation

Passed:

```bash
node scripts/validate-workflow-state.mjs
node projects/real-life-workflows/artifacts/package/validate-readme-package-surface.mjs
node projects/real-life-workflows/artifacts/finder/validate-finder-artifacts.mjs
```
