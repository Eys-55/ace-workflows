# Issue 001: Start an Isolated Testing Session

## Parent

`workflow-foundry-008` - Project Testing Sessions

## What to build

Create the first end-to-end testing-session path: the operator invokes the
testing-session workflow with a start action, a project slug, and an optional
goal. The workflow creates an isolated session record for that project and logs
the initial session state without modifying normal project state.

This slice should prove the basic session lifecycle exists and that the
testing-session state is durable, project-scoped, and separate from ordinary
task execution.

## Acceptance criteria

- [x] The testing-session workflow accepts a start action with a required
      project slug and optional goal.
- [x] Starting a session creates a deterministic session id.
- [x] Starting a session creates session metadata/status state.
- [x] Starting a session creates an appendable structured event stream.
- [x] Starting a session creates a human-readable context file.
- [x] Starting a session updates only the project testing-session index and
      the new session folder.
- [x] Starting a session records at least started and preload-complete events.
- [x] Starting a session does not edit project source, task JSON, skills,
      scripts, or ordinary workflow artifacts.
- [x] Workflow-state validation still passes after this slice.

## Blocked by

None - can start immediately.

## User stories covered

- 1. Start a testing session for a specific project
- 2. Provide an optional goal
- 3. Keep testing mode read-only against normal project state
- 6. Give every session its own durable folder
- 7. Record session metadata and status
- 8. Record structured events
- 9. Preserve human-readable context
- 16. Keep testing-session writes narrowly scoped
- 19. Preserve the skills-first workflow surface
