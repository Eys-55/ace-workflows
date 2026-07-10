import { createHash } from "node:crypto";
import { existsSync, lstatSync, readFileSync, realpathSync, statSync } from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  arrayOrEmpty,
  artifactValidations,
  isHistoricalCompatibleTask,
  isRecord,
  isWithinPath,
  issue,
  nonEmptyString,
  normalizedLocator,
  resolveAgainst,
  validateTaskDeliverableState,
} from "./workflow-contract-schema.mjs";
import { validateSkillBundle } from "./workflow-skill-catalog.mjs";

const sha256 = (value) => createHash("sha256").update(value).digest("hex");

function validScenarioEvidence(document) {
  if (!Array.isArray(document?.expanded_cases) || !isRecord(document?.case_expansion)) return false;
  const caseIds = document.expanded_cases.map((entry) => entry?.case_id);
  const liveCount = document.expanded_cases.filter((entry) => arrayOrEmpty(entry?.runner_modes).includes("fresh-agent")).length;
  const deterministicCount = document.expanded_cases.filter((entry) => arrayOrEmpty(entry?.runner_modes).includes("deterministic-fixture")).length;
  return (
    nonEmptyString(document.schema_version) &&
    caseIds.length > 0 &&
    new Set(caseIds).size === caseIds.length &&
    document.case_expansion.live_case_count === liveCount &&
    document.case_expansion.deterministic_case_count === deterministicCount &&
    document.expanded_cases.every(
      (entry) =>
        isRecord(entry) &&
        nonEmptyString(entry.case_id) &&
        nonEmptyString(entry.stage) &&
        nonEmptyString(entry.raw_prompt) &&
        isRecord(entry.repository_context) &&
        entry.repository_context.expected_route_withheld === true &&
        isRecord(entry.expected_route) &&
        arrayOrEmpty(entry.runner_modes).length > 0,
    )
  );
}

function validLiveEvidenceRun(run, priorIds, liveIds, sessions) {
  if (!isRecord(run) || !nonEmptyString(run.evidence_id) || !nonEmptyString(run.scenario_id)) return false;
  if (liveIds.has(run.evidence_id) || sessions.has(run.runner_session_id)) return false;
  liveIds.add(run.evidence_id);
  sessions.add(run.runner_session_id);
  const modelIndex = arrayOrEmpty(run.invocation).indexOf("--model");
  const modelFlags = arrayOrEmpty(run.invocation).filter((entry) => entry === "--model").length;
  const retryValid = run.first_attempt === true
    ? run.retry_of === null
    : run.first_attempt === false && nonEmptyString(run.retry_of) && priorIds.has(run.retry_of);
  const validations = arrayOrEmpty(run.validation_results);
  const wrote = arrayOrEmpty(run.observed_diff).length > 0;
  return (
    run.runner_id === "gpt-5.6-sol" &&
    run.runner_command_model === "gpt-5.6-sol" &&
    nonEmptyString(run.runner_session_id) &&
    modelFlags === 1 &&
    run.invocation[modelIndex + 1] === "gpt-5.6-sol" &&
    retryValid &&
    run.result === "pass" &&
    run.model_failure_detected === false &&
    nonEmptyString(run.raw_prompt) &&
    nonEmptyString(run.raw_output) &&
    nonEmptyString(run.raw_event_log) &&
    sha256(run.raw_event_log) === run.raw_event_log_sha256 &&
    isRecord(run.before_snapshot) &&
    nonEmptyString(run.before_snapshot.commit) &&
    nonEmptyString(run.before_snapshot.tracked_files_sha256) &&
    isRecord(run.after_snapshot) &&
    run.after_snapshot.baseline_commit === run.before_snapshot.commit &&
    nonEmptyString(run.after_snapshot.status_sha256) &&
    nonEmptyString(run.after_snapshot.diff_sha256) &&
    sha256(run.raw_unified_diff ?? "") === run.after_snapshot.diff_sha256 &&
    isRecord(run.grader_output) &&
    run.grader_output.verdict === "pass" &&
    validations.length > 0 &&
    validations.every(
      (result) =>
        isRecord(result) &&
        result.result === "pass" &&
        result.independent_of_runner === true &&
        nonEmptyString(result.grader_id) &&
        result.grader_id !== run.runner_id &&
        nonEmptyString(result.evidence),
    ) &&
    (wrote
      ? nonEmptyString(run.raw_unified_diff) && arrayOrEmpty(run.observed_artifacts).length > 0
      : run.raw_unified_diff === "" && run.no_write_evidence?.verified_zero_writes === true)
  );
}

function validReleaseEvidence(document) {
  if (!Array.isArray(document?.live_runs)) return false;
  const priorRuns = arrayOrEmpty(document.prior_runs);
  const priorIds = new Set(priorRuns.map((run) => run?.evidence_id).filter(nonEmptyString));
  if (priorIds.size !== priorRuns.length) return false;
  const liveIds = new Set();
  const sessions = new Set();
  const liveValid = document.live_runs.every((run) => validLiveEvidenceRun(run, priorIds, liveIds, sessions));
  return (
    document.release_result === "pass" &&
    Array.isArray(document.pending_records) &&
    document.pending_records.length === 0 &&
    document.model_policy?.required_model === "gpt-5.6-sol" &&
    Array.isArray(document.model_policy?.fallback_models) &&
    document.model_policy.fallback_models.length === 0 &&
    document.live_case_count === document.live_runs.length &&
    document.live_pass_count === document.live_runs.length &&
    document.live_fail_count === 0 &&
    liveValid &&
    arrayOrEmpty(document.deterministic_runs).length > 0 &&
    document.deterministic_runs.every((run) => run?.result === "pass" && nonEmptyString(run?.observed_result)) &&
    document.final_review_record?.result === "pass" &&
    document.full_verification?.result === "pass"
  );
}

function artifactBoundary(root, contract) {
  if (contract?.ownership_boundary !== "standalone-product") {
    return { boundaryRoot: path.resolve(root), writePlan: null, error: null };
  }
  if (
    !nonEmptyString(contract.external_product_root) ||
    !path.isAbsolute(contract.external_product_root) ||
    !isRecord(contract.external_write_plan) ||
    contract.external_write_plan.external_write_approved !== true
  ) {
    return { boundaryRoot: null, writePlan: null, error: "external-write-plan-missing" };
  }
  return {
    boundaryRoot: path.resolve(contract.external_product_root),
    writePlan: contract.external_write_plan,
    error: null,
  };
}

function validatePathArtifactUnsafe(root, artifact, contract = null) {
  if (!isRecord(artifact) || !nonEmptyString(artifact.locator)) {
    return { ready: false, code: "required-artifact-invalid" };
  }
  const boundary = artifactBoundary(root, contract);
  if (boundary.error) return { ready: false, code: boundary.error };
  const absolute = resolveAgainst(boundary.boundaryRoot, artifact.locator);
  if (!absolute || !isWithinPath(boundary.boundaryRoot, absolute)) {
    return { ready: false, code: "dependency-out-of-boundary" };
  }

  if (boundary.writePlan) {
    const allowedZones = arrayOrEmpty(boundary.writePlan.allowed_write_zones)
      .map((zone) => resolveAgainst(boundary.boundaryRoot, zone))
      .filter(Boolean);
    const protectedPaths = arrayOrEmpty(boundary.writePlan.protected_paths)
      .map((protectedPath) => resolveAgainst(boundary.boundaryRoot, protectedPath))
      .filter(Boolean);
    if (
      allowedZones.length === 0 ||
      allowedZones.some((zone) => !isWithinPath(boundary.boundaryRoot, zone)) ||
      protectedPaths.some((protectedPath) => !isWithinPath(boundary.boundaryRoot, protectedPath)) ||
      !allowedZones.some((zone) => isWithinPath(zone, absolute)) ||
      protectedPaths.some((protectedPath) => isWithinPath(protectedPath, absolute))
    ) {
      return { ready: false, code: "dependency-out-of-boundary" };
    }
  }

  if (!existsSync(absolute)) return { ready: false, code: "required-artifact-missing" };
  if (!existsSync(boundary.boundaryRoot)) {
    return { ready: false, code: "required-artifact-missing" };
  }

  const resolvedRoot = realpathSync(boundary.boundaryRoot);
  const resolvedArtifact = realpathSync(absolute);
  if (lstatSync(absolute).isSymbolicLink() || !(resolvedArtifact === resolvedRoot || resolvedArtifact.startsWith(`${resolvedRoot}${path.sep}`))) {
    return { ready: false, code: "dependency-out-of-boundary" };
  }

  const stats = statSync(absolute);
  if (artifact.validation === "file" && !stats.isFile()) {
    return { ready: false, code: "required-artifact-invalid" };
  }
  if (artifact.validation === "directory" && !stats.isDirectory()) {
    return { ready: false, code: "required-artifact-invalid" };
  }
  if (["canonical-skill-bundle", "packaged-skill-bundle"].includes(artifact.validation)) {
    const policyPaths =
      contract.ownership_boundary === "standalone-product"
        ? [path.join(boundary.boundaryRoot, "AGENTS.md")]
        : contract.ownership_boundary === "project-packaged"
          ? [path.join(boundary.boundaryRoot, "projects", contract.owner_project, "AGENTS.md")]
          : [];
    const bundleValidation = validateSkillBundle({
      root: boundary.boundaryRoot,
      bundlePath: absolute,
      expectedName: path.basename(absolute),
      ownershipBoundary: contract.ownership_boundary,
      runtimeVisibility: contract.runtime_visibility,
      policyPaths,
    });
    if (!bundleValidation.ready) return { ready: false, code: "required-artifact-invalid" };
  }
  if (["behavior-evidence", "external-action-evidence"].includes(artifact.validation)) {
    if (!stats.isFile()) return { ready: false, code: "required-artifact-invalid" };
    const contents = readFileSync(absolute, "utf8").trim();
    if (!contents) return { ready: false, code: "required-artifact-invalid" };
    if (path.extname(absolute) === ".json") {
      try {
        const parsed = JSON.parse(contents);
        if (!parsed || typeof parsed !== "object" || Object.keys(parsed).length === 0) {
          return { ready: false, code: "required-artifact-invalid" };
        }
        if (
          artifact.validation === "behavior-evidence" &&
          !(Array.isArray(parsed.expanded_cases) ? validScenarioEvidence(parsed) : validReleaseEvidence(parsed))
        ) {
          return { ready: false, code: "required-artifact-invalid" };
        }
      } catch {
        return { ready: false, code: "required-artifact-invalid" };
      }
    }
  }
  return { ready: true, code: null };
}

function validatePathArtifact(root, artifact, contract = null) {
  try {
    return validatePathArtifactUnsafe(root, artifact, contract);
  } catch {
    return { ready: false, code: "required-artifact-invalid" };
  }
}

function hasSymlinkedTargetComponent(boundaryRoot, absolute) {
  if (!isWithinPath(boundaryRoot, absolute)) return true;
  const relative = path.relative(path.resolve(boundaryRoot), path.resolve(absolute));
  let current = path.resolve(boundaryRoot);
  for (const segment of relative.split(path.sep).filter(Boolean)) {
    current = path.join(current, segment);
    try {
      if (lstatSync(current).isSymbolicLink()) return true;
    } catch (error) {
      if (error?.code === "ENOENT") return false;
      throw error;
    }
  }
  return false;
}

function identityReadinessFor(task, contract, root, invalidEvidenceIndexes) {
  const artifact = arrayOrEmpty(contract?.required_artifacts).find(
    (candidate) =>
      isRecord(candidate) &&
      candidate.artifact_role === "primary" &&
      candidate.locator_type === "path" &&
      normalizedLocator(candidate.locator) === normalizedLocator(contract.target_surface),
  );
  if (!artifact) return { applicable: false, ready: true, code: null, target: contract?.target_surface ?? null };
  const boundary = artifactBoundary(root, contract);
  const absolute = boundary.error ? null : resolveAgainst(boundary.boundaryRoot, artifact.locator);
  let existingTarget = false;
  let unsafeTarget = false;
  try {
    unsafeTarget = Boolean(absolute && hasSymlinkedTargetComponent(boundary.boundaryRoot, absolute));
    existingTarget =
      !unsafeTarget &&
      Boolean(absolute && isWithinPath(boundary.boundaryRoot, absolute) && existsSync(absolute)) &&
      isWithinPath(realpathSync(boundary.boundaryRoot), realpathSync(absolute));
  } catch {
    existingTarget = false;
    unsafeTarget = true;
  }
  const preImplementation = ["intake", "grilling", "prd", "issues"].includes(task?.matt_phase);
  const expectedChanges = contract.operation === "update" ? new Set(["update", "updated", "modify", "modified"]) : new Set(["create", "created", "add", "added"]);
  const diffProvesOperation = arrayOrEmpty(task?.behavior_evidence).some(
    (evidence, index) =>
      !invalidEvidenceIndexes.has(index) &&
      evidence?.result === "pass" &&
      evidence.observed_contract_ids?.includes(contract.deliverable_id) &&
      arrayOrEmpty(evidence.observed_diff).some(
        (entry) => normalizedLocator(entry?.path) === normalizedLocator(contract.target_surface) && nonEmptyString(entry?.change) && expectedChanges.has(entry.change.toLowerCase()),
      ),
  );
  const ready =
    !unsafeTarget &&
    (contract.operation === "update"
      ? existingTarget && (preImplementation || diffProvesOperation)
      : preImplementation
        ? !existingTarget
        : existingTarget && diffProvesOperation);
  return {
    applicable: true,
    ready,
    code: ready ? null : unsafeTarget ? "dependency-out-of-boundary" : contract.operation === "update" ? "update-identity-unresolved" : existingTarget ? "identity-collision" : "create-target-missing",
    target: contract.target_surface,
    existing_matches: existingTarget ? 1 : 0,
  };
}

function evidenceForEval(task, evalId, contractId = null, root = process.cwd(), invalidEvidenceIndexes = new Set()) {
  return arrayOrEmpty(task?.behavior_evidence).find(
    (evidence, index) =>
      !invalidEvidenceIndexes.has(index) &&
      evidence.eval_id === evalId &&
      evidence.result === "pass" &&
      (!contractId || evidence.observed_contract_ids?.includes(contractId)) &&
      Array.isArray(evidence.observed_artifacts) &&
      evidence.observed_artifacts.length > 0 &&
      evidence.observed_artifacts.every((artifactPath) => arrayOrEmpty(task?.linked_artifacts).includes(artifactPath) && existsSync(path.resolve(root, artifactPath))),
  );
}

function dependencyOutputBoundary(root, outputPath, writePlan) {
  const repositoryRoot = path.resolve(root);
  const absolute = resolveAgainst(repositoryRoot, outputPath);
  if (!absolute) return { absolute: null, boundaryRoot: null, external: false };
  if (isWithinPath(repositoryRoot, absolute)) {
    return { absolute, boundaryRoot: repositoryRoot, external: false };
  }
  const externalRoot = writePlan?.external_product_root;
  if (!nonEmptyString(externalRoot) || !path.isAbsolute(externalRoot)) {
    return { absolute, boundaryRoot: null, external: true };
  }
  const boundaryRoot = path.resolve(externalRoot);
  return {
    absolute,
    boundaryRoot: isWithinPath(boundaryRoot, absolute) ? boundaryRoot : null,
    external: true,
  };
}

function dependencyOutputPathResultUnsafe(root, outputPath, writePlan) {
  const boundary = dependencyOutputBoundary(root, outputPath, writePlan);
  if (!boundary.absolute || !boundary.boundaryRoot) {
    return { ready: false, code: "dependency-out-of-boundary", external: boundary.external };
  }
  if (boundary.external && (writePlan?.external_write_approved !== true || !nonEmptyString(writePlan?.approved_at) || !nonEmptyString(writePlan?.approval_note))) {
    return { ready: false, code: "external-write-approval-missing", external: true };
  }

  const allowedZones = arrayOrEmpty(writePlan?.allowed_write_zones)
    .map((zone) => dependencyOutputBoundary(root, zone, writePlan))
    .filter((zone) => zone.absolute && zone.boundaryRoot);
  if (allowedZones.length === 0 || !allowedZones.some((zone) => zone.external === boundary.external && isWithinPath(zone.absolute, boundary.absolute))) {
    return { ready: false, code: "dependency-out-of-boundary", external: boundary.external };
  }

  const protectedPaths = arrayOrEmpty(writePlan?.protected_paths)
    .map((protectedPath) => dependencyOutputBoundary(root, protectedPath, writePlan))
    .filter((protectedPath) => protectedPath.absolute && protectedPath.boundaryRoot);
  if (protectedPaths.some((protectedPath) => protectedPath.external === boundary.external && isWithinPath(protectedPath.absolute, boundary.absolute))) {
    return { ready: false, code: "dependency-protected-path", external: boundary.external };
  }

  if (!existsSync(boundary.absolute) || !existsSync(boundary.boundaryRoot)) {
    return { ready: false, code: "dependency-output-missing", external: boundary.external };
  }
  const resolvedRoot = realpathSync(boundary.boundaryRoot);
  const resolvedOutput = realpathSync(boundary.absolute);
  if (lstatSync(boundary.absolute).isSymbolicLink() || !isWithinPath(resolvedRoot, resolvedOutput)) {
    return { ready: false, code: "dependency-out-of-boundary", external: boundary.external };
  }
  return { ready: true, code: null, external: boundary.external };
}

function dependencyOutputPathResult(root, outputPath, writePlan) {
  try {
    return dependencyOutputPathResultUnsafe(root, outputPath, writePlan);
  } catch {
    return { ready: false, code: "dependency-out-of-boundary", external: false };
  }
}

function samePathSet(left, right) {
  const normalize = (values) =>
    [
      ...new Set(
        arrayOrEmpty(values)
          .filter(nonEmptyString)
          .map((value) => path.normalize(value)),
      ),
    ].sort();
  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
}

function dependencyReadinessFor(task, contract, root) {
  const results = [];
  for (const step of arrayOrEmpty(task?.dependency_steps).filter((candidate) => isRecord(candidate) && candidate.supported_deliverable_id === contract.deliverable_id)) {
    const blockers = [];
    const writePlan = step.dependency_write_plan;
    const supportedArtifact = [...arrayOrEmpty(contract.required_artifacts), ...arrayOrEmpty(contract.allowed_support_artifacts)].find(
      (candidate) => candidate?.artifact_id === step.supported_artifact_id,
    );
    if (!writePlan) blockers.push(issue("dependency-write-plan-missing", `${step.step_id} has no write plan.`));

    const artifactCandidates = arrayOrEmpty(task?.dependency_artifacts).filter(
      (candidate) =>
        isRecord(candidate) &&
        candidate.dependency_step_id === step.step_id &&
        candidate.supported_deliverable_id === step.supported_deliverable_id &&
        candidate.supported_artifact_id === step.supported_artifact_id,
    );
    const artifactCandidate = artifactCandidates.length === 1 ? artifactCandidates[0] : null;
    if (artifactCandidates.length > 1) {
      blockers.push(issue("dependency-role-mismatch", `${step.step_id} has ambiguous dependency outputs.`));
    }
    const artifact = artifactCandidate?.artifact_role === step.artifact_role ? artifactCandidate : null;
    if (artifactCandidate && !artifact) {
      blockers.push(issue("dependency-role-mismatch", `${step.step_id} output has the wrong artifact role.`));
    }
    if (!artifact) {
      blockers.push(issue("dependency-output-missing", `${step.step_id} has no matching dependency artifact.`));
    } else {
      const generatedFiles = Array.isArray(artifact.generated_files) ? artifact.generated_files : [];
      if (generatedFiles.length === 0 || generatedFiles.some((file) => !nonEmptyString(file))) {
        blockers.push(issue("dependency-output-missing", `${step.step_id} output files are missing.`));
      }
      const expectedOutputPaths = arrayOrEmpty(writePlan?.expected_output_paths);
      if (!samePathSet(generatedFiles, expectedOutputPaths)) {
        blockers.push(issue("dependency-output-unexpected", `${step.step_id} outputs do not exactly match the approved expected paths.`));
      }
      for (const generatedFile of generatedFiles) {
        const outputResult = dependencyOutputPathResult(root, generatedFile, writePlan);
        if (!outputResult.ready) {
          blockers.push(issue(outputResult.code, `${step.step_id} output ${generatedFile} failed boundary validation.`));
        }
      }
      if (step.artifact_role === "primary") {
        const supportsLocator = generatedFiles.some((generatedFile) => {
          const locator = normalizedLocator(supportedArtifact?.locator);
          const generated = normalizedLocator(generatedFile);
          return generated === locator || generated?.startsWith(`${locator}${path.sep}`);
        });
        const normalValidation =
          supportedArtifact?.locator_type === "path" && artifactValidations.has(supportedArtifact?.validation)
            ? validatePathArtifact(root, supportedArtifact, contract)
            : { ready: false };
        if (!supportsLocator || !normalValidation.ready) {
          blockers.push(issue("dependency-output-invalid", `${step.step_id} primary output failed its owning artifact validation.`));
        }
        if (!["official", "promoted"].includes(artifact.artifact_status)) {
          blockers.push(issue("dependency-promotion-missing", `${step.step_id} primary output is not explicitly promoted or official.`));
        } else if (
          !isRecord(artifact.promotion_metadata) ||
          !nonEmptyString(artifact.promotion_metadata.promoted_at) ||
          !nonEmptyString(artifact.promotion_metadata.promotion_reason)
        ) {
          blockers.push(issue("dependency-promotion-missing", `${step.step_id} primary promotion has no auditable metadata.`));
        }
      }
    }

    const provenanceCandidates = arrayOrEmpty(task?.dependency_provenance).filter(
      (candidate) =>
        isRecord(candidate) &&
        candidate.dependency_step_id === step.step_id &&
        candidate.supported_deliverable_id === step.supported_deliverable_id &&
        candidate.supported_artifact_id === step.supported_artifact_id,
    );
    const provenanceCandidate = provenanceCandidates.length === 1 ? provenanceCandidates[0] : null;
    if (provenanceCandidates.length > 1) {
      blockers.push(issue("dependency-role-mismatch", `${step.step_id} has ambiguous dependency provenance.`));
    }
    const provenance = provenanceCandidate?.artifact_role === step.artifact_role ? provenanceCandidate : null;
    if (provenanceCandidate && !provenance) {
      blockers.push(issue("dependency-role-mismatch", `${step.step_id} provenance has the wrong role.`));
    }
    if (!provenance) {
      blockers.push(issue("dependency-provenance-missing", `${step.step_id} has no matching provenance.`));
    } else if (artifact) {
      if (!samePathSet(artifact.generated_files, provenance.generated_artifacts)) {
        blockers.push(issue("dependency-provenance-missing", `${step.step_id} provenance omits or adds output files.`));
      }
      if (!nonEmptyString(provenance.artifact_status) || provenance.artifact_status !== artifact.artifact_status) {
        blockers.push(issue("dependency-provenance-missing", `${step.step_id} provenance does not preserve artifact promotion status.`));
      }
    }

    results.push({
      step_id: step.step_id,
      completion_condition_id: step.completion_condition_id,
      ready: blockers.length === 0,
      blockers,
    });
  }
  return results;
}

function approvalExistsForArtifact(task, contract, artifact) {
  const bindings = arrayOrEmpty(task?.artifact_bindings).filter(
    (binding) =>
      isRecord(binding) && binding.deliverable_id === contract.deliverable_id && binding.artifact_id === artifact.artifact_id && binding.artifact_role === artifact.artifact_role,
  );
  return arrayOrEmpty(task?.phase_guard?.approved_artifacts).some((approval) => {
    if (!isRecord(approval) || approval.phase !== "implement" || approval.deliverable_id !== contract.deliverable_id || approval.artifact_role !== artifact.artifact_role) {
      return false;
    }
    const artifactIdMatches =
      approval.artifact_id === artifact.artifact_id || (task?.deliverable_migration?.status === "approved" && !nonEmptyString(approval.artifact_id) && bindings.length === 1);
    if (!artifactIdMatches) return false;
    if (artifact.locator_type === "task-evidence") {
      return approval.evidence_id === artifact.locator;
    }
    return bindings.some((binding) => {
      if (binding.locator_type === "path") return approval.path === binding.locator;
      if (binding.locator_type === "path-prefix") {
        const prefix = binding.locator.replace(/[\\/]+$/, "");
        return approval.path === prefix || approval.path?.startsWith(`${prefix}/`) || approval.path?.startsWith(`${prefix}\\`);
      }
      return false;
    });
  });
}

function uniqueIssues(blockers) {
  return blockers.filter((blocker, index, all) => all.findIndex((candidate) => candidate.code === blocker.code && candidate.message === blocker.message) === index);
}

export function projectDeliverableReadiness({ task, root = process.cwd(), catalog = null } = {}) {
  if (isHistoricalCompatibleTask(task)) {
    return {
      migration: { status: "historical-compatible" },
      contracts: [],
      state: "historical-compatible",
      next_phase_ready: true,
      completion_ready: true,
      blockers: [],
      deliverables: [],
    };
  }

  const validationErrors = validateTaskDeliverableState(task);
  const invalidEvidenceIndexes = new Set(
    validationErrors
      .map((error) => error.context?.match(/^behavior_evidence\[(\d+)\]/)?.[1])
      .filter((index) => index !== undefined)
      .map(Number),
  );
  const migration = task?.deliverable_migration ?? { status: "missing" };
  if (migration.status === "pending") {
    return {
      migration,
      contracts: [],
      state: "blocked",
      next_phase_ready: false,
      completion_ready: false,
      blockers: [issue("migration-pending", "Classify and approve deliverables before advancing.")],
      deliverables: [],
    };
  }

  const globalBlockers = [...validationErrors];
  const deliverables = [];
  for (const contract of arrayOrEmpty(task?.deliverable_contracts).filter(isRecord)) {
    const artifactReadiness = [];
    const evalReadiness = [];
    const blockers = [];

    for (const artifact of arrayOrEmpty(contract.required_artifacts).filter(isRecord)) {
      let result;
      if (artifact.locator_type === "path") {
        result = validatePathArtifact(root, artifact, contract);
      } else if (artifact.locator_type === "task-evidence" && ["behavior-evidence", "external-action-evidence"].includes(artifact.validation)) {
        const evidence = arrayOrEmpty(task?.behavior_evidence).find(
          (candidate, index) =>
            !invalidEvidenceIndexes.has(index) &&
            isRecord(candidate) &&
            candidate.evidence_id === artifact.locator &&
            candidate.result === "pass" &&
            candidate.observed_contract_ids?.includes(contract.deliverable_id) &&
            candidate.observed_artifacts?.length > 0 &&
            candidate.observed_artifacts.every((artifactPath) => arrayOrEmpty(task?.linked_artifacts).includes(artifactPath) && existsSync(path.resolve(root, artifactPath))),
        );
        result = evidence ? { ready: true, code: null } : { ready: false, code: "required-artifact-missing" };
      } else {
        result = { ready: false, code: "required-artifact-invalid" };
      }
      artifactReadiness.push({
        artifact_id: artifact.artifact_id,
        locator: artifact.locator,
        ready: result.ready,
        blocker: result.code,
      });
      if (!result.ready) blockers.push(issue(result.code, `${artifact.artifact_id} is not ready.`));
    }

    const identityReadiness = identityReadinessFor(task, contract, root, invalidEvidenceIndexes);
    if (!identityReadiness.ready) blockers.push(issue(identityReadiness.code, `${contract.deliverable_id} identity did not satisfy its ${contract.operation} precondition.`));

    for (const evaluation of arrayOrEmpty(contract.eval_plan).filter((entry) => isRecord(entry) && entry.required)) {
      const evidence = evidenceForEval(task, evaluation.eval_id, contract.deliverable_id, root, invalidEvidenceIndexes);
      const ready = Boolean(evidence && (evaluation.kind !== "fresh-agent" || evidence.runner_id === "gpt-5.6-sol"));
      evalReadiness.push({ eval_id: evaluation.eval_id, kind: evaluation.kind, ready });
      if (!ready) blockers.push(issue("eval-evidence-missing", `${evaluation.eval_id} has no passing evidence.`));
    }

    const dependencyReadiness = dependencyReadinessFor(task, contract, root);
    blockers.push(...dependencyReadiness.flatMap((dependency) => dependency.blockers));

    const conditionReadiness = [];
    for (const condition of arrayOrEmpty(contract.completion_conditions).filter(isRecord)) {
      let ready = false;
      if (condition.type === "artifact-valid") {
        ready = artifactReadiness.some((artifact) => artifact.artifact_id === condition.reference && artifact.ready);
      } else if (["eval-passed", "review-passed"].includes(condition.type)) {
        const evaluation = arrayOrEmpty(contract.eval_plan).find((candidate) => candidate.eval_id === condition.reference);
        const evidence = evidenceForEval(task, condition.reference, contract.deliverable_id, root, invalidEvidenceIndexes);
        ready = Boolean(evidence && (evaluation?.kind !== "fresh-agent" || evidence.runner_id === "gpt-5.6-sol"));
      } else if (condition.type === "dependency-step-complete") {
        ready = dependencyReadiness.some((dependency) => dependency.completion_condition_id === condition.reference && dependency.ready);
      }
      conditionReadiness.push({
        condition_id: condition.condition_id,
        type: condition.type,
        reference: condition.reference,
        ready,
      });
      if (!ready) {
        blockers.push(issue(condition.type === "review-passed" ? "review-evidence-missing" : "primary-deliverable-incomplete", `${condition.condition_id} is not satisfied.`));
      }
    }

    const discoveryRequired = contract.kind === "canonical-skill";
    const expectedSkillName = discoveryRequired && nonEmptyString(contract.target_surface) ? path.basename(normalizedLocator(contract.target_surface)) : null;
    const catalogEntry = discoveryRequired ? (arrayOrEmpty(catalog?.skills).find((skill) => skill?.name === expectedSkillName) ?? null) : null;
    const discovery = {
      required: discoveryRequired,
      ready: !discoveryRequired || Boolean(catalogEntry),
      catalog_entry: catalogEntry,
      blockers: [],
    };
    if (discoveryRequired && catalog && !catalogEntry) {
      discovery.blockers.push(issue("catalog-phantom-entry", `${expectedSkillName} is absent from the canonical catalog.`));
      blockers.push(...discovery.blockers);
    }

    const implementationApprovalsReady =
      identityReadiness.ready && arrayOrEmpty(contract.required_artifacts).every((artifact) => isRecord(artifact) && approvalExistsForArtifact(task, contract, artifact));
    const codeReviewEntryReady =
      artifactReadiness.every((artifact) => artifact.ready) &&
      evalReadiness.filter((evaluation) => evaluation.kind !== "manual-review").every((evaluation) => evaluation.ready) &&
      dependencyReadiness.every((dependency) => dependency.ready) &&
      conditionReadiness.filter((condition) => condition.type !== "review-passed").every((condition) => condition.ready) &&
      identityReadiness.ready &&
      discovery.ready;
    const deliverableBlockers = uniqueIssues(blockers);
    deliverables.push({
      deliverable_id: contract.deliverable_id,
      kind: contract.kind,
      role: contract.role,
      blocking: contract.role === "primary" || contract.blocking !== false,
      runtime_visibility: contract.runtime_visibility,
      artifact_readiness: artifactReadiness,
      eval_readiness: evalReadiness,
      dependency_readiness: dependencyReadiness,
      completion_condition_readiness: conditionReadiness,
      identity_readiness: identityReadiness,
      implementation_approvals_ready: implementationApprovalsReady,
      code_review_entry_ready: codeReviewEntryReady,
      discovery,
      blockers: deliverableBlockers,
      ready: deliverableBlockers.length === 0,
    });
    globalBlockers.push(...deliverableBlockers);
  }

  const uniqueBlockers = uniqueIssues(globalBlockers);
  const primaryDeliverables = deliverables.filter((deliverable) => deliverable.role === "primary");
  const blockingDeliverables = deliverables.filter((deliverable) => deliverable.role === "primary" || deliverable.blocking);
  const completionReady =
    validationErrors.length === 0 &&
    primaryDeliverables.length > 0 &&
    primaryDeliverables.every((deliverable) => deliverable.ready) &&
    blockingDeliverables.every((deliverable) => deliverable.ready);
  let nextPhaseReady;
  if (["intake", "grilling", "prd"].includes(task?.matt_phase)) {
    nextPhaseReady = validationErrors.length === 0;
  } else if (task?.matt_phase === "issues") {
    nextPhaseReady = validationErrors.length === 0 && blockingDeliverables.every((deliverable) => deliverable.implementation_approvals_ready);
  } else if (task?.matt_phase === "implement") {
    nextPhaseReady = validationErrors.length === 0 && blockingDeliverables.every((deliverable) => deliverable.code_review_entry_ready);
  } else {
    nextPhaseReady = completionReady;
  }

  return {
    migration,
    contracts: task?.deliverable_contracts ?? [],
    state: nextPhaseReady ? "ready" : "blocked",
    next_phase_ready: nextPhaseReady,
    completion_ready: completionReady,
    blockers: uniqueBlockers,
    deliverables,
  };
}
