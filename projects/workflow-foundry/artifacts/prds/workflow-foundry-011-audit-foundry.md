# PRD: Audit Foundry Skill

Task: `workflow-foundry-011`
Status: Ready for issue breakdown

## Problem Statement

The foundry now has multiple workflow surfaces: root instructions, project
instructions, JSON trackers, Codex-discoverable skills, validation scripts,
testing-session state, and a generated tracker UI. When the operator wants to
understand the current state of the foundry, there is no single audit workflow
that reads the right files, explains what is happening, writes a durable report,
and recommends the next tracker actions.

Existing surfaces help with pieces of this job. `review-project-state` reviews
one project before task work. `workflow-help` explains available skills and
scripts. The tracker UI makes state visible. None of those is the canonical
Markdown report generator for the state of the foundry.

The operator needs a Codex-accessible skill that audits the foundry, writes a
well-stored Markdown report, and summarizes the result in chat, while staying
read-only against source state. Project integration and connection registration
are not part of this task.

## Solution

Create a model-invoked `$audit-foundry` skill under `.agents/skills` with
Codex metadata. The skill reads the selected audit scope, writes a Markdown
report under `projects/workflow-foundry/artifacts/reviews/`, then summarizes
the report in chat.

The skill supports four report modes:

- `$audit-foundry` for foundry-only scope
- `$audit-foundry scope:foundry-projects` for foundry plus project trackers
- `$audit-foundry scope:projects` for project trackers without foregrounding
  foundry control-plane analysis
- `$audit-foundry project:<slug>` for one specific project

The default invocation is foundry-only. Project-inclusive modes are explicit.

The skill is read-only against source state. It may write the audit report
artifact, but it must not fix, rewrite, reclassify, or mutate tasks, skills,
project files, registry entries, validation scripts, generated UI, or other
workflow state. Any follow-up changes must happen through a later
`native Codex planning` or `native Codex planning` flow.

## User Stories

1. As the foundry operator, I want to run `$audit-foundry`, so that I can understand the current foundry state without manually opening every tracker file.
2. As the foundry operator, I want the default audit to focus on the foundry, so that the common path stays fast and clear.
3. As the foundry operator, I want a foundry-plus-projects report mode, so that I can inspect the foundry alongside project tracker state when needed.
4. As the foundry operator, I want a projects-only report mode, so that I can inspect project health without foregrounding the foundry control plane.
5. As the foundry operator, I want a specific-project report mode, so that I can audit one project by slug.
6. As the foundry operator, I want every audit to write a Markdown report, so that the state of everything audited is saved as a durable artifact.
7. As the foundry operator, I want the chat response to summarize the report, so that I can immediately know the important findings and next actions.
8. As the foundry operator, I want audit reports stored neatly under workflow-foundry reviews, so that they are easy to find later.
9. As the foundry operator, I want audit reports to name recommended next tracker actions, so that the audit leads to concrete follow-up work.
10. As the foundry operator, I want the audit to stay read-only against source state, so that asking for an audit never silently changes the foundry.
11. As the foundry operator, I want the audit to distinguish active skills from artifacts and generated UI, so that I do not confuse callable workflow surfaces with supporting files.
12. As the foundry operator, I want the audit to inspect root and project AGENTS.md boundaries, so that control-plane rules do not drift into project instructions.
13. As the foundry operator, I want the audit to inspect workflow-foundry task state, so that open, blocked, in-progress, and recently completed work is visible.
14. As the foundry operator, I want the audit to inspect validation behavior, so that I can see whether the foundry currently validates.
15. As the foundry operator, I want the audit to inspect generated UI state when relevant, so that tracker UI work is not hidden from foundry state.
16. As the foundry operator, I want project-inclusive audits to read project summaries, task indexes, non-done tasks, and testing-session indexes, so that project state is grounded without loading heavy evidence by default.
17. As the foundry operator, I want full artifacts, event streams, and quarantined import bodies loaded only when exact evidence is needed, so that audits stay focused.
18. As a future maintainer, I want the skill to follow the repo's `.agents/skills` shape, so that Codex can discover it predictably.
19. As a future maintainer, I want the skill to use concise steps and progressive disclosure, so that the audit workflow remains maintainable.
20. As a future maintainer, I want validation or fixtures to prove the skill metadata and report behavior, so that the audit surface does not regress.

## Implementation Decisions

- Build one callable skill named `audit-foundry`.
- Put the skill under the canonical `.agents/skills` surface with matching
  frontmatter name and `agents/openai.yaml` metadata.
- Do not create legacy command shims or custom prompt files.
- Keep the skill model-invoked because the operator wants a Codex-accessible
  slash-style skill.
- Use foundry-only as the default invocation.
- Use `scope:foundry-projects` for foundry plus projects.
- Use `scope:projects` for projects only.
- Use `project:<slug>` for a specific project report.
- Always write a Markdown report before returning the final chat summary.
- Store audit reports under `projects/workflow-foundry/artifacts/reviews/`.
- Use date-stamped `audit-foundry` Markdown filenames.
- Treat the report write as an output artifact, not a state mutation or fix.
- Keep source state read-only during audits.
- Report recommended next tracker actions instead of making follow-up changes.
- For foundry scope, load root instructions, registry, workflow-foundry project
  state, workflow-foundry task state, existing foundry skills, validation
  scripts, and generated UI state pointers.
- For project scope, load each selected project's AGENTS.md, project.json,
  task index, non-done task JSON files, and testing-session index summary when
  present.
- Keep full project artifacts, full testing-session event streams, and
  quarantined import bodies on demand unless a finding needs exact evidence.
- Preserve project integration and connection registration for a later task.

## Testing Decisions

- Validate skill structure through workflow-state validation.
- Add or update validation coverage so the new skill folder has matching
  frontmatter name and Codex metadata.
- Test report path construction at the highest available seam if a deterministic
  helper is introduced.
- Prefer existing query and validation helpers over adding broad new script
  logic.
- Verify that an audit report is always written for each invocation mode.
- Verify that the chat summary points to the written report path.
- Verify that source state is not changed by an audit except for the report
  artifact.
- Verify that foundry-only mode does not require loading project-heavy details.
- Verify that project-inclusive modes read project task indexes and non-done
  task JSON.
- Run `node scripts/validate-workflow-state.mjs` after implementation.

## Out of Scope

- Project integration.
- Foundry-owned project connection registration.
- Changing `native Codex planning` to support integration tasks.
- Fixing findings discovered by the audit.
- Editing task status, project metadata, registry entries, skills, validation
  scripts, generated UI, or project artifacts as part of an audit.
- Replacing `review-project-state` or `workflow-help`.
- Creating legacy command shims.
- Creating custom prompt files.
- Auditing external repositories directly.

## Further Notes

This skill should behave like an operator-facing audit report generator, not a
repair tool. Its job is to load the correct state, explain it clearly, preserve
the report, and name the next tracker actions. The follow-up work still belongs
in normal tracked tasks.
