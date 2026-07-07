# Workflow Foundry Tracker UI Runner PRD

## Problem Statement

The workflow tracker exists and runs locally, but using it is still too manual
and the current interface is hard to scan once real task data appears. The user
wants one foundry skill that quickly opens the tracker without remembering
Astro commands, and a tracker view that is organized around one project at a
time instead of forcing all workflows into one long table.

The current linked-artifact display joins long file paths into a single text
block. That makes the right side of the table wrap heavily and turns the
workflow list into a cramped path dump instead of a readable operating surface.

The user also wants task rows to become actionable: pressing a task should make
it easy to continue that task in Codex. Because the tracker is read-only static
UI, this handoff must be explicit and safe rather than silent browser-side
command execution.

## Solution

Create a `workflow-tracker-ui` foundry skill that defaults to fast open/start
behavior. If the tracker dev server is already running, the skill opens it. If
not, the skill starts the Astro tracker and opens it. Verification remains
available as an explicit optional mode rather than slowing down normal viewing.

Refine the tracker UI into a project-scoped workflow console. The first screen
should make project selection obvious, show project-level task counts, and then
show the selected project's workflow tasks in a dense but readable layout. The
table should prioritize task identity, status, Matt phase, next action, and
summary context.

Linked artifacts should be compact by default. The UI should show artifact
counts and a small set of representative filenames, with a details affordance
for the full list. Long paths must not force the main workflow table to widen or
wrap into unreadable columns.

Task actions should include a safe `Continue` affordance. The reliable v1
behavior is to generate the exact `$continue-task project:<slug>
task:<task-id>` command and make it easy to copy. A best-effort Codex app open
handoff can be added only if a supported local mechanism exists. The browser UI
must not pretend it can silently execute Codex commands.

## User Stories

1. As the foundry operator, I want to run one skill to open the tracker, so that I do not have to remember the tracker directory or Astro command.
2. As the foundry operator, I want the tracker skill to open quickly, so that checking workflow state feels lightweight.
3. As the foundry operator, I want verification to be optional, so that normal UI viewing is not blocked by tests or builds.
4. As the foundry operator, I want to choose a project from the UI, so that I can focus on one workflow product line at a time.
5. As the foundry operator, I want the selected project to show its workflow tasks clearly, so that I can see what is todo, in progress, blocked, or done.
6. As the foundry operator, I want to see each task's Matt phase and next action, so that I know whether the work needs grilling, PRD, issues, implementation, or review.
7. As the foundry operator, I want linked artifacts to be summarized by count and useful filenames, so that long paths do not dominate the screen.
8. As the foundry operator, I want to expand artifacts only when needed, so that the default task list stays readable.
9. As the foundry operator, I want a task action that produces the correct continue command, so that I can resume a task without manually typing the project slug and task id.
10. As the foundry operator, I want any Codex app handoff to be explicit, so that the browser does not silently execute commands or mutate workflow state.
11. As a future maintainer, I want the UI to remain read-only against project and task JSON, so that the tracker cannot corrupt the canonical workflow state.
12. As a future maintainer, I want tests to cover project selection and artifact display behavior, so that the UI does not regress back into cramped wrapping.
13. As a future maintainer, I want the runner skill to document its modes clearly, so that fast open and verification do not become ambiguous.
14. As a future maintainer, I want the tracker skill to live under the canonical foundry skill surface, so that it is discoverable the same way as the other workflow skills.

## Implementation Decisions

- Keep the tracker as the existing Astro read-only app rather than replacing the framework.
- Add one canonical foundry skill for tracker operation with a fast default path and an explicit verification mode.
- Treat the runner skill as an operator workflow, not as a hidden daemon manager. It should report what it opened or started and where the UI is available.
- Replace the binary current-project-only control with a project chooser that can show all projects or a selected project.
- Prefer project-scoped task display over a global table as the primary viewing model.
- Render linked artifacts as structured data: count, compact visible labels, and an expandable full list.
- Add task-level continue handoff data derived from project slug and task id.
- Use command-copy as the reliable continuation handoff. Add direct Codex app opening only if an actual supported app mechanism is found during implementation.
- Preserve the read-only boundary: UI controls may filter, expand, copy, or navigate, but must not edit project JSON, task JSON, skills, scripts, or artifacts.

## Testing Decisions

- Extend the existing tracker data tests to cover any new derived fields needed for compact artifact display or continue-command generation.
- Extend generated-output tests to assert the project chooser, continue command text, artifact count summaries, and absence of mutating form behavior.
- Verify the fast runner path manually or with a deterministic script check: already-running server opens directly, missing server starts and opens.
- Keep tests at the behavior boundary. They should check rendered controls and generated data, not private helper internals.

## Out of Scope

- Editing task state from the tracker UI.
- Silently running Codex commands from browser JavaScript.
- Replacing Astro with a heavier app framework.
- Adding authentication or a remote hosted workflow dashboard.
- Solving global Codex app deep-linking unless a supported local mechanism is confirmed.
- Reworking unrelated tracker-maintenance or testing-session workflows.

## Further Notes

The existing tracker task already implemented the first Astro snapshot and is
in code review. This task is the v2 operating layer: one-skill access, better
project navigation, readable artifact display, and safe task continuation
handoff.
