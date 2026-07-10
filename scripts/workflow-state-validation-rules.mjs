export const allowedProjectStates = new Set(["active", "paused", "archived"]);
export const allowedStatuses = new Set(["todo", "in-progress", "blocked", "done"]);
export const allowedTaskKinds = new Set(["workflow-change", "tracker-maintenance"]);
export const allowedPhases = new Set([
  "intake",
  "grilling",
  "prd",
  "issues",
  "implement",
  "code-review",
  "done",
]);
export const allowedAgentRoles = new Set(["root-workflow-foundry", "project-domain"]);
export const allowedQuarantineStatuses = new Set(["quarantined"]);
export const projectAgentsForbiddenPatterns = [
  "## Project Preflight",
  "## Matt Pocock Flow",
  "## GitHub Checkpoints",
  "## Canonical Workflow Surface",
  "tasks/index.json",
  "validate-workflow-state.mjs",
  "query-workflow-state.mjs",
  "Load, load, load",
  "workflow-foundry control plane",
];

const allowedNextActions = new Set([
  "none",
  "grilling",
  "prd",
  "issues",
  "implement",
  "code-review",
]);
const implementationOrLaterPhases = new Set(["implement", "code-review", "done"]);
const allowedCapabilityDependencySources = new Set([
  "operator-explicit",
  "confirmed-natural-language",
  "known-tracker-context",
]);
const allowedCapabilityDependencyStatuses = new Set([
  "proposed",
  "confirmed",
  "approved",
  "blocked",
]);
const allowedDependencyArtifactStatuses = new Set([
  "intake-evidence",
  "grilling-evidence",
  "execution-evidence",
  "context",
  "official",
  "promoted",
]);
const commandSupportHeadings = new Set([
  "developer verification",
  "developer verification mode",
  "package smoke test",
  "deterministic validation",
  "query helper",
  "internal support",
]);
const packageManagerCommands = new Set([
  "add",
  "audit",
  "build",
  "check",
  "ci",
  "create",
  "dev",
  "dlx",
  "exec",
  "format",
  "init",
  "install",
  "link",
  "lint",
  "pack",
  "publish",
  "remove",
  "run",
  "start",
  "test",
  "typecheck",
  "uninstall",
  "update",
  "upgrade",
  "workspace",
  "workspaces",
  "x",
]);
const proseContinuationWords = new Set([
  "are",
  "can",
  "commands",
  "does",
  "files",
  "helpers",
  "is",
  "means",
  "remains",
  "scripts",
  "should",
  "uses",
  "was",
]);
const scriptExtensionPattern = /\.(?:sh|bash|zsh|fish|ps1|cmd|bat|py|mjs|cjs|js|ts)$/i;
const executableCommands = new Set([
  "aws",
  "az",
  "bash",
  "bun",
  "bunx",
  "cargo",
  "cmake",
  "corepack",
  "curl",
  "deno",
  "docker",
  "docker-compose",
  "dotnet",
  "fish",
  "gh",
  "git",
  "gcloud",
  "go",
  "gradle",
  "gradlew",
  "helm",
  "java",
  "javac",
  "just",
  "kubectl",
  "make",
  "mvn",
  "mvnw",
  "ninja",
  "node",
  "npm",
  "npx",
  "pip",
  "pip3",
  "pipx",
  "pnpm",
  "podman",
  "poetry",
  "powershell",
  "pwsh",
  "pytest",
  "python",
  "python3",
  "rsync",
  "rustup",
  "scp",
  "sh",
  "ssh",
  "terraform",
  "tofu",
  "uv",
  "uvx",
  "wget",
  "yarn",
  "zsh",
]);

function normalizeHeading(heading) {
  return heading
    .replace(/`/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase();
}

function stripCommandPrefix(value) {
  return value
    .trim()
    .replace(/^(?:>\s*)+/, "")
    .replace(/^\$\s+/, "")
    .trim();
}

function commandCandidates(line, fenceLanguage) {
  const candidates = [];
  const withoutQuote = line.trim().replace(/^(?:>\s*)+/, "");
  const listMatch = withoutQuote.match(/^(?:[-*+]\s+|\d+[.)]\s+)(.*)$/);
  const stripped = stripCommandPrefix(listMatch?.[1] ?? withoutQuote);
  const negated = /\b(?:do not|don't|never|must not|cannot)\b/i.test(withoutQuote);

  if (fenceLanguage || !line.includes("`")) {
    candidates.push({
      text: stripped,
      context: fenceLanguage ? "fence" : "plain",
      listItem: Boolean(listMatch),
      negated,
    });
  }
  for (const match of line.matchAll(/`([^`\r\n]+)`/g)) {
    candidates.push({
      text: stripCommandPrefix(match[1]),
      context: "inline",
      listItem: false,
      negated,
    });
  }
  return candidates;
}

function isDirectScriptCommand(candidate) {
  const [executable = "", ...argumentsList] = candidate.text.split(/\s+/);
  const directPath =
    /^(?:\.\.?[\\/])\S+/.test(executable) ||
    /^(?:scripts|bin|node_modules[\\/]\.bin)[\\/]\S+/i.test(executable);
  const namedScript = scriptExtensionPattern.test(executable);
  if (!directPath && !namedScript) return false;
  if (candidate.context === "fence" || argumentsList.length > 0) return true;
  return candidate.context === "plain" && !candidate.listItem;
}

function isNamedRuntimeCommand(candidate) {
  const [executable = "", firstArgument = "", secondArgument = ""] = candidate.text.split(/\s+/);
  const command = executable.toLowerCase();
  const argument = firstArgument.replace(/[;,]$/, "");
  const normalizedArgument = argument.toLowerCase();
  const normalizedSecondArgument = secondArgument.replace(/[;,]$/, "").toLowerCase();

  if (candidate.negated || executable !== command) return false;
  if (proseContinuationWords.has(normalizedArgument)) return false;
  if (
    ["npm", "pnpm", "yarn"].includes(command) &&
    !packageManagerCommands.has(normalizedArgument) &&
    proseContinuationWords.has(normalizedSecondArgument)
  ) {
    return false;
  }
  if (executableCommands.has(command)) return Boolean(argument) || candidate.context !== "inline";

  if (candidate.text.startsWith("/usr/bin/env ")) {
    const envCommand = candidate.text.trim().split(/\s+/)[1]?.toLowerCase();
    return executableCommands.has(envCommand);
  }
  return false;
}

function unwrapCommandSegment(segment) {
  const tokens = segment.trim().split(/\s+/).filter(Boolean);
  const wrappers = new Set(["command", "env", "exec", "nohup", "time"]);
  let changed = true;

  while (tokens.length > 0 && changed) {
    changed = false;
    while (/^[A-Za-z_][A-Za-z0-9_]*=\S*$/.test(tokens[0] ?? "")) {
      tokens.shift();
      changed = true;
    }
    if (wrappers.has((tokens[0] ?? "").toLowerCase())) {
      tokens.shift();
      while (tokens[0] === "--" || /^-\S+/.test(tokens[0] ?? "")) tokens.shift();
      changed = true;
    }
  }
  return tokens.join(" ");
}

function containsOperatorCommand(line, fenceLanguage) {
  return commandCandidates(line, fenceLanguage).some((candidate) =>
    candidate.text
      .split(/\s*(?:&&|\|\||;|\|)\s*/)
      .map(unwrapCommandSegment)
      .filter(Boolean)
      .map((text) => ({ ...candidate, text }))
      .some((segment) => isNamedRuntimeCommand(segment) || isDirectScriptCommand(segment)),
  );
}

export function findCommandFirstViolations(contents) {
  const violations = [];
  let currentHeading = "";
  let fenceLanguage = "";

  for (const [index, line] of contents.split("\n").entries()) {
    const fenceMatch = line.match(/^\s*```\s*([^\s`]*)/);
    if (fenceMatch) {
      fenceLanguage = fenceLanguage ? "" : (fenceMatch[1] || "code").toLowerCase();
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (!fenceLanguage && headingMatch) {
      currentHeading = headingMatch[2];
      continue;
    }
    if (
      containsOperatorCommand(line, fenceLanguage) &&
      !commandSupportHeadings.has(normalizeHeading(currentHeading))
    ) {
      violations.push({ line: index + 1, heading: currentHeading });
    }
  }
  return violations;
}

export function isConsistentlyDone(record) {
  return record?.status === "done" && record?.matt_phase === "done";
}

export function hasDonePhaseMismatch(record) {
  return (record?.status === "done") !== (record?.matt_phase === "done");
}

export function createValidationRules({ errors, relative }) {
  function requireString(object, key, filePath) {
    if (typeof object?.[key] !== "string" || object[key].trim() === "") {
      errors.push(`${relative(filePath)} must include string field "${key}"`);
    }
  }

  function requireArray(object, key, filePath) {
    if (!Array.isArray(object?.[key])) {
      errors.push(`${relative(filePath)} must include array field "${key}"`);
    }
  }

  function requireObject(object, key, filePath) {
    const value = object?.[key];
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
      errors.push(`${relative(filePath)} must include object field "${key}"`);
    }
  }

  function requireStringField(object, key, filePath, context) {
    if (typeof object?.[key] !== "string" || object[key].trim() === "") {
      errors.push(`${relative(filePath)} ${context} must include string field "${key}"`);
    }
  }

  function requireArrayField(object, key, filePath, context) {
    if (!Array.isArray(object?.[key])) {
      errors.push(`${relative(filePath)} ${context} must include array field "${key}"`);
    }
  }

  function validateOptionalArray(object, key, filePath) {
    if (object?.[key] === undefined) return false;
    if (!Array.isArray(object[key])) {
      errors.push(`${relative(filePath)} optional field "${key}" must be an array when present`);
      return false;
    }
    return true;
  }

  function validateStringArray(value, filePath, context) {
    if (!Array.isArray(value)) {
      errors.push(`${relative(filePath)} ${context} must be an array`);
      return;
    }
    for (const [index, item] of value.entries()) {
      if (typeof item !== "string" || item.trim() === "") {
        errors.push(`${relative(filePath)} ${context}[${index}] must be a non-empty string`);
      }
    }
  }

  function validateContextSnapshot(task, filePath) {
    requireObject(task, "context_snapshot", filePath);
    if (!task.context_snapshot) return;
    requireString(task.context_snapshot, "summary", filePath);
    requireArray(task.context_snapshot, "must_load", filePath);
  }

  function validatePhaseGuard(task, filePath) {
    requireObject(task, "phase_guard", filePath);
    if (!task.phase_guard) return;
    requireString(task.phase_guard, "selected_next_action", filePath);
    requireArray(task.phase_guard, "approved_artifacts", filePath);
    requireArray(task.phase_guard, "process_exceptions", filePath);
    if (
      typeof task.phase_guard.selected_next_action === "string" &&
      !allowedNextActions.has(task.phase_guard.selected_next_action)
    ) {
      errors.push(
        `${relative(filePath)} has invalid phase_guard.selected_next_action "${task.phase_guard.selected_next_action}"`,
      );
    }
    if (Array.isArray(task.phase_guard.approved_artifacts)) {
      for (const [index, artifact] of task.phase_guard.approved_artifacts.entries()) {
        for (const key of ["path", "phase", "approval_note", "approved_at"]) {
          if (typeof artifact?.[key] !== "string" || artifact[key].trim() === "") {
            errors.push(
              `${relative(filePath)} phase_guard.approved_artifacts[${index}] must include string field "${key}"`,
            );
          }
        }
        if (typeof artifact?.phase === "string" && !allowedNextActions.has(artifact.phase)) {
          errors.push(
            `${relative(filePath)} phase_guard.approved_artifacts[${index}] has invalid phase "${artifact.phase}"`,
          );
        }
      }
    }
    if (Array.isArray(task.phase_guard.process_exceptions)) {
      for (const [index, exception] of task.phase_guard.process_exceptions.entries()) {
        for (const key of ["path", "reason", "approved_at"]) {
          if (typeof exception?.[key] !== "string" || exception[key].trim() === "") {
            errors.push(
              `${relative(filePath)} phase_guard.process_exceptions[${index}] must include string field "${key}"`,
            );
          }
        }
      }
    }
  }

  function validateSelectedDependencySkill(skill, filePath, context) {
    if (typeof skill !== "object" || skill === null || Array.isArray(skill)) {
      errors.push(`${relative(filePath)} ${context} must be an object`);
      return;
    }
    for (const key of ["skill", "purpose", "call_boundary"]) {
      requireStringField(skill, key, filePath, context);
    }
    for (const key of ["expected_artifacts", "allowed_writes", "protected_paths"]) {
      validateStringArray(skill?.[key], filePath, `${context}.${key}`);
    }
    for (const key of ["loaded_skills", "loaded_but_not_selected_skills", "available_skills"]) {
      if (skill?.[key] !== undefined) {
        errors.push(
          `${relative(filePath)} ${context} must not include "${key}"; only selected dependency skills are approved`,
        );
      }
    }
  }

  function validateCapabilityDependencies(task, filePath) {
    const dependencyIds = new Set();
    const selectedSkillsByDependencyId = new Map();
    if (validateOptionalArray(task, "capability_dependencies", filePath)) {
      for (const [index, dependency] of task.capability_dependencies.entries()) {
        const context = `capability_dependencies[${index}]`;
        if (typeof dependency !== "object" || dependency === null || Array.isArray(dependency)) {
          errors.push(`${relative(filePath)} ${context} must be an object`);
          continue;
        }
        for (const key of ["dependency_id", "dependency_project", "purpose", "source", "status"]) {
          requireStringField(dependency, key, filePath, context);
        }
        if (typeof dependency?.dependency_id === "string") dependencyIds.add(dependency.dependency_id);
        if (
          typeof dependency?.source === "string" &&
          !allowedCapabilityDependencySources.has(dependency.source)
        ) {
          errors.push(
            `${relative(filePath)} ${context}.source must be one of ${[
              ...allowedCapabilityDependencySources,
            ].join(", ")}`,
          );
        }
        if (dependency?.source === "live-folder-scan") {
          errors.push(`${relative(filePath)} ${context}.source must not use broad live folder scans`);
        }
        if (
          typeof dependency?.status === "string" &&
          !allowedCapabilityDependencyStatuses.has(dependency.status)
        ) {
          errors.push(
            `${relative(filePath)} ${context}.status must be one of ${[
              ...allowedCapabilityDependencyStatuses,
            ].join(", ")}`,
          );
        }
        requireArrayField(dependency, "selected_skills", filePath, context);
        if (Array.isArray(dependency?.selected_skills)) {
          if (dependency.selected_skills.length === 0) {
            errors.push(`${relative(filePath)} ${context}.selected_skills must include at least one skill`);
          }
          const selectedSkillNames = new Set();
          for (const [skillIndex, skill] of dependency.selected_skills.entries()) {
            validateSelectedDependencySkill(skill, filePath, `${context}.selected_skills[${skillIndex}]`);
            if (typeof skill?.skill === "string" && skill.skill.trim() !== "") {
              selectedSkillNames.add(skill.skill);
            }
          }
          if (typeof dependency?.dependency_id === "string" && dependency.dependency_id.trim() !== "") {
            selectedSkillsByDependencyId.set(dependency.dependency_id, selectedSkillNames);
          }
        }
        for (const key of [
          "advertised_capabilities",
          "loaded_skills",
          "loaded_but_not_selected_skills",
          "available_skills",
        ]) {
          if (dependency?.[key] !== undefined) {
            errors.push(
              `${relative(filePath)} ${context} must not include "${key}"; dependency approval is limited to selected skills`,
            );
          }
        }
      }
    }
    const dependencyStepIds = validateDependencySteps(
      task,
      filePath,
      dependencyIds,
      selectedSkillsByDependencyId,
    );
    validateDependencyArtifacts(task, filePath, dependencyStepIds);
    validateDependencyProvenance(task, filePath, dependencyStepIds);
  }

  function validateDependencySteps(task, filePath, dependencyIds, selectedSkillsByDependencyId) {
    const hasCapabilityDependencies =
      Array.isArray(task.capability_dependencies) && task.capability_dependencies.length > 0;
    const hasDependencySteps = validateOptionalArray(task, "dependency_steps", filePath);
    const stepIds = new Set();
    if (hasCapabilityDependencies && (!hasDependencySteps || task.dependency_steps.length === 0)) {
      errors.push(`${relative(filePath)} capability_dependencies require at least one dependency_steps entry`);
    }
    if (!hasDependencySteps) return stepIds;
    if (!hasCapabilityDependencies && task.dependency_steps.length > 0) {
      errors.push(`${relative(filePath)} dependency_steps require at least one capability_dependencies entry`);
    }
    for (const [index, step] of task.dependency_steps.entries()) {
      const context = `dependency_steps[${index}]`;
      if (typeof step !== "object" || step === null || Array.isArray(step)) {
        errors.push(`${relative(filePath)} ${context} must be an object`);
        continue;
      }
      for (const key of [
        "step_id",
        "capability_dependency_id",
        "dependency_project",
        "selected_skill",
        "purpose",
      ]) {
        requireStringField(step, key, filePath, context);
      }
      if (typeof step?.step_id === "string") {
        if (stepIds.has(step.step_id)) {
          errors.push(`${relative(filePath)} repeats dependency step_id "${step.step_id}"`);
        }
        stepIds.add(step.step_id);
      }
      if (
        dependencyIds.size > 0 &&
        typeof step?.capability_dependency_id === "string" &&
        !dependencyIds.has(step.capability_dependency_id)
      ) {
        errors.push(
          `${relative(filePath)} ${context}.capability_dependency_id must reference a capability_dependencies dependency_id`,
        );
      }
      const selectedSkillNames = selectedSkillsByDependencyId.get(step?.capability_dependency_id);
      if (
        selectedSkillNames &&
        typeof step?.selected_skill === "string" &&
        !selectedSkillNames.has(step.selected_skill)
      ) {
        errors.push(
          `${relative(filePath)} ${context}.selected_skill must be listed in the referenced capability_dependencies selected_skills`,
        );
      }
      for (const key of [
        "expected_inputs",
        "expected_outputs",
        "allowed_writes",
        "protected_paths",
        "provenance_requirements",
      ]) {
        validateStringArray(step?.[key], filePath, `${context}.${key}`);
      }
      if (step?.documented_helper_skills !== undefined) {
        validateStringArray(step.documented_helper_skills, filePath, `${context}.documented_helper_skills`);
      }
      for (const key of ["loaded_skills", "loaded_but_not_selected_skills", "available_skills"]) {
        if (step?.[key] !== undefined) {
          errors.push(
            `${relative(filePath)} ${context} must not include "${key}"; only selected skills and documented helpers are approved`,
          );
        }
      }
      if (implementationOrLaterPhases.has(task.matt_phase)) {
        validateDependencyWritePlan(step?.dependency_write_plan, filePath, `${context}.dependency_write_plan`);
      } else if (step?.dependency_write_plan !== undefined) {
        validateDependencyWritePlan(step.dependency_write_plan, filePath, `${context}.dependency_write_plan`);
      }
    }
    return stepIds;
  }

  function validateDependencyWritePlan(writePlan, filePath, context) {
    if (typeof writePlan !== "object" || writePlan === null || Array.isArray(writePlan)) {
      errors.push(`${relative(filePath)} ${context} must be an object before implementation`);
      return;
    }
    for (const key of [
      "expected_output_paths",
      "allowed_write_zones",
      "protected_paths",
      "promotion_rules",
      "provenance_requirements",
      "stop_conditions",
    ]) {
      validateStringArray(writePlan?.[key], filePath, `${context}.${key}`);
    }
    requireStringField(writePlan, "approved_at", filePath, context);
    if (writePlan?.mutates_dependency_tracker === true && !writePlan?.approved_tracker_task) {
      errors.push(
        `${relative(filePath)} ${context} may mutate a dependency tracker only with approved_tracker_task`,
      );
    }
  }

  function validateDependencyArtifacts(task, filePath, dependencyStepIds) {
    if (!validateOptionalArray(task, "dependency_artifacts", filePath)) return;
    for (const [index, artifact] of task.dependency_artifacts.entries()) {
      const context = `dependency_artifacts[${index}]`;
      if (typeof artifact !== "object" || artifact === null || Array.isArray(artifact)) {
        errors.push(`${relative(filePath)} ${context} must be an object`);
        continue;
      }
      for (const key of [
        "artifact_id",
        "owner_task_id",
        "dependency_step_id",
        "dependency_project",
        "source_skill",
        "phase",
        "purpose",
        "artifact_status",
      ]) {
        requireStringField(artifact, key, filePath, context);
      }
      if (artifact?.owner_task_id !== task.task_id) {
        errors.push(`${relative(filePath)} ${context}.owner_task_id must equal task_id`);
      }
      if (
        typeof artifact?.dependency_step_id === "string" &&
        !dependencyStepIds.has(artifact.dependency_step_id)
      ) {
        errors.push(`${relative(filePath)} ${context}.dependency_step_id must reference dependency_steps.step_id`);
      }
      if (typeof artifact?.phase === "string" && !allowedPhases.has(artifact.phase)) {
        errors.push(`${relative(filePath)} ${context}.phase must be a valid Matt phase`);
      }
      if (
        typeof artifact?.artifact_status === "string" &&
        !allowedDependencyArtifactStatuses.has(artifact.artifact_status)
      ) {
        errors.push(
          `${relative(filePath)} ${context}.artifact_status must be one of ${[
            ...allowedDependencyArtifactStatuses,
          ].join(", ")}`,
        );
      }
      validateStringArray(artifact?.generated_files, filePath, `${context}.generated_files`);
      validateStringArray(
        artifact?.protected_boundary_metadata,
        filePath,
        `${context}.protected_boundary_metadata`,
      );
      if (["official", "promoted"].includes(artifact?.artifact_status)) {
        const promotion = artifact?.promotion_metadata;
        if (typeof promotion !== "object" || promotion === null || Array.isArray(promotion)) {
          errors.push(`${relative(filePath)} ${context}.promotion_metadata is required for promoted artifacts`);
        } else {
          requireStringField(promotion, "promoted_at", filePath, `${context}.promotion_metadata`);
          requireStringField(promotion, "prd_reference", filePath, `${context}.promotion_metadata`);
        }
      }
      if (artifact?.mutates_dependency_tracker === true && !artifact?.approved_tracker_task) {
        errors.push(
          `${relative(filePath)} ${context} may mutate a dependency tracker only with approved_tracker_task`,
        );
      }
    }
  }

  function validateDependencyProvenance(task, filePath, dependencyStepIds) {
    if (!validateOptionalArray(task, "dependency_provenance", filePath)) return;
    for (const [index, provenance] of task.dependency_provenance.entries()) {
      const context = `dependency_provenance[${index}]`;
      if (typeof provenance !== "object" || provenance === null || Array.isArray(provenance)) {
        errors.push(`${relative(filePath)} ${context} must be an object`);
        continue;
      }
      for (const key of [
        "primary_project",
        "primary_task_id",
        "dependency_step_id",
        "dependency_project",
        "selected_skill",
        "dependency_write_plan",
        "phase",
        "timestamp",
        "artifact_status",
      ]) {
        requireStringField(provenance, key, filePath, context);
      }
      if (provenance?.primary_project !== task.project_slug) {
        errors.push(`${relative(filePath)} ${context}.primary_project must equal project_slug`);
      }
      if (provenance?.primary_task_id !== task.task_id) {
        errors.push(`${relative(filePath)} ${context}.primary_task_id must equal task_id`);
      }
      if (
        typeof provenance?.dependency_step_id === "string" &&
        !dependencyStepIds.has(provenance.dependency_step_id)
      ) {
        errors.push(`${relative(filePath)} ${context}.dependency_step_id must reference dependency_steps.step_id`);
      }
      if (typeof provenance?.phase === "string" && !allowedPhases.has(provenance.phase)) {
        errors.push(`${relative(filePath)} ${context}.phase must be a valid Matt phase`);
      }
      if (
        typeof provenance?.artifact_status === "string" &&
        !allowedDependencyArtifactStatuses.has(provenance.artifact_status)
      ) {
        errors.push(
          `${relative(filePath)} ${context}.artifact_status must be one of ${[
            ...allowedDependencyArtifactStatuses,
          ].join(", ")}`,
        );
      }
      for (const key of ["helper_skills_used", "inputs", "generated_artifacts"]) {
        validateStringArray(provenance?.[key], filePath, `${context}.${key}`);
      }
    }
  }

  return {
    requireArray,
    requireObject,
    requireString,
    validateCapabilityDependencies,
    validateContextSnapshot,
    validatePhaseGuard,
  };
}
