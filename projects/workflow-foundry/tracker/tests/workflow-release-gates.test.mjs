import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { projectDeliverableReadiness } from "../../../../scripts/workflow-deliverable-contracts.mjs";
import { validateReleaseEvidenceDocument } from "../../../../scripts/workflow-release-evidence-validation.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../../..");

test("readiness validates the executable scenario evidence document", () => {
  const locator = "projects/workflow-foundry/artifacts/reviews/workflow-foundry-006-behavior-scenarios.json";
  const task = {
    task_id: "scenario-evidence-gate",
    project_slug: "workflow-foundry",
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

test("validates complete release evidence and accepts ordinary documents", async () => {
  const evidence = JSON.parse(
    await readFile(
      path.join(
        repoRoot,
        "projects/workflow-foundry/artifacts/reviews/workflow-foundry-015-behavior-evidence.json",
      ),
      "utf8",
    ),
  );

  assert.deepEqual(validateReleaseEvidenceDocument({}), { valid: true, errors: [] });
  assert.deepEqual(validateReleaseEvidenceDocument(evidence), { valid: true, errors: [] });
});

test("reports every release-evidence integrity family", async () => {
  const evidence = JSON.parse(
    await readFile(
      path.join(
        repoRoot,
        "projects/workflow-foundry/artifacts/reviews/workflow-foundry-015-behavior-evidence.json",
      ),
      "utf8",
    ),
  );
  const invalid = structuredClone(evidence);

  invalid.baseline_runs[0].runner_session_id = invalid.baseline_runs[1].runner_session_id;
  invalid.baseline_runs[0].raw_event_log_sha256 = "invalid";
  invalid.baseline_runs[0].raw_prompt = "mismatch";
  invalid.calibration_runs[0].result = "pass";
  invalid.high_risk_pass3[0].consecutive_passes = 2;
  invalid.pairwise_domain_review.generic_dashboard = true;
  invalid.full_verification.commands[0].exit_code = 1;
  invalid.review_history.final_reviews[0].exit_code = 1;
  invalid.deterministic_runs[0].exit_code = 1;
  invalid.attempt_history.pop();

  const result = validateReleaseEvidenceDocument(invalid);
  assert.equal(result.valid, false);
  assert.deepEqual(
    new Set(result.errors),
    new Set([
      "historical-identity-duplicate",
      "historical-event-hash-mismatch",
      "baseline-prompt-mismatch",
      "calibration-history-invalid",
      "pass3-order-invalid",
      "pairwise-review-invalid",
      "full-verification-invalid",
      "final-review-invalid",
      "deterministic-run-invalid",
      "attempt-history-incomplete",
    ]),
  );
});
