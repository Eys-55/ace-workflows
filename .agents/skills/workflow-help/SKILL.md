---
name: workflow-help
description: Show the available ace-workflows skills, project surfaces, optional status ledger, validation helpers, and safest direct next action. Use when the user asks what the repository can do or which workflow skill fits a request.
---

# Workflow Help

Explain the active repository surfaces from current local evidence.

## Procedure

1. Read root `AGENTS.md` and `registry/agents-md.json`.
2. Inventory `.agents/skills/*/SKILL.md` and their metadata.
3. Inspect project directories and `project.json` files when project context is
   relevant.
4. Treat `tasks/` JSON as an optional status ledger, not an authorization gate.
5. Distinguish callable canonical skills from project-packaged or quarantined
   material.
6. Recommend the smallest direct path through native Codex planning,
   implementation, validation, commit, and branch push.

Do not invent missing capabilities or present helper scripts as callable
skills. Do not require a ledger record before work begins.

## Output

Return:

- active skills and their exact invocations
- relevant projects and ownership boundaries
- useful deterministic query or validation helpers
- the recommended direct next action
- any real blocker found in current repository state

## Developer Verification

Use `node scripts/query-workflow-state.mjs --skill-catalog` to verify the
derived callable-skill inventory when repository validation needs exact paths.
