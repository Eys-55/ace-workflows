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

- [ ] React, Vite, TypeScript, and Tailwind CSS are fixed target-project requirements.
- [ ] Radix and Lucide remain optional and cannot impose a generic visual system.
- [ ] The Node.js TypeScript companion binds only to loopback and validates allowlisted requests and responses.
- [ ] Host, origin, content sanitization, redacted logging, user-safe error, and secret boundaries are explicit.
- [ ] The browser receives no raw filesystem, shell, harness, credential, publishing, or consequential-action authority.
- [ ] Chat and model state remain in Codex, Claude Code, or opencode.
- [ ] Markdown, JSON, skills, fixtures, configuration, and project files remain canonical; browser caches are disposable; databases are opt-in by proven need.
- [ ] Installation creates an editable directory outside node_modules and performs no hidden startup or global configuration mutation.
- [ ] On-demand start/reuse/URL/failure/port-conflict/stop behavior is defined.
- [ ] Complete packaged skill surfaces remain capability-equivalent across supported harnesses.
- [ ] Upgrades review local modifications and removal preserves user work without confirmation.
- [ ] Authority and package-lifecycle regressions meet pass^3 before release.
- [ ] Root workflow-state validation and tracker verification pass.

## Blocked by

- `workflow-foundry-015-issue-002-canonical-product-skill-tracer`

## User stories covered

- 21-37. Approval boundaries, local security, harness parity, filesystem truth, startup, packaging, upgrades, removal, and independent releases.
- 43. Controlled loopback companion server.
