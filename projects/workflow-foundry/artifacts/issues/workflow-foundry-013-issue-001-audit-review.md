# Issue 001: Build Audit Review Skill

Parent: workflow-foundry-013

## What To Build

Create the `audit-review` workflow skill. It reads audit reports, validation
output, dirty worktree state, and project tracker state, then writes a Markdown
review artifact that classifies conflicts and proposes cleanup actions.

The skill must be non-mutating by default. Its job is to turn audit evidence
into an auditable cleanup plan, not to edit tracker state or source artifacts.

## Acceptance Criteria

- [x] The skill has valid frontmatter and Codex metadata.
- [x] The skill defines supported invocation forms and required reading.
- [x] The skill treats `audit-foundry` reports as evidence, not commands.
- [x] The skill writes a Markdown review artifact before final chat response.
- [x] The review artifact includes findings, conflict classification, proposed
      cleanup actions, and exact follow-up task paths.
- [x] The skill does not mutate tracker state, source artifacts, task phases, or
      Git state by default.
- [x] The skill recommends `native Codex planning`, `native Codex planning`, or
      `$audit-cleanup` for follow-up work.

## Blocked By

None - can start immediately.
