# Skill Bundle Contract

Use this contract for every target skill emitted by `$build-workflow-skill`.

## Identity

- Use a lowercase, hyphenated folder.
- Set frontmatter `name` to that exact folder name.
- Put trigger language in frontmatter `description`.
- Include `agents/openai.yaml` with `display_name`, `short_description`, and a
  `default_prompt` that invokes the exact `$skill-name`.
- Make target surface, ownership, runtime visibility, and runtime targets agree
  with the approved deliverable contract.

## Required Semantics

Every substantive `SKILL.md` defines:

1. Overview: the user-visible job and non-goals.
2. Required Context: exact policy, task, source, and prior-art inputs.
3. Input Contract: required and optional inputs plus invalid combinations.
4. Workflow: imperative, independently inspectable steps.
5. Decision Points: branches, selection criteria, and default-deny behavior.
6. Failure Handling: stable blockers, recovery, and stop behavior.
7. Human Boundaries: consequential actions and approvals retained by the user
   or harness.
8. Output Contract: files, state, evidence, and handoff shape.
9. Completion Gate: deterministic, model-run, human-review, and security gates.

Do not replace these semantics with a pointer to another skill or command.

## Optional Resources

Create a reference only for detailed knowledge loaded conditionally. Create a
script only for deterministic repeated work permitted by the repository file
policy. Create an asset only when the workflow directly consumes a stable
template or media resource.

For every resource, record its declared support artifact id, purpose, exact
approval, direct `SKILL.md` reference, consumer deliverable, and verification
evidence. Delete speculative or unreferenced resources.

## Ownership Variants

- Canonical: `.agents/skills/<slug>`; active in the Foundry catalog.
- Project packaged: `projects/<project-slug>/skills/<slug>`; shipped with that
  project and inactive in the Foundry runtime.
- Standalone: product-policy-owned path; inactive in the Foundry catalog and
  evaluated in a disposable repository by default.
- Workflow pack: one complete bundle and independent invocation per member.

An update resolves exactly one existing identity. Promotion is a separate
contract, not an ownership shortcut.

Apply the same strict bundle parser and semantic checks to canonical,
project-packaged, and standalone bundles. Ownership changes path and policy; it
does not permit malformed YAML, duplicate metadata keys, command-first usage,
thin wrappers, undeclared helpers, or missing required semantics.

## Completion Gate

Complete only when:

- required files exist and identities agree;
- the workflow semantics above are substantive;
- optional resources are declared, referenced, and tested;
- command-first and helper-substitute checks pass;
- runtime visibility and catalog membership are correct;
- deterministic fixtures pass;
- required GPT-5.6 Sol fresh-agent scenarios pass with every failed attempt and retry relationship preserved;
- dependency outcomes reconcile when present;
- Standards and Spec review has no unresolved critical or high finding.
