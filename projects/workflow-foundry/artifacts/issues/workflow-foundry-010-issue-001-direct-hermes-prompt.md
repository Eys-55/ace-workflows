# Issue 001: Direct Hermes Ace Foundry Prompt

## Parent

`workflow-foundry-010`

## What to build

Create the direct Markdown prompt that Ace can paste into Hermes to make Hermes
inspect Ace's workflow repo and propose an Ace-only foundry accounting system.
The prompt must be scoped to Ace's usage, must not instruct Hermes to create or
configure profiles, must not alter shared Hermes behavior, and must require
inspection plus explicit Ace approval before any writes.

## Acceptance criteria

- [x] The prompt is written as a direct message to Hermes.
- [x] The prompt is Ace-only and warns Hermes not to affect other users.
- [x] The prompt assumes Hermes profiles already exist and does not ask Hermes
      to create or configure profiles.
- [x] The prompt tells Hermes to inspect the current workflow repo before
      proposing files.
- [x] The prompt tells Hermes to propose exact files and changes before writing.
- [x] The prompt requires explicit Ace approval before writing anything.
- [x] The prompt states that Markdown plus JSON are the legitimate source of
      truth.
- [x] The prompt states that Google Sheets is only the easy-viewing/generated
      surface.
- [x] The prompt tells Hermes not to rely on bounded memory as the full work
      ledger.
- [x] The final prompt artifact is linked from the task JSON.
- [x] Workflow-state validation passes after the prompt and tracker updates.

## Blocked by

None - can start immediately.
