# Code Review: Audit Review And Cleanup Skills

Task: workflow-foundry-013
Generated: 2026-07-08
Review base: current worktree against PRD and issue artifacts

## Standards

No blocking standards issues found.

- The new skills use the canonical `.agents/skills/<name>/SKILL.md` shape with
  matching frontmatter names and Codex metadata.
- The implementation stays skill-first and does not add command shims, prompt
  files, Python files, or script-driven workflow logic.
- The two-skill split follows the approved design boundary: `audit-review` is
  non-mutating by default, while `audit-cleanup` is mutation-capable only behind
  tracker task, Markdown plan, phase guard, and validation gates.
- The help surface and validator enumerate the new canonical skills.
- The implementation avoids broad deletion and source-refactor behavior in v1.

## Spec

No blocking spec issues found.

- `audit-review` reads audit evidence, classifies cleanup actions, writes a
  Markdown review artifact after linkage preflight, and recommends exact
  follow-up skill paths.
- `audit-cleanup` requires a selected task and Markdown plan before mutation,
  preserves JSON phase guards as the enforcement source of truth, supports the
  approved v1 cleanup categories, and preserves the final push boundary.
- `audit-foundry` remains read-only and is not changed into a cleanup executor.
- Validation and tracker verification passed after implementation.

## Residual Risk

The skills are workflow contracts rather than executable automation. Their
behavior depends on future agents following the required reading, phase-guard
preflight, and final-push boundary. The current validator checks metadata,
canonical invocation names, changed-file linkage, and phase-gated artifacts; it
does not simulate a full future cleanup run.

## Validation

- `node scripts/validate-workflow-state.mjs` passed.
- `npm run verify` in the tracker package passed.
