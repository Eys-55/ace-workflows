# Issue 003: Add Task Detail And Continue Command

## Parent

`workflow-foundry-009`

## What to build

Make task selection open a detail surface instead of switching execution
context. On desktop, the detail surface should be a right-side drawer inside the
task pane. On mobile, it should expand under the selected task. The detail view
should show full next action, pre-previous workflow/phase-guard context, recent session log,
expandable full session log, grouped artifacts, and an exact copyable continue
command.

## Acceptance criteria

- [ ] Selecting a task opens details without mutating project/task JSON.
- [ ] The continue command is shown as `native Codex planning project:<slug> task:<task-id>`.
- [ ] The copy button copies the command when clipboard access is available.
- [ ] The detail panel shows latest session events by default and can disclose the full log.
- [ ] Full artifact paths are available only in progressive disclosure areas.

## Blocked by

- `workflow-foundry-009-issue-001-derived-state.md`
- `workflow-foundry-009-issue-002-project-console-ui.md`
