# Issue 002: Build The Canonical Product Skill Tracer

## Parent

`workflow-foundry-015` - Create Markdown-first build-workflow-product skill

## What to build

Create the smallest complete `$build-workflow-product` bundle that turns one raw
workflow-product request into the correct tracked target-project contract. The
tracer includes model-invoked metadata, the universal preflight and build
sequence, and one workflow-product contract reference. It must route callable
skill construction through the Foundry's sole skill-builder authority and
preserve separate UI, skill, runtime, package, and support deliverables.

Retest the narrow tracer against the shared scenario format. Do not add visual,
runtime, or packaging depth before the core ownership and task route passes.

## Acceptance criteria

- [x] The canonical bundle has matching lowercase identity, trigger-rich description, required runtime metadata, and `$build-workflow-product` default invocation.
- [x] The core sequence requires a selected project, complete tracker preload, and an approved target-project task before writes.
- [x] Create and revamp intent route without duplicating an existing target task.
- [x] UI and callable workflow-skill deliverables remain distinct.
- [x] Skill-bundle construction delegates to the sole `$build-workflow-skill` authority.
- [x] Foundry code and target-product code land in their owning boundaries.
- [x] Missing ownership, task, real content, or artifact approval stops before writes.
- [x] The first post-skill scenario proves correct routing and contract output.
- [x] Root workflow-state validation and tracker verification pass.

## Blocked by

- `workflow-foundry-015-issue-001-fresh-agent-scenario-foundation`
- `workflow-foundry-006-issue-006-multi-deliverable-routing` and its blocker chain

## User stories covered

- 1-5. Canonical invocation, authority separation, tracked task, typed contracts, and complete preload.
- 47-48. Eval-grounded and progressively disclosed skill authoring.
