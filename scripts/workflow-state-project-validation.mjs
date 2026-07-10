import path from "node:path";
import {
  projectDeliverableReadiness,
  validateTaskDeliverableState,
} from "./workflow-deliverable-contracts.mjs";
import {
  allowedPhases,
  allowedProjectStates,
  allowedStatuses,
  allowedTaskKinds,
  hasDonePhaseMismatch,
  isConsistentlyDone,
} from "./workflow-state-validation-rules.mjs";

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

function isTrackerArtifact(filePath) {
  return trackerArtifactPatterns.some((pattern) => pattern.test(filePath));
}

function isPlanningArtifact(filePath) {
  return planningArtifactPatterns.some((pattern) => pattern.test(filePath));
}

function isImplementationArtifact(filePath) {
  return !coreScriptArtifacts.has(filePath) &&
    implementationArtifactPatterns.some((pattern) => pattern.test(filePath));
}

function hasApprovedArtifact(task, filePath, phase) {
  return task.phase_guard?.approved_artifacts?.some(
    (artifact) => artifact.path === filePath && artifact.phase === phase,
  );
}

function hasProcessException(task, filePath) {
  return task.phase_guard?.process_exceptions?.some((exception) => exception.path === filePath);
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
    validatePhaseGuard,
  } = rules;

  function validateTask(task, filePath, projectSlug, requiredMustLoadPaths, skillCatalog) {
    for (const key of [
      "task_id",
      "project_slug",
      "title",
      "status",
      "matt_phase",
      "summary",
      "created_at",
      "updated_at",
    ]) {
      requireString(task, key, filePath);
    }
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
    for (const issue of validateTaskDeliverableState(task)) {
      errors.push(`${relative(filePath)} ${issue.code}: ${issue.message}`);
    }
    if (task.status === "done" || ["code-review", "done"].includes(task.matt_phase)) {
      const readiness = projectDeliverableReadiness({ task, root, catalog: skillCatalog });
      if (!readiness.completion_ready) {
        for (const blocker of readiness.blockers) {
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
    if (Array.isArray(task.context_snapshot?.must_load)) {
      for (const requiredPath of requiredMustLoadPaths) {
        if (!task.context_snapshot.must_load.includes(requiredPath)) {
          errors.push(`${relative(filePath)} context_snapshot.must_load must include "${requiredPath}"`);
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
    if (hasDonePhaseMismatch(task)) {
      errors.push(`${relative(filePath)} status and matt_phase must both be done or both be non-done`);
    }
    if (task.explicit_next_action_required !== true) {
      errors.push(`${relative(filePath)} explicit_next_action_required must be true`);
    }
  }

  function validateChangedArtifact(change, openTasksByArtifact) {
    const filePath = change.path;
    if (change.status.includes("D") || coreScriptArtifacts.has(filePath)) return;
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
      errors.push(`${relative(indexFile)} is missing`);
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

    const requiredMustLoadPaths = [
      "AGENTS.md",
      "registry/agents-md.json",
      projectAgentsPath,
      `projects/${projectSlug}/project.json`,
      `projects/${projectSlug}/tasks/index.json`,
      ...index.tasks
        .filter((item) => !isConsistentlyDone(item) && typeof item.task_id === "string")
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
      for (const key of ["title", "status", "matt_phase", "updated_at"]) {
        requireString(item, key, indexFile);
      }
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
      if (hasDonePhaseMismatch(item)) {
        errors.push(
          `${relative(indexFile)} status and matt_phase for ${item.task_id} must both be done or both be non-done`,
        );
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
      validateTask(task, taskFile, projectSlug, requiredMustLoadPaths, skillCatalog);
      if (!isConsistentlyDone(task)) openTasks.push(task);
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

  return { validateChangedArtifact, validateProject };
}
