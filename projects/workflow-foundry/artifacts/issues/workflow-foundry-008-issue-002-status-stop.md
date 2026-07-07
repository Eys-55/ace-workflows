# Issue 002: Add Status and Stop Actions

## Parent

`workflow-foundry-008` - Project Testing Sessions

## What to build

Extend the testing-session workflow so the operator can inspect and stop an
existing independent testing run by session id. The status action should read
the stored session state. The stop action should mark the session as stopped
inside testing-session state and append a stop event, without converting the
run into a normal task or recommendation.

This slice completes the minimal lifecycle around the session state created by
the start action.

## Acceptance criteria

- [x] The testing-session workflow accepts a status action with a required
      session id.
- [x] The status action reads session metadata and reports the current testing
      session state.
- [x] The testing-session workflow accepts a stop action with a required
      session id.
- [x] The stop action updates only the session metadata, event stream, and
      project testing-session index.
- [x] The stop action records a stopped-by-operator style event.
- [x] Status and stop do not create recommendations, tasks, or task changes.
- [x] Status and stop do not edit project source, task JSON, skills, scripts,
      or ordinary workflow artifacts.
- [x] Workflow-state validation still passes after this slice.

## Blocked by

- `workflow-foundry-008-issue-001-start-session`

## User stories covered

- 5. Run independently
- 7. Record metadata and status
- 12. Inspect session status
- 13. Stop an independent run
- 16. Keep testing-session writes narrowly scoped
- 17. Avoid automatic recommendations
- 20. Cover start, stop, and status actions
