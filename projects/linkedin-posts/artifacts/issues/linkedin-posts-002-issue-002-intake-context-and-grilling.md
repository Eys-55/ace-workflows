# Issue 002: Intake Context And Post Grilling

## Parent

`linkedin-posts-002` - Create LinkedIn post generation workflow

## What to build

Build the intake path that turns an arbitrary selected context set plus
post-level grilling answers into a ready-to-draft run record. The workflow
should accept any mix of project, task, foundry, whole-system, and rough-draft
inputs while preserving source boundaries and provenance.

The completed slice should be able to capture the run's selected context,
target audience, personalness level, user intent, user wording, optional rough
draft, and optional reader action without drafting or publishing anything.

## Acceptance criteria

- [ ] A draft run can include one project, multiple projects, one task, multiple tasks, foundry context, whole-system context, or any mix of those scopes.
- [ ] Source project trackers remain read-only by default during intake.
- [ ] Every selected source is represented in the run record with enough provenance for later claim tracing.
- [ ] The post-level grilling step requires target audience.
- [ ] The post-level grilling step requires low, medium, or high personalness level.
- [ ] The post-level grilling step captures the user's intent, framing, wording, and phrasing.
- [ ] Desired reader action is optional and must not be forced into every run.
- [ ] Existing rough draft input is accepted and stored when provided.
- [ ] The intake path does not generate drafts, post externally, or mutate a reusable voice profile.

## Blocked by

- `linkedin-posts-002-issue-001-draft-run-contract`

## User stories covered

- 1. Select any project, task, foundry context, or whole-system context.
- 2. Select multiple projects.
- 3. Select multiple tasks.
- 4. Provide a rough draft.
- 5. Generate from context without a rough draft.
- 6. Grilling before drafting.
- 7. User wording influences the post.
- 12. Ask for target audience.
- 13. Set personalness level.
- 14. Desired reader action is optional.
- 15. Suggest reader action when useful.
- 46. Preserve source project boundaries.
