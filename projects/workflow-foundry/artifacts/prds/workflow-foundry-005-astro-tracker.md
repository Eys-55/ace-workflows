# PRD: Astro Project Task Tracker

Task: `workflow-foundry-005`
Status: Ready for issue breakdown

## Problem Statement

The workflow foundry stores project and task state in JSON, but reviewing that
state requires opening multiple files or running terminal queries. The user
wants a small visual tracker that makes project and task status scannable
without changing the JSON source of truth.

The tracker must stay completely read-only. It should make the current
workflow state easier to inspect, not become an editor, database, or alternate
task system.

## Solution

Build an Astro-generated tracker inside the workflow-foundry project. Astro
will read project and task JSON at build time and generate a static, read-only
tracker page.

The first version should show all repo projects by default, with a control to
filter down to the current workflow-foundry project. It should include a
light/dark mode toggle and render the task details needed to understand project
progress at a glance.

The generated tracker is a snapshot. When project or task JSON changes, the
operator rebuilds the tracker to refresh the static output.

## User Stories

1. As the repo operator, I want to see all projects in one tracker, so that I
   can understand the workflow system without opening every project folder.
2. As the repo operator, I want to filter the tracker to workflow-foundry, so
   that I can focus on the current project when maintaining the control plane.
3. As the repo operator, I want the tracker to be read-only, so that I do not
   accidentally edit canonical task JSON from the browser.
4. As the repo operator, I want to see each task status, so that I can spot
   todo, in-progress, blocked, and done work quickly.
5. As the repo operator, I want to see each task kind, so that I can separate
   workflow-change work from tracker-maintenance work.
6. As the repo operator, I want to see each previous workflow phase, so that I know whether
   a task is in intake, planning, PRD, issues, implementation, review, or done.
7. As the repo operator, I want to see next-action and phase-guard state, so
   that I know what kind of work is currently allowed.
8. As the repo operator, I want to see linked artifacts, so that I can jump
   from the tracker to the files that define or verify the work.
9. As the repo operator, I want a dark mode toggle, so that the tracker is
   comfortable to use in the same visual context as the rest of my tooling.
10. As the repo operator, I want a light mode option, so that the tracker is
    still usable in bright environments or screenshots.
11. As the repo operator, I want a compact visual summary, so that I can scan
    project health without reading full JSON files.
12. As the repo operator, I want the tracker to make stale snapshots obvious,
    so that I remember to rebuild after changing JSON.
13. As the repo operator, I want the tracker to handle one project today and
    many projects later, so that it does not need redesign when more project
    folders are added.
14. As the repo operator, I want invalid or missing tracker state to fail at
    build or validation time, so that the UI does not hide broken JSON.
15. As a future agent working in this repo, I want the tracker architecture to
    preserve JSON as the source of truth, so that automation can keep using the
    existing task model.

## Implementation Decisions

- Use Astro static generation as the implementation surface.
- Keep the tracker under the workflow-foundry project because it is
  maintenance UI for the repo workflow system.
- Treat project and task JSON as the only canonical state.
- Read JSON at build time and render a static tracker snapshot.
- Do not write to project JSON, task JSON, registry files, or task indexes from
  the browser.
- Include client-side JavaScript only for view controls such as theme toggling
  and project filtering.
- Show all projects by default.
- Provide a workflow-foundry-only filter for the current project view.
- Render at minimum: project name, project state, task id, title, task kind,
  status, previous workflow phase, explicit next action, phase guard, updated date, and
  linked artifacts.
- Show enough snapshot metadata for the operator to understand when the tracker
  was generated.
- Keep the UI dense and operational rather than marketing-like.
- Use deterministic build behavior so generated output can be validated.

## Testing Decisions

- Test the highest useful seam: the JSON-to-tracker data assembly and generated
  static output.
- Verify that all known projects and tasks appear in the generated tracker.
- Verify that workflow-foundry filtering hides other projects when present.
- Verify that the light/dark mode control is present and does not alter source
  JSON.
- Verify that required task fields are rendered for at least one representative
  task.
- Verify that malformed or missing required JSON fails validation rather than
  generating a misleading tracker.
- Keep tests and validation in JavaScript or shell-accessible commands; do not
  introduce Python.
- Run the repo workflow-state validator after tracker changes.

## Out of Scope

- Browser-side editing of project or task JSON.
- Live runtime updates when JSON changes.
- A database, API server, authentication, or remote deployment.
- GitHub issue synchronization.
- Replacing the JSON tracker model.
- Replacing existing query or validation scripts.
- Supporting arbitrary user-created project schemas outside the established
  project/task JSON contract.

## Further Notes

The tracker is a view artifact. The workflow-foundry JSON state remains the
source of truth. If the user later wants automatic refresh without rebuilding,
that should be treated as a separate runtime-app decision rather than an
extension of the static snapshot contract.
