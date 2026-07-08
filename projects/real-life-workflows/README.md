# Real Life Workflows

![Real Life Workflows hero](assets/hero.png)

## Search a large workflow universe

Real Life Workflows is an installable workflow search pack for operators and
developers who need source-backed examples of how real work gets done.

It starts from a curated catalog of real-world workflow doors, searches across a
larger upstream source universe, and writes durable workflow-understanding
packets that another agent or developer can inspect, reuse, and turn into a
clean skill later.

| Scale signal | Count | Meaning |
| --- | ---: | --- |
| Upstream flow source universe | 19,000+ | Source-universe estimate from counted skill, agent, and workflow templates |
| Curated workflow doors | 171 | Audited search doors used to route workflow discovery |
| Source repos | 17 | Indexed repositories behind the catalog |
| Direct skill or agent templates | 12,607 | Counted `SKILL.md` and `SOUL.md` source files |
| Workflow JSON templates | 6,573 | Counted workflow JSON templates in template-heavy repos |

The 19,000+ figure is a source-universe estimate, not a claim that every
upstream flow is fully audited in this project. The proof lives in
[`artifacts/counts/upstream-source-universe-counts.json`](artifacts/counts/upstream-source-universe-counts.json).

## What It Does

| Feature | What operators get |
| --- | --- |
| Workflow universe search | Search across 171 curated workflow doors and 17 source repos backed by a 19,000+ upstream-flow source universe |
| Full packets by default | Get a workflow-understanding packet, not just a short ranked list |
| Deeper research trails | Follow source links, local source paths, reliability labels, and expansion candidates |
| Saved outputs | Write packet artifacts to disk every run for handoff, review, and reuse |
| Skill extraction path | Use packet recommendations as candidates for future clean skills after audit and rewrite |
| Quarantine safety | Keep imported source evidence separate from active callable skills |

## Catalog Breakdown

The README does not list every door. The breakdown below shows the scale without
turning the product surface into a raw catalog dump.

| Door type | Curated doors |
| --- | ---: |
| Category doors | 114 |
| Workflow doors | 26 |
| Manifest doors | 18 |
| Template doors | 6 |
| Lane doors | 4 |
| Skill-source doors | 3 |
| Total | 171 |

These are search doors. They are not repository counts, and they are not a
claim that every upstream workflow is ready to run.

## Install

Install the local package only when you are testing or exporting the skill pack
outside this repo's active `.agents/skills` surface:

```bash
npm install ./projects/real-life-workflows
```

That package exposes the first exportable skill surface for agent runtimes:

```text
real-life-workflow-search
```

The package is local-installable first. It is not presented as a published npm
package.

## Agent Runtime Usage

Use `real-life-workflow-search` as a skill in Codex, Claude Code, opencode, or
another compatible agent runtime. The caller provides a workflow topic and an
approved artifact path, and the skill writes a workflow-understanding packet.

```text
Use $real-life-workflow-search to create a workflow-understanding packet for
"customer billing exception workflows" and write it under the primary project's
approved workflow-packets artifact area.
```

The output path should be inside the caller or primary project's approved
artifact area. The skill writes a packet every run and reports the packet path.

For broader searches:

```text
Use $real-life-workflow-search with a broader recommendation limit for
"document evidence research workflows" and write the packet under the primary
project's approved workflow-packets artifact area.
```

Agent harnesses can discover the packaged skill through:

```text
skills/real-life-workflow-search/SKILL.md
skills/real-life-workflow-search/agents/openai.yaml
skill-manifest.json
```

## Package Smoke Test

Use this only to verify the local package command wrapper, not as the normal
operator path for calling the skill:

```bash
npx real-life-workflow-search \
  --query "customer billing exception workflows" \
  --output projects/customer-ops/artifacts/workflow-packets/customer-billing-exceptions.md
```

## Packet Output

Every workflow-understanding packet includes:

- the original query
- the universal intake question
- visible recommendation count
- provenance
- human review boundary
- Direct Matches
- Strong Adjacent Matches
- Supporting Building Blocks
- Maybe Useful

Every visible recommendation includes:

- why it matters
- why it is here
- what it does
- source link
- local door or source path
- reliability
- possible skill to extract
- expansion candidates when available

## Skill Surface

Active packaged skill:

| Skill | Job |
| --- | --- |
| `real-life-workflow-search` | Search the workflow universe and write a full workflow-understanding packet |

Future skills can be extracted from packets, but only after a tracked audit and
rewrite. Imported quarantine skills are source evidence only. They are not
active, not callable, not discoverable as Real Life Workflows skills, and not
promotable as-is.

## Source Boundaries

This project keeps three things separate:

| Surface | Status |
| --- | --- |
| Packaged `real-life-workflow-search` skill | Active callable package skill |
| 171 curated workflow doors | Search and routing layer |
| Quarantined imported skills | Source evidence only |

Workflow packets are learning and design artifacts. They do not prove medical,
legal, financial, compliance, engineering, safety, eligibility, coverage, or
operational correctness. Human review is required before external action or
before turning a packet into a reusable production skill.

## Developer Verification

From the repository root:

```bash
node projects/real-life-workflows/artifacts/package/validate-readme-package-surface.mjs
node projects/real-life-workflows/artifacts/finder/validate-finder-artifacts.mjs
node scripts/validate-workflow-state.mjs
```

From the package directory:

```bash
npm pack --dry-run --json
```
