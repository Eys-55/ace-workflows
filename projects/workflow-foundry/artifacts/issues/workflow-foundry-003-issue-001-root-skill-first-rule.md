# Issue 001: Root Skill-First Rule

## Parent

`workflow-foundry-003`

## What to build

Make the foundry control plane explicitly skill-first and agent-runtime-first.
The top-level instructions must say that this repo builds workflow skills and
workflow packs for agent runtimes such as Codex, Claude Code, opencode, and
Antigravity-style environments. Commands may support validation, query helpers,
packaging, or internal skill behavior, but they are not the primary operator
surface.

## Acceptance criteria

- [x] Root instructions define the skill-first and agent-runtime-first rule.
- [x] Root instructions preserve `.agents/skills` as the active local Codex
      surface.
- [x] Root instructions distinguish project-local packaged skills as exportable
      artifacts, not active local skills by default.
- [x] Root instructions classify command-like helpers as support surfaces, not
      skill invocation surfaces.

## Blocked by

None - can start immediately.
