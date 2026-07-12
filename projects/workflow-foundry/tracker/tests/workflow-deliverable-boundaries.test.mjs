import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
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

test("rejects decorative evidence, unsatisfied review conditions, and escaped symlinks", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-evidence-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "projects", "fixture"), { recursive: true });
  await writeFile(path.join(root, "projects", "fixture", "output.md"), "fixture\n");

  const decorative = approvedTask();
  decorative.behavior_evidence[0] = {
    ...decorative.behavior_evidence[0],
    observed_contract_ids: ["wrong-contract"],
    observed_artifacts: ["projects/fixture/missing.md"],
  };
  assert.equal(projectDeliverableReadiness({ task: decorative, root }).completion_ready, false);

  const incompleteRun = approvedTask();
  delete incompleteRun.behavior_evidence[0].runner_session_id;
  delete incompleteRun.behavior_evidence[0].raw_output;
  incompleteRun.behavior_evidence[0].completed_at = "not-a-time";
  assert.ok(validateTaskDeliverableState(incompleteRun).some((error) => error.code === "behavior-evidence-invalid"));

  const retriedRun = approvedTask();
  retriedRun.behavior_evidence[0].first_attempt = false;
  assert.ok(validateTaskDeliverableState(retriedRun).some((error) => error.code === "behavior-evidence-invalid"));

  const preservedRetry = approvedTask();
  const failedAttempt = structuredClone(preservedRetry.behavior_evidence[0]);
  failedAttempt.evidence_id = "fixture-run-first-attempt";
  failedAttempt.result = "fail";
  failedAttempt.validation_results[0].result = "fail";
  preservedRetry.behavior_evidence[0].first_attempt = false;
  preservedRetry.behavior_evidence[0].retry_of = failedAttempt.evidence_id;
  preservedRetry.behavior_evidence = [failedAttempt, preservedRetry.behavior_evidence[0]];
  assert.deepEqual(validateTaskDeliverableState(preservedRetry), []);

  const selfGraded = approvedTask();
  selfGraded.behavior_evidence[0].observed_route = ["canonical-skill"];
  selfGraded.behavior_evidence[0].observed_diff = [];
  selfGraded.behavior_evidence[0].validation_results[0] = {
    check_id: "fixture-eval",
    result: "pass",
    grader_id: "gpt-5.6-sol",
    grader_mode: "self-report",
    grader_session_id: "fixture-session-001",
    independent_of_runner: true,
    evidence: "The runner says it passed.",
  };
  assert.ok(validateTaskDeliverableState(selfGraded).some((error) => error.code === "behavior-evidence-invalid"));
  assert.equal(projectDeliverableReadiness({ task: selfGraded, root }).deliverables[0].eval_readiness[0].ready, false);

  const mixedVerdict = approvedTask();
  mixedVerdict.behavior_evidence[0].validation_results.push({
    check_id: "security-review",
    result: "fail",
    grader_id: "fixture-security-grader",
    grader_mode: "independent-agent",
    grader_session_id: "fixture-security-session-001",
    independent_of_runner: true,
    evidence: "A required security check failed.",
  });
  assert.ok(validateTaskDeliverableState(mixedVerdict).some((error) => error.code === "behavior-evidence-invalid"));
  assert.equal(projectDeliverableReadiness({ task: mixedVerdict, root }).deliverables[0].eval_readiness[0].ready, false);

  const blockedNoWrite = approvedTask();
  blockedNoWrite.behavior_evidence[0].observed_diff = [];
  blockedNoWrite.behavior_evidence[0].no_write_evidence = {
    outcome: "blocked",
    reason: "A boundary check refused the write.",
    verified_zero_writes: true,
  };
  assert.deepEqual(validateTaskDeliverableState(blockedNoWrite), []);

  const unboundRun = approvedTask();
  unboundRun.behavior_evidence[0].observed_artifacts = ["projects/fixture/unbound.md"];
  unboundRun.behavior_evidence[0].observed_diff = [{ path: "projects/fixture/unbound.md", change: "created" }];
  unboundRun.linked_artifacts.push("projects/fixture/unbound.md");
  assert.ok(validateTaskDeliverableState(unboundRun).some((error) => error.code === "behavior-evidence-unbound"));

  const wrongModel = approvedTask({
    deliverable_contracts: [
      contract({
        eval_plan: [{ eval_id: "fixture-eval", kind: "fresh-agent", required: true }],
      }),
    ],
  });
  wrongModel.behavior_evidence[0].runner_id = "fallback-model";
  assert.equal(projectDeliverableReadiness({ task: wrongModel, root }).completion_ready, false);

  const reviewRequired = approvedTask({
    deliverable_contracts: [
      contract({
        completion_conditions: [
          {
            condition_id: "review-required",
            type: "review-passed",
            reference: "manual-review-eval",
          },
        ],
      }),
    ],
  });
  assert.ok(projectDeliverableReadiness({ task: reviewRequired, root }).blockers.some((blocker) => blocker.code === "review-evidence-missing"));

  const outside = path.join(root, "..", `${path.basename(root)}-outside.md`);
  await writeFile(outside, "outside\n");
  t.after(() => rm(outside, { force: true }));
  const linkPath = path.join(root, "projects", "fixture", "link.md");
  await symlink(outside, linkPath);
  const escaped = approvedTask({
    deliverable_contracts: [
      contract({
        target_surface: "projects/fixture/link.md",
        required_artifacts: [
          {
            artifact_id: "fixture-output-file",
            artifact_role: "primary",
            locator_type: "path",
            locator: "projects/fixture/link.md",
            validation: "file",
          },
        ],
      }),
    ],
    behavior_evidence: [],
    artifact_bindings: [
      {
        deliverable_id: "fixture-output",
        artifact_id: "fixture-output-file",
        artifact_role: "primary",
        locator_type: "path",
        locator: "projects/fixture/link.md",
      },
    ],
    linked_artifacts: ["projects/fixture/link.md"],
  });
  const escapedReadiness = projectDeliverableReadiness({ task: escaped, root });
  assert.equal(escapedReadiness.deliverables[0].identity_readiness.ready, false);
  assert.equal(escapedReadiness.deliverables[0].identity_readiness.code, "dependency-out-of-boundary");
  assert.ok(escapedReadiness.blockers.some((blocker) => blocker.code === "dependency-out-of-boundary"));
  assert.equal(await readFile(outside, "utf8"), "outside\n");
});

test("reconciles dependency output, provenance, role, and write boundaries", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-dependency-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "projects", "fixture", "dependency"), { recursive: true });
  await writeFile(path.join(root, "projects", "fixture", "output.md"), "fixture\n");
  await writeFile(path.join(root, "projects", "fixture", "dependency", "evidence.md"), "evidence\n");
  await mkdir(path.join(root, "outside"), { recursive: true });
  await writeFile(path.join(root, "outside", "evidence.md"), "outside\n");

  function dependencyFixture() {
    const fixture = approvedTask();
    fixture.deliverable_contracts[0].allowed_support_artifacts = [
      {
        artifact_id: "dependency-evidence",
        artifact_role: "support",
        locator_type: "path",
        locator: "projects/fixture/dependency/evidence.md",
        purpose: "Support the primary output with approved dependency evidence.",
      },
    ];
    fixture.deliverable_contracts[0].completion_conditions.push({
      condition_id: "dependency-complete",
      type: "dependency-step-complete",
      reference: "dependency-complete",
    });
    fixture.artifact_bindings.push({
      deliverable_id: "fixture-output",
      artifact_id: "dependency-evidence",
      artifact_role: "support",
      locator_type: "path",
      locator: "projects/fixture/dependency/evidence.md",
    });
    fixture.linked_artifacts.push("projects/fixture/dependency/evidence.md");
    fixture.dependency_steps = [
      {
        step_id: "dep-001",
        supported_deliverable_id: "fixture-output",
        supported_artifact_id: "dependency-evidence",
        artifact_role: "support",
        required_outcome: "Dependency evidence exists with matching provenance.",
        completion_condition_id: "dependency-complete",
        dependency_write_plan: {
          expected_output_paths: ["projects/fixture/dependency/evidence.md"],
          allowed_write_zones: ["projects/fixture/dependency"],
          protected_paths: ["projects/fixture/tasks/"],
          provenance_requirements: ["record generated artifacts and status"],
          promotion_rules: ["Primary dependency output requires explicit promotion."],
          external_write_approved: false,
        },
      },
    ];
    fixture.dependency_artifacts = [
      {
        dependency_step_id: "dep-001",
        supported_deliverable_id: "fixture-output",
        supported_artifact_id: "dependency-evidence",
        artifact_role: "support",
        generated_files: ["projects/fixture/dependency/evidence.md"],
        artifact_status: "execution-evidence",
      },
    ];
    fixture.dependency_provenance = [
      {
        dependency_step_id: "dep-001",
        supported_deliverable_id: "fixture-output",
        supported_artifact_id: "dependency-evidence",
        artifact_role: "support",
        generated_artifacts: ["projects/fixture/dependency/evidence.md"],
        artifact_status: "execution-evidence",
      },
    ];
    return fixture;
  }

  const success = dependencyFixture();
  assert.equal(projectDeliverableReadiness({ task: success, root }).completion_ready, true);

  const metadataOnly = dependencyFixture();
  metadataOnly.dependency_artifacts = [];
  metadataOnly.dependency_provenance = [];
  const metadataBlockers = projectDeliverableReadiness({ task: metadataOnly, root }).blockers;
  assert.ok(metadataBlockers.some((blocker) => blocker.code === "dependency-output-missing"));
  assert.ok(metadataBlockers.some((blocker) => blocker.code === "dependency-provenance-missing"));

  const wrongRole = dependencyFixture();
  wrongRole.dependency_artifacts[0].artifact_role = "primary";
  assert.ok(projectDeliverableReadiness({ task: wrongRole, root }).blockers.some((blocker) => blocker.code === "dependency-role-mismatch"));

  const outOfBoundary = dependencyFixture();
  outOfBoundary.dependency_artifacts[0].generated_files = ["outside/evidence.md"];
  outOfBoundary.dependency_provenance[0].generated_artifacts = ["outside/evidence.md"];
  assert.ok(projectDeliverableReadiness({ task: outOfBoundary, root }).blockers.some((blocker) => blocker.code === "dependency-out-of-boundary"));

  const unexpectedOutput = dependencyFixture();
  unexpectedOutput.dependency_steps[0].dependency_write_plan.expected_output_paths = ["projects/fixture/dependency/expected.md"];
  assert.ok(projectDeliverableReadiness({ task: unexpectedOutput, root }).blockers.some((blocker) => blocker.code === "dependency-output-unexpected"));

  const protectedOutput = dependencyFixture();
  protectedOutput.dependency_steps[0].dependency_write_plan.protected_paths = ["projects/fixture/dependency/"];
  assert.ok(projectDeliverableReadiness({ task: protectedOutput, root }).blockers.some((blocker) => blocker.code === "dependency-protected-path"));

  const outsideTarget = path.join(root, "..", `${path.basename(root)}-external.md`);
  await writeFile(outsideTarget, "external\n");
  t.after(() => rm(outsideTarget, { force: true }));
  const unapprovedExternal = dependencyFixture();
  unapprovedExternal.dependency_steps[0].dependency_write_plan.expected_output_paths = [outsideTarget];
  unapprovedExternal.dependency_steps[0].dependency_write_plan.allowed_write_zones = [path.dirname(outsideTarget)];
  unapprovedExternal.dependency_steps[0].dependency_write_plan.external_product_root = path.dirname(outsideTarget);
  unapprovedExternal.dependency_artifacts[0].generated_files = [outsideTarget];
  unapprovedExternal.dependency_provenance[0].generated_artifacts = [outsideTarget];
  assert.ok(projectDeliverableReadiness({ task: unapprovedExternal, root }).blockers.some((blocker) => blocker.code === "external-write-approval-missing"));

  const symlinkTarget = path.join(root, "..", `${path.basename(root)}-symlink-target.md`);
  await writeFile(symlinkTarget, "symlink target\n");
  t.after(() => rm(symlinkTarget, { force: true }));
  const symlinkPath = path.join(root, "projects", "fixture", "dependency", "link.md");
  await symlink(symlinkTarget, symlinkPath);
  const escapedSymlink = dependencyFixture();
  escapedSymlink.dependency_steps[0].dependency_write_plan.expected_output_paths = ["projects/fixture/dependency/link.md"];
  escapedSymlink.dependency_artifacts[0].generated_files = ["projects/fixture/dependency/link.md"];
  escapedSymlink.dependency_provenance[0].generated_artifacts = ["projects/fixture/dependency/link.md"];
  assert.ok(projectDeliverableReadiness({ task: escapedSymlink, root }).blockers.some((blocker) => blocker.code === "dependency-out-of-boundary"));

  const wrongProvenanceStatus = dependencyFixture();
  wrongProvenanceStatus.dependency_provenance[0].artifact_status = "promoted";
  assert.ok(projectDeliverableReadiness({ task: wrongProvenanceStatus, root }).blockers.some((blocker) => blocker.code === "dependency-provenance-missing"));

  const unpromotedPrimary = dependencyFixture();
  unpromotedPrimary.deliverable_contracts[0].allowed_support_artifacts[0].artifact_role = "primary";
  unpromotedPrimary.artifact_bindings[1].artifact_role = "primary";
  unpromotedPrimary.dependency_steps[0].artifact_role = "primary";
  unpromotedPrimary.dependency_artifacts[0].artifact_role = "primary";
  unpromotedPrimary.dependency_provenance[0].artifact_role = "primary";
  assert.ok(projectDeliverableReadiness({ task: unpromotedPrimary, root }).blockers.some((blocker) => blocker.code === "dependency-promotion-missing"));

  const invalidPromotedPrimary = dependencyFixture();
  invalidPromotedPrimary.deliverable_contracts[0].allowed_support_artifacts[0] = {
    ...invalidPromotedPrimary.deliverable_contracts[0].allowed_support_artifacts[0],
    artifact_role: "primary",
    validation: "canonical-skill-bundle",
  };
  invalidPromotedPrimary.artifact_bindings[1].artifact_role = "primary";
  invalidPromotedPrimary.dependency_steps[0].artifact_role = "primary";
  invalidPromotedPrimary.dependency_artifacts[0] = {
    ...invalidPromotedPrimary.dependency_artifacts[0],
    artifact_role: "primary",
    artifact_status: "promoted",
    promotion_metadata: {
      promoted_at: "2026-07-10",
      promotion_reason: "Promote the fixture dependency output.",
    },
  };
  invalidPromotedPrimary.dependency_provenance[0].artifact_role = "primary";
  invalidPromotedPrimary.dependency_provenance[0].artifact_status = "promoted";
  assert.ok(projectDeliverableReadiness({ task: invalidPromotedPrimary, root }).blockers.some((blocker) => blocker.code === "dependency-output-invalid"));
});

test("validates standalone artifacts only inside an explicitly approved product root", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-foundry-root-"));
  const productRoot = await mkdtemp(path.join(os.tmpdir(), "workflow-product-root-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  t.after(() => rm(productRoot, { recursive: true, force: true }));
  await writeFile(path.join(productRoot, "AGENTS.md"), "# Product Policy\n\nPython is not allowed. Keep the skill substantive and commands secondary.\n");
  const bundle = path.join(productRoot, "skills", "product-skill");
  await writeSkillBundle(bundle, "product-skill");

  function standaloneContract(overrides = {}) {
    return contract({
      kind: "standalone-skill",
      ownership_boundary: "standalone-product",
      target_surface: bundle,
      runtime_visibility: "standalone-only",
      external_product_root: productRoot,
      external_write_plan: {
        allowed_write_zones: ["skills/"],
        protected_paths: [],
        external_write_approved: true,
        approved_at: "2026-07-10",
        approval_note: "Approve fixture product writes.",
      },
      required_artifacts: [
        {
          artifact_id: "fixture-output-file",
          artifact_role: "primary",
          locator_type: "path",
          locator: bundle,
          validation: "packaged-skill-bundle",
        },
      ],
      ...overrides,
    });
  }

  const valid = approvedTask({
    deliverable_contracts: [standaloneContract()],
    artifact_bindings: [
      {
        deliverable_id: "fixture-output",
        artifact_id: "fixture-output-file",
        artifact_role: "primary",
        locator_type: "path",
        locator: bundle,
      },
    ],
    linked_artifacts: [bundle],
    behavior_evidence: [
      {
        ...approvedTask().behavior_evidence[0],
        observed_artifacts: [bundle],
        observed_diff: [{ path: bundle, change: "created" }],
        observed_route: ["standalone-skill"],
        observed_ownership: ["standalone-product"],
        observed_visibility: ["standalone-only"],
      },
    ],
  });
  assert.deepEqual(validateTaskDeliverableState(valid), []);
  assert.equal(projectDeliverableReadiness({ task: valid, root }).completion_ready, true);

  const unusedHelper = path.join(bundle, "references", "unused.md");
  await mkdir(path.dirname(unusedHelper), { recursive: true });
  await writeFile(unusedHelper, "unused helper\n");
  assert.ok(projectDeliverableReadiness({ task: valid, root }).blockers.some((blocker) => blocker.code === "required-artifact-invalid"));
  await rm(unusedHelper);

  const missingPlan = structuredClone(valid);
  delete missingPlan.deliverable_contracts[0].external_write_plan;
  assert.ok(validateTaskDeliverableState(missingPlan).some((error) => error.code === "external-write-plan-missing"));

  const outside = path.join(root, "outside-skill");
  await writeSkillBundle(outside, "outside-skill");
  const escaped = structuredClone(valid);
  escaped.deliverable_contracts[0].target_surface = outside;
  escaped.deliverable_contracts[0].required_artifacts[0].locator = outside;
  escaped.artifact_bindings[0].locator = outside;
  escaped.linked_artifacts = [outside];
  escaped.behavior_evidence[0].observed_artifacts = [outside];
  assert.ok(projectDeliverableReadiness({ task: escaped, root }).blockers.some((blocker) => blocker.code === "dependency-out-of-boundary"));
});

test("returns structured errors for malformed nested values and accepts status-only tasks", () => {
  const malformed = approvedTask({
    deliverable_contracts: [
      contract({
        required_artifacts: {},
        allowed_support_artifacts: "nope",
        required_guidance: [null],
        eval_plan: {},
        completion_conditions: "nope",
      }),
    ],
    artifact_bindings: {},
    behavior_evidence: [null],
    dependency_steps: [null],
  });
  assert.doesNotThrow(() => validateTaskDeliverableState(malformed));
  assert.ok(validateTaskDeliverableState(malformed).length > 0);
  assert.doesNotThrow(() => projectDeliverableReadiness({ task: malformed }));

  const malformedPlan = approvedTask({
    dependency_steps: [
      {
        step_id: "dep-malformed",
        supported_deliverable_id: "fixture-output",
        supported_artifact_id: "fixture-output-file",
        artifact_role: "primary",
        required_outcome: "Malformed paths return errors.",
        completion_condition_id: "fixture-artifact-valid",
        dependency_write_plan: {
          expected_output_paths: [null],
          allowed_write_zones: [{}],
          protected_paths: [false],
          provenance_requirements: ["record provenance"],
          promotion_rules: ["require promotion"],
        },
      },
    ],
  });
  assert.doesNotThrow(() => validateTaskDeliverableState(malformedPlan));
  assert.doesNotThrow(() => projectDeliverableReadiness({ task: malformedPlan }));
  assert.doesNotThrow(() => projectDeliverableReadiness());

  const statusOnly = task({ status: "done" });
  assert.deepEqual(validateTaskDeliverableState(statusOnly), []);
  assert.equal(projectDeliverableReadiness({ task: statusOnly }).state, "blocked");
});
