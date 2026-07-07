import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const trackerRoot = process.cwd();
const repoRoot = path.resolve(trackerRoot, "..", "..", "..");
const projectsRoot = path.join(repoRoot, "projects");

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    throw new Error(`${path.relative(repoRoot, filePath)} is invalid JSON: ${error.message}`);
  }
}

function requireString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
}

function requireArray(value, label) {
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`);
  }
  return value;
}

function normalizeTask(task, taskPath) {
  const relativeTaskPath = path.relative(repoRoot, taskPath);
  const phaseGuard = task.phase_guard ?? {};

  return {
    id: requireString(task.task_id, `${relativeTaskPath} task_id`),
    title: requireString(task.title, `${relativeTaskPath} title`),
    kind: requireString(task.task_kind ?? "workflow-change", `${relativeTaskPath} task_kind`),
    status: requireString(task.status, `${relativeTaskPath} status`),
    mattPhase: requireString(task.matt_phase, `${relativeTaskPath} matt_phase`),
    updatedAt: requireString(task.updated_at, `${relativeTaskPath} updated_at`),
    explicitNextActionRequired: task.explicit_next_action_required === true,
    summary: typeof task.summary === "string" ? task.summary : "",
    phaseGuard: {
      selectedNextAction:
        typeof phaseGuard.selected_next_action === "string"
          ? phaseGuard.selected_next_action
          : "none",
      approvedArtifactCount: Array.isArray(phaseGuard.approved_artifacts)
        ? phaseGuard.approved_artifacts.length
        : 0,
      processExceptionCount: Array.isArray(phaseGuard.process_exceptions)
        ? phaseGuard.process_exceptions.length
        : 0,
    },
    linkedArtifacts: requireArray(
      task.linked_artifacts ?? [],
      `${relativeTaskPath} linked_artifacts`,
    ),
    filePath: relativeTaskPath,
  };
}

async function loadProject(projectDir) {
  const projectPath = path.join(projectDir, "project.json");
  const indexPath = path.join(projectDir, "tasks", "index.json");

  if (!(await exists(projectPath)) || !(await exists(indexPath))) {
    return null;
  }

  const project = await readJson(projectPath);
  const index = await readJson(indexPath);
  const taskSummaries = requireArray(index.tasks, `${path.relative(repoRoot, indexPath)} tasks`);
  const tasks = [];

  for (const taskSummary of taskSummaries) {
    const taskId = requireString(
      taskSummary.task_id,
      `${path.relative(repoRoot, indexPath)} task_id`,
    );
    const taskPath = path.join(projectDir, "tasks", `${taskId}.json`);

    if (!(await exists(taskPath))) {
      throw new Error(`${path.relative(repoRoot, taskPath)} is listed but missing`);
    }

    tasks.push(normalizeTask(await readJson(taskPath), taskPath));
  }

  return {
    slug: requireString(project.project_slug, `${path.relative(repoRoot, projectPath)} project_slug`),
    name: requireString(project.name, `${path.relative(repoRoot, projectPath)} name`),
    state: requireString(project.project_state, `${path.relative(repoRoot, projectPath)} state`),
    domain: typeof project.domain === "string" ? project.domain : "",
    goal: typeof project.goal === "string" ? project.goal : "",
    updatedAt: requireString(project.updated_at, `${path.relative(repoRoot, projectPath)} updated_at`),
    projectPath: path.relative(repoRoot, projectPath),
    taskIndexPath: path.relative(repoRoot, indexPath),
    tasks,
  };
}

export async function loadWorkflowState() {
  const entries = await readdir(projectsRoot, { withFileTypes: true });
  const projects = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const project = await loadProject(path.join(projectsRoot, entry.name));
    if (project) projects.push(project);
  }

  projects.sort((left, right) => left.slug.localeCompare(right.slug));

  const taskCount = projects.reduce((total, project) => total + project.tasks.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    currentProjectSlug: "workflow-foundry",
    projectCount: projects.length,
    taskCount,
    projects,
  };
}
