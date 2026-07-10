# Issue 005: Route Packaged And Standalone Skills Safely

## Parent

`workflow-foundry-006` - Design skill-first Workflow Foundry revamp

## What to build

Take raw create-skill language through two non-canonical ownership branches:
an in-foundry project-local packaged skill and a standalone product-repository
skill. Carry each branch through ownership resolution, approved contract, the
appropriate branch of `$build-workflow-skill`, a complete skill bundle,
runtime-visibility enforcement, and behavior evidence. The packaged skill must
land at its owning `projects/<project-slug>/skills/<slug>` surface and remain
inactive in the local foundry runtime. The standalone skill must land only in
the product-owned repository surface and inherit that product's file policy.
Unresolved ownership must stop before approval or writes.

Keep Codex executable first while preserving portable contract fields. Add both
branches to the shared scenario contract introduced by Issue 004. Use a
disposable product repository for the standalone branch; no real external
product repository may be mutated without its own approved write plan.

## Acceptance criteria

- [x] Raw in-foundry packaged-skill language resolves the owning `projects/<project-slug>/skills/<slug>` surface before task creation.
- [x] A complete project-local packaged bundle is created at that surface, records non-active local runtime visibility, and does not enter the canonical catalog.
- [x] Raw standalone create-skill language resolves a named product repository and product-owned skill surface before task creation.
- [x] Both contracts record ownership, runtime targets, applicable file policy, and non-foundry runtime visibility.
- [x] The same `$build-workflow-skill` authority selects the packaged or standalone branch and creates the appropriate complete bundle.
- [x] Foundry-local helper restrictions are not imposed blindly when the product fixture has a different approved file policy.
- [x] Packaged and standalone product skills remain outside the active foundry catalog unless a separate promotion contract exists.
- [x] Ambiguous ownership or target surfaces stop before artifact approval or writes.
- [x] Packaged and standalone variants extend the shared scenario contract and drive both live fresh-agent runs and deterministic fixtures.
- [x] Fresh-agent English, terse, and Taglish scenarios produce the expected packaged or standalone route without being told the intended classification.
- [x] Evidence records the raw prompt, context, observed contract and artifacts, runtime visibility, runner identity, timestamp, builder-contract version, and result.
- [x] Disposable-repository tests prove no real external repository is mutated.
- [x] Root workflow-state validation and tracker verification pass.

## Blocked by

- `workflow-foundry-006-issue-004-canonical-skill-tracer`

## User stories covered

- 4. Route standalone product skills to their product repository
- 5. Stop on ambiguous skill destinations
- 14. Prevent generic authoring defaults from overriding local routing
- 30. Keep packaged and standalone product skills outside the foundry runtime unless promoted
- 31. Respect the product repository's file policy
- 38. Ship Codex first while preserving portable contracts
- 42. Record runtime visibility explicitly
- 44. Record raw behavior evidence and observed results
