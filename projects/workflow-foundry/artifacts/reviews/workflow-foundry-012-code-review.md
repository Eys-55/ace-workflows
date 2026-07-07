# Code Review: workflow-foundry-012 Capability Dependencies

Task: `workflow-foundry-012`
Date: 2026-07-08
Phase: `code-review`

## Scope

Reviewed the `workflow-foundry-012` implementation against:

- `projects/workflow-foundry/artifacts/prds/workflow-foundry-012-capability-dependencies.md`
- `projects/workflow-foundry/artifacts/issues/workflow-foundry-012-issue-001-capability-task-draft.md`
- `projects/workflow-foundry/artifacts/issues/workflow-foundry-012-issue-002-dependency-artifact-provenance.md`
- `projects/workflow-foundry/artifacts/issues/workflow-foundry-012-issue-003-dependency-write-plan-gate.md`
- `projects/workflow-foundry/artifacts/issues/workflow-foundry-012-issue-004-continue-time-dependency-steps.md`
- `projects/workflow-foundry/artifacts/issues/workflow-foundry-012-issue-005-validation-and-regression-coverage.md`
- `.agents/skills/initiate-task/SKILL.md`
- `.agents/skills/continue-task/SKILL.md`
- `scripts/validate-workflow-state.mjs`

## Standards

Result: pass after one review fix.

The implementation keeps the canonical `.agents/skills/` surface, does not add
legacy command or prompt shims, keeps workflow instructions in Markdown, and
uses `.mjs` only for deterministic workflow-state validation.

Review fix applied:

- `scripts/validate-workflow-state.mjs` now rejects dependency steps whose
  `selected_skill` is not listed in the referenced
  `capability_dependencies[].selected_skills` map. It also requires each
  capability dependency to include at least one selected skill.

## Spec

Result: pass.

The implementation preserves a single primary task model, requires explicit or
confirmed dependency use, limits suggestions to known tracker context, keeps
dependency project trackers read-only by default, records dependency steps and
artifact provenance, requires implementation-time write plans, and lets
`$continue-task` propose mid-execution dependency steps only after context load
and operator approval.

Direct project wrappers, broad connection registries, and live project-folder
scans remain out of scope.

## Validation

Commands run:

```bash
node --check scripts/validate-workflow-state.mjs
node scripts/validate-workflow-state.mjs
git diff --check
```

All passed.

## Remaining Risk

No blocking review findings remain. The validator checks the task-state
contract and schema boundaries; actual future dependency skill execution still
depends on operators following the approved `dependency_write_plan` at runtime.
