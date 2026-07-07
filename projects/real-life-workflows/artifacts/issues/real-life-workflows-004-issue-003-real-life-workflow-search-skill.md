# Issue 003: Real-Life Workflow Search Skill

## Parent

`real-life-workflows-004`

## What to build

Create the first clean callable packaged skill: `real-life-workflow-search`.
It should guide an agent through a search over the curated workflow universe and
produce a full workflow-understanding packet by default. Each run must write a
packet to the caller or primary project's approved artifact area and report the
artifact path.

## Acceptance criteria

- [ ] Skill folder name and frontmatter name are `real-life-workflow-search`.
- [ ] Skill description explains when agent harnesses should invoke it.
- [ ] Skill returns a full packet by default, not only a ranked list.
- [ ] Skill requires packet writes under the caller or primary project's approved artifact area.
- [ ] Skill requires provenance in packet output.
- [ ] Skill forbids packet writes into `node_modules`, dependency trackers, dependency `AGENTS.md`, and dependency skill definitions.
- [ ] Skill preserves the quarantine boundary and does not promote imported skills as active.
- [ ] Skill includes harness-facing metadata.

## Blocked by

- Issue 002 for package placement and file inclusion rules.
