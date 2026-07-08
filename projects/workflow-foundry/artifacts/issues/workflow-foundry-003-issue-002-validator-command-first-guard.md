# Issue 002: Validator Command-First Guard

## Parent

`workflow-foundry-003`

## What to build

Add section-aware validation that hard-fails command-first skill-calling
language where feasible. The validator should reject operator-facing sections
that present `npx`, `npm`, Python, or raw script commands as the way to call a
workflow skill, while allowing clearly labeled developer verification, package
smoke-test, deterministic validation, query-helper, or internal-support
sections.

## Acceptance criteria

- [x] Validation rejects command-first examples under operator-facing headings
      such as `Call The Skill`, `Use`, `Run`, and `Operator Usage`.
- [x] Validation permits command examples in explicitly labeled developer,
      package smoke-test, validation, query-helper, or internal-support
      sections.
- [x] Validation scans root instructions, active skills, project READMEs, and
      project-local packaged skill docs that are part of the workflow surface.
- [x] Validation remains compatible with deterministic `.mjs` helper usage.

## Blocked by

- `workflow-foundry-003-issue-001-root-skill-first-rule.md`
