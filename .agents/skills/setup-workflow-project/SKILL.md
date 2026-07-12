---
name: setup-workflow-project
description: Set up a new workflow project with project instructions, project metadata, optional passive status-ledger files, artifact folders, registry coverage, and validation. Use when the user asks to create or initialize a workflow project.
---

# Setup Workflow Project

Create a project-owned workspace under `projects/<project-slug>/`.

## Inputs

Require a lowercase hyphenated slug, objective, target users, workflow scope,
source boundaries, and acceptance bar. Ask only for information that cannot be
derived from repository context.

## Procedure

1. Read root `AGENTS.md`, `registry/agents-md.json`, and nearby project examples.
2. Confirm the slug and paths do not collide with existing projects.
3. Plan the smallest project structure needed for the requested product line.
4. Create `AGENTS.md` with domain-only guidance and create `project.json` with
   objective, users, scope, sources, lifecycle state, ECC concepts, acceptance
   bar, and the project-instruction path.
5. Register the project `AGENTS.md` in `registry/agents-md.json`.
6. Create only useful artifact categories. Existing PRD, issue, review, and
   handoff directories are organizational categories, not required stages.
7. Create `tasks/index.json` only when the user wants a passive status ledger;
   initialize it empty and do not create an authorization record.
8. Run repository validation, inspect the diff, scan for secrets, commit, and
   push the working branch.

Never redefine root control-plane rules in project instructions. Do not create
Python, active command shims, or helper code that substitutes for a skill.

## Output

Return the project path, files created, registry change, validation evidence,
commit, pushed branch, and any remaining risk.
