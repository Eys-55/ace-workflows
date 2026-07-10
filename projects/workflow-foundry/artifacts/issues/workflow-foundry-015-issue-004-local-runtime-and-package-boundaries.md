# Issue 004: Enforce Local Runtime And Package Boundaries

## Parent

`workflow-foundry-015` - Create Markdown-first build-workflow-product skill

## What to build

Add the local-sidecar-runtime reference and extend the workflow-product contract
through authority, embedded-chat, Foundry-leak, and package-lifecycle scenarios.
The slice defines the fixed target stack, loopback browser bridge,
filesystem-first persistence, safe action surface, editable npm installation,
harness parity, startup and stop behavior, and non-destructive lifecycle.

## Acceptance criteria

- [x] React, Vite, TypeScript, and Tailwind CSS are fixed target-project requirements.
- [x] Radix and Lucide remain optional and cannot impose a generic visual system.
- [x] The Node.js TypeScript companion binds only to loopback and validates allowlisted requests and responses.
- [x] Host, origin, content sanitization, redacted logging, user-safe error, and secret boundaries are explicit.
- [x] The browser receives no raw filesystem, shell, harness, credential, publishing, or consequential-action authority.
- [x] Chat and model state remain in Codex, Claude Code, or opencode.
- [x] Markdown, JSON, skills, fixtures, configuration, and project files remain canonical; browser caches are disposable; databases are opt-in by proven need.
- [x] Installation creates an editable directory outside node_modules and performs no hidden startup or global configuration mutation.
- [x] On-demand start/reuse/URL/failure/port-conflict/stop behavior is defined.
- [x] Complete packaged skill surfaces remain capability-equivalent across supported harnesses.
- [x] Upgrades review local modifications and removal preserves user work without confirmation.
- [x] Authority and package-lifecycle regressions meet pass^3 before release.
- [x] Root workflow-state validation and tracker verification pass.

## Blocked by

- `workflow-foundry-015-issue-002-canonical-product-skill-tracer`

## User stories covered

- 21-37. Approval boundaries, local security, harness parity, filesystem truth, startup, packaging, upgrades, removal, and independent releases.
- 43. Controlled loopback companion server.
