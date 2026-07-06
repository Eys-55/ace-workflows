# AGENTS.md

This repository exists to create, refine, and validate agent workflows. Treat it
as a workflow foundry, not a generic notes folder.

## Non-Negotiable Operating Rule

For every change in this repository, including the smallest edit, follow the
Matt Pocock process and reference files used by this repo. Before changing a
workflow, skill, markdown file, prompt chain, command, or supporting script:

1. Locate the relevant Matt Pocock source material. The canonical source is
   `mattpocock/skills`: https://github.com/mattpocock/skills
2. Read it before editing.
3. Mirror its structure, naming, examples, and quality bar unless the user asks
   for a deliberate deviation.
4. If no local Matt Pocock mirror or reference file exists yet, inspect the
   upstream repository before editing and record the source used.

Do not invent a workflow style from memory when Matt Pocock source material is
available.

If the user says "call Matt", "use Matt", "Matt process", "Mat process", or
"Matt Pocock process", first read [references/matt-pocock-skills.md](references/matt-pocock-skills.md),
then inspect the relevant upstream skill files from `mattpocock/skills`.

## ECC Is The Build System For Workflows

Everything about building agent workflows here is based on Everything Claude
Code (ECC). Assume you are not naturally good at designing workflow packs,
skills, markdown instructions, prompt chains, or agent handoffs. Before building
or editing those artifacts, re-read the relevant ECC guidance and use it as the
source of truth.

Use ECC principles for:

- workflow decomposition
- skill design
- prompt chaining
- eval gates
- test-first workflow construction
- agent handoffs
- reusable references, scripts, and assets
- security and validation requirements
- documentation placement

If Matt Pocock style and ECC workflow guidance seem to conflict, preserve the
Matt Pocock presentation/style while preserving the ECC workflow architecture.
Raise the conflict if it affects behavior or validation.

## Canonical Workflow Surface

`skills/` is the canonical workflow surface.

Add new reusable workflow contributions under `skills/` first. Only create or
update `commands/` when a legacy slash-command shim is required for migration or
cross-harness parity.

Expected skill shape:

```text
skills/
  skill-name/
    SKILL.md
    agents/openai.yaml
    references/
    scripts/
    assets/
```

Only create optional folders when they are genuinely needed. Keep `SKILL.md`
focused and concise; move detailed, conditional, or domain-heavy material into
directly linked reference files.

## Allowed File Types

Python is not allowed in this repository.

Workflow artifacts should be Markdown and JSON. `.mjs` files are allowed only
for JSON validation or query helpers. Do not use `.mjs` to replace skill logic,
prompt chains, or workflow instructions.

## Repository Model

Use a GitHub-style project workflow.

This repository is organized around projects. Each project is a workflow product
line, such as health, education, finance, research, or another domain the user
names.

Expected shape:

```text
projects/
  project-slug/
    project.json
    tasks/
      index.json
      task-id.json
    artifacts/
      prds/
      issues/
      reviews/
      handoffs/
```

`project.json` stores the project objective, target users, workflow scope,
source materials, and acceptance bar.

`tasks/index.json` is the project task index. Each task also has its own
`tasks/<task-id>.json` file. Task JSON must show, at minimum:

- task id
- task title
- status: `todo`, `in-progress`, `blocked`, `done`
- Matt phase: `intake`, `grilling`, `prd`, `issues`, `implement`,
  `code-review`, `done`
- explicit next action required
- owner or session
- linked files/artifacts
- acceptance checks
- last updated date

Do not create top-level project files when a project-local home is more
appropriate.

## Project Preflight

When the user asks for an edit, do not jump straight to the named file.

First:

1. Identify the project. If ambiguous, ask which project.
2. Read the project's `project.json`.
3. Read the full project `tasks/index.json`.
4. Review all open, blocked, in-progress, and recently completed tasks.
5. Read every non-done task JSON file before acting.
6. Check whether the requested edit conflicts with unfinished work.
7. Identify the exact task being edited, or create a new tracked task if needed.
8. Only then edit the workflow artifact.

If the user asks for a new session for a project, preserve the same project
tracker and handoff state. A new session does not mean a new project brain.

## Matt Pocock Flow

Use Matt Pocock's `ask-matt` flow as the process router.

Main build path:

```text
grill-with-docs -> to-prd -> to-issues -> implement -> code-review
```

For multi-session project work:

```text
grill-with-docs -> to-prd -> to-issues -> fresh session per issue -> implement
```

`implement` must drive `tdd` internally: one red test, just enough code or
workflow text to pass, then the next slice. It closes with `code-review`.

For this repo, project-local JSON task trackers act as the issue tracker until a
GitHub remote and issue workflow are configured.

## Grilling Mode

When requirements are vague, apply a strict preflight instead of politely
guessing. Ask the smallest number of hard questions needed to prevent building
the wrong workflow.

Default grilling questions:

- Which project does this belong to?
- What task id or tracker item is this changing?
- What should be true when this workflow is done?
- Which Matt Pocock upstream skill should govern the structure?
- Which ECC workflow pattern or skill is the source of truth?
- What fixture or eval proves this works?

Do not ask all questions every time. Ask the first blocking question, inspect
the repo, then continue.

## Required Workflow Before Building

Before implementing a workflow artifact:

1. Define the concrete target artifact.
2. Identify the user-visible job the workflow must perform.
3. Identify the project and read its tracker.
4. Find the closest Matt Pocock upstream skill or local reference.
5. Read the relevant ECC guidance for workflow, skill, or prompt-chain design.
6. Define the acceptance checks before writing the implementation.
7. Build the smallest verifiable version.
8. Validate with tests, fixtures, linting, scripts, or a manual eval as
   appropriate.
9. Update the project tracker.
10. Review the output against ECC and the Matt Pocock reference before
    finalizing.

Do not skip the reference-reading step because the change seems small.

## Skill Creation Rules

When creating or editing skills:

- Use lowercase, hyphenated skill folder names.
- Put trigger guidance in the `description` frontmatter, not only in the body.
- Write instructions in imperative form.
- Prefer concise procedural guidance over long explanations.
- Use scripts for deterministic repeated operations.
- Use references for detailed material that should be loaded only when needed.
- Use assets for templates or files that support generated outputs.
- Avoid extra README, changelog, quick-reference, or installation files unless
  the user specifically asks for them.
- Validate skills after creation or material edits.

## Prompt Chain Rules

Prompt chains are workflow logic, not loose prose.

For each chain, capture:

- input contract
- intermediate artifacts
- decision points
- validation checks
- failure handling
- handoff/output contract

Keep each step independently inspectable. If a chain cannot be evaluated, it is
not finished.

## Testing And Validation

Default to test-first or eval-first work.

For code:

- Write or update tests before implementation when feasible.
- Keep coverage at or above 80% when the repo has a coverage harness.
- Run the narrowest useful verification first, then broader checks when risk
  warrants it.

For workflow artifacts:

- Use example inputs and expected outputs.
- Add fixtures when the behavior is repeatable.
- Add validators or scripts when manual inspection would be unreliable.
- Record acceptance criteria in the artifact or the nearest existing project doc.

## Security And Safety

Never hardcode secrets, credentials, tokens, or private keys. Validate all
external inputs at boundaries. Treat networked tools as read-only unless the
user explicitly approves a write action such as publishing, pushing, sending, or
modifying third-party state.

Before commits or external writes, inspect the diff and check for exposed
secrets or sensitive data.

## Documentation Placement

Put durable project knowledge in the existing project documentation structure.
If no obvious location exists, ask before creating a new top-level document.

Do not duplicate the same knowledge in memory, docs, and comments. If the task
already produces the relevant durable artifact, use that artifact as the source
of truth.

## Git And Commit Style

Use Conventional Commits:

```text
<type>: <description>
```

Common types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `perf`, `ci`.

Keep the first line concise and imperative.

## GitHub Checkpoints

Keep changes GitHub-ready at all times, but only push at explicit checkpoints.

Checkpoint rules:

- Use local commits for coherent completed units.
- Do not push to GitHub without explicit user approval for that checkpoint.
- Before a checkpoint, inspect the diff, run the relevant validation, and check
  for secrets.
- The checkpoint summary must name the project, tasks changed, files changed,
  validation run, and remaining risks.
- If a GitHub remote is missing, say so and ask before creating or connecting
  one.

## Default Reminder

When building here, remind yourself:

> I am not allowed to improvise agent workflows from confidence. I must look at
> the Matt Pocock reference files for local style and ECC for workflow
> construction. I must read `project.json`, `tasks/index.json`, and every
> non-done task JSON before editing because every project has unfinished context
> that can change the correct edit.
