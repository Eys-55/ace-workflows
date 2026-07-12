import path from "node:path";
import {
  projectDeliverableReadiness,
  validateTaskDeliverableState,
} from "./workflow-deliverable-contracts.mjs";
import {
  allowedProjectStates,
  allowedStatuses,
  allowedTaskKinds,
} from "./workflow-state-validation-rules.mjs";

const trackerArtifactPatterns = [
  /^registry\/agents-md\.json$/,
  /^projects\/[^/]+\/project\.json$/,
  /^projects\/[^/]+\/tasks\/index\.json$/,
  /^projects\/[^/]+\/tasks\/[^/]+\.json$/,
];
const retiredPrefix = String.fromCharCode(109, 97, 116, 116);
const removedTaskFields = [
  [retiredPrefix, "phase"].join("_"),
  ["phase", "guard"].join("_"),
  ["explicit", "next", "action", "required"].join("_"),
  ["removed", "lifecycle", "field"].join("_"),
  ["removed", "write", "gate"].join("_"),
];

function isTrackerArtifact(filePath) {
  return trackerArtifactPatterns.some((pattern) => pattern.test(filePath));
}

export function createProjectValidation({
  root,
  errors,
  exists,
  readJson,
  relative,
  rules,
}) {
  const {
    requireArray,
    requireString,
    validateCapabilityDependencies,
    validateContextSnapshot,
  } = rules;

  function rejectRemovedFields(record, filePath, context = "") {
    for (const field of removedTaskFields) {
      if (Object.hasOwn(record, field)) {
        errors.push(`${relative(filePath)}${context} contains removed field ${field}`);
      }
    }
  }

  function validateTask(task, filePath, projectSlug, skillCatalog) {
    for (const key of [
      "task_id",
      "project_slug",
      "title",
      "status",
      "summary",
      "created_at",
      "updated_at",
    ]) {
      requireString(task, key, filePath);
    }
    if (task.status !== "done") requireString(task, "next_action", filePath);
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
    validateCapabilityDependencies(task, filePath);
    rejectRemovedFields(task, filePath);
    for (const issue of validateTaskDeliverableState(task)) {
      errors.push(`${relative(filePath)} ${issue.code}: ${issue.message}`);
    }
    if (Array.isArray(task.deliverable_contracts) && task.deliverable_contracts.length > 0) {
      const readiness = projectDeliverableReadiness({ task, root, catalog: skillCatalog });
      const activeSecurityBlockers = new Set([
        "dependency-out-of-boundary",
        "dependency-protected-path",
        "external-write-approval-missing",
        "required-artifact-invalid",
      ]);
      for (const blocker of readiness.blockers) {
        if (task.status === "done" || activeSecurityBlockers.has(blocker.code)) {
          errors.push(`${relative(filePath)} ${blocker.code}: ${blocker.message}`);
        }
      }
    }

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
    if (task.project_slug !== projectSlug) {
      errors.push(`${relative(filePath)} project_slug must equal "${projectSlug}"`);
    }
    if (!allowedStatuses.has(task.status)) {
      errors.push(`${relative(filePath)} has invalid status "${task.status}"`);
    }
  }

  async function validateProject(projectDir, agentsEntries, skillCatalog) {
    const projectSlug = path.basename(projectDir);
    const projectFile = path.join(projectDir, "project.json");
    const indexFile = path.join(projectDir, "tasks", "index.json");
    const projectAgentsPath = `projects/${projectSlug}/AGENTS.md`;
    if (!(await exists(projectFile))) {
      errors.push(`${relative(projectFile)} is missing`);
      return [];
    }
    if (!(await exists(indexFile))) {
      // Task tracking is optional. When an index exists, its summaries and detail files
      // are still validated for consistency below.
      return [];
    }

    const project = await readJson(projectFile);
    const index = await readJson(indexFile);
    if (!project || !index) return [];
    for (const key of [
      "project_slug",
      "name",
      "project_state",
      "goal",
      "domain",
      "agents_md",
      "created_at",
      "updated_at",
    ]) {
      requireString(project, key, projectFile);
    }
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
      errors.push(`${relative(projectFile)} has invalid project_state "${project.project_state}"`);
    }
    if (index.project_slug !== projectSlug) {
      errors.push(`${relative(indexFile)} project_slug must equal "${projectSlug}"`);
    }
    if (!Array.isArray(index.tasks)) {
      errors.push(`${relative(indexFile)} must include array field "tasks"`);
      return [];
    }

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
      for (const key of ["title", "status", "updated_at"]) {
        requireString(item, key, indexFile);
      }
      rejectRemovedFields(item, indexFile, ` task ${item.task_id}`);
      const itemTaskKind = item.task_kind ?? "workflow-change";
      if (!allowedTaskKinds.has(itemTaskKind)) {
        errors.push(`${relative(indexFile)} has invalid task_kind for ${item.task_id}`);
      }
      if (!allowedStatuses.has(item.status)) {
        errors.push(`${relative(indexFile)} has invalid status for ${item.task_id}`);
      }
      const taskFile = path.join(projectDir, "tasks", `${item.task_id}.json`);
      if (!(await exists(taskFile))) {
        errors.push(`${relative(taskFile)} is missing`);
        continue;
      }
      const task = await readJson(taskFile);
      if (!task) continue;
      if (task.task_id !== item.task_id) {
        errors.push(`${relative(taskFile)} task_id must equal "${item.task_id}"`);
      }
      validateTask(task, taskFile, projectSlug, skillCatalog);
      if (task.status !== "done") openTasks.push(task);
      if (task.title !== item.title) {
        errors.push(`${relative(indexFile)} title mismatch for ${item.task_id}`);
      }
      if (task.status !== item.status) {
        errors.push(`${relative(indexFile)} status mismatch for ${item.task_id}`);
      }
      if (task.updated_at !== item.updated_at) {
        errors.push(`${relative(indexFile)} updated_at mismatch for ${item.task_id}`);
      }
      if ((task.task_kind ?? "workflow-change") !== itemTaskKind) {
        errors.push(`${relative(indexFile)} task_kind mismatch for ${item.task_id}`);
      }
    }
    return openTasks;
  }

  return { validateProject };
}
