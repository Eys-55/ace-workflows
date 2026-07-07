# Issue 001: Audit Foundry Skill Contract

## Parent

`workflow-foundry-011` - Audit Foundry Skill

## What to build

Create the Codex-discoverable `audit-foundry` skill as the canonical callable
surface for foundry audit reports. The skill should define the invocation
contract, read-only boundary, report-writing requirement, and handoff back to
normal tracker tasks for any fixes.

## Acceptance criteria

- [x] The skill lives under the canonical `.agents/skills` surface.
- [x] The skill frontmatter name matches the folder name.
- [x] Codex metadata exposes the skill with a clear display name and default prompt.
- [x] The skill supports `$audit-foundry`, `scope:foundry-projects`, `scope:projects`, and `project:<slug>` invocations.
- [x] The skill states that every run writes a Markdown report before final chat summary.
- [x] The skill states that source state is read-only and fixes require later tracked task work.
- [x] The skill follows Matt Pocock skill-writing guidance for predictable steps and concise trigger text.

## Blocked by

None - can start immediately.

## User stories covered

- 1. Run `$audit-foundry`
- 2. Default to foundry scope
- 3. Foundry-plus-projects report mode
- 4. Projects-only report mode
- 5. Specific-project report mode
- 6. Always write a Markdown report
- 10. Stay read-only against source state
- 18. Follow `.agents/skills` shape
- 19. Keep skill instructions concise and predictable
