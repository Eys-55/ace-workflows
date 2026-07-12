# AGENTS.md

This repository creates, refines, and validates agent workflows. Treat it as a
workflow foundry, not a generic notes folder.

## Operating Model

Use the native Codex workflow for repository changes:

```text
plan -> implement -> validate -> commit -> push
```

- Inspect the relevant repository and project context before planning.
- Use Codex Plan Mode for complex work; a separate repo-specific planning
  lifecycle is not required.
- Implement with ECC guidance, test-first or eval-first slices, and focused
  review.
- Validate in proportion to risk, inspect the diff, and scan for secrets before
  committing or pushing.
- A user request to perform repository work authorizes pushing the completed
  working branch after validation. It does not authorize merging into `main`,
  opening a pull request, publishing a release, or changing third-party state
  unless the user requests that action.

## ECC Is the Build System for Workflows

Use Everything Claude Code (ECC) as the source of truth for workflow
decomposition, skill design, prompt chains, test-first construction, eval
gates, agent handoffs, reusable resources, security, and validation.

For new features and bug fixes:

1. Define observable acceptance checks.
2. Add a failing test or eval when feasible.
3. Implement the smallest passing slice.
4. Refactor without weakening the checks.
5. Review correctness, security, and maintainability.

## Canonical Workflow Surface

`.agents/skills/` is the only canonical active skill surface. Codex discovers
repository skills there and invokes them as `$skill-name`.

Do not create active workflow command shims or custom prompt files. Keep
`SKILL.md` concise and move detailed conditional material into directly linked
references. A skill bundle has this shape:

```text
.agents/skills/skill-name/
  SKILL.md
  agents/openai.yaml
  references/       # optional
  scripts/          # optional deterministic support
  assets/           # optional
```

The folder name must match the lowercase, hyphenated `name` in frontmatter.
Put trigger guidance in the frontmatter `description` and write procedures in
imperative form.

Operator-facing documentation must lead with skill invocation and agent-runtime
usage. `npx`, `npm`, or raw helper scripts may support deterministic validation,
queries, or package smoke tests, but they are not substitutes for callable
skills.

## File Policy

- Python is not allowed.
- Workflow artifacts should be Markdown and JSON.
- `.mjs` is allowed only for deterministic validation or query helpers; it must
  not replace skill logic or workflow instructions.
- Prefer small, focused files and project-local homes over new top-level files.
- Never hardcode secrets, credentials, tokens, or private keys.
- Validate external input at system boundaries and fail with clear errors.

## Repository and Project Boundaries

Projects live under `projects/<project-slug>/`. The `workflow-foundry` project
owns the repository control plane: root skills, JSON helpers, registry entries,
and validation behavior.

Root `AGENTS.md` owns repository-wide workflow architecture, validation, file
policy, and Git safety. Project `AGENTS.md` files contain only project/domain
behavior, vocabulary, source rules, and output expectations. Every live
`AGENTS.md` must be registered in `registry/agents-md.json`.

Typical project layout:

```text
projects/project-slug/
  AGENTS.md
  project.json
  tasks/
    index.json
    task-id.json
  artifacts/
    prds/
    issues/
    reviews/
    handoffs/
```

Artifact directories are organizational categories, not mandatory delivery
stages.

## Optional Status Ledger

Project and task JSON is a passive status ledger. It may preserve project
context, dependencies, provenance, linked artifacts, acceptance criteria, and
session history, but it never gates implementation or requires a dedicated
task-creation or task-resume workflow.

When ledger state is relevant, inspect it before changing overlapping work.
Creating or updating a ledger entry is optional unless the user specifically
asks for status tracking. Never create a ledger entry solely to authorize an
edit.

Task details may record:

- task id, title, and kind
- status: `todo`, `in-progress`, `blocked`, or `done`
- a plain `next_action` for non-done work
- acceptance criteria and context
- dependencies and provenance
- linked artifacts and session history
- owner and last-updated metadata

Task indexes should retain only task identity, status, and update metadata.

## Working Procedure

Before editing:

1. Identify the owning project and affected surfaces.
2. Read the root and applicable project instructions.
3. Inspect relevant source, tests, configuration, and optional ledger state.
4. Inspect the worktree for overlapping user or agent changes.
5. Define the smallest implementation and its acceptance checks.

During implementation:

- Preserve unrelated and concurrent changes.
- Use immutable data transformations where practical.
- Keep functions small, errors explicit, and boundaries validated.
- Add fixtures or validators when manual inspection would be unreliable.
- Use project documentation for durable decisions without duplicating the same
  knowledge in multiple places.

Before completion:

1. Run the narrowest relevant tests, then broader verification when warranted.
2. Run repository validation for control-plane or ledger changes.
3. Inspect the complete diff and verify it has no whitespace errors.
4. Scan the pending commit for secrets and sensitive data.
5. Commit a coherent unit using Conventional Commits.
6. Push the current working branch and verify its remote commit.

## Validation Expectations

For code, include unit and integration coverage and critical end-to-end flows
where the repository has those harnesses. Maintain at least 80% coverage when a
coverage gate exists.

For workflow artifacts, use example inputs, expected outputs, repeatable
fixtures, and deterministic validators where appropriate. Validation should
cover JSON/schema correctness, index/detail consistency, registered project
instructions, dependency integrity, testing-session safety, skill structure,
and path/security boundaries.

## Git Safety

Use Conventional Commits: `<type>: <description>`.

Never discard user changes, force-push, merge into `main`, or rewrite public
history unless the user explicitly requests it. Before every push, inspect the
full diff, run relevant validation, and check for exposed secrets. If validation
or the secret scan fails, do not push; preserve the local work and report the
blocker.
