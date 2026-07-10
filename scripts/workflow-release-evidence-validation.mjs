import { createHash } from "node:crypto";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const isRecord = (value) => typeof value === "object" && value !== null && !Array.isArray(value);
const nonEmpty = (value) => typeof value === "string" && value.trim() !== "";

function exactSolInvocation(record) {
  if (!isRecord(record) || (record.runner_id ?? record.reviewer_id) !== "gpt-5.6-sol" || !Array.isArray(record.invocation)) return false;
  const indexes = record.invocation.flatMap((entry, index) => entry === "--model" ? [index] : []);
  return indexes.length === 1 && record.invocation[indexes[0] + 1] === "gpt-5.6-sol";
}

function rawEventValid(record) {
  return nonEmpty(record?.raw_event_log) && sha256(record.raw_event_log) === record.raw_event_log_sha256;
}

function repeatOf(evidenceId) {
  const match = evidenceId?.match(/-r(\d+)$/);
  return match ? Number(match[1]) : null;
}

function sameStringSet(left, right) {
  const normalize = (values) => [...new Set(values)].sort();
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

function validHistoricalModelRun(record) {
  return (
    isRecord(record) &&
    nonEmpty(record.evidence_id) &&
    nonEmpty(record.scenario_id) &&
    nonEmpty(record.runner_session_id) &&
    nonEmpty(record.raw_prompt) &&
    nonEmpty(record.raw_output) &&
    ["pass", "fail"].includes(record.result) &&
    exactSolInvocation(record) &&
    rawEventValid(record)
  );
}

function validPairwiseReview(pairwise) {
  const finalReview = pairwise?.final_review;
  return (
    pairwise?.result === "pass" &&
    pairwise.generic_dashboard === false &&
    pairwise.materially_different === true &&
    Array.isArray(pairwise.concrete_differences) &&
    pairwise.concrete_differences.length >= 5 &&
    Array.isArray(pairwise.unresolved_critical_findings) &&
    pairwise.unresolved_critical_findings.length === 0 &&
    Array.isArray(pairwise.unresolved_high_findings) &&
    pairwise.unresolved_high_findings.length === 0 &&
    exactSolInvocation(finalReview) &&
    rawEventValid(finalReview) &&
    finalReview.review?.verdict === "pass" &&
    finalReview.review?.generic_dashboard === false &&
    finalReview.review?.materially_different === true
  );
}

function validVerificationCommand(command) {
  return (
    isRecord(command) &&
    nonEmpty(command.command) &&
    Number.isFinite(Date.parse(command.started_at)) &&
    Number.isFinite(Date.parse(command.completed_at)) &&
    Date.parse(command.completed_at) >= Date.parse(command.started_at) &&
    command.exit_code === 0 &&
    nonEmpty(command.raw_output) &&
    sha256(command.raw_output) === command.raw_output_sha256
  );
}

function validFullVerification(verification) {
  return (
    isRecord(verification) &&
    verification.result === "pass" &&
    Array.isArray(verification.commands) &&
    verification.commands.length >= 5 &&
    verification.commands.every(validVerificationCommand)
  );
}

function validFinalReview(review) {
  return (
    isRecord(review) &&
    exactSolInvocation(review) &&
    rawEventValid(review) &&
    review.exit_code === 0 &&
    review.review?.verdict === "PASS" &&
    Array.isArray(review.review?.unresolved_critical_findings) &&
    review.review.unresolved_critical_findings.length === 0 &&
    Array.isArray(review.review?.unresolved_high_findings) &&
    review.review.unresolved_high_findings.length === 0
  );
}

function validDeterministicRun(run) {
  return (
    isRecord(run) &&
    nonEmpty(run.evidence_id) &&
    nonEmpty(run.runner_id) &&
    nonEmpty(run.runner_mode) &&
    nonEmpty(run.runner_session_id) &&
    nonEmpty(run.grader_id) &&
    nonEmpty(run.command) &&
    Number.isFinite(Date.parse(run.started_at)) &&
    Number.isFinite(Date.parse(run.completed_at)) &&
    run.exit_code === 0 &&
    run.result === "pass" &&
    run.independent_of_model_runner === true &&
    nonEmpty(run.raw_output) &&
    sha256(run.raw_output) === run.raw_output_sha256 &&
    nonEmpty(run.observed_result)
  );
}

function validPass3Series(series, attemptById, currentBundleHash) {
  if (!isRecord(series) || series.consecutive_passes !== 3 || series.skill_bundle_sha256 !== currentBundleHash) return false;
  if (!Array.isArray(series.evidence_ids) || series.evidence_ids.length !== 3) return false;
  const runs = series.evidence_ids.map((evidenceId) => attemptById.get(evidenceId));
  if (runs.some((run) => !run || run.result !== "pass" || run.scenario_id !== series.family_id)) return false;
  if (runs.some((run) => run.skill_bundle_sha256 !== currentBundleHash)) return false;
  const repeats = runs.map((run) => repeatOf(run.evidence_id));
  if (repeats.some((repeat) => repeat === null) || repeats[1] !== repeats[0] + 1 || repeats[2] !== repeats[1] + 1) return false;
  if (!runs.every((run, index) => index === 0 || Date.parse(run.started_at) >= Date.parse(runs[index - 1].completed_at))) return false;
  if (!Array.isArray(series.runner_session_ids) || !sameStringSet(series.runner_session_ids, runs.map((run) => run.runner_session_id))) return false;
  if (series.reset_after_failure !== null) {
    const reset = attemptById.get(series.reset_after_failure);
    if (!reset || reset.result !== "fail" || repeatOf(reset.evidence_id) + 1 !== repeats[0]) return false;
  }
  return true;
}

export function validateReleaseEvidenceDocument(document) {
  const errors = [];
  const extended = Array.isArray(document?.baseline_runs) || Array.isArray(document?.high_risk_pass3);
  if (!extended) return { valid: true, errors };

  const baseline = Array.isArray(document.baseline_runs) ? document.baseline_runs : [];
  const calibration = Array.isArray(document.calibration_runs) ? document.calibration_runs : [];
  const prior = Array.isArray(document.prior_runs) ? document.prior_runs : [];
  const live = Array.isArray(document.live_runs) ? document.live_runs : [];
  const allRuns = [...calibration, ...baseline, ...prior, ...live];
  const attemptById = new Map(allRuns.map((run) => [run?.evidence_id, run]));

  if (attemptById.size !== allRuns.length || new Set(allRuns.map((run) => run?.runner_session_id)).size !== allRuns.length) {
    errors.push("historical-identity-duplicate");
  }
  if (!allRuns.every(validHistoricalModelRun)) errors.push("historical-event-hash-mismatch");

  const liveByScenario = new Map(live.map((run) => [run.scenario_id, run]));
  const baselineValid =
    baseline.length === live.length &&
    baseline.every((run) => {
      const green = liveByScenario.get(run.scenario_id);
      return (
        run.result === "fail" &&
        run.skill_bundle_present === false &&
        run.raw_prompt === green?.raw_prompt &&
        run.fixture_id === green?.fixture_id &&
        run.repository_context?.expected_route_withheld === true &&
        run.repository_context?.product_code_write_enabled === false &&
        run.no_write_evidence?.verified_zero_writes === true &&
        Array.isArray(run.observed_status) &&
        run.observed_status.length === 0
      );
    });
  if (!baselineValid) errors.push("baseline-prompt-mismatch");

  if (calibration.length === 0 || !calibration.every((run) => run.result === "fail" && run.skill_bundle_present === false)) {
    errors.push("calibration-history-invalid");
  }

  const pass3Valid =
    Array.isArray(document.high_risk_pass3) &&
    document.high_risk_pass3.length > 0 &&
    document.high_risk_pass3.every((series) => validPass3Series(series, attemptById, document.skill_bundle_sha256));
  if (!pass3Valid) errors.push("pass3-order-invalid");

  if (!validPairwiseReview(document.pairwise_domain_review)) errors.push("pairwise-review-invalid");
  if (!validFullVerification(document.full_verification)) errors.push("full-verification-invalid");

  const finalReviews = document.review_history?.final_reviews;
  if (
    !Array.isArray(finalReviews) ||
    finalReviews.length !== 3 ||
    !sameStringSet(finalReviews.map((review) => review.review_mode), ["spec", "security", "evidence"]) ||
    !finalReviews.every(validFinalReview)
  ) {
    errors.push("final-review-invalid");
  }

  if (!Array.isArray(document.deterministic_runs) || document.deterministic_runs.length === 0 || !document.deterministic_runs.every(validDeterministicRun)) {
    errors.push("deterministic-run-invalid");
  }

  const historyIds = Array.isArray(document.attempt_history) ? document.attempt_history.map((entry) => entry?.evidence_id) : [];
  if (!sameStringSet(historyIds, allRuns.map((run) => run.evidence_id))) errors.push("attempt-history-incomplete");

  return { valid: errors.length === 0, errors };
}
