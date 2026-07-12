# PRD: Hermes Ace Foundry Prompt

Task: `workflow-foundry-010`
Status: Ready for issue breakdown

## Problem Statement

Ace wants Hermes to operate with a foundry-style accounting system when Ace is
using it. Every request to edit or add workflow material should be accounted
for in a legitimate workflow state surface, instead of living only in chat
memory or informal session context.

Hermes is shared by multiple people, so this behavior must stay Ace-only. The
prompt must not change global Hermes behavior, shared memory, shared skills, or
other users' operating context.

The immediate need is a direct Markdown prompt that Ace can give to Hermes. The
prompt should make Hermes inspect Ace's current workflow repo first, propose
the exact foundry files and changes, and wait for Ace approval before writing.

## Solution

Create one direct Markdown prompt for Hermes. The prompt tells Hermes to adopt
an Ace-only foundry accounting behavior for workflow work:

- Markdown plus JSON are the legitimate workflow state.
- Google Sheets is only the easy viewing layer.
- Hermes should answer from tracked workflow files as much as possible.
- Hermes should assume the active Ace profile/context already exists.
- Hermes must not create or configure profiles.
- Hermes must not alter shared behavior for other users.
- Hermes must inspect the repo before writing.
- Hermes must propose exact files and changes.
- Hermes must wait for explicit Ace approval before implementation.

The prompt should be designed for Hermes as the primary reader. It can remain
human-readable, but its structure should be direct, operational, and easy for
Hermes to execute.

## User Stories

1. As Ace, I want a direct prompt for Hermes, so that I can tell Hermes exactly
   how to build the foundry accounting behavior into my own usage.
2. As Ace, I want Hermes to treat Markdown plus JSON as the legitimate state, so
   that workflow work is not tracked only in memory or chat.
3. As Ace, I want Google Sheets to be a generated viewing layer, so that current
   workflow work is easy to inspect without making Sheets the source of truth.
4. As Ace, I want Hermes to answer from workflow files as much as possible, so
   that its answers are grounded in tracked state.
5. As Ace, I want the prompt to be Ace-only, so that other Hermes users are not
   affected by my workflow accounting system.
6. As Ace, I want Hermes to assume profiles already exist, so that the prompt
   does not waste effort creating or configuring profiles.
7. As Ace, I want Hermes to inspect the current workflow repo first, so that it
   understands the real file layout before suggesting changes.
8. As Ace, I want Hermes to propose exact files and changes before writing, so
   that I can inspect the plan and prevent accidental shared-system changes.
9. As Ace, I want Hermes to wait for my approval before writing files, so that
   the setup remains controlled.
10. As Ace, I want the prompt to preserve the foundry idea, so that every
    workflow add/edit request becomes accountable.
11. As Ace, I want the prompt to distinguish source of truth from view layers,
    so that Hermes does not accidentally treat Google Sheets as canonical.
12. As Ace, I want the prompt to warn Hermes not to use bounded memory as the
    full ledger, so that detailed workflow state stays in files.
13. As Ace, I want the prompt to be easy to paste into Hermes, so that I can use
    it directly without additional explanation.
14. As a future Hermes run, I want clear first steps, so that the agent does not
    jump straight into writing files.
15. As a future Hermes run, I want explicit non-goals, so that the agent does
    not modify shared profiles, global memory, or other users' behavior.

## Implementation Decisions

- The deliverable is a Markdown file written as a direct prompt to Hermes.
- The prompt is scoped to Ace's Hermes usage only.
- The prompt must not instruct Hermes to create or configure profiles.
- The prompt must assume the active Ace context/profile already exists.
- The prompt must tell Hermes to inspect the current workflow repo first.
- The prompt must tell Hermes to propose exact files and changes before
  writing.
- The prompt must require explicit Ace approval before any writes.
- The prompt must describe Markdown plus JSON as the legitimate workflow state.
- The prompt must describe Google Sheets as a generated/easy-viewing surface.
- The prompt must tell Hermes not to rely on bounded memory as the work ledger.
- The prompt should be concise enough to paste into Hermes in one message.
- The prompt may include a target foundry shape, but it should not pretend the
  files already exist before Hermes inspects.
- The prompt should preserve the repo's foundry principles: accountable work,
  structured state, operator ownership, validation evidence, and explicit next
  actions.

## Testing Decisions

- Review the prompt as a text artifact against the accepted planning decisions.
- Verify the prompt includes the Ace-only boundary.
- Verify the prompt includes the inspect-first rule.
- Verify the prompt includes the approval-before-writing rule.
- Verify the prompt distinguishes Markdown/JSON source of truth from Google
  Sheets viewing.
- Verify the prompt tells Hermes not to create or configure profiles.
- Verify the prompt is direct enough to paste into Hermes without extra
  explanation.
- Link the final prompt artifact from the task JSON.
- Run workflow-state validation after the prompt artifact and task updates are
  complete, noting unrelated validation blockers separately if present.

## Out of Scope

- Implementing the foundry accounting system inside Hermes.
- Creating or configuring Hermes profiles.
- Editing shared Hermes memory, shared skills, or shared behavior for other
  users.
- Building Google Sheets synchronization.
- Creating per-request Markdown records.
- Changing this repo's canonical workflow mechanics.
- Creating active command shims or custom prompt surfaces.
- Running the prompt inside Hermes during this task.

## Further Notes

The official Hermes documentation supports keeping detailed workflow accounting
outside bounded memory, using concise project context files, keeping reusable
procedures in skills, and using profile/session boundaries for isolation. The
prompt should align with those constraints while staying focused on Ace's
workflow foundry behavior.
