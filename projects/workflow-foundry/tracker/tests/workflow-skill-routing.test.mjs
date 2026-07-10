import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  projectDeliverableReadiness,
  validateTaskDeliverableState,
} from "../../../../scripts/workflow-deliverable-contracts.mjs";
import { deriveCanonicalSkillCatalog } from "../../../../scripts/workflow-skill-catalog.mjs";
import { validateWorkflowState } from "../../../../scripts/workflow-state-validation-core.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../../..");
const scenariosPath = path.join(
  repoRoot,
  "projects/workflow-foundry/artifacts/reviews/workflow-foundry-006-behavior-scenarios.json",
);
const skillKinds = new Set(["canonical-skill", "packaged-skill", "standalone-skill"]);
const promptRouteRules = [
  ["single:command-helper-pressure", /\bquick start\b.*\bhelper script\b|\bnpx wrapper\b/], ["single:ambiguous-destination", /not chosen whether/], ["single:canonical-update", /update the existing audit-project-state|do not create a duplicate/],
  ["mixed-product", /(?=.*\bui\b)(?=.*callable (?:workflow )?skill)/], ["workflow-pack", /workflow pack/], ["project-packaged", /(?=.*\bhealth\b)(?=.*\b(?:packaged|package)\b)/],
  ["standalone", /(?=.*coverage-product)(?=.*\brepo(?:sitory)?\b)/], ["validator-only", /(?=.*validator)(?=.*(?:\bonly\b|\blang\b|not a skill|no skill|huwag))/], ["documentation-only", /(?=.*handoff)(?=.*(?:\bonly\b|\blang\b))/],
  ["tracker-only", /(?=.*tracker)(?=.*(?:\bonly\b|\blang\b))/], ["dependency-backed", /(?=.*dependency)(?=.*evidence)(?=.*skill)/], ["canonical-create", /^(?!.*(?:update the existing|duplicate)).*(?:audit-project-state|audits? project state|nag-audit.*project state)/],
];
function classifyRawPrompt(rawPrompt) {
  const matches = promptRouteRules.filter(([, pattern]) => pattern.test(rawPrompt.toLowerCase()));
  assert.equal(matches.length, 1, `raw prompt must resolve to exactly one route: ${rawPrompt}`);
  return matches[0][0];
}

function artifactPath(root, locator) {
  return path.isAbsolute(locator) ? locator : path.join(root, locator);
}

async function writeArtifact(root, locator, contents) {
  const target = artifactPath(root, locator);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents);
}

async function writeCompleteSkill(root, locator, name, sharedReference = "") {
  const bundle = artifactPath(root, locator);
  await mkdir(path.join(bundle, "agents"), { recursive: true });
  await writeFile(
    path.join(bundle, "SKILL.md"),
    `---
name: ${name}
description: Use when an approved deterministic route fixture must produce a complete callable workflow skill.
---

# ${name}

## Overview

Produce the approved callable workflow outcome without replacing the skill with commands or helper code.

## Required Context

Read the repository policy, selected task, typed deliverable contract, artifact bindings, and current readiness blockers. ${sharedReference}

## Input Contract

Require resolved ownership, an exact target surface, role-bound approvals, runtime visibility, and a deterministic evaluation plan.

## Workflow

1. Read and classify the selected contract, ownership boundary, and required user-visible outcome.
2. Create the smallest complete approved bundle while preserving every human and external-write boundary.
3. Validate the bundle, catalog projection, evidence, dependency outcomes, and phase readiness before handoff.

## Decision Points

Choose only the approved ownership branch and stop when identity, ownership, role, or destination is unresolved.

## Failure Handling

Return a stable blocker with observed evidence and perform no unapproved write when validation or authority is missing.

## Human Boundaries

Keep contract approval, external writes, promotion, publishing, and consequential dependency actions with the operator.

## Output Contract

Return the complete bundle, catalog result, validation evidence, dependency provenance, blockers, and lifecycle handoff.

## Completion Gate

Require valid artifacts, passing deterministic evidence, correct visibility, reconciled dependencies, and review without high findings.
`,
  );
  await writeFile(
    path.join(bundle, "agents", "openai.yaml"),
    `interface:
  display_name: "${name}"
  short_description: "Execute the approved ${name} workflow"
  default_prompt: "Use $${name} to execute the approved workflow."
`,
  );
}

async function writeRejectedCommandSkill(root, locator, name) {
  const bundle = artifactPath(root, locator);
  await mkdir(path.join(bundle, "agents"), { recursive: true });
  await writeFile(
    path.join(bundle, "SKILL.md"),
    `---
name: ${name}
description: Use when a command wrapper is incorrectly presented as a skill.
---

# Invalid wrapper

## Quick Start

npx invalid-wrapper
`,
  );
  await writeFile(
    path.join(bundle, "agents", "openai.yaml"),
    `interface:
  display_name: "Invalid wrapper"
  short_description: "Invalid command wrapper"
  default_prompt: "Use $${name}."
`,
  );
}

function makeContract({
  id,
  kind,
  surface,
  validation,
  role = "primary",
  boundary = "canonical-foundry",
  owner = "workflow-foundry",
  visibility = "not-applicable",
  operation = "create",
  members = [],
  independentlyCallable,
  support = [],
  extraConditions = [],
  externalProductRoot,
}) {
  const primaryId = `${id}-primary`;
  const evalId = `${id}-eval`;
  const result = {
    deliverable_id: id,
    contract_version: 1,
    kind,
    operation,
    role,
    ownership_boundary: boundary,
    owner_project: owner,
    target_surface: surface,
    runtime_visibility: visibility,
    runtime_targets: ["codex"],
    member_deliverable_ids: members,
    required_artifacts: [
      {
        artifact_id: primaryId,
        artifact_role: "primary",
        locator_type: "path",
        locator: surface,
        validation,
      },
    ],
    allowed_support_artifacts: support,
    required_guidance: [
      {
        guidance_id: `${id}-guidance`,
        source: "workflow-foundry-006 deterministic scenario contract",
        evidence: "The fixture exercises the declared route through the real contract, readiness, and catalog modules.",
      },
    ],
    eval_plan: [{ eval_id: evalId, kind: "deterministic", required: true }],
    completion_conditions: [
      { condition_id: `${id}-artifact-valid`, type: "artifact-valid", reference: primaryId },
      { condition_id: `${id}-eval-passed`, type: "eval-passed", reference: evalId },
      ...extraConditions,
    ],
  };
  if (operation === "update") result.update_identity = surface;
  if (independentlyCallable !== undefined) result.independently_callable = independentlyCallable;
  if (externalProductRoot) {
    result.external_product_root = externalProductRoot;
    result.external_write_plan = {
      allowed_write_zones: ["skills/"],
      protected_paths: [],
      external_write_approved: true,
      approved_at: "2026-07-10",
      approval_note: "Approve the disposable standalone fixture only.",
    };
  }
  return result;
}

function contractArtifacts(contract) {
  return [...contract.required_artifacts, ...contract.allowed_support_artifacts];
}

function evidenceFor(contract) {
  const artifact = contract.required_artifacts[0];
  const evalId = contract.eval_plan[0].eval_id;
  return {
    evidence_id: `${contract.deliverable_id}-evidence`,
    eval_id: evalId,
    scenario_id: `deterministic-${contract.deliverable_id}`,
    raw_prompt: `Execute the deterministic ${contract.deliverable_id} route.`,
    repository_context: "isolated disposable route fixture",
    runner_id: "node-test-runner",
    runner_mode: "deterministic-fixture",
    runner_session_id: `session-${contract.deliverable_id}`,
    started_at: "2026-07-10T00:00:00.000Z",
    completed_at: "2026-07-10T00:00:01.000Z",
    raw_output: `Validated ${contract.deliverable_id}.`,
    observed_diff: [{ path: artifact.locator, change: contract.operation === "update" ? "updated" : "created" }],
    validation_results: [{
      check_id: evalId,
      result: "pass",
      grader_id: "independent-deterministic-grader",
      grader_mode: "deterministic-validator",
      grader_session_id: `grader-${contract.deliverable_id}`,
      independent_of_runner: true,
      evidence: "The real contract, readiness, and catalog projections passed.",
    }],
    first_attempt: true,
    expected_route: contract.kind,
    observed_route: [contract.kind],
    observed_ownership: [contract.ownership_boundary],
    observed_visibility: [contract.runtime_visibility],
    observed_phase_result: "advanced after deterministic validation",
    observed_contract_ids: [contract.deliverable_id],
    observed_artifacts: [artifact.locator],
    result: "pass",
    timestamp: "2026-07-10T00:00:01.000Z",
    builder_contract_version: 1,
  };
}

function makeTask(contracts, { phase = "implement", taskKind = "workflow-change", dependency = {} } = {}) {
  const allArtifacts = contracts.flatMap((contract) => contractArtifacts(contract));
  const approvals = phase === "implement"
    ? contracts.flatMap((contract) => contract.required_artifacts.map((artifact) => ({
        path: artifact.locator,
        phase: "implement",
        deliverable_id: contract.deliverable_id,
        artifact_id: artifact.artifact_id,
        artifact_role: artifact.artifact_role,
        approval_note: "Approve the exact disposable scenario artifact.",
        approved_at: "2026-07-10",
      })))
    : [];
  return {
    task_id: "deterministic-route-001",
    project_slug: "workflow-foundry",
    task_kind: taskKind,
    status: "in-progress",
    matt_phase: phase,
    deliverable_migration: {
      status: "native",
      target_contract_version: 1,
      frozen_phase: null,
      approved_at: "2026-07-10",
      approval_note: "Approve the deterministic route contract.",
    },
    deliverable_contracts: contracts,
    artifact_bindings: contracts.flatMap((contract) => contractArtifacts(contract).map((artifact) => ({
      deliverable_id: contract.deliverable_id,
      artifact_id: artifact.artifact_id,
      artifact_role: artifact.artifact_role,
      locator_type: artifact.locator_type,
      locator: artifact.locator,
    }))),
    behavior_evidence: phase === "implement" ? contracts.map(evidenceFor) : [],
    linked_artifacts: allArtifacts.map((artifact) => artifact.locator),
    phase_guard: {
      selected_next_action: phase === "implement" ? "code-review" : "grilling",
      approved_artifacts: approvals,
      process_exceptions: [],
    },
    ...dependency,
  };
}

function routeDefinition(routeKey, suiteRoot) {
  const skill = (id, surface, options = {}) => makeContract({
    id,
    kind: options.kind ?? "canonical-skill",
    surface,
    validation: options.kind === "packaged-skill" || options.kind === "standalone-skill"
      ? "packaged-skill-bundle"
      : "canonical-skill-bundle",
    visibility: options.visibility ?? "canonical-active",
    boundary: options.boundary,
    owner: options.owner,
    role: options.role,
    operation: options.operation,
    independentlyCallable: options.independentlyCallable,
    externalProductRoot: options.externalProductRoot,
    support: options.support,
    extraConditions: options.extraConditions,
  });
  if (routeKey === "canonical-create" || routeKey === "single:canonical-update") {
    const surface = ".agents/skills/audit-project-state";
    return {
      branch: "canonical",
      contracts: [skill("audit-project-state", surface, { operation: routeKey.includes("update") ? "update" : "create" })],
      skills: [[surface, "audit-project-state"]],
      expectedCatalog: ["audit-project-state"],
    };
  }
  if (routeKey === "project-packaged") {
    const surface = "projects/health/skills/health-workflow";
    return {
      branch: "project-packaged",
      contracts: [skill("health-workflow", surface, { kind: "packaged-skill", boundary: "project-packaged", owner: "health", visibility: "project-local-inactive" })],
      skills: [[surface, "health-workflow"]],
      files: [["projects/health/AGENTS.md", "# Health product policy\n\nPython is not allowed. Keep workflow skills callable through the selected harness.\n"]],
      expectedCatalog: [],
    };
  }
  if (routeKey === "standalone") {
    const productRoot = path.join(suiteRoot, "products", "coverage-product");
    const surface = path.join(productRoot, "skills", "coverage-product");
    return {
      branch: "standalone",
      contracts: [skill("coverage-product", surface, { kind: "standalone-skill", boundary: "standalone-product", owner: "coverage-product", visibility: "standalone-only", externalProductRoot: productRoot })],
      skills: [[surface, "coverage-product"]],
      files: [[path.join(productRoot, "AGENTS.md"), "# Coverage product policy\n\nPython is not allowed. Keep workflow skills callable through the selected harness.\n"]],
      expectedCatalog: [],
    };
  }
  if (routeKey === "mixed-product") {
    const ui = makeContract({ id: "mixed-ui", kind: "ui-application", surface: "projects/workflow-foundry/tracker/src/pages/mixed.astro", validation: "file" });
    const callable = skill("mixed-control", ".agents/skills/mixed-control");
    return {
      branch: "multi-deliverable", contracts: [ui, callable],
      skills: [[callable.target_surface, "mixed-control"]], files: [[ui.target_surface, "<main>Mixed UI</main>\n"]], expectedCatalog: ["mixed-control"],
    };
  }
  if (routeKey === "workflow-pack") {
    const packSurface = ".workflow-packs/research-pack";
    const shared = `${packSurface}/shared.md`;
    const first = skill("pack-first", ".agents/skills/pack-first", { role: "support", independentlyCallable: true });
    const second = skill("pack-second", ".agents/skills/pack-second", { role: "support", independentlyCallable: true });
    const pack = makeContract({
      id: "research-pack", kind: "workflow-pack", surface: packSurface, validation: "directory",
      visibility: "canonical-active", members: [first.deliverable_id, second.deliverable_id],
      support: [{ artifact_id: "pack-shared", artifact_role: "support", locator_type: "path", locator: shared, purpose: "Share declared guidance between independently callable members." }],
    });
    return {
      branch: "workflow-pack", contracts: [pack, first, second], directories: [packSurface],
      files: [[shared, "# Shared pack guidance\n"]],
      skills: [[first.target_surface, "pack-first", shared], [second.target_surface, "pack-second", shared]],
      expectedCatalog: ["pack-first", "pack-second"],
    };
  }
  if (["validator-only", "documentation-only", "tracker-only"].includes(routeKey)) {
    const config = {
      "validator-only": ["validator-query-helper", "scripts/approved-validator.mjs", "export const valid = true;\n", "create"],
      "documentation-only": ["documentation-handoff", "projects/workflow-foundry/artifacts/handoffs/route.md", "# Route handoff\n", "create"],
      "tracker-only": ["tracker-only", "projects/workflow-foundry/project.json", "{\"project_slug\":\"workflow-foundry\"}\n", "update"],
    }[routeKey];
    const routed = makeContract({ id: routeKey, kind: config[0], surface: config[1], validation: "file", operation: config[3] });
    return { branch: routeKey, contracts: [routed], files: [[config[1], config[2]]], expectedCatalog: [], taskKind: routeKey === "tracker-only" ? "tracker-maintenance" : "workflow-change" };
  }
  if (routeKey === "dependency-backed") {
    const supportPath = "projects/workflow-foundry/artifacts/reviews/dependency-output.md";
    const support = [{ artifact_id: "dependency-output", artifact_role: "support", locator_type: "path", locator: supportPath, purpose: "Record bounded dependency output with provenance." }];
    const routed = skill("dependency-backed-skill", ".agents/skills/dependency-backed-skill", {
      support,
      extraConditions: [{ condition_id: "dependency-reconciled", type: "dependency-step-complete", reference: "dependency-ready" }],
    });
    const step = {
      step_id: "dependency-step", supported_deliverable_id: routed.deliverable_id, supported_artifact_id: "dependency-output", artifact_role: "support",
      required_outcome: "The declared dependency output exists with matching provenance.", completion_condition_id: "dependency-ready",
      dependency_write_plan: { expected_output_paths: [supportPath], allowed_write_zones: ["projects/workflow-foundry/artifacts/reviews"], protected_paths: ["projects/workflow-foundry/tasks"], provenance_requirements: ["generated artifacts"], promotion_rules: ["support remains support"] },
    };
    return {
      branch: "dependency-backed", contracts: [routed], skills: [[routed.target_surface, "dependency-backed-skill"]], files: [[supportPath, "dependency evidence\n"]], expectedCatalog: ["dependency-backed-skill"],
      dependency: {
        dependency_steps: [step],
        dependency_artifacts: [{ dependency_step_id: step.step_id, supported_deliverable_id: routed.deliverable_id, supported_artifact_id: "dependency-output", artifact_role: "support", generated_files: [supportPath], artifact_status: "execution-evidence" }],
        dependency_provenance: [{ dependency_step_id: step.step_id, supported_deliverable_id: routed.deliverable_id, supported_artifact_id: "dependency-output", artifact_role: "support", generated_artifacts: [supportPath], artifact_status: "execution-evidence" }],
      },
    };
  }
  if (routeKey === "single:command-helper-pressure") {
    const routed = skill("invalid-wrapper", ".agents/skills/invalid-wrapper");
    return { branch: "canonical", contracts: [routed], rejectedSkill: [routed.target_surface, "invalid-wrapper"], expectedCatalog: [], expectRejected: true };
  }
  if (routeKey === "single:ambiguous-destination") {
    return { branch: "blocked-ownership", contracts: [], expectedCatalog: [], expectBlocked: true };
  }
  throw new Error(`Unhandled deterministic route ${routeKey}`);
}

async function materializeRouteFixture({ routeKey, suiteRoot }) {
  const root = path.join(suiteRoot, routeKey.replace(/[^a-z0-9-]/g, "-"));
  await mkdir(path.join(root, ".agents", "skills"), { recursive: true });
  const definition = routeDefinition(routeKey, suiteRoot);
  for (const directory of definition.directories ?? []) await mkdir(artifactPath(root, directory), { recursive: true });
  for (const [locator, contents] of definition.files ?? []) await writeArtifact(root, locator, contents);
  for (const [locator, name, shared] of definition.skills ?? []) await writeCompleteSkill(root, locator, name, shared ? `Read the declared shared reference at ${shared}.` : "");
  if (definition.rejectedSkill) await writeRejectedCommandSkill(root, ...definition.rejectedSkill);

  const catalog = await deriveCanonicalSkillCatalog({ root });
  if (definition.expectBlocked) {
    const task = {
      task_id: "ambiguous", project_slug: "workflow-foundry", status: "in-progress", matt_phase: "intake",
      deliverable_migration: { status: "pending", target_contract_version: 1, frozen_phase: "intake", approved_at: null, approval_note: null },
      deliverable_contracts: [], artifact_bindings: [], behavior_evidence: [], linked_artifacts: [],
      phase_guard: { selected_next_action: "grilling", approved_artifacts: [], process_exceptions: [] },
    };
    assert.deepEqual(validateTaskDeliverableState(task), []);
    const readiness = projectDeliverableReadiness({ task, root, catalog });
    assert.equal(readiness.next_phase_ready, false);
    assert.deepEqual(readiness.blockers.map((blocker) => blocker.code), ["migration-pending"]);
    return { ...definition, root, task, readiness, intakeReadiness: readiness, catalog };
  }

  const task = makeTask(definition.contracts, { taskKind: definition.taskKind, dependency: definition.dependency });
  assert.deepEqual(validateTaskDeliverableState(task), []);
  const readiness = projectDeliverableReadiness({ task, root, catalog });
  const intakeTask = makeTask(definition.contracts, { phase: "intake", taskKind: definition.taskKind, dependency: definition.dependency });
  assert.deepEqual(validateTaskDeliverableState(intakeTask), []);
  const intakeReadiness = projectDeliverableReadiness({ task: intakeTask, root, catalog });
  assert.equal(intakeReadiness.next_phase_ready, true);
  assert.equal(intakeReadiness.completion_ready, false);
  assert.equal(intakeTask.phase_guard.approved_artifacts.length, 0);

  if (definition.expectRejected) {
    assert.equal(readiness.completion_ready, false);
    assert.ok(catalog.errors.some((error) => ["catalog-semantic-thin-wrapper", "catalog-bundle-incomplete"].includes(error.code)));
  } else {
    assert.deepEqual(catalog.errors, []);
    assert.equal(readiness.completion_ready, true, `${routeKey}: ${JSON.stringify(readiness.blockers)}`);
    assert.equal(readiness.next_phase_ready, true);
    assert.ok(definition.contracts.some((contract) => contract.role === "primary"));
    assert.ok(readiness.deliverables.flatMap((deliverable) => deliverable.artifact_readiness).every((artifact) => artifact.ready));
  }
  assert.deepEqual(catalog.skills.map((skillEntry) => skillEntry.name).sort(), [...definition.expectedCatalog].sort());

  if (routeKey === "mixed-product") {
    assert.deepEqual(definition.contracts.map((contract) => contract.role), ["primary", "primary"]);
    const uiPath = artifactPath(root, definition.contracts[0].target_surface);
    await rm(uiPath);
    assert.equal(projectDeliverableReadiness({ task, root, catalog }).completion_ready, false);
    await writeFile(uiPath, "<main>Mixed UI</main>\n");
  }
  if (routeKey === "workflow-pack") {
    const members = definition.contracts.slice(1);
    assert.deepEqual(definition.contracts.map((contract) => contract.role), ["primary", "support", "support"]);
    assert.ok(members.every((member) => member.independently_callable && skillKinds.has(member.kind)));
  }
  if (routeKey === "standalone") {
    const escaped = structuredClone(task);
    escaped.deliverable_contracts[0].external_write_plan.allowed_write_zones = ["other/"];
    assert.equal(projectDeliverableReadiness({ task: escaped, root, catalog }).completion_ready, false);
  }
  if (routeKey === "dependency-backed") {
    assert.equal(task.dependency_steps[0].artifact_role, "support");
    assert.ok(readiness.deliverables[0].dependency_readiness.every((dependency) => dependency.ready));
    const missingProvenance = structuredClone(task);
    missingProvenance.dependency_provenance = [];
    assert.ok(projectDeliverableReadiness({ task: missingProvenance, root, catalog }).blockers.some((blocker) => blocker.code === "dependency-provenance-missing"));
  }
  return { ...definition, root, task, readiness, intakeTask, intakeReadiness, catalog };
}

async function executeDeterministicScenarioGate({ fixture, t }) {
  const deterministicCases = fixture.expanded_cases.filter((scenario) => scenario.runner_modes.includes("deterministic-fixture"));
  assert.equal(deterministicCases.length, fixture.case_expansion.deterministic_case_count);
  const suiteRoot = await mkdtemp(path.join(os.tmpdir(), "workflow-route-gate-"));
  t.after(() => rm(suiteRoot, { recursive: true, force: true }));
  const routeKeyFor = (scenario) => classifyRawPrompt(scenario.raw_prompt);
  const routeKeys = [...new Set(deterministicCases.map(routeKeyFor))];
  const outcomes = new Map();
  for (const routeKey of routeKeys) outcomes.set(routeKey, await materializeRouteFixture({ routeKey, suiteRoot }));

  const consumed = new Set();
  for (const scenario of deterministicCases) {
    const outcome = outcomes.get(routeKeyFor(scenario));
    consumed.add(scenario.case_id);
    assert.ok(scenario.raw_prompt.trim(), `${scenario.case_id} must preserve the raw prompt`);
    assert.equal(scenario.repository_context.expected_route_withheld, true);
    assert.equal(outcome.branch, scenario.expected_route.branch, `${scenario.case_id} raw prompt classified as ${routeKeyFor(scenario)}`);
    if (scenario.expected_route.builder === "none") {
      assert.ok(outcome.contracts.every((contract) => !skillKinds.has(contract.kind)));
    }
    if (scenario.stage === "implementation-ready-construction") {
      assert.equal(outcome.readiness.completion_ready, true);
    } else if (outcome.expectBlocked) {
      assert.equal(outcome.intakeReadiness.next_phase_ready, false);
    } else {
      assert.equal(outcome.intakeTask.matt_phase, "intake");
      assert.equal(outcome.intakeReadiness.next_phase_ready, true);
    }
  }
  assert.equal(consumed.size, deterministicCases.length);
  assert.equal(outcomes.size, 12);
  for (const routeKey of ["validator-only", "documentation-only", "tracker-only"]) {
    const outcome = outcomes.get(routeKey);
    assert.equal(outcome.readiness.completion_ready, true);
    assert.deepEqual(outcome.catalog.skills, []);
  }
}

test("uses one shared scenario contract for every routing family and language variant", async () => {
  const fixture = JSON.parse(await readFile(scenariosPath, "utf8"));
  const requiredFamilies = [
    "canonical-create",
    "project-packaged",
    "standalone",
    "mixed-product",
    "workflow-pack",
    "validator-only",
    "documentation-only",
    "tracker-only",
    "dependency-backed",
  ];

  assert.equal(fixture.schema_version, "2");
  assert.equal(fixture.builder_contract_version, 1);
  assert.deepEqual(fixture.runner_modes, ["fresh-agent", "deterministic-fixture"]);
  for (const familyId of requiredFamilies) {
    const family = fixture.scenario_families.find((candidate) => candidate.family_id === familyId);
    assert.ok(family, `${familyId} scenario family must exist`);
    assert.deepEqual(Object.keys(family.prompts).sort(), ["english", "taglish", "terse"]);
    for (const key of [
      "repository_context",
      "expected_route",
      "ownership_boundary",
      "required_bundle",
      "allowed_support",
      "forbidden_outcomes",
      "dependency_behavior",
      "phase_behavior",
      "expected_final_result",
    ]) {
      assert.notEqual(family[key], undefined, `${familyId}.${key} must exist`);
    }
  }
  assert.deepEqual(
    fixture.single_scenarios.map((scenario) => scenario.scenario_id).sort(),
    ["ambiguous-destination", "canonical-update", "command-helper-pressure"],
  );
  assert.equal(fixture.case_expansion.live_case_count, 54);
  assert.equal(fixture.case_expansion.deterministic_case_count, 48);
  assert.equal(fixture.expanded_cases.length, 54);
  assert.equal(new Set(fixture.expanded_cases.map((scenario) => scenario.case_id)).size, 54);

  const constructionFamilies = new Set([
    "canonical-create",
    "project-packaged",
    "standalone",
    "mixed-product",
    "workflow-pack",
    "dependency-backed",
  ]);
  for (const family of fixture.scenario_families) {
    for (const [variant, rawPrompt] of Object.entries(family.prompts)) {
      const lifecycle = fixture.expanded_cases.find(
        (scenario) => scenario.case_id === `lifecycle-${family.family_id}-${variant}`,
      );
      assert.equal(lifecycle.raw_prompt, rawPrompt);
      assert.equal(lifecycle.repository_context.expected_route_withheld, true);
      assert.equal(lifecycle.stage, "lifecycle-intent");

      if (constructionFamilies.has(family.family_id)) {
        const construction = fixture.expanded_cases.find(
          (scenario) => scenario.case_id === `green-${family.family_id}-${variant}`,
        );
        assert.equal(construction.raw_prompt, rawPrompt);
        assert.equal(construction.repository_context.expected_route_withheld, true);
        assert.equal(construction.stage, "implementation-ready-construction");
        assert.ok(construction.runner_modes.includes("fresh-agent"));
      }
    }
  }
  for (const familyId of constructionFamilies) {
    const baseline = fixture.expanded_cases.find(
      (scenario) => scenario.case_id === `red-${familyId}-english`,
    );
    assert.equal(baseline.stage, "behavioral-red-baseline");
    assert.equal(baseline.repository_context.builder_available, false);
    assert.deepEqual(baseline.runner_modes, ["fresh-agent"]);
  }
});

test("ships one substantive canonical build-workflow-skill bundle", async () => {
  const skillPath = path.join(repoRoot, ".agents/skills/build-workflow-skill/SKILL.md");
  const metadataPath = path.join(
    repoRoot,
    ".agents/skills/build-workflow-skill/agents/openai.yaml",
  );
  const [skill, metadata] = await Promise.all([
    readFile(skillPath, "utf8"),
    readFile(metadataPath, "utf8"),
  ]);

  for (const heading of [
    "Overview",
    "Required Context",
    "Input Contract",
    "Workflow",
    "Decision Points",
    "Failure Handling",
    "Human Boundaries",
    "Output Contract",
    "Completion Gate",
    "Developer Verification",
  ]) {
    assert.match(skill, new RegExp(`^## ${heading}$`, "m"));
  }
  assert.match(skill, /references\/skill-bundle-contract\.md/);
  assert.match(skill, /references\/behavior-evaluation-contract\.md/);
  assert.match(metadata, /default_prompt: "Use \$build-workflow-skill/);

  const catalog = await deriveCanonicalSkillCatalog({ root: repoRoot });
  assert.deepEqual(catalog.errors, []);
  assert.ok(catalog.skills.some((candidate) => candidate.name === "build-workflow-skill"));
});

test("default-denies operator commands outside exact support headings", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-command-first-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  async function writeCommandSkill(name, body) {
    const bundle = path.join(root, ".agents", "skills", name);
    await mkdir(path.join(bundle, "agents"), { recursive: true });
    await writeFile(
      path.join(bundle, "SKILL.md"),
      `---\nname: ${name}\ndescription: Use when testing ${name}.\n---\n\n# ${name}\n\n${body}\n`,
    );
    await writeFile(
      path.join(bundle, "agents", "openai.yaml"),
      `interface:\n  display_name: "${name}"\n  short_description: "Fixture"\n  default_prompt: "Use $${name} for the fixture."\n`,
    );
  }

  await writeCommandSkill("unheaded-command", "npx unheaded-command");
  await writeCommandSkill("quick-command", "## Quick Start\n\nnpm run quick");
  await writeCommandSkill("example-command", "## Example\n\nnode scripts/example.mjs");
  await writeCommandSkill("arbitrary-command", "## Workflow\n\nnpm run arbitrary");
  await writeCommandSkill("node-bin-command", "## Process\n\nnode bin/cli.mjs");
  await writeCommandSkill("shell-command", "## Steps\n\nbash scripts/run.sh");
  await writeCommandSkill("executable-command", "## Runtime\n\n./scripts/run.mjs --check");
  await writeCommandSkill(
    "node-modules-bin-command",
    "## Runtime\n\nnode_modules/.bin/fixture-tool --check",
  );
  await writeCommandSkill(
    "inline-node-command",
    "## Process\n\nRun `node bin/cli.mjs --check` for the operator.",
  );
  await writeCommandSkill(
    "fenced-package-command",
    "## Process\n\n```bash\nnpm run verify\n```",
  );
  await writeCommandSkill(
    "chained-package-command",
    "## Process\n\ncd app && npm run dev",
  );
  await writeCommandSkill(
    "env-wrapper-command",
    "## Process\n\nenv npm run x",
  );
  await writeCommandSkill(
    "command-wrapper-command",
    "## Process\n\ncommand npm run x",
  );
  await writeCommandSkill(
    "assigned-wrapper-command",
    "## Process\n\nCI=1 pnpm test",
  );
  await writeCommandSkill(
    "semicolon-shell-command",
    "## Process\n\ncd app; bash scripts/run.sh",
  );
  await writeCommandSkill(
    "yarn-custom-script-command",
    "## Process\n\nyarn custom-script",
  );
  await writeCommandSkill(
    "pnpm-custom-script-command",
    "## Process\n\npnpm custom-script",
  );
  await writeCommandSkill(
    "deno-task-command",
    "## Process\n\ndeno task verify",
  );
  for (const [name, command] of [
    ["text-fence-command", "```text\nnpm run verify\n```"],
    ["corepack-command", "corepack pnpm test"],
    ["make-command", "make build"],
    ["docker-compose-command", "docker compose up"],
    ["uv-command", "uv run pytest"],
    ["cargo-command", "cargo test"],
    ["go-command", "go test ./..."],
    ["git-command", "git status"],
  ]) {
    await writeCommandSkill(name, `## Process\n\n${command}`);
  }
  await writeCommandSkill(
    "suffix-support-command",
    "## Project Developer Verification\n\npnpm test",
  );
  await writeCommandSkill(
    "allowed-command",
    "## Deterministic Validation\n\nnode scripts/validate.mjs",
  );
  await writeCommandSkill(
    "allowed-internal-command",
    "## Internal Support\n\nzsh scripts/support.zsh",
  );
  await writeCommandSkill(
    "prose-and-inventory-only",
    [
      "## Workflow",
      "",
      "Python is not allowed in this repository.",
      "Node is the runtime used by deterministic helpers.",
      "pnpm custom scripts are described here as ordinary prose.",
      "yarn custom scripts can also be discussed without invoking them.",
      "The `.mjs` extension identifies validation and query helpers.",
      "Read `scripts/query-workflow-state.mjs` before changing the query contract.",
      "1. `scripts/validate-workflow-state.mjs`",
      "2. `bin/workflow-helper.mjs`",
      "",
      "## Developer Verification",
      "",
      "```text",
      "node scripts/example.mjs",
      "npm run verify",
      "./scripts/run.mjs --check",
      "```",
    ].join("\n"),
  );

  const result = await validateWorkflowState({ root, includeChangedFiles: false });
  const commandErrors = result.errors.filter((error) => error.includes("presents command-first"));
  assert.equal(commandErrors.length, 27);
  assert.ok(commandErrors.some((error) => error.includes("unheaded-command")));
  assert.ok(commandErrors.some((error) => error.includes("Quick Start")));
  assert.ok(commandErrors.some((error) => error.includes("Example")));
  assert.ok(commandErrors.some((error) => error.includes("arbitrary-command")));
  assert.ok(commandErrors.some((error) => error.includes("node-bin-command")));
  assert.ok(commandErrors.some((error) => error.includes("shell-command")));
  assert.ok(commandErrors.some((error) => error.includes("executable-command")));
  assert.ok(commandErrors.some((error) => error.includes("node-modules-bin-command")));
  assert.ok(commandErrors.some((error) => error.includes("inline-node-command")));
  assert.ok(commandErrors.some((error) => error.includes("fenced-package-command")));
  assert.ok(commandErrors.some((error) => error.includes("chained-package-command")));
  assert.ok(commandErrors.some((error) => error.includes("env-wrapper-command")));
  assert.ok(commandErrors.some((error) => error.includes("command-wrapper-command")));
  assert.ok(commandErrors.some((error) => error.includes("assigned-wrapper-command")));
  assert.ok(commandErrors.some((error) => error.includes("semicolon-shell-command")));
  assert.ok(commandErrors.some((error) => error.includes("yarn-custom-script-command")));
  assert.ok(commandErrors.some((error) => error.includes("pnpm-custom-script-command")));
  assert.ok(commandErrors.some((error) => error.includes("deno-task-command")));
  for (const skillName of [
    "text-fence-command",
    "corepack-command",
    "make-command",
    "docker-compose-command",
    "uv-command",
    "cargo-command",
    "go-command",
    "git-command",
  ]) {
    assert.ok(commandErrors.some((error) => error.includes(skillName)), skillName);
  }
  assert.ok(commandErrors.some((error) => error.includes("suffix-support-command")));
  assert.ok(commandErrors.every((error) => !error.includes("allowed-command")));
  assert.ok(commandErrors.every((error) => !error.includes("allowed-internal-command")));
  assert.ok(commandErrors.every((error) => !error.includes("prose-and-inventory-only")));
});

test("returns a structured validator result for malformed options", async () => {
  const nullOptions = await validateWorkflowState(null);
  assert.equal(nullOptions.ok, false);
  assert.deepEqual(nullOptions.errors, [
    "validator-input-invalid: options must be an object with an optional path-string root",
  ]);

  const invalidRoot = await validateWorkflowState({ root: 42 });
  assert.equal(invalidRoot.ok, false);
  assert.deepEqual(invalidRoot.errors, [
    "validator-input-invalid: options must be an object with an optional path-string root",
  ]);
});

test("executes every deterministic scenario through real contract, readiness, and catalog gates", async (t) => {
  const fixture = JSON.parse(await readFile(scenariosPath, "utf8"));
  await executeDeterministicScenarioGate({ fixture, t });
});
