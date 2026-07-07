# Real-Life Workflows README And Skill Pack PRD

## Problem Statement

Operators need the real-life-workflows project to present itself like a usable
workflow product, not like a quarantine folder or one-off script. The project
already has a finder, a curated door catalog, and a large upstream source
universe, but the current surface does not make that value obvious to developers
who might install and call it from agent harnesses.

The README must advertise the scale clearly: 171 curated workflow doors across
17 source repositories, backed by a 19,000+ upstream-flow source universe. It
must also avoid overclaiming. The 171 rows are curated doors, not 171 repos.
The 19,000+ figure is a source-universe estimate, not a statement that every
upstream flow has been deeply classified and audited inside this project.

The current imported skill material remains quarantined source evidence. It
cannot be presented as active callable skill inventory. The task needs one clean
installable skill surface first, then a README that tells operators what the
project can do and where the larger future skill opportunity lives.

## Solution

Create a polished project README and minimal npm-style skill package surface.
The README should lead with the product promise:

> Search a large workflow universe.

The first packaged skill should be `real-life-workflow-search`. It should be
installable locally with npm-style commands, callable by agent harnesses such as
Claude Code, Codex, and opencode, and focused on returning a full
workflow-understanding packet by default.

The implementation should:

1. Add a product-like README with a visual hero generated through the GPT image
   generation model in Codex.
2. Show a compact scale breakdown rather than listing all 171 curated doors.
3. Include the verified headline metrics: 19,000+ upstream flows, 171 curated
   doors, and 17 source repositories.
4. Add a local methodology/count artifact so the headline claim is inspectable.
5. Describe features for search, full packet creation, deeper research, source
   links, confidence and caveat handling, saved outputs, and future skill
   extraction.
6. Add the minimum package metadata needed for truthful local npm installation.
7. Expose callable skill content for `real-life-workflow-search`, not just a
   packaged README.
8. Keep quarantined imported skills framed as candidate source families only,
   pending audit and rewrite.

The installed skill must write workflow-understanding packets to the caller or
primary project's approved artifact area with provenance. It must not write into
`node_modules`, dependency trackers, dependency `AGENTS.md` files, or dependency
skill definitions.

## User Stories

1. As a developer operator, I want the README to feel like a polished product
   surface, so that I can quickly understand why the workflow catalog is worth
   installing.
2. As a developer operator, I want the headline promise to be "search a large
   workflow universe," so that the value is clear before I learn about packet
   details.
3. As a developer operator, I want the README to show 19,000+ upstream flows,
   171 curated doors, and 17 source repositories, so that the scale is obvious.
4. As a careful operator, I want the README to distinguish curated doors from
   repositories and audited workflows, so that I do not repeat inflated claims.
5. As a careful operator, I want a local count or methodology artifact linked
   from the README, so that the 19,000+ claim is inspectable.
6. As a reader, I want a visual hero asset, so that the project has an immediate
   product signal instead of looking like raw internal notes.
7. As a reader, I want a compact breakdown of the catalog, so that I can feel
   the scale without scrolling through all 171 doors.
8. As a developer operator, I want npm-style installation instructions, so that
   I can add the workflow pack to an agent workspace in a familiar way.
9. As a developer operator, I want local install instructions to be truthful, so
   that the README does not imply a package has already been published.
10. As a harness integrator, I want the installed package to include skill
    content and metadata, so that Claude Code, Codex, opencode, or a similar
    harness can call it as a skill.
11. As a harness integrator, I want one clean callable skill first, so that the
    package proves the pattern without promoting untrusted imported skills.
12. As an operator, I want the first callable skill to be named
    `real-life-workflow-search`, so that the skill name matches the product job.
13. As an operator, I want `real-life-workflow-search` to return a full
    workflow-understanding packet by default, so that I get usable research
    output rather than a shallow ranked list.
14. As an operator, I want every run to write the packet to disk and report the
    artifact path, so that the result is durable and handoff-ready.
15. As a project owner, I want packet outputs to be written under the caller or
    primary project's approved artifact area, so that package calls obey the
    active task's artifact ownership rules.
16. As a project owner, I want packet outputs to include provenance, so that
    later agents can tell which package, skill, and source universe produced
    the packet.
17. As a project owner, I want the skill to avoid writing into `node_modules` or
    dependency control-plane files, so that installs remain immutable and safe.
18. As a workflow researcher, I want the README to explain deeper source
    research, so that I know the finder can expand beyond surface matches.
19. As a workflow researcher, I want packet features to include source links,
    local source paths, confidence labels, and caveats, so that I can audit the
    result before acting on it.
20. As a workflow builder, I want the README to explain future skill extraction
    paths, so that the catalog feels like a source of reusable workflow
    products.
21. As a workflow builder, I want quarantined imported skills labeled as
    candidate future families, so that I do not mistake them for callable active
    skills.
22. As a maintainer, I want the package files to include only the minimum
    truthful install surface, so that the implementation does not overbuild a
    public API prematurely.
23. As a maintainer, I want validation to catch broken README claims, so that
    the project does not say "171 repos" or imply all 19,000+ upstream flows are
    fully audited.
24. As a maintainer, I want validation to confirm the package includes the
    README, hero, count artifact, and callable skill content, so that install
    instructions match what ships.
25. As an operator in a high-stakes domain, I want the README and skill contract
    to preserve human review boundaries, so that workflow packets are not
    treated as medical, legal, financial, compliance, engineering, or safety
    conclusions.

## Implementation Decisions

- The README should be product-like and operator-facing, with developer
  installation and calling instructions.
- The README should lead with workflow-universe search. Packet creation is the
  practical output of the search, not the headline promise.
- The visual hero should be generated during implementation through the GPT
  image generation model in Codex and stored as a project asset.
- The catalog breakdown should be compact. Do not list every curated door in
  the README.
- The count artifact should preserve the exact meaning of the metrics:
  19,000+ upstream flows, 171 curated doors, and 17 source repositories.
- The npm surface should be local-installable first. It may be publish-ready,
  but the README must not claim the package is already published.
- The implementation should prove one callable packaged skill first:
  `real-life-workflow-search`.
- The packaged skill must include enough metadata and instructions for agent
  harnesses to discover or call it as a skill.
- The packaged skill should produce a full workflow-understanding packet by
  default and write it to disk on every run.
- Packet writes should target the caller or primary project's approved artifact
  area and include provenance.
- The package must not mutate dependency trackers, dependency `AGENTS.md`,
  dependency skill definitions, or installed package files.
- Quarantined imported skills remain source evidence only. They can be named as
  future extraction candidates only when the copy makes the quarantine boundary
  explicit.
- Avoid building a broad public JavaScript API unless a later issue requires it
  to verify installability or harness integration.
- Any deterministic helper or validator added for this task should use the
  repository's allowed file types. Do not add Python.

## Testing Decisions

The highest-value testing seam is the shipped surface: README claims, package
contents, callable skill contract, and packet-write instructions.

Implementation should include or run checks that prove:

1. The workflow tracker remains valid.
2. The README contains the correct metrics and does not say "171 repos."
3. The README describes the 19,000+ number as an upstream source-universe
   figure, not as fully audited local workflow rows.
4. The compact breakdown exists and does not expand into a full 171-row table.
5. The visual hero asset exists and is referenced by the README.
6. The package metadata supports local npm installation.
7. A package dry run includes the README, hero asset, count artifact, and
   `real-life-workflow-search` skill content.
8. The skill metadata includes a matching name and useful description.
9. The skill contract says packet output is written under the caller or primary
   project's approved artifact area with provenance.
10. The skill contract does not instruct agents to write into `node_modules` or
    dependency control-plane files.
11. Quarantined imported skills are not promoted into the active callable skill
    list.
12. Markdown and JSON formatting checks pass.

`npm pack --dry-run` is the preferred package-shape check once package metadata
exists. Existing workflow-state validation should remain the final repo-level
gate for the PRD and tracker state.

## Out Of Scope

- Publishing the package to npm.
- Pushing to GitHub or opening a pull request.
- Promoting the 18 quarantined imported skills as active callable skills.
- Building the full future multi-skill suite.
- Listing all 171 curated doors in the README.
- Claiming all 19,000+ upstream flows are fully audited workflows.
- Creating a broad JavaScript import API before the installable skill surface
  needs it.
- Building a web app or interactive UI.
- Mutating dependency project trackers or dependency control-plane files.
- Repairing unrelated project state, including concurrent project additions.

## Further Notes

The next Matt phase should split this PRD into implementation issues. A clean
issue split would be:

1. README positioning, compact catalog breakdown, count artifact, and hero
   asset.
2. Minimal npm package manifest and package-shape verification.
3. `real-life-workflow-search` skill contract and harness-callable metadata.
4. README and package validators for count claims, quarantine boundaries, and
   packet-write rules.
5. Final review against Matt style, ECC workflow-package expectations, and the
   active pollution-audit boundary.

The README should sell the product, but the implementation must keep the proof
close: every public claim should map to a local artifact, package file, or
explicitly labeled future direction.
