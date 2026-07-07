# Issue 004: Validate Testing-Session State

## Parent

`workflow-foundry-008` - Project Testing Sessions

## What to build

Add validation coverage for testing-session indexes and session records. The
validator should catch malformed indexes, malformed session metadata, invalid
event streams, and writes that make testing-session state look like ordinary
project task state.

This slice makes the session capture contract durable before broader workflow
use depends on it.

## Acceptance criteria

- [x] Validation accepts a well-formed testing-session index and session
      folder.
- [x] Validation rejects malformed testing-session indexes.
- [x] Validation rejects session records missing required metadata/status.
- [x] Validation rejects malformed structured event records.
- [x] Validation rejects testing-session state that points outside the selected
      project's testing-session artifact area.
- [x] Validation does not require every project to have testing sessions.
- [x] Validation proves normal task JSON is not treated as testing-session
      state.
- [x] No Python is introduced.
- [x] Workflow-state validation still passes after this slice.

## Blocked by

- `workflow-foundry-008-issue-001-start-session`
- `workflow-foundry-008-issue-003-project-preload-discovery`

## User stories covered

- 3. Keep testing mode read-only against normal project state
- 10. Discover prior sessions during project preload
- 16. Keep testing-session writes narrowly scoped
- 18. Detect malformed session indexes or logs
- 19. Preserve the skills-first workflow surface
