import { execFile } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { validateTestingSessionState } from "./testing-session-state.mjs";

const root = process.cwd();
const execFileAsync = promisify(execFile);
const allowedProjectStates = new Set(["active", "paused", "archived"]);
const allowedStatuses = new Set(["todo", "in-progress", "blocked", "done"]);
const allowedTaskKinds = new Set(["workflow-change", "tracker-maintenance"]);
const allowedNextActions = new Set([
  "none",
  "grilling",
  "prd",
  "issues",
  "implement",
  "code-review",
]);
const allowedPhases = new Set([
  "intake",
  "grilling",
  "prd",
  "issues",
  "implement",
  "code-review",
  "done",
]);
const allowedAgentRoles = new Set(["root-workflow-foundry", "project-domain"]);
const allowedQuarantineStatuses = new Set(["quarantined"]);
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
const skillInvocationNames = [
  "workflow-help",
  "setup-workflow-project",
  "initiate-task",
  "continue-task",
  "audit-foundry",
  "testing-session",
];
const projectAgentsForbiddenPatterns = [
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

const errors = [];
const trackerArtifactPatterns = [
  /^registry\/agents-md\.json$/,
  /^projects\/[^/]+\/project\.json$/,
  /^projects\/[^/]+\/tasks\/index\.json$/,
  /^projects\/[^/]+\/tasks\/[^/]+\.json$/,
];
const implementationArtifactPatterns = [
  /^\.agents\/skills\/.+/,
  /^projects\/[^/]+\/artifacts\/.+/,
  /^scripts\/.+\.mjs$/,
];
const planningArtifactPatterns = [
  /^projects\/[^/]+\/artifacts\/prds\/.+/,
  /^projects\/[^/]+\/artifacts\/issues\/.+/,
  /^projects\/[^/]+\/artifacts\/reviews\/.+/,
  /^projects\/[^/]+\/artifacts\/handoffs\/.+/,
];
const coreScriptArtifacts = new Set([
  "scripts/query-workflow-state.mjs",
  "scripts/validate-workflow-state.mjs",
]);
const forbiddenPrimarySlashPattern = new RegExp(
  `(^|\\s)/(?:${skillInvocationNames.join("|")})\\b`,
);
const commandFirstSkillUsagePattern =
  /(^|[\s`])(?:npx|npm|pnpm|yarn|bun|python|python3)\b|(^|[\s`])node\s+(?:scripts\/|projects\/[^/\s]+\/artifacts\/)/;
const commandFirstOperatorHeadings = [
  "agent runtime usage",
  "call skill",
  "call the skill",
  "how to use",
  "operator usage",
  "run",
  "skill invocation",
  "usage",
  "use",
  "use the skill",
];
const commandSupportHeadings = [
  "developer verification",
  "developer verification mode",
  "install",
  "package smoke test",
  "state helpers",
  "validation",
];

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dir) {
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await listFiles(fullPath)));
    } else {
      files.push(fullPath);
    }
  }

  return files;
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    errors.push(`${relative(filePath)} is not valid JSON: ${error.message}`);
    return null;
  }
}

async function readText(filePath) {
  try {
    return await readFile(filePath, "utf8");
  } catch (error) {
    errors.push(`${relative(filePath)} cannot be read: ${error.message}`);
    return "";
  }
}

function relative(filePath) {
  return path.relative(root, filePath);
}

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

async function getChangedFiles() {
  try {
    const { stdout } = await execFileAsync("git", [
      "status",
      "--porcelain",
      "--untracked-files=all",
    ], { cwd: root });

    return stdout
      .split("\n")
      .map((line) => line.trimEnd())
      .filter(Boolean)
      .map((line) => {
        const status = line.slice(0, 2);
        const rawPath = line.slice(3);
        const filePath = rawPath.includes(" -> ") ? rawPath.split(" -> ").at(-1) : rawPath;
        return { status, path: filePath };
      });
  } catch (error) {
    errors.push(`git status failed: ${error.message}`);
    return [];
  }
}

function parseSkillFrontmatter(contents, filePath) {
  const match = contents.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) {
    errors.push(`${relative(filePath)} must start with YAML frontmatter`);
    return null;
  }

  const fields = {};
  for (const line of match[1].split("\n")) {
    const fieldMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!fieldMatch) continue;
    fields[fieldMatch[1]] = fieldMatch[2].replace(/^["']|["']$/g, "").trim();
  }

  for (const key of ["name", "description"]) {
    if (!fields[key]) {
      errors.push(`${relative(filePath)} frontmatter must include "${key}"`);
    }
  }

  return fields;
}

function validateNoPrimarySlashInvocation(filePath, contents) {
  if (forbiddenPrimarySlashPattern.test(contents)) {
    errors.push(
      `${relative(filePath)} must use $skill-name invocation, not primary slash-command invocation`,
    );
  }
}

function normalizeHeading(heading) {
  return heading
    .replace(/`/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase();
}

function isCommandFirstOperatorHeading(heading) {
  const normalized = normalizeHeading(heading);
  return commandFirstOperatorHeadings.some(
    (operatorHeading) =>
      normalized === operatorHeading || normalized.endsWith(` ${operatorHeading}`),
  );
}

function isCommandSupportHeading(heading) {
  const normalized = normalizeHeading(heading);
  return commandSupportHeadings.some(
    (supportHeading) =>
      normalized === supportHeading || normalized.endsWith(` ${supportHeading}`),
  );
}

function isSkillFirstRuntimeSurfaceFile(filePath) {
  const file = relative(filePath);
  return (
    file === "AGENTS.md" ||
    /^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(file) ||
    /^projects\/[^/]+\/README\.md$/.test(file) ||
    /^projects\/[^/]+\/skills\/[^/]+\/SKILL\.md$/.test(file)
  );
}

function validateSkillFirstRuntimeSurface(filePath, contents) {
  let currentHeading = "";

  for (const [index, line] of contents.split("\n").entries()) {
    const headingMatch = line.match(/^(#{1,6})\s+(.+?)\s*#*\s*$/);
    if (headingMatch) {
      currentHeading = headingMatch[2];
      continue;
    }

    if (!commandFirstSkillUsagePattern.test(line)) continue;
    if (!isCommandFirstOperatorHeading(currentHeading)) continue;
    if (isCommandSupportHeading(currentHeading)) continue;

    errors.push(
      `${relative(filePath)}:${index + 1} presents command-first skill usage under "${currentHeading}"; move command examples to Developer Verification, Package Smoke Test, or internal helper sections`,
    );
  }
}

async function validateSkillFirstRuntimeSurfaces(files) {
  for (const filePath of files.filter(isSkillFirstRuntimeSurfaceFile)) {
    validateSkillFirstRuntimeSurface(filePath, await readText(filePath));
  }
}

async function validateSkillSurface(files) {
  const skillRoot = path.join(root, ".agents", "skills");
  if (!(await exists(skillRoot))) {
    errors.push(".agents/skills is missing");
    return;
  }

  const forbiddenPromptFiles = files
    .map(relative)
    .filter((file) => file.startsWith(".codex/prompts/") && file.endsWith(".md"));
  for (const file of forbiddenPromptFiles) {
    errors.push(`${file} is forbidden: use .agents/skills for reusable workflows`);
  }

  const forbiddenCommandFiles = files
    .map(relative)
    .filter((file) => file.startsWith("commands/") && file.endsWith(".md"));
  for (const file of forbiddenCommandFiles) {
    errors.push(`${file} is forbidden: use $skill-name invocation from .agents/skills`);
  }

  const forbiddenLegacySkills = files
    .map(relative)
    .filter((file) => /^skills\/[^/]+\/SKILL\.md$/.test(file));
  for (const file of forbiddenLegacySkills) {
    errors.push(`${file} is forbidden: canonical skills must live in .agents/skills`);
  }

  const skillFiles = files.filter((file) =>
    /^\.agents\/skills\/[^/]+\/SKILL\.md$/.test(relative(file)),
  );

  if (skillFiles.length === 0) {
    errors.push(".agents/skills must include at least one skill SKILL.md");
  }

  for (const skillFile of skillFiles) {
    const contents = await readText(skillFile);
    const fields = parseSkillFrontmatter(contents, skillFile);
    const folderName = path.basename(path.dirname(skillFile));

    if (fields?.name && fields.name !== folderName) {
      errors.push(
        `${relative(skillFile)} frontmatter name "${fields.name}" must match folder "${folderName}"`,
      );
    }

    if (/(?<!\.agents\/)skills\/[^/\s]+\/SKILL\.md/.test(contents)) {
      errors.push(`${relative(skillFile)} must not point to legacy skills/*/SKILL.md`);
    }
  }

  for (const filePath of [
    path.join(root, "AGENTS.md"),
    path.join(root, ".agents", "skills", "workflow-help", "SKILL.md"),
  ]) {
    if (await exists(filePath)) {
      validateNoPrimarySlashInvocation(filePath, await readText(filePath));
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

  for (const forbiddenKey of ["loaded_skills", "loaded_but_not_selected_skills", "available_skills"]) {
    if (skill?.[forbiddenKey] !== undefined) {
      errors.push(
        `${relative(filePath)} ${context} must not include "${forbiddenKey}"; only selected dependency skills are approved`,
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

      if (typeof dependency?.dependency_id === "string") {
        dependencyIds.add(dependency.dependency_id);
      }

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

      for (const forbiddenKey of [
        "advertised_capabilities",
        "loaded_skills",
        "loaded_but_not_selected_skills",
        "available_skills",
      ]) {
        if (dependency?.[forbiddenKey] !== undefined) {
          errors.push(
            `${relative(filePath)} ${context} must not include "${forbiddenKey}"; dependency approval is limited to selected skills`,
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

    for (const forbiddenKey of ["loaded_skills", "loaded_but_not_selected_skills", "available_skills"]) {
      if (step?.[forbiddenKey] !== undefined) {
        errors.push(
          `${relative(filePath)} ${context} must not include "${forbiddenKey}"; only selected skills and documented helpers are approved`,
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
    validateStringArray(artifact?.protected_boundary_metadata, filePath, `${context}.protected_boundary_metadata`);

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

function isTrackerArtifact(filePath) {
  return trackerArtifactPatterns.some((pattern) => pattern.test(filePath));
}

function isPlanningArtifact(filePath) {
  return planningArtifactPatterns.some((pattern) => pattern.test(filePath));
}

function isImplementationArtifact(filePath) {
  if (coreScriptArtifacts.has(filePath)) return false;
  return implementationArtifactPatterns.some((pattern) => pattern.test(filePath));
}

function hasApprovedArtifact(task, filePath, phase) {
  return task.phase_guard?.approved_artifacts?.some(
    (artifact) => artifact.path === filePath && artifact.phase === phase,
  );
}

function hasProcessException(task, filePath) {
  return task.phase_guard?.process_exceptions?.some((exception) => exception.path === filePath);
}

function validateTask(task, filePath, projectSlug, requiredMustLoadPaths) {
  requireString(task, "task_id", filePath);
  requireString(task, "project_slug", filePath);
  requireString(task, "title", filePath);
  requireString(task, "status", filePath);
  requireString(task, "matt_phase", filePath);
  requireString(task, "summary", filePath);
  requireString(task, "created_at", filePath);
  requireString(task, "updated_at", filePath);

  for (const key of [
    "acceptance_criteria",
    "ecc_concepts_applied",
    "dependencies",
    "related_tasks",
    "linked_artifacts",
    "session_log",
  ]) {
    requireArray(task, key, filePath);
  }

  validateContextSnapshot(task, filePath);
  validatePhaseGuard(task, filePath);
  validateCapabilityDependencies(task, filePath);

  const taskKind = task.task_kind ?? "workflow-change";
  if (!allowedTaskKinds.has(taskKind)) {
    errors.push(`${relative(filePath)} has invalid task_kind "${taskKind}"`);
  }

  if (
    taskKind === "tracker-maintenance" &&
    !task.linked_artifacts?.some((artifactPath) => isTrackerArtifact(artifactPath))
  ) {
    errors.push(`${relative(filePath)} tracker-maintenance task must link a tracker artifact`);
  }

  if (Array.isArray(task.context_snapshot?.must_load)) {
    for (const requiredPath of requiredMustLoadPaths) {
      if (!task.context_snapshot.must_load.includes(requiredPath)) {
        errors.push(
          `${relative(filePath)} context_snapshot.must_load must include "${requiredPath}"`,
        );
      }
    }
  }

  if (task.project_slug !== projectSlug) {
    errors.push(`${relative(filePath)} project_slug must equal "${projectSlug}"`);
  }

  if (!allowedStatuses.has(task.status)) {
    errors.push(`${relative(filePath)} has invalid status "${task.status}"`);
  }

  if (!allowedPhases.has(task.matt_phase)) {
    errors.push(`${relative(filePath)} has invalid matt_phase "${task.matt_phase}"`);
  }

  if (task.explicit_next_action_required !== true) {
    errors.push(`${relative(filePath)} explicit_next_action_required must be true`);
  }
}

function validateChangedArtifact(change, openTasksByArtifact) {
  const filePath = change.path;
  if (change.status.includes("D")) return;
  if (coreScriptArtifacts.has(filePath)) return;

  const linkedTasks = openTasksByArtifact.get(filePath) ?? [];

  if (isTrackerArtifact(filePath)) {
    if (
      linkedTasks.some(
        (task) => task.task_kind === "tracker-maintenance" || hasProcessException(task, filePath),
      )
    ) {
      return;
    }
    errors.push(`${filePath} changed but is not linked to a non-done tracker-maintenance task`);
    return;
  }

  if (isPlanningArtifact(filePath)) {
    if (linkedTasks.length > 0) return;
    errors.push(`${filePath} changed but is not linked to a non-done task`);
    return;
  }

  if (isImplementationArtifact(filePath)) {
    if (linkedTasks.length === 0) {
      errors.push(`${filePath} changed but is not linked to a non-done task`);
      return;
    }

    if (
      linkedTasks.some(
        (task) => task.matt_phase === "implement" || hasApprovedArtifact(task, filePath, "implement"),
      )
    ) {
      return;
    }

    errors.push(`${filePath} changed before implement phase without approved implement artifact`);
  }
}

async function loadAgentsRegistry() {
  const registryFile = path.join(root, "registry", "agents-md.json");
  if (!(await exists(registryFile))) {
    errors.push(`${relative(registryFile)} is missing`);
    return { registryFile, entries: [] };
  }

  const registry = await readJson(registryFile);
  if (!registry) return { registryFile, entries: [] };

  if (!Array.isArray(registry.agents_md)) {
    errors.push(`${relative(registryFile)} must include array field "agents_md"`);
    return { registryFile, entries: [] };
  }

  return { registryFile, entries: registry.agents_md };
}

async function validateAgentsRegistry(files) {
  const { registryFile, entries } = await loadAgentsRegistry();
  const registryPaths = new Set();
  const discoveredAgents = files
    .filter((file) => !file.includes(`${path.sep}.git${path.sep}`))
    .filter((file) => path.basename(file) === "AGENTS.md")
    .map(relative)
    .sort();

  for (const entry of entries) {
    requireString(entry, "path", registryFile);
    requireString(entry, "role", registryFile);
    requireString(entry, "scope", registryFile);
    requireArray(entry, "allowed_content", registryFile);

    if (typeof entry.live !== "boolean") {
      errors.push(`${relative(registryFile)} entry ${entry.path} must include boolean field "live"`);
    }

    if (entry.owning_project !== null && typeof entry.owning_project !== "string") {
      errors.push(
        `${relative(registryFile)} entry ${entry.path} owning_project must be string or null`,
      );
    }

    if (!allowedAgentRoles.has(entry.role)) {
      errors.push(`${relative(registryFile)} entry ${entry.path} has invalid role "${entry.role}"`);
    }

    if (registryPaths.has(entry.path)) {
      errors.push(`${relative(registryFile)} repeats AGENTS.md path "${entry.path}"`);
    }
    registryPaths.add(entry.path);

    const absoluteAgentsPath = path.join(root, entry.path);
    if (!(await exists(absoluteAgentsPath))) {
      errors.push(`${entry.path} is registered but missing`);
      continue;
    }

    if (entry.role === "root-workflow-foundry") {
      if (entry.path !== "AGENTS.md") {
        errors.push(`${entry.path} root-workflow-foundry entry must be AGENTS.md`);
      }
      if (entry.owning_project !== null) {
        errors.push(`${entry.path} root-workflow-foundry owning_project must be null`);
      }
    }

    if (entry.role === "project-domain") {
      const expectedPath = `projects/${entry.owning_project}/AGENTS.md`;
      const expectedScope = `projects/${entry.owning_project}`;
      if (entry.path !== expectedPath) {
        errors.push(`${entry.path} project-domain path must equal ${expectedPath}`);
      }
      if (entry.scope !== expectedScope) {
        errors.push(`${entry.path} project-domain scope must equal ${expectedScope}`);
      }

      const contents = await readText(absoluteAgentsPath);
      for (const pattern of projectAgentsForbiddenPatterns) {
        if (contents.includes(pattern)) {
          errors.push(`${entry.path} contains root workflow/control-plane pattern "${pattern}"`);
        }
      }
    }
  }

  for (const agentsPath of discoveredAgents) {
    if (!registryPaths.has(agentsPath)) {
      errors.push(`${agentsPath} exists but is not registered in registry/agents-md.json`);
    }
  }

  if (!registryPaths.has("AGENTS.md")) {
    errors.push("root AGENTS.md must be registered in registry/agents-md.json");
  }

  return entries;
}

async function validateProject(projectDir, agentsEntries) {
  const projectSlug = path.basename(projectDir);
  const projectFile = path.join(projectDir, "project.json");
  const indexFile = path.join(projectDir, "tasks", "index.json");
  const projectAgentsPath = `projects/${projectSlug}/AGENTS.md`;

  if (!(await exists(projectFile))) {
    errors.push(`${relative(projectFile)} is missing`);
    return;
  }

  if (!(await exists(indexFile))) {
    errors.push(`${relative(indexFile)} is missing`);
    return;
  }

  const project = await readJson(projectFile);
  const index = await readJson(indexFile);
  if (!project || !index) return;

  requireString(project, "project_slug", projectFile);
  requireString(project, "name", projectFile);
  requireString(project, "project_state", projectFile);
  requireString(project, "goal", projectFile);
  requireString(project, "domain", projectFile);
  requireString(project, "agents_md", projectFile);
  requireString(project, "created_at", projectFile);
  requireString(project, "updated_at", projectFile);
  requireArray(project, "active_conventions", projectFile);
  requireArray(project, "ecc_concepts_applied", projectFile);

  if (project.project_slug !== projectSlug) {
    errors.push(`${relative(projectFile)} project_slug must equal "${projectSlug}"`);
  }

  if (project.agents_md !== projectAgentsPath) {
    errors.push(`${relative(projectFile)} agents_md must equal "${projectAgentsPath}"`);
  }

  const projectAgentsEntry = agentsEntries.find(
    (entry) =>
      entry.path === projectAgentsPath &&
      entry.role === "project-domain" &&
      entry.owning_project === projectSlug,
  );
  if (!projectAgentsEntry) {
    errors.push(`${projectAgentsPath} must be registered as project-domain`);
  }

  if (!allowedProjectStates.has(project.project_state)) {
    errors.push(
      `${relative(projectFile)} has invalid project_state "${project.project_state}"`,
    );
  }

  if (index.project_slug !== projectSlug) {
    errors.push(`${relative(indexFile)} project_slug must equal "${projectSlug}"`);
  }

  if (!Array.isArray(index.tasks)) {
    errors.push(`${relative(indexFile)} must include array field "tasks"`);
    return;
  }

  const requiredMustLoadPaths = [
    "AGENTS.md",
    "registry/agents-md.json",
    projectAgentsPath,
    `projects/${projectSlug}/project.json`,
    `projects/${projectSlug}/tasks/index.json`,
    ...index.tasks
      .filter((item) => item.status !== "done" && typeof item.task_id === "string")
      .map((item) => `projects/${projectSlug}/tasks/${item.task_id}.json`),
  ];

  const taskIds = new Set();
  const openTasks = [];
  for (const item of index.tasks) {
    if (typeof item.task_id !== "string") {
      errors.push(`${relative(indexFile)} has task without task_id`);
      continue;
    }

    if (taskIds.has(item.task_id)) {
      errors.push(`${relative(indexFile)} repeats task_id "${item.task_id}"`);
    }
    taskIds.add(item.task_id);

    requireString(item, "title", indexFile);
    requireString(item, "status", indexFile);
    requireString(item, "matt_phase", indexFile);
    requireString(item, "updated_at", indexFile);

    const itemTaskKind = item.task_kind ?? "workflow-change";
    if (!allowedTaskKinds.has(itemTaskKind)) {
      errors.push(`${relative(indexFile)} has invalid task_kind for ${item.task_id}`);
    }

    if (!allowedStatuses.has(item.status)) {
      errors.push(`${relative(indexFile)} has invalid status for ${item.task_id}`);
    }

    if (!allowedPhases.has(item.matt_phase)) {
      errors.push(`${relative(indexFile)} has invalid matt_phase for ${item.task_id}`);
    }

    const taskFile = path.join(projectDir, "tasks", `${item.task_id}.json`);
    if (!(await exists(taskFile))) {
      errors.push(`${relative(taskFile)} is missing`);
      continue;
    }

    const task = await readJson(taskFile);
    if (!task) continue;

    validateTask(task, taskFile, projectSlug, requiredMustLoadPaths);
    if (task.status !== "done") {
      openTasks.push(task);
    }

    if (task.title !== item.title) {
      errors.push(`${relative(indexFile)} title mismatch for ${item.task_id}`);
    }

    if (task.status !== item.status) {
      errors.push(`${relative(indexFile)} status mismatch for ${item.task_id}`);
    }

    if (task.matt_phase !== item.matt_phase) {
      errors.push(`${relative(indexFile)} matt_phase mismatch for ${item.task_id}`);
    }

    if ((task.task_kind ?? "workflow-change") !== itemTaskKind) {
      errors.push(`${relative(indexFile)} task_kind mismatch for ${item.task_id}`);
    }
  }

  return openTasks;
}

function listSkillImportFiles(files, importRoot) {
  const relativeImportRoot = relative(importRoot);
  return files
    .map(relative)
    .filter((file) =>
      file.startsWith(`${relativeImportRoot}/skills/`) && file.endsWith("/SKILL.md"),
    )
    .sort();
}

async function validateQuarantineImport(projectSlug, importRoot, files) {
  const markerFile = path.join(importRoot, "quarantine.json");
  const relativeMarkerFile = relative(markerFile);
  const skillFiles = listSkillImportFiles(files, importRoot);

  if (skillFiles.length === 0) return;

  if (!(await exists(markerFile))) {
    errors.push(`${relative(importRoot)} contains imported skills but is missing quarantine.json`);
    return;
  }

  const marker = await readJson(markerFile);
  if (!marker) return;

  requireString(marker, "project_slug", markerFile);
  requireString(marker, "import_id", markerFile);
  requireString(marker, "status", markerFile);
  requireString(marker, "active_skill_surface_path", markerFile);
  requireArray(marker, "boundaries", markerFile);
  requireArray(marker, "imported_skills", markerFile);

  const expectedImportId = path.basename(importRoot);
  if (marker.import_id !== expectedImportId) {
    errors.push(`${relativeMarkerFile} import_id must equal "${expectedImportId}"`);
  }

  if (marker.project_slug !== projectSlug) {
    errors.push(`${relativeMarkerFile} project_slug must equal "${projectSlug}"`);
  }

  if (!allowedQuarantineStatuses.has(marker.status)) {
    errors.push(`${relativeMarkerFile} status must be "quarantined"`);
  }

  for (const [key, expectedValue] of Object.entries({
    source_evidence_only: true,
    callable: false,
    active_skill_surface: false,
    discoverable_as_active_skill: false,
    report_as_project_skills: false,
    promotable_as_is: false,
  })) {
    if (marker[key] !== expectedValue) {
      errors.push(`${relativeMarkerFile} ${key} must be ${expectedValue}`);
    }
  }

  if (marker.imported_skill_count !== skillFiles.length) {
    errors.push(
      `${relativeMarkerFile} imported_skill_count must equal imported SKILL.md count ${skillFiles.length}`,
    );
  }

  const markerSkillPaths = new Set(
    Array.isArray(marker.imported_skills)
      ? marker.imported_skills.map((skill) => skill.path).filter(Boolean)
      : [],
  );
  const actualSkillPaths = new Set(skillFiles);

  for (const skillFile of skillFiles) {
    if (!markerSkillPaths.has(skillFile)) {
      errors.push(`${relativeMarkerFile} imported_skills must include ${skillFile}`);
    }
  }

  for (const markerSkillPath of markerSkillPaths) {
    if (!actualSkillPaths.has(markerSkillPath)) {
      errors.push(`${relativeMarkerFile} imported_skills includes missing file ${markerSkillPath}`);
    }
  }
}

async function validateQuarantineImports(files) {
  const importRoots = new Set();
  for (const file of files) {
    const relativeFile = relative(file);
    const match = relativeFile.match(/^(projects\/[^/]+)\/quarantine\/imports\/([^/]+)\/skills\/[^/]+\/SKILL\.md$/);
    if (!match) continue;
    importRoots.add(`${match[1]}/quarantine/imports/${match[2]}`);
  }

  for (const relativeImportRoot of [...importRoots].sort()) {
    const [, projectSlug] =
      relativeImportRoot.match(/^projects\/([^/]+)\/quarantine\/imports\//) ?? [];
    if (!projectSlug) continue;
    await validateQuarantineImport(projectSlug, path.join(root, relativeImportRoot), files);
  }
}

const files = await listFiles(root);
for (const file of files) {
  if (file.includes(`${path.sep}.git${path.sep}`)) continue;
  if (file.endsWith(".py")) {
    errors.push(`${relative(file)} is forbidden: Python files are not allowed`);
  }
}

await validateSkillSurface(files);
await validateSkillFirstRuntimeSurfaces(files);
await validateQuarantineImports(files);

const agentsEntries = await validateAgentsRegistry(files);

const projectsDir = path.join(root, "projects");
const openTasks = [];
if (await exists(projectsDir)) {
  const projectEntries = await readdir(projectsDir, { withFileTypes: true });
  for (const entry of projectEntries) {
    if (entry.isDirectory()) {
      openTasks.push(
        ...((await validateProject(path.join(projectsDir, entry.name), agentsEntries)) ?? []),
      );
    }
  }
}

errors.push(...(await validateTestingSessionState({ root })));

const openTasksByArtifact = new Map();
for (const task of openTasks) {
  const artifactPaths = new Set([
    ...(Array.isArray(task.linked_artifacts) ? task.linked_artifacts : []),
    ...(Array.isArray(task.phase_guard?.approved_artifacts)
      ? task.phase_guard.approved_artifacts.map((artifact) => artifact.path)
      : []),
    ...(Array.isArray(task.phase_guard?.process_exceptions)
      ? task.phase_guard.process_exceptions.map((exception) => exception.path)
      : []),
  ]);

  for (const artifactPath of artifactPaths) {
    if (!openTasksByArtifact.has(artifactPath)) {
      openTasksByArtifact.set(artifactPath, []);
    }
    openTasksByArtifact.get(artifactPath).push(task);
  }
}

for (const change of await getChangedFiles()) {
  validateChangedArtifact(change, openTasksByArtifact);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Workflow state is valid.");
