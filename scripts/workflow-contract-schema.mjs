import path from "node:path";

export const DELIVERABLE_CONTRACT_VERSION = 1;

const contractKinds = new Set([
  "canonical-skill",
  "packaged-skill",
  "standalone-skill",
  "workflow-pack",
  "ui-application",
  "validator-query-helper",
  "documentation-handoff",
  "tracker-only",
]);
const operations = new Set(["create", "update"]);
const roles = new Set(["primary", "support"]);
const ownershipBoundaries = new Set(["canonical-foundry", "project-packaged", "standalone-product"]);
const runtimeVisibilities = new Set(["canonical-active", "project-local-inactive", "standalone-only", "not-applicable"]);
const locatorTypes = new Set(["path", "path-prefix", "task-evidence"]);
export const artifactValidations = new Set(["file", "directory", "canonical-skill-bundle", "packaged-skill-bundle", "behavior-evidence", "external-action-evidence"]);
const evalKinds = new Set(["deterministic", "fresh-agent", "manual-review", "e2e"]);
const conditionTypes = new Set(["artifact-valid", "eval-passed", "dependency-step-complete", "review-passed"]);
const skillKinds = new Set(["canonical-skill", "packaged-skill", "standalone-skill"]);
const skillBundleValidations = new Set(["canonical-skill-bundle", "packaged-skill-bundle"]);
export const semanticSkillSections = ["Overview", "Required Context", "Input Contract", "Workflow", "Decision Points", "Failure Handling", "Human Boundaries", "Output Contract", "Completion Gate"];

export function issue(code, message, context = "task") {
  return { code, context, message };
}

export function nonEmptyString(value) {
  return typeof value === "string" && value.trim() !== "";
}

export function isRecord(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function arrayOrEmpty(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizedLocator(value) {
  return nonEmptyString(value) ? value.replace(/[\\/]+$/, "") : value;
}

function hasTraversal(value) {
  return !nonEmptyString(value) || value.split(/[\\/]+/).some((segment) => segment === "..");
}

export function isWithinPath(parent, candidate) {
  const relative = path.relative(path.resolve(parent), path.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

export function resolveAgainst(base, declaredPath) {
  if (!nonEmptyString(declaredPath) || hasTraversal(declaredPath)) return null;
  return path.isAbsolute(declaredPath) ? path.resolve(declaredPath) : path.resolve(base, declaredPath);
}

function requireStrings(values, code, context, errors, { allowEmpty = false } = {}) {
  if (!Array.isArray(values) || (!allowEmpty && values.length === 0) || values.some((value) => !nonEmptyString(value))) {
    errors.push(issue(code, `${context} must be an array of non-empty strings.`, context));
  }
}

function artifactKey(deliverableId, artifactId) {
  return `${deliverableId}:${artifactId}`;
}

function validateContract(contract, index, errors, ids, artifactIds) {
  const context = `deliverable_contracts[${index}]`;
  if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
    errors.push(issue("contract-invalid", `${context} must be an object.`, context));
    return;
  }

  if (!nonEmptyString(contract.deliverable_id) || ids.has(contract.deliverable_id)) {
    errors.push(issue("contract-invalid", `${context}.deliverable_id must be unique and non-empty.`, context));
  } else {
    ids.add(contract.deliverable_id);
  }
  if (contract.contract_version !== DELIVERABLE_CONTRACT_VERSION) {
    errors.push(issue("contract-invalid", `${context}.contract_version must be 1.`, context));
  }
  if (!contractKinds.has(contract.kind)) {
    errors.push(issue("contract-invalid", `${context}.kind is not supported.`, context));
  }
  if (!operations.has(contract.operation)) {
    errors.push(issue("contract-invalid", `${context}.operation must be create or update.`, context));
  }
  if (!roles.has(contract.role)) {
    errors.push(issue("contract-invalid", `${context}.role must be primary or support.`, context));
  }
  if (contract.role === "primary" && contract.blocking === false) {
    errors.push(issue("primary-contract-nonblocking", `${context} primary contracts cannot opt out of readiness or completion.`, context));
  }
  if (contract.blocking !== undefined && typeof contract.blocking !== "boolean") {
    errors.push(issue("contract-invalid", `${context}.blocking must be boolean when present.`, context));
  }
  if (!ownershipBoundaries.has(contract.ownership_boundary)) {
    errors.push(issue("ownership-unresolved", `${context}.ownership_boundary must be resolved.`, context));
  }
  for (const field of ["owner_project", "target_surface"]) {
    if (!nonEmptyString(contract[field])) {
      errors.push(issue("ownership-unresolved", `${context}.${field} must be non-empty.`, context));
    }
  }
  if (!runtimeVisibilities.has(contract.runtime_visibility)) {
    errors.push(issue("contract-invalid", `${context}.runtime_visibility is not supported.`, context));
  }
  requireStrings(contract.runtime_targets, "contract-invalid", `${context}.runtime_targets`, errors);
  if (!Array.isArray(contract.member_deliverable_ids)) {
    errors.push(issue("contract-invalid", `${context}.member_deliverable_ids must be an array.`, context));
  } else if (contract.member_deliverable_ids.some((value) => !nonEmptyString(value))) {
    errors.push(issue("contract-invalid", `${context}.member_deliverable_ids must contain identities.`, context));
  }

  if (!Array.isArray(contract.required_artifacts) || contract.required_artifacts.length === 0) {
    errors.push(issue("contract-invalid", `${context}.required_artifacts must not be empty.`, context));
  } else {
    for (const [artifactIndex, artifact] of contract.required_artifacts.entries()) {
      const artifactContext = `${context}.required_artifacts[${artifactIndex}]`;
      if (!nonEmptyString(artifact?.artifact_id)) {
        errors.push(issue("contract-invalid", `${artifactContext}.artifact_id is required.`, artifactContext));
        continue;
      }
      const key = artifactKey(contract.deliverable_id, artifact.artifact_id);
      if (artifactIds.has(key)) {
        errors.push(issue("contract-invalid", `${artifactContext}.artifact_id is duplicated.`, artifactContext));
      }
      artifactIds.add(key);
      if (!roles.has(artifact.artifact_role)) {
        errors.push(issue("contract-invalid", `${artifactContext}.artifact_role is invalid.`, artifactContext));
      }
      if (!locatorTypes.has(artifact.locator_type) || !nonEmptyString(artifact.locator)) {
        errors.push(issue("contract-invalid", `${artifactContext} must declare a valid locator.`, artifactContext));
      }
      if (!artifactValidations.has(artifact.validation)) {
        errors.push(issue("contract-invalid", `${artifactContext}.validation is invalid.`, artifactContext));
      }
    }
  }

  const primaryArtifacts = arrayOrEmpty(contract.required_artifacts).filter((artifact) => isRecord(artifact) && artifact.artifact_role === "primary");
  if (
    nonEmptyString(contract.target_surface) &&
    !primaryArtifacts.some(
      (artifact) => ["path", "path-prefix", "task-evidence"].includes(artifact.locator_type) && normalizedLocator(artifact.locator) === normalizedLocator(contract.target_surface),
    )
  ) {
    errors.push(issue("contract-routing-invalid", `${context}.target_surface must equal a required primary artifact locator.`, context));
  }

  if (contract.operation === "update") {
    if (!nonEmptyString(contract.update_identity)) {
      errors.push(issue("update-identity-missing", `${context}.update_identity must resolve exactly one existing target.`, context));
    } else if (normalizedLocator(contract.update_identity) !== normalizedLocator(contract.target_surface)) {
      errors.push(issue("contract-routing-invalid", `${context}.update_identity must equal target_surface.`, context));
    }
  } else if (contract.update_identity !== undefined) {
    errors.push(issue("contract-routing-invalid", `${context}.update_identity is only valid for update operations.`, context));
  }

  const primaryValidations = new Set(primaryArtifacts.map((artifact) => artifact.validation));
  const repoRelativeTarget = nonEmptyString(contract.target_surface) && !path.isAbsolute(contract.target_surface) && !hasTraversal(contract.target_surface);
  let routeValid = true;
  if (contract.kind === "canonical-skill") {
    routeValid =
      contract.ownership_boundary === "canonical-foundry" &&
      contract.runtime_visibility === "canonical-active" &&
      repoRelativeTarget &&
      /^\.agents\/skills\/[a-z0-9]+(?:-[a-z0-9]+)*\/?$/.test(contract.target_surface) &&
      primaryValidations.has("canonical-skill-bundle");
  } else if (contract.kind === "packaged-skill") {
    routeValid =
      contract.ownership_boundary === "project-packaged" &&
      contract.runtime_visibility === "project-local-inactive" &&
      repoRelativeTarget &&
      contract.target_surface.startsWith(`projects/${contract.owner_project}/skills/`) &&
      primaryValidations.has("packaged-skill-bundle");
  } else if (contract.kind === "standalone-skill") {
    routeValid = contract.ownership_boundary === "standalone-product" && contract.runtime_visibility === "standalone-only" && primaryValidations.has("packaged-skill-bundle");
  } else if (contract.kind === "workflow-pack") {
    const expectedVisibility = {
      "canonical-foundry": "canonical-active",
      "project-packaged": "project-local-inactive",
      "standalone-product": "standalone-only",
    }[contract.ownership_boundary];
    routeValid = expectedVisibility === contract.runtime_visibility && primaryValidations.has("directory");
  } else if (contract.kind === "ui-application") {
    const expectedVisibilities = {
      "canonical-foundry": new Set(["not-applicable"]),
      "project-packaged": new Set(["not-applicable", "project-local-inactive"]),
      "standalone-product": new Set(["standalone-only"]),
    }[contract.ownership_boundary];
    routeValid = Boolean(expectedVisibilities?.has(contract.runtime_visibility)) && [...primaryValidations].some((validation) => ["file", "directory"].includes(validation));
  } else if (contract.kind === "validator-query-helper") {
    routeValid = contract.runtime_visibility === "not-applicable" && [...primaryValidations].every((validation) => ["file", "directory"].includes(validation));
  } else if (contract.kind === "documentation-handoff") {
    routeValid =
      contract.runtime_visibility === "not-applicable" &&
      [...primaryValidations].every((validation) => ["file", "directory", "behavior-evidence", "external-action-evidence"].includes(validation));
  } else if (contract.kind === "tracker-only") {
    routeValid =
      contract.ownership_boundary === "canonical-foundry" &&
      contract.runtime_visibility === "not-applicable" &&
      [...primaryValidations].every((validation) => validation === "file");
  }
  if (!routeValid) {
    errors.push(issue("contract-routing-invalid", `${context} kind, ownership, target, visibility, and primary validation do not agree.`, context));
  }

  if (contract.ownership_boundary !== "standalone-product" && !repoRelativeTarget) {
    errors.push(issue("contract-routing-invalid", `${context}.target_surface must be a safe repository-relative path.`, context));
  }
  if (contract.ownership_boundary === "standalone-product") {
    const productRoot = contract.external_product_root;
    const writePlan = contract.external_write_plan;
    if (!nonEmptyString(productRoot) || !path.isAbsolute(productRoot)) {
      errors.push(issue("external-write-plan-missing", `${context}.external_product_root must be an absolute product-owned root.`, context));
    }
    if (
      !isRecord(writePlan) ||
      !Array.isArray(writePlan.allowed_write_zones) ||
      writePlan.allowed_write_zones.length === 0 ||
      !Array.isArray(writePlan.protected_paths) ||
      writePlan.external_write_approved !== true ||
      !nonEmptyString(writePlan.approved_at) ||
      !nonEmptyString(writePlan.approval_note)
    ) {
      errors.push(issue("external-write-plan-missing", `${context}.external_write_plan must explicitly approve bounded product writes.`, context));
    }
    if (nonEmptyString(productRoot) && path.isAbsolute(productRoot) && isRecord(writePlan)) {
      const resolvedProductRoot = path.resolve(productRoot);
      const resolvedTarget = resolveAgainst(resolvedProductRoot, contract.target_surface);
      const zones = arrayOrEmpty(writePlan.allowed_write_zones).map((zone) => resolveAgainst(resolvedProductRoot, zone));
      const protectedPaths = arrayOrEmpty(writePlan.protected_paths).map((protectedPath) => resolveAgainst(resolvedProductRoot, protectedPath));
      if (
        !resolvedTarget ||
        !isWithinPath(resolvedProductRoot, resolvedTarget) ||
        zones.some((zone) => !zone || !isWithinPath(resolvedProductRoot, zone)) ||
        !zones.some((zone) => zone && isWithinPath(zone, resolvedTarget)) ||
        protectedPaths.some((protectedPath) => !protectedPath || !isWithinPath(resolvedProductRoot, protectedPath) || isWithinPath(protectedPath, resolvedTarget))
      ) {
        errors.push(issue("dependency-out-of-boundary", `${context} standalone target escapes its approved product write plan.`, context));
      }
    }
  }

  if (!Array.isArray(contract.allowed_support_artifacts)) {
    errors.push(issue("contract-invalid", `${context}.allowed_support_artifacts must be an array.`, context));
  } else {
    for (const [supportIndex, support] of contract.allowed_support_artifacts.entries()) {
      const supportContext = `${context}.allowed_support_artifacts[${supportIndex}]`;
      if (
        !nonEmptyString(support?.artifact_id) ||
        !roles.has(support?.artifact_role) ||
        !locatorTypes.has(support?.locator_type) ||
        !nonEmptyString(support?.locator) ||
        !nonEmptyString(support?.purpose)
      ) {
        errors.push(issue("contract-invalid", `${supportContext} is incomplete.`, supportContext));
      } else {
        const key = artifactKey(contract.deliverable_id, support.artifact_id);
        if (artifactIds.has(key)) {
          errors.push(issue("contract-invalid", `${supportContext}.artifact_id is duplicated.`, supportContext));
        }
        artifactIds.add(key);
      }
    }
  }

  const guidanceIds = new Set();
  if (!Array.isArray(contract.required_guidance) || contract.required_guidance.length === 0) {
    errors.push(issue("contract-invalid", `${context}.required_guidance must not be empty.`, context));
  } else {
    for (const [guidanceIndex, guidance] of contract.required_guidance.entries()) {
      const guidanceContext = `${context}.required_guidance[${guidanceIndex}]`;
      if (!nonEmptyString(guidance?.guidance_id) || !nonEmptyString(guidance?.source) || !nonEmptyString(guidance?.evidence)) {
        errors.push(issue("contract-invalid", `${guidanceContext} is incomplete.`, guidanceContext));
      } else if (guidanceIds.has(guidance.guidance_id)) {
        errors.push(issue("contract-invalid", `${guidanceContext}.guidance_id is duplicated.`, guidanceContext));
      } else {
        guidanceIds.add(guidance.guidance_id);
      }
    }
  }

  const evalIds = new Set();
  if (!Array.isArray(contract.eval_plan) || contract.eval_plan.length === 0) {
    errors.push(issue("contract-invalid", `${context}.eval_plan must not be empty.`, context));
  } else {
    for (const [evalIndex, evaluation] of contract.eval_plan.entries()) {
      const evalContext = `${context}.eval_plan[${evalIndex}]`;
      if (!nonEmptyString(evaluation?.eval_id) || !evalKinds.has(evaluation?.kind) || typeof evaluation?.required !== "boolean") {
        errors.push(issue("contract-invalid", `${evalContext} is incomplete.`, evalContext));
      } else if (evalIds.has(evaluation.eval_id)) {
        errors.push(issue("contract-invalid", `${evalContext}.eval_id is duplicated.`, evalContext));
      } else {
        evalIds.add(evaluation.eval_id);
      }
    }
  }

  const conditionIds = new Set();
  const localArtifactIds = new Set(
    [...arrayOrEmpty(contract.required_artifacts), ...arrayOrEmpty(contract.allowed_support_artifacts)].filter(isRecord).map((artifact) => artifact.artifact_id),
  );
  if (!Array.isArray(contract.completion_conditions) || contract.completion_conditions.length === 0) {
    errors.push(issue("contract-invalid", `${context}.completion_conditions must not be empty.`, context));
  } else {
    for (const [conditionIndex, condition] of contract.completion_conditions.entries()) {
      const conditionContext = `${context}.completion_conditions[${conditionIndex}]`;
      if (!nonEmptyString(condition?.condition_id) || !conditionTypes.has(condition?.type) || !nonEmptyString(condition?.reference)) {
        errors.push(issue("contract-invalid", `${conditionContext} is incomplete.`, conditionContext));
      } else if (conditionIds.has(condition.condition_id)) {
        errors.push(issue("contract-invalid", `${conditionContext}.condition_id is duplicated.`, conditionContext));
      } else {
        conditionIds.add(condition.condition_id);
        if (
          (condition.type === "artifact-valid" && !localArtifactIds.has(condition.reference)) ||
          (["eval-passed", "review-passed"].includes(condition.type) && !evalIds.has(condition.reference))
        ) {
          errors.push(issue("contract-invalid", `${conditionContext}.reference does not resolve inside this contract.`, conditionContext));
        }
      }
    }
  }
}

function validateBindings(task, contracts, errors) {
  const bindings = arrayOrEmpty(task?.artifact_bindings);
  const bindingKeys = new Set();
  const validContracts = arrayOrEmpty(contracts).filter(isRecord);
  const contractById = new Map(validContracts.filter((contract) => nonEmptyString(contract.deliverable_id)).map((contract) => [contract.deliverable_id, contract]));
  const requiredBindingKeys = new Set(
    validContracts.flatMap((contract) =>
      [...arrayOrEmpty(contract.required_artifacts), ...arrayOrEmpty(contract.allowed_support_artifacts)]
        .filter(isRecord)
        .map((artifact) => `${contract.deliverable_id}:${artifact.artifact_id}`),
    ),
  );
  const presentBindingKeys = new Set();
  const linkedArtifacts = arrayOrEmpty(task?.linked_artifacts);

  if (!Array.isArray(task?.artifact_bindings)) {
    errors.push(issue("contract-invalid", "artifact_bindings must be an array.", "artifact_bindings"));
  }
  for (const [index, binding] of bindings.entries()) {
    const context = `artifact_bindings[${index}]`;
    const contract = contractById.get(binding?.deliverable_id);
    if (!contract) {
      errors.push(issue("artifact-binding-unbound", `${context} references an unknown deliverable.`, context));
      continue;
    }
    if (!nonEmptyString(binding?.artifact_id) || !roles.has(binding?.artifact_role) || !locatorTypes.has(binding?.locator_type) || !nonEmptyString(binding?.locator)) {
      errors.push(issue("contract-invalid", `${context} is incomplete.`, context));
      continue;
    }
    if (
      binding.locator_type === "path-prefix" &&
      (!binding.locator.endsWith("/") || (path.isAbsolute(binding.locator) && contract.ownership_boundary !== "standalone-product") || hasTraversal(binding.locator))
    ) {
      errors.push(issue("contract-invalid", `${context} has an unsafe path-prefix locator.`, context));
      continue;
    }
    const declared = [...arrayOrEmpty(contract.required_artifacts), ...arrayOrEmpty(contract.allowed_support_artifacts)].find(
      (artifact) => isRecord(artifact) && artifact.artifact_id === binding.artifact_id,
    );
    const locatorMatches =
      declared?.locator === binding.locator ||
      (binding.locator_type === "path-prefix" && declared?.locator_type === "path" && binding.locator.replace(/\/$/, "") === declared.locator);
    if (!declared || !locatorMatches || declared.artifact_role !== binding.artifact_role) {
      errors.push(issue("support-artifact-undeclared", `${context} is not declared by its contract.`, context));
    }
    const bindingKey = `${binding.deliverable_id}:${binding.artifact_id}`;
    if (bindingKeys.has(bindingKey)) {
      errors.push(issue("contract-invalid", `${context} duplicates ${bindingKey}.`, context));
    }
    bindingKeys.add(bindingKey);
    presentBindingKeys.add(`${binding.deliverable_id}:${binding.artifact_id}`);
    if (binding.locator_type === "path" && !linkedArtifacts.includes(binding.locator)) {
      errors.push(issue("artifact-binding-unbound", `${context}.locator must appear in linked_artifacts.`, context));
    }
  }

  for (const requiredKey of requiredBindingKeys) {
    if (!presentBindingKeys.has(requiredKey)) {
      errors.push(issue("artifact-binding-unbound", `Declared artifact ${requiredKey} has no artifact_bindings entry.`, "artifact_bindings"));
    }
  }
}

function validateBehaviorEvidence(task, contracts, errors) {
  if (!Array.isArray(task?.behavior_evidence)) {
    errors.push(issue("contract-invalid", "behavior_evidence must be an array.", "behavior_evidence"));
    return;
  }
  const contractById = new Map(
    arrayOrEmpty(contracts)
      .filter((contract) => isRecord(contract) && nonEmptyString(contract.deliverable_id))
      .map((contract) => [contract.deliverable_id, contract]),
  );
  const bindings = arrayOrEmpty(task?.artifact_bindings).filter(isRecord);
  const evidenceById = new Map(task.behavior_evidence.filter(isRecord).map((entry) => [entry.evidence_id, entry]));

  function bindingMatchesPath(binding, artifactPath, evidenceId) {
    if (binding.locator_type === "path") return binding.locator === artifactPath;
    if (binding.locator_type === "path-prefix") {
      const prefix = normalizedLocator(binding.locator);
      return artifactPath === prefix || artifactPath.startsWith(`${prefix}/`);
    }
    return binding.locator_type === "task-evidence" && binding.locator === evidenceId;
  }

  function pathFitsContractBoundary(contract, artifactPath) {
    if (!nonEmptyString(artifactPath) || hasTraversal(artifactPath)) return false;
    if (contract?.ownership_boundary !== "standalone-product") {
      return !path.isAbsolute(artifactPath);
    }
    if (!nonEmptyString(contract.external_product_root) || !path.isAbsolute(contract.external_product_root)) {
      return false;
    }
    const absolute = resolveAgainst(contract.external_product_root, artifactPath);
    return Boolean(absolute && isWithinPath(contract.external_product_root, absolute));
  }

  for (const [index, evidence] of task.behavior_evidence.entries()) {
    const context = `behavior_evidence[${index}]`;
    for (const field of [
      "evidence_id",
      "eval_id",
      "scenario_id",
      "raw_prompt",
      "repository_context",
      "runner_id",
      "runner_mode",
      "runner_session_id",
      "started_at",
      "completed_at",
      "raw_output",
      "expected_route",
      "result",
      "timestamp",
    ]) {
      if (!nonEmptyString(evidence?.[field])) {
        errors.push(issue("contract-invalid", `${context}.${field} is required.`, context));
      }
    }
    requireStrings(evidence?.observed_contract_ids, "contract-invalid", `${context}.observed_contract_ids`, errors);
    requireStrings(evidence?.observed_artifacts, "contract-invalid", `${context}.observed_artifacts`, errors);
    requireStrings(evidence?.observed_route, "contract-invalid", `${context}.observed_route`, errors);
    requireStrings(evidence?.observed_ownership, "contract-invalid", `${context}.observed_ownership`, errors);
    requireStrings(evidence?.observed_visibility, "contract-invalid", `${context}.observed_visibility`, errors);
    if (!new Set(["pass", "fail", "blocked"]).has(evidence?.result)) {
      errors.push(issue("contract-invalid", `${context}.result must be pass, fail, or blocked.`, context));
    }
    if (evidence?.builder_contract_version !== DELIVERABLE_CONTRACT_VERSION) {
      errors.push(issue("contract-invalid", `${context}.builder_contract_version must be 1.`, context));
    }
    const startedAt = Date.parse(evidence?.started_at);
    const completedAt = Date.parse(evidence?.completed_at);
    const validationResultsValid =
      Array.isArray(evidence?.validation_results) &&
      evidence.validation_results.length > 0 &&
      evidence.validation_results.every(
        (result) =>
          isRecord(result) &&
          nonEmptyString(result.check_id) &&
          ["pass", "fail", "blocked"].includes(result.result) &&
          nonEmptyString(result.grader_id) &&
          ["deterministic-validator", "independent-agent", "human-review", "e2e-runner"].includes(result.grader_mode) &&
          nonEmptyString(result.grader_session_id) &&
          result.independent_of_runner === true &&
          result.grader_id !== evidence.runner_id &&
          result.grader_session_id !== evidence.runner_session_id &&
          nonEmptyString(result.evidence),
      ) &&
      evidence.validation_results.some((result) => result.check_id === evidence.eval_id && result.result === evidence.result) &&
      (evidence.result !== "pass" || evidence.validation_results.every((result) => result.result === "pass"));
    const diffValid =
      Array.isArray(evidence?.observed_diff) &&
      evidence.observed_diff.every((entry) => isRecord(entry) && nonEmptyString(entry.path) && nonEmptyString(entry.change) && evidence.observed_artifacts?.includes(entry.path));
    const noWriteValid =
      isRecord(evidence?.no_write_evidence) &&
      ["blocked", "refused"].includes(evidence.no_write_evidence.outcome) &&
      nonEmptyString(evidence.no_write_evidence.reason) &&
      evidence.no_write_evidence.verified_zero_writes === true;
    const priorAttempt = evidenceById.get(evidence?.retry_of);
    const attemptValid = evidence?.first_attempt === true
      ? evidence?.retry_of == null
      : evidence?.first_attempt === false && priorAttempt?.eval_id === evidence?.eval_id && priorAttempt?.scenario_id === evidence?.scenario_id && priorAttempt?.result !== "pass";
    if (
      !Number.isFinite(startedAt) ||
      !Number.isFinite(completedAt) ||
      completedAt < startedAt ||
      !attemptValid ||
      !validationResultsValid ||
      !diffValid ||
      (evidence?.observed_diff?.length > 0 && evidence?.no_write_evidence !== undefined)
    ) {
      errors.push(issue("behavior-evidence-invalid", `${context} must contain a complete run and preserved attempt chain.`, context));
    }

    const observedContractIds = arrayOrEmpty(evidence?.observed_contract_ids);
    const observedContracts = observedContractIds.map((id) => contractById.get(id));
    const boundEvaluations = observedContracts.flatMap((contract) => arrayOrEmpty(contract?.eval_plan).filter((evaluation) => evaluation?.eval_id === evidence?.eval_id));
    const evalBound = boundEvaluations.length > 0;
    const expectedRunnerModes = new Set(
      boundEvaluations.map((evaluation) => ({ deterministic: "deterministic-fixture", "fresh-agent": "fresh-agent", "manual-review": "manual-review", e2e: "e2e" })[evaluation.kind]),
    );
    const runnerModeValid = expectedRunnerModes.size === 1 && expectedRunnerModes.has(evidence?.runner_mode);
    const exactSet = (observed, expected) => {
      const normalize = (values) => [...new Set(arrayOrEmpty(values).filter(nonEmptyString))].sort();
      return JSON.stringify(normalize(observed)) === JSON.stringify(normalize(expected));
    };
    const routeProjectionValid =
      exactSet(
        evidence?.observed_route,
        observedContracts.map((contract) => contract?.kind),
      ) &&
      exactSet(
        evidence?.observed_ownership,
        observedContracts.map((contract) => contract?.ownership_boundary),
      ) &&
      exactSet(
        evidence?.observed_visibility,
        observedContracts.map((contract) => contract?.runtime_visibility),
      );
    const artifactProducingPass =
      evidence?.result === "pass" &&
      observedContracts.some((contract) => ["create", "update"].includes(contract?.operation) && arrayOrEmpty(contract?.required_artifacts).length > 0);
    const diffOutcomeValid = !artifactProducingPass || evidence?.observed_diff?.length > 0 || noWriteValid;
    const artifactsBound = arrayOrEmpty(evidence?.observed_artifacts).every((artifactPath) => {
      if (!arrayOrEmpty(task?.linked_artifacts).includes(artifactPath)) return false;
      return bindings.some((binding) => {
        if (!observedContractIds.includes(binding.deliverable_id)) return false;
        const contract = contractById.get(binding.deliverable_id);
        return bindingMatchesPath(binding, artifactPath, evidence?.evidence_id) && pathFitsContractBoundary(contract, artifactPath);
      });
    });
    if (observedContracts.some((contract) => !contract) || !evalBound || !runnerModeValid || !routeProjectionValid || !diffOutcomeValid || !artifactsBound) {
      errors.push(issue("behavior-evidence-unbound", `${context} does not match its eval, artifact binding, and ownership boundary.`, context));
    }
  }
}

function validateDependencyBindings(task, contracts, errors) {
  if (task?.dependency_steps === undefined) return;
  if (!Array.isArray(task.dependency_steps)) {
    errors.push(issue("contract-invalid", "dependency_steps must be an array.", "dependency_steps"));
    return;
  }
  if (task.dependency_steps.length === 0) return;
  const validContracts = arrayOrEmpty(contracts).filter(isRecord);
  const contractIds = new Set(validContracts.map((contract) => contract.deliverable_id));
  if (task.dependency_artifacts !== undefined && !Array.isArray(task.dependency_artifacts)) {
    errors.push(issue("contract-invalid", "dependency_artifacts must be an array.", "dependency_artifacts"));
  }
  if (task.dependency_provenance !== undefined && !Array.isArray(task.dependency_provenance)) {
    errors.push(issue("contract-invalid", "dependency_provenance must be an array.", "dependency_provenance"));
  }
  for (const [index, step] of task.dependency_steps.entries()) {
    const context = `dependency_steps[${index}]`;
    for (const field of ["step_id", "supported_deliverable_id", "supported_artifact_id", "artifact_role", "required_outcome", "completion_condition_id"]) {
      if (!nonEmptyString(step?.[field])) {
        errors.push(issue("dependency-role-mismatch", `${context}.${field} is required.`, context));
      }
    }
    const supportedContract = validContracts.find((contract) => contract?.deliverable_id === step?.supported_deliverable_id);
    const supportedArtifact = [...arrayOrEmpty(supportedContract?.required_artifacts), ...arrayOrEmpty(supportedContract?.allowed_support_artifacts)].find(
      (artifact) => artifact?.artifact_id === step?.supported_artifact_id,
    );
    if (!contractIds.has(step?.supported_deliverable_id) || !roles.has(step?.artifact_role) || !supportedArtifact || supportedArtifact.artifact_role !== step?.artifact_role) {
      errors.push(issue("dependency-role-mismatch", `${context} does not map to a valid deliverable role.`, context));
    }
    if (!step?.dependency_write_plan) {
      errors.push(issue("dependency-write-plan-missing", `${context} requires dependency_write_plan.`, context));
    } else {
      const writePlan = step.dependency_write_plan;
      if (
        !isRecord(writePlan) ||
        !Array.isArray(writePlan.expected_output_paths) ||
        writePlan.expected_output_paths.length === 0 ||
        !Array.isArray(writePlan.allowed_write_zones) ||
        writePlan.allowed_write_zones.length === 0 ||
        !Array.isArray(writePlan.protected_paths) ||
        !Array.isArray(writePlan.provenance_requirements) ||
        writePlan.provenance_requirements.length === 0 ||
        !Array.isArray(writePlan.promotion_rules) ||
        writePlan.promotion_rules.length === 0
      ) {
        errors.push(issue("dependency-write-plan-missing", `${context}.dependency_write_plan must declare outputs, zones, protected paths, provenance, and promotion.`, context));
      } else {
        requireStrings(writePlan.expected_output_paths, "dependency-write-plan-missing", `${context}.dependency_write_plan.expected_output_paths`, errors);
        requireStrings(writePlan.allowed_write_zones, "dependency-write-plan-missing", `${context}.dependency_write_plan.allowed_write_zones`, errors);
        requireStrings(writePlan.protected_paths, "dependency-write-plan-missing", `${context}.dependency_write_plan.protected_paths`, errors, { allowEmpty: true });
        requireStrings(writePlan.provenance_requirements, "dependency-write-plan-missing", `${context}.dependency_write_plan.provenance_requirements`, errors);
        requireStrings(writePlan.promotion_rules, "dependency-write-plan-missing", `${context}.dependency_write_plan.promotion_rules`, errors);
        const declaresExternalWrites =
          nonEmptyString(writePlan.external_product_root) ||
          [...writePlan.expected_output_paths, ...writePlan.allowed_write_zones, ...writePlan.protected_paths].some(
            (declaredPath) => nonEmptyString(declaredPath) && path.isAbsolute(declaredPath),
          );
        if (declaresExternalWrites && (writePlan.external_write_approved !== true || !nonEmptyString(writePlan.approved_at) || !nonEmptyString(writePlan.approval_note))) {
          errors.push(issue("external-write-approval-missing", `${context}.dependency_write_plan lacks explicit external-write approval.`, context));
        }
      }
    }
  }
}

export function validateTaskDeliverableState(task) {
  const errors = [];
  if (task?.deliverable_contracts === undefined) return errors;
  const contracts = Array.isArray(task.deliverable_contracts) ? task.deliverable_contracts : [];
  if (!Array.isArray(task.deliverable_contracts)) {
    return [issue("contract-invalid", "deliverable_contracts must be an array.", "deliverable_contracts")];
  }
  if (contracts.length === 0) {
    errors.push(issue("contract-missing", "Declared deliverable contracts must include at least one contract."));
    return errors;
  }

  const ids = new Set();
  const artifactIds = new Set();
  for (const [index, contract] of contracts.entries()) {
    validateContract(contract, index, errors, ids, artifactIds);
  }
  if (!contracts.some((contract) => contract?.role === "primary")) {
    errors.push(issue("contract-missing", "At least one deliverable contract must be primary."));
  }
  const contractById = new Map(
    contracts.filter((candidate) => isRecord(candidate) && nonEmptyString(candidate.deliverable_id)).map((candidate) => [candidate.deliverable_id, candidate]),
  );
  for (const contract of contracts.filter((candidate) => candidate?.kind === "workflow-pack")) {
    const members = arrayOrEmpty(contract.member_deliverable_ids);
    if (members.length === 0 || new Set(members).size !== members.length) {
      errors.push(issue("workflow-pack-member-invalid", `Workflow pack ${contract.deliverable_id} must declare unique member deliverables.`));
    }
    for (const memberId of members) {
      const member = contractById.get(memberId);
      if (
        !member ||
        memberId === contract.deliverable_id ||
        !skillKinds.has(member.kind) ||
        member.independently_callable !== true ||
        !arrayOrEmpty(member.required_artifacts).some((artifact) => isRecord(artifact) && artifact.artifact_role === "primary" && skillBundleValidations.has(artifact.validation))
      ) {
        errors.push(issue("workflow-pack-member-invalid", `Workflow pack member ${memberId} must be an independently callable skill contract.`));
      }
    }
  }

  validateBindings(task, contracts, errors);
  validateBehaviorEvidence(task, contracts, errors);
  validateDependencyBindings(task, contracts, errors);
  return errors;
}
