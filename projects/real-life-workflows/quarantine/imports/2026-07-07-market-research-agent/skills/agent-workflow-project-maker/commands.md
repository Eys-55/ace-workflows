# Agent Workflow Project Maker Internal Adapter Reference

This is an Internal Adapter Reference, not operator instructions. Do not tell the user to run these commands. Skills are the operator interface. Codex chat is
the operator surface. The user never runs tracker scripts; scripts are internal
adapters.

Plain chat is the primary workflow trigger. Codex should treat messages such as
"I am building a workflow", "I found a bug in my workflow", "create a workflow",
and "continue this workflow" as workflow-intake requests.

skills/ is canonical. These slash names are compatibility metadata for Codex and
cross-harness parity, not a second workflow source of truth.

| Slash | Mode | Purpose |
| --- | --- | --- |
| `/tracker workflow` | start | Compatibility phrase for tracker-backed workflow intake in chat. |
| `/tracker status` | status | Show tracker-backed workflow status and current next actions. |
| `/tracker closeout` | closeout | Check validation, GitHub upload safety, and continuation readiness. |
| `/workflow-find` | read | Find existing workflow surfaces before creating anything new. |
| `/workflow-router` | read | Route a raw workflow problem through ECC-loaded workflow intake. |
| `/workflow-contract` | draft | Draft or inspect an ECC workflow contract for a workflow idea. |
| `/workflow-create-skill` | write | Create draft workflow scaffold files after explicit confirmation. |
| `/workflow-status` | status | Show tracker-backed workflow status and current next actions. |
| `/workflow-closeout` | closeout | Check validation, GitHub upload safety, and continuation readiness. |

There is no Python slash registry and no Python workflow-intake command. Codex
uses this document as compatibility vocabulary, then follows the canonical skill
contract in chat.

## Router Contract

Workflow-router work must start from ECC-loaded intake. A reported workflow bug
or workflow problem creates or locks a tracked workflow run, loads ECC and
workflow-specific context, writes a context manifest, shows visible ECC proof,
then asks the first context-aware grilling question.

Do not use these commands to skip into implementation.
