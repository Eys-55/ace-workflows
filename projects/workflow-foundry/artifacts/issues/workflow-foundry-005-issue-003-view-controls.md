# Issue 003: Add theme and project view controls

## Parent

`workflow-foundry-005` - Astro Project Task Tracker

## What to build

Add the small client-side controls needed for day-to-day use: a light/dark mode
toggle and a view toggle that switches between all projects and the current
workflow-foundry project. These controls should only affect presentation.

This slice should keep client-side JavaScript limited to view behavior and
must not introduce browser-side writes to the JSON tracker model.

## Acceptance criteria

- [ ] The tracker includes a light/dark mode toggle.
- [ ] The tracker includes a control to view all projects or only
      workflow-foundry.
- [ ] The all-projects view remains the default view.
- [ ] Theme and project filters update the visible UI without editing source
      JSON.
- [ ] Controls are accessible by keyboard and have clear labels.
- [ ] The UI remains dense, operational, and suitable for repeated scanning.
- [ ] The repo workflow-state validator still passes after this slice.

## Blocked by

- Issue 002: Render all projects and required task fields

## User stories covered

- 2. Filter to workflow-foundry
- 9. Dark mode toggle
- 10. Light mode option
- 11. Compact visual summary
