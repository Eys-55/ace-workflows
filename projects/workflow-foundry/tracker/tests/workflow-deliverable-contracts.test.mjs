import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { projectDeliverableReadiness, validateTaskDeliverableState } from "../../../../scripts/workflow-deliverable-contracts.mjs";

function task(overrides = {}) {
  return {
    task_id: "fixture-001",
    project_slug: "fixture",
    status: "in-progress",
    linked_artifacts: [],
    ...overrides,
  };
}

function contract(overrides = {}) {
  return {
    deliverable_id: "fixture-output",
    contract_version: 1,
    kind: "documentation-handoff",
    operation: "create",
    role: "primary",
    ownership_boundary: "project-packaged",
    owner_project: "fixture",
    target_surface: "projects/fixture/output.md",
    runtime_visibility: "not-applicable",
    runtime_targets: ["codex"],
    member_deliverable_ids: [],
    required_artifacts: [
      {
        artifact_id: "fixture-output-file",
        artifact_role: "primary",
        locator_type: "path",
        locator: "projects/fixture/output.md",
        validation: "file",
      },
    ],
    allowed_support_artifacts: [],
    required_guidance: [
      {
        guidance_id: "fixture-guidance",
        source: "AGENTS.md",
        evidence: "The output follows the repository policy.",
      },
    ],
    eval_plan: [{ eval_id: "fixture-eval", kind: "deterministic", required: true }],
    completion_conditions: [
      {
        condition_id: "fixture-artifact-valid",
        type: "artifact-valid",
        reference: "fixture-output-file",
      },
      {
        condition_id: "fixture-eval-passed",
        type: "eval-passed",
        reference: "fixture-eval",
      },
    ],
    ...overrides,
  };
}

function approvedTask(overrides = {}) {
  const deliverable = contract();
  return task({
    deliverable_contracts: [deliverable],
    artifact_bindings: [
      {
        deliverable_id: "fixture-output",
        artifact_id: "fixture-output-file",
        artifact_role: "primary",
        locator_type: "path",
        locator: "projects/fixture/output.md",
      },
    ],
    behavior_evidence: [
      {
        evidence_id: "fixture-run",
        eval_id: "fixture-eval",
        scenario_id: "fixture-scenario",
        raw_prompt: "Create the fixture output.",
        repository_context: "fixture-repository",
        runner_id: "gpt-5.6-sol",
        runner_mode: "deterministic-fixture",
        runner_session_id: "fixture-session-001",
        started_at: "2026-07-10T00:00:00.000Z",
        completed_at: "2026-07-10T00:01:00.000Z",
        raw_output: "Created and validated the fixture output.",
        observed_diff: [{ path: "projects/fixture/output.md", change: "created" }],
        validation_results: [
          {
            check_id: "fixture-eval",
            result: "pass",
            grader_id: "fixture-independent-grader",
            grader_mode: "deterministic-validator",
            grader_session_id: "fixture-grader-session-001",
            independent_of_runner: true,
            evidence: "Verified the emitted artifact and contract independently.",
          },
        ],
        first_attempt: true,
        expected_route: "documentation-handoff",
        observed_route: ["documentation-handoff"],
        observed_ownership: ["project-packaged"],
        observed_visibility: ["not-applicable"],
        observed_contract_ids: ["fixture-output"],
        observed_artifacts: ["projects/fixture/output.md"],
        result: "pass",
        timestamp: "2026-07-10T00:00:00.000Z",
        builder_contract_version: 1,
      },
    ],
    linked_artifacts: ["projects/fixture/output.md"],
    ...overrides,
  });
}

async function writeSkillBundle(bundle, name) {
  await mkdir(path.join(bundle, "agents"), { recursive: true });
  await writeFile(
    path.join(bundle, "SKILL.md"),
    `---\nname: ${name}\ndescription: Use when a complete fixture workflow must be executed.\n---\n# Fixture Skill\n\n## Overview\n\nProduce the approved fixture outcome.\n\n## Required Context\n\nRead the selected task and repository policy.\n\n## Input Contract\n\nRequire an approved task and exact target.\n\n## Workflow\n\n1. Inspect the contract.\n2. Produce the approved artifact.\n3. Verify the result.\n\n## Decision Points\n\nStop when ownership is unresolved.\n\n## Failure Handling\n\nReturn a stable blocker without writing outside the boundary.\n\n## Human Boundaries\n\nKeep external writes and publishing with the operator.\n\n## Output Contract\n\nReturn the artifact, validation, and evidence.\n\n## Completion Gate\n\nRequire deterministic validation and review.\n`,
  );
  await writeFile(
    path.join(bundle, "agents", "openai.yaml"),
    `interface:\n  display_name: "Fixture Skill"\n  short_description: "Build the fixture outcome"\n  default_prompt: "Use $${name} to build the fixture outcome."\n`,
  );
}

test("treats deliverable contracts as optional but validates them when declared", () => {
  assert.deepEqual(validateTaskDeliverableState(task()), []);
  const missingContract = task({ deliverable_contracts: [], artifact_bindings: [], behavior_evidence: [] });
  assert.ok(validateTaskDeliverableState(missingContract).some((error) => error.code === "contract-missing"));

  const missingOwnership = approvedTask({
    deliverable_contracts: [contract({ ownership_boundary: "" })],
  });
  assert.ok(validateTaskDeliverableState(missingOwnership).some((error) => error.code === "ownership-unresolved"));

  const unboundArtifact = approvedTask({ artifact_bindings: [{ deliverable_id: "unknown-deliverable" }] });
  assert.ok(validateTaskDeliverableState(unboundArtifact).some((error) => error.code === "artifact-binding-unbound"));
});

test("projects a contracted task as ready from real artifacts and evidence", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-contract-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "projects", "fixture"), { recursive: true });
  await writeFile(path.join(root, "projects", "fixture", "output.md"), "fixture\n");

  const fixture = approvedTask();
  assert.deepEqual(validateTaskDeliverableState(fixture), []);
  const readiness = projectDeliverableReadiness({ task: fixture, root });
  assert.equal(readiness.state, "ready");
  assert.equal(readiness.completion_ready, true);
  assert.deepEqual(readiness.blockers, []);
});

test("rejects create collisions and resolves updates to one real target", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-identity-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "projects", "fixture"), { recursive: true });
  await writeFile(path.join(root, "projects", "fixture", "output.md"), "preexisting\n");

  const createCollision = approvedTask({ behavior_evidence: [] });
  const collisionReadiness = projectDeliverableReadiness({ task: createCollision, root });
  assert.equal(collisionReadiness.deliverables[0].identity_readiness.ready, false);
  assert.ok(collisionReadiness.blockers.some((blocker) => blocker.code === "identity-collision"));

  const update = approvedTask({
    behavior_evidence: [],
    deliverable_contracts: [
      contract({
        operation: "update",
        update_identity: "projects/fixture/output.md",
      }),
    ],
  });
  const updateReadiness = projectDeliverableReadiness({ task: update, root });
  assert.equal(updateReadiness.deliverables[0].identity_readiness.ready, true);

  await rm(path.join(root, "projects", "fixture", "output.md"));
  const missingUpdateReadiness = projectDeliverableReadiness({ task: update, root });
  assert.equal(missingUpdateReadiness.deliverables[0].identity_readiness.ready, false);
  assert.ok(missingUpdateReadiness.blockers.some((blocker) => blocker.code === "update-identity-unresolved"));
});

test("returns structured errors for malformed contracts, wrong roles, and malformed payloads", () => {
  const malformed = approvedTask({
    deliverable_contracts: [null],
    artifact_bindings: [],
  });
  assert.doesNotThrow(() => validateTaskDeliverableState(malformed));
  assert.ok(validateTaskDeliverableState(malformed).some((error) => error.code === "contract-invalid"));

  const wrongRole = approvedTask({
    artifact_bindings: [
      {
        deliverable_id: "fixture-output",
        artifact_id: "fixture-output-file",
        artifact_role: "support",
        locator_type: "path",
        locator: "projects/fixture/output.md",
      },
    ],
  });
  assert.ok(validateTaskDeliverableState(wrongRole).some((error) => error.code === "support-artifact-undeclared"));

  const malformedPayload = task({ deliverable_contracts: {}, artifact_bindings: [{}], behavior_evidence: [{}] });
  assert.ok(validateTaskDeliverableState(malformedPayload).some((error) => error.code === "contract-invalid"));
});

test("gates completion on every required contract", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-completion-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "projects", "fixture"), { recursive: true });
  await writeFile(path.join(root, "projects", "fixture", "output.md"), "fixture\n");

  const primary = approvedTask();
  const supportContract = contract({
    deliverable_id: "optional-support",
    role: "support",
    target_surface: "projects/fixture/missing.md",
    required_artifacts: [
      {
        artifact_id: "missing-support",
        artifact_role: "primary",
        locator_type: "path",
        locator: "projects/fixture/missing.md",
        validation: "file",
      },
    ],
    eval_plan: [{ eval_id: "support-eval", kind: "deterministic", required: false }],
    completion_conditions: [
      {
        condition_id: "support-file-valid",
        type: "artifact-valid",
        reference: "missing-support",
      },
    ],
  });
  primary.deliverable_contracts.push(supportContract);
  primary.artifact_bindings.push({
    deliverable_id: "optional-support",
    artifact_id: "missing-support",
    artifact_role: "primary",
    locator_type: "path",
    locator: "projects/fixture/missing.md",
  });
  primary.linked_artifacts.push("projects/fixture/missing.md");
  const readiness = projectDeliverableReadiness({ task: primary, root });
  assert.equal(readiness.completion_ready, false);
  assert.ok(readiness.blockers.some((blocker) => blocker.code === "required-artifact-missing"));

  primary.deliverable_contracts[1].blocking = false;
  assert.equal(projectDeliverableReadiness({ task: primary, root }).completion_ready, true);

  const primaryBypass = approvedTask();
  primaryBypass.deliverable_contracts[0].blocking = false;
  assert.ok(validateTaskDeliverableState(primaryBypass).some((error) => error.code === "primary-contract-nonblocking"));
  const primaryBypassReadiness = projectDeliverableReadiness({ task: primaryBypass, root });
  assert.equal(primaryBypassReadiness.deliverables[0].blocking, true);
  assert.equal(primaryBypassReadiness.completion_ready, false);
});

test("rejects a thin script-wrapper bundle as a primary skill", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-thin-skill-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const bundle = path.join(root, ".agents", "skills", "thin-skill");
  await mkdir(path.join(bundle, "agents"), { recursive: true });
  await writeFile(
    path.join(bundle, "SKILL.md"),
    `---\nname: thin-skill\ndescription: Use when thin.\n---\n# Thin\n\n## Overview\n\nDelegate everything.\n\n## Required Context\n\nFind the helper.\n\n## Input Contract\n\nAccept any input.\n\n## Workflow\n\n1. Run the helper script.\n2. Return whatever it prints.\n\n## Decision Points\n\nUse the helper.\n\n## Failure Handling\n\nRetry the helper.\n\n## Human Boundaries\n\nNone.\n\n## Output Contract\n\nThe helper output.\n\n## Completion Gate\n\nThe helper exits.\n\n${Array.from({ length: 12 }, (_, index) => `Filler line ${index + 1}.`).join("\n")}\n`,
  );
  await writeFile(path.join(bundle, "agents", "openai.yaml"), 'interface:\n  display_name: "Thin"\n  short_description: "Thin"\n  default_prompt: "Use $thin-skill."\n');

  const fixture = approvedTask({
    deliverable_contracts: [
      contract({
        kind: "canonical-skill",
        ownership_boundary: "canonical-foundry",
        target_surface: ".agents/skills/thin-skill",
        runtime_visibility: "canonical-active",
        required_artifacts: [
          {
            artifact_id: "fixture-output-file",
            artifact_role: "primary",
            locator_type: "path",
            locator: ".agents/skills/thin-skill",
            validation: "canonical-skill-bundle",
          },
        ],
      }),
    ],
    artifact_bindings: [
      {
        deliverable_id: "fixture-output",
        artifact_id: "fixture-output-file",
        artifact_role: "primary",
        locator_type: "path",
        locator: ".agents/skills/thin-skill",
      },
    ],
    linked_artifacts: [".agents/skills/thin-skill"],
    behavior_evidence: [
      {
        ...approvedTask().behavior_evidence[0],
        observed_artifacts: [".agents/skills/thin-skill"],
        observed_diff: [{ path: ".agents/skills/thin-skill", change: "created" }],
      },
    ],
  });
  assert.ok(projectDeliverableReadiness({ task: fixture, root }).blockers.some((blocker) => blocker.code === "required-artifact-invalid"));
});

test("enforces kind routing, exact targets, update identity, and callable pack members", () => {
  const wrongCanonicalRoute = approvedTask({
    deliverable_contracts: [
      contract({
        kind: "canonical-skill",
        ownership_boundary: "project-packaged",
        target_surface: "projects/fixture/skills/example",
        runtime_visibility: "project-local-inactive",
        required_artifacts: [
          {
            artifact_id: "fixture-output-file",
            artifact_role: "primary",
            locator_type: "path",
            locator: "projects/fixture/skills/example",
            validation: "packaged-skill-bundle",
          },
        ],
      }),
    ],
  });
  assert.ok(validateTaskDeliverableState(wrongCanonicalRoute).some((error) => error.code === "contract-routing-invalid"));

  const targetMismatch = approvedTask({
    deliverable_contracts: [contract({ target_surface: "projects/fixture/other.md" })],
  });
  assert.ok(validateTaskDeliverableState(targetMismatch).some((error) => error.code === "contract-routing-invalid"));

  const updateWithoutIdentity = approvedTask({
    deliverable_contracts: [contract({ operation: "update" })],
  });
  assert.ok(validateTaskDeliverableState(updateWithoutIdentity).some((error) => error.code === "update-identity-missing"));

  const emptyPack = approvedTask({
    deliverable_contracts: [
      contract({
        kind: "workflow-pack",
        member_deliverable_ids: [],
        required_artifacts: [
          {
            artifact_id: "fixture-output-file",
            artifact_role: "primary",
            locator_type: "path",
            locator: "projects/fixture/output.md",
            validation: "directory",
          },
        ],
      }),
    ],
  });
  assert.ok(validateTaskDeliverableState(emptyPack).some((error) => error.code === "workflow-pack-member-invalid"));

  const packMember = contract({
    deliverable_id: "pack-member",
    kind: "packaged-skill",
    role: "support",
    target_surface: "projects/fixture/skills/pack-member",
    runtime_visibility: "project-local-inactive",
    independently_callable: false,
    required_artifacts: [
      {
        artifact_id: "pack-member-bundle",
        artifact_role: "primary",
        locator_type: "path",
        locator: "projects/fixture/skills/pack-member",
        validation: "packaged-skill-bundle",
      },
    ],
  });
  const nonCallablePack = approvedTask({
    deliverable_contracts: [
      contract({
        kind: "workflow-pack",
        member_deliverable_ids: ["pack-member"],
        required_artifacts: [
          {
            artifact_id: "fixture-output-file",
            artifact_role: "primary",
            locator_type: "path",
            locator: "projects/fixture/output.md",
            validation: "directory",
          },
        ],
      }),
      packMember,
    ],
  });
  assert.ok(validateTaskDeliverableState(nonCallablePack).some((error) => error.code === "workflow-pack-member-invalid"));
});

test("binds task evidence to the exact declared artifact", () => {
  const evidenceContract = contract({
    target_surface: "fixture-evidence",
    required_artifacts: [
      {
        artifact_id: "fixture-output-file",
        artifact_role: "primary",
        locator_type: "task-evidence",
        locator: "fixture-evidence",
        validation: "behavior-evidence",
      },
    ],
    completion_conditions: [
      {
        condition_id: "fixture-artifact-valid",
        type: "artifact-valid",
        reference: "fixture-output-file",
      },
    ],
  });
  const evidenceTask = approvedTask({
    deliverable_contracts: [evidenceContract],
    artifact_bindings: [
      {
        deliverable_id: "fixture-output",
        artifact_id: "fixture-output-file",
        artifact_role: "primary",
        locator_type: "task-evidence",
        locator: "fixture-evidence",
      },
    ],
    behavior_evidence: [],
  });
  assert.equal(projectDeliverableReadiness({ task: evidenceTask }).completion_ready, false);
  assert.deepEqual(validateTaskDeliverableState(evidenceTask), []);
});
