# Workflow Foundry Tracker UI Runner PRD

## Problem Statement

The workflow tracker exists and runs locally, but it still behaves like a
generated status table instead of a workflow operating surface. Opening it
requires remembering the tracker directory and Astro command, and the UI makes
project focus harder than it needs to be.

The current tracker also exposes linked artifacts as long raw paths. Real
workflow tasks can have many artifacts, so the linked-artifacts column wraps
heavily and turns the task view into a cramped path dump.

The foundry operator wants a fast one-skill way to open the tracker, then a
project-first UI that shows actual workflow tasks, their phase, their next
action, and their artifacts without mutating canonical project/task JSON.

## Solution

Create a `workflow-tracker-ui` foundry skill that defaults to fast open/start
behavior. If the tracker is already running, the skill opens it. If not, it
starts the Astro tracker and opens it. Verification remains available as an
explicit optional mode, but normal opening must stay quick.

Refine the tracker into a read-only project workflow console:

- left sidebar for project navigation and project search
- right pane for selected-project summary, lifecycle rail, task search, active
  task rows, and a collapsed done section
- task details in a right-side drawer on desktop and an expanded section on
  mobile
- linked artifacts grouped by type with human-readable labels first and raw
  paths disclosed only when needed
- explicit `$continue-task project:<slug> task:<task-id>` command copy, with no
  direct Codex app handoff in this version

The tracker remains read-only. Browser state may remember the selected project
and selected task in `localStorage`, but it must not write to workflow JSON.

## User Stories

1. As the foundry operator, I want to run one skill to open the tracker, so that I do not have to remember the tracker directory or Astro command.
2. As the foundry operator, I want the tracker skill to open quickly, so that checking workflow state feels lightweight.
3. As the foundry operator, I want verification to be optional, so that normal UI viewing is not blocked by tests or builds.
4. As the foundry operator, I want dark mode by default, so that the tracker opens in the preferred working theme.
5. As the foundry operator, I want a visible light/dark toggle, so that I can change themes without editing code.
6. As the foundry operator, I want projects in a left sidebar, so that project switching stays visible while I inspect tasks.
7. As the foundry operator, I want to filter projects by name or slug, so that the sidebar scales as the foundry grows.
8. As the foundry operator, I want each project entry to show active task count, blocked count, and current hot phase, so that I can triage projects quickly.
9. As the foundry operator, I want a selected-project summary strip, so that I can see open, blocked, in-review, and done counts before reading task rows.
10. As the foundry operator, I want the selected project's goal and domain visible, so that task work stays tied to the project context.
11. As the foundry operator, I want active/open tasks to be primary, so that done tasks do not bury current work.
12. As the foundry operator, I want completed tasks collapsed by default, so that historical work remains available without crowding the main list.
13. As the foundry operator, I want task rows to be dense, flat, outlined, and 2D, so that the UI feels like an operating tool instead of decorative cards.
14. As the foundry operator, I want each task row to show a truncated next action, so that I can scan what each task needs.
15. As the foundry operator, I want task clicks to open details first, so that selecting a task does not unexpectedly switch Codex context.
16. As the foundry operator, I want task details in a right-side drawer on desktop, so that the task list and selected task can be compared.
17. As the foundry operator, I want task details inline on mobile, so that small screens do not require a cramped side drawer.
18. As the foundry operator, I want the detail panel to show the full next action, so that I can resume work without guessing.
19. As the foundry operator, I want the detail panel to show the latest session events, so that I can understand recent task history quickly.
20. As the foundry operator, I want the full session log expandable, so that deeper history is available without dominating the default view.
21. As the foundry operator, I want a monospace continue-command box with a copy button, so that I can resume exactly the selected task.
22. As the foundry operator, I want continue commands to include both project slug and task id, so that the command is explicit and paste-safe.
23. As the foundry operator, I want no direct Codex app handoff in this version, so that the UI does not pretend browser JavaScript can execute Codex commands safely.
24. As the foundry operator, I want a lifecycle rail from intake/preflight through done, so that each task's process position is obvious.
25. As the foundry operator, I want lifecycle rail chips to filter tasks by phase, so that phase navigation does not require a separate control.
26. As the foundry operator, I want the selected task's current phase highlighted in the rail, so that detail context stays visible.
27. As the foundry operator, I want intake, project preload, and phase-guard readiness noted separately from later Matt phases, so that pre-Matt work is not flattened into implementation status.
28. As the foundry operator, I want task search scoped to the selected project, so that search does not jump across product lines unexpectedly.
29. As the foundry operator, I want task search to cover title, id, status, phase, and artifact title, so that I can find work by any common handle.
30. As the foundry operator, I want linked artifacts grouped by type, so that PRDs, issues, skills, tracker files, tests, and other files are easier to scan.
31. As the foundry operator, I want artifact labels to show human-readable names first, so that raw paths do not dominate the main UI.
32. As the foundry operator, I want full artifact paths progressively disclosed, so that long paths never create cramped wrapping in task rows.
33. As the foundry operator, I want the tracker to remember the last selected project and task, so that returning to the UI preserves local viewing context.
34. As a future maintainer, I want browser persistence to stay in `localStorage` only, so that canonical workflow JSON remains source of truth.
35. As a future maintainer, I want derived tracker data covered by tests, so that project stats, artifact grouping, and continue commands do not regress.
36. As a future maintainer, I want generated-output tests to cover visible controls, so that the UI cannot silently lose project filtering, command copy, or artifact grouping.
37. As a future maintainer, I want the runner skill to live under `.agents/skills`, so that it is part of the canonical workflow surface.
38. As a future maintainer, I want the skill metadata to match the folder name, so that Codex discovery remains predictable.

## Implementation Decisions

- Keep the tracker as the existing Astro read-only app.
- Use the existing data-loader seam as the main derived-state seam.
- Add derived task fields for continue command, next-action text, lifecycle phase,
  recent/full session log, and grouped artifact labels.
- Add derived project fields for open, blocked, in-review, done, active task
  count, and hot phase.
- Replace the all-project table with a two-pane project console.
- Keep task rows as flat outlined rows with restrained color accents and no
  shadows, bevels, or nested card treatment.
- Make lifecycle rail chips interactive filters scoped to the selected project.
- Keep search/filter behavior entirely client-side against already-rendered
  read-only HTML.
- Use `localStorage` only for selected project and selected task.
- Generate exact continue commands in the form `$continue-task project:<slug>
  task:<task-id>`.
- Do not add Codex deep-link/app handoff in this version.
- Create a model-invoked `workflow-tracker-ui` skill because the user wants a
  named workflow surface that can be run directly.
- Keep the skill concise and procedural; do not create command shims.

## Testing Decisions

- Test derived workflow state through `loadWorkflowState`, not private helper
  internals.
- Assert that representative tasks expose project stats, grouped artifacts,
  continue commands, lifecycle phase, and recent session events.
- Test generated HTML after `astro build`, because the tracker is a static
  generated output.
- Assert that generated output includes project sidebar/search, lifecycle rail,
  task search, continue command copy, grouped artifact labels, and read-only
  behavior.
- Verify the skill files through repository validation.
- Run tracker verification from the tracker package and workflow-state
  validation from the repo root.
- Run the UI locally and inspect it after implementation.

## Out of Scope

- Editing project or task JSON from the tracker UI.
- Silently running Codex commands from browser JavaScript.
- Direct Codex app deep-linking or app automation.
- Replacing Astro with a different app framework.
- Adding authentication or remote hosting.
- Reworking unrelated workflow-foundry tasks.
- Turning PRD/issues/code-review phases into separate repo-local skills.

## Further Notes

This task is the v2 operating layer on top of the existing Astro tracker. The
goal is not a decorative dashboard. The goal is a fast, explicit, project-first
workflow console that lets the operator decide what to continue next and copy
the correct command without losing the read-only boundary.
