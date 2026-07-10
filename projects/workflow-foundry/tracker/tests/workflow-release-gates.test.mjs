import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { projectDeliverableReadiness } from "../../../../scripts/workflow-deliverable-contracts.mjs";
import { validateReleaseEvidenceDocument } from "../../../../scripts/workflow-release-evidence-validation.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../../..");

test("initiate-task scaffolds a guided packaged skill contract", async () => {
  const markdown = await readFile(path.join(repoRoot, ".agents/skills/initiate-task/SKILL.md"), "utf8");
  const templates = [...markdown.matchAll(/```json\s*\n([\s\S]*?)\n```/g)]
    .map((match) => JSON.parse(match[1]));
  const taskTemplate = templates.find((template) => Array.isArray(template.deliverable_contracts));
  assert.ok(taskTemplate, "the canonical task JSON template must exist");

  const contract = taskTemplate.deliverable_contracts.find(({ kind }) => kind === "packaged-skill");
  assert.ok(contract, "the task template must demonstrate packaged-skill routing");
  assert.equal(contract.required_artifacts[0].validation, "packaged-skill-bundle");
  assert.ok(Array.isArray(contract.required_guidance) && contract.required_guidance.length > 0);
});

test("readiness validates the executable scenario evidence document", () => {
  const locator = "projects/workflow-foundry/artifacts/reviews/workflow-foundry-006-behavior-scenarios.json";
  const task = {
    task_id: "scenario-evidence-gate",
    project_slug: "workflow-foundry",
    matt_phase: "intake",
    deliverable_migration: { status: "native" },
    deliverable_contracts: [{
      deliverable_id: "scenario-evidence",
      kind: "documentation-handoff",
      operation: "create",
      role: "primary",
      ownership_boundary: "canonical-foundry",
      owner_project: "workflow-foundry",
      target_surface: locator,
      required_artifacts: [{ artifact_id: "scenario-file", artifact_role: "primary", locator_type: "path", locator, validation: "behavior-evidence" }],
    }],
  };

  const readiness = projectDeliverableReadiness({ task, root: repoRoot });
  assert.equal(readiness.deliverables[0].artifact_readiness[0].ready, true);
});

test("release readiness replays the provenance-complete behavior evidence gate", async () => {
  const taskPath = path.join(
    repoRoot,
    "projects/workflow-foundry/tasks/workflow-foundry-006.json",
  );
  const task = JSON.parse(await readFile(taskPath, "utf8"));
  const readiness = projectDeliverableReadiness({ task, root: repoRoot });
  const evidenceDeliverable = readiness.deliverables.find(
    (entry) => entry.deliverable_id === "wf006-behavior-evidence",
  );
  const runEvidence = evidenceDeliverable.artifact_readiness.find(
    (entry) => entry.artifact_id === "behavior-run-evidence",
  );

  assert.equal(runEvidence.ready, true);
  assert.equal(readiness.completion_ready, true);
  assert.deepEqual(readiness.blockers, []);
});

test("extended workflow-product release evidence rejects tampered history and review claims", async () => {
  const evidencePath = path.join(
    repoRoot,
    "projects/workflow-foundry/artifacts/reviews/workflow-foundry-015-behavior-evidence.json",
  );
  const evidence = JSON.parse(await readFile(evidencePath, "utf8"));
  assert.deepEqual(validateReleaseEvidenceDocument(evidence), { valid: true, errors: [] });

  const tamper = (mutate, expectedCode) => {
    const document = structuredClone(evidence);
    mutate(document);
    const result = validateReleaseEvidenceDocument(document);
    assert.equal(result.valid, false);
    assert.ok(result.errors.includes(expectedCode), `${expectedCode}: ${result.errors.join(", ")}`);
  };

  tamper((document) => { document.baseline_runs[0].raw_prompt = "different prompt"; }, "baseline-prompt-mismatch");
  tamper((document) => { document.prior_runs[0].raw_event_log += "tampered"; }, "historical-event-hash-mismatch");
  tamper((document) => { document.high_risk_pass3[0].evidence_ids.reverse(); }, "pass3-order-invalid");
  tamper((document) => { document.pairwise_domain_review.final_review.raw_event_log += "tampered"; }, "pairwise-review-invalid");
  tamper((document) => { document.full_verification.commands[0].exit_code = 1; }, "full-verification-invalid");
  tamper((document) => { document.review_history.final_reviews[0].review.verdict = "FAIL"; }, "final-review-invalid");
  tamper((document) => { delete document.deterministic_runs[0].exit_code; }, "deterministic-run-invalid");
});
