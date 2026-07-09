# Issue 006: Preserve Roles Across Mixed Workflow Products

## Parent

`workflow-foundry-006` - Design skill-first Workflow Foundry revamp

## What to build

Carry multiple deliverable contracts through routing, persistence, phase
approval, implementation outcomes, read-only projection, deterministic
enforcement, and fresh-agent evidence. Exercise a UI plus callable skill, a
coordinated multi-skill workflow pack, a validator or query-helper-only request,
a documentation-only request, and tracker-only work.

Application code may satisfy only its UI contract. Each workflow-pack skill
must retain an independent callable interface even when resources are shared. A
helper-only, documentation-only, or tracker-only request must not invent a skill
wrapper. Existing-skill language in a multi-deliverable request must update the
identified bundle rather than duplicate it. Add every routing family in this
slice to the shared scenario contract introduced by Issue 004.

## Acceptance criteria

- [ ] One task can persist and expose multiple versioned contracts with distinct primary and support roles.
- [ ] A mixed UI-plus-skill scenario completes only when both the application and callable skill contracts are satisfied.
- [ ] UI or package code cannot satisfy a skill bundle or skill eval requirement.
- [ ] A workflow-pack scenario produces multiple individually callable skill contracts while allowing explicitly shared support resources.
- [ ] Validator-only, documentation-only, and tracker-only requests produce their requested products without fake skill wrappers.
- [ ] Phase approvals, linked artifacts, dependency evidence, readiness, and completion reconcile per deliverable and role.
- [ ] Optional resources are justified and linked to the deliverable that consumes them.
- [ ] Existing-skill language updates one identified bundle without creating a duplicate.
- [ ] Mixed-product, workflow-pack, helper-only, documentation-only, and tracker-only variants extend the shared scenario contract and drive both live and deterministic seams.
- [ ] Fresh-agent English, terse, and Taglish scenarios cover every routing family without revealing the intended classification.
- [ ] Evidence records raw prompts, observed contracts and artifacts, runner identities, timestamps, contract versions, and results.
- [ ] Query and read-only tracker output show each deliverable's readiness and blockers without mutation.
- [ ] Root workflow-state validation and tracker verification pass.

## Blocked by

- `workflow-foundry-006-issue-004-canonical-skill-tracer`

## User stories covered

- 6. Distinguish primary deliverables from support artifacts
- 7. Represent multiple deliverables accurately
- 16. Preserve legitimate JavaScript and deterministic helper products
- 17. Justify optional resources
- 18. Keep each workflow-pack skill independently callable
- 22. Approve artifacts by deliverable and role
- 27. Preserve legitimate UI and validator outcomes
- 32. Use typed deliverable contracts
- 33. Keep completion criteria local to each authoring step
- 41. Distinguish existing-skill updates from new creation
- 43. Show readiness without tracker mutation
- 44. Record raw behavior evidence and observed results
