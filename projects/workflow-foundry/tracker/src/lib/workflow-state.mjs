import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const trackerRoot = process.cwd();
const repoRoot = path.resolve(trackerRoot, "..", "..", "..");
const projectsRoot = path.join(repoRoot, "projects");

const artifactGroupOrder = ["prd", "issues", "skills", "tracker", "tests", "other"];
const artifactGroupLabels = {
  prd: "PRD",
  issues: "Issues",
  skills: "Skills",
  tracker: "Tracker",
  tests: "Tests",
  other: "Other",
};

const lifecycleOrder = ["intake", "grilling", "prd", "issues", "implement", "code-review", "done"];

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

function artifactGroupFor(artifactPath) {
  if (artifactPath.includes("/artifacts/prds/")) return "prd";
  if (artifactPath.includes("/artifacts/issues/")) return "issues";
  if (artifactPath.includes("/skills/")) return "skills";
  if (artifactPath.includes("/tests/")) return "tests";
  if (artifactPath.includes("/tracker/")) return "tracker";
  return "other";
}

function artifactLabelFor(artifactPath) {
  const basename = path.basename(artifactPath);
  const extension = path.extname(basename);
  return extension ? basename.slice(0, -extension.length) : basename;
}

function groupArtifacts(artifactPaths) {
  const groups = Object.fromEntries(
    artifactGroupOrder.map((group) => [
      group,
      {
        id: group,
        label: artifactGroupLabels[group],
        count: 0,
        items: [],
      },
    ]),
  );

  for (const artifactPath of artifactPaths) {
    const group = groups[artifactGroupFor(artifactPath)];
    group.items.push({
      label: artifactLabelFor(artifactPath),
      path: artifactPath,
    });
    group.count += 1;
  }

  return groups;
}

function lifecyclePhaseFor(task) {
  if (task.status === "done") return "done";
  if (lifecycleOrder.includes(task.matt_phase)) return task.matt_phase;
  return "intake";
}

function nextActionLabelFor(task, phaseGuard) {
  if (typeof phaseGuard.selected_next_action === "string" && phaseGuard.selected_next_action !== "none") {
    return phaseGuard.selected_next_action;
  }
  if (task.explicit_next_action_required === true) {
    return "explicit next action required";
  }
  return "no explicit next action";
}

function recentSessionEventsFor(sessionLog) {
  return sessionLog.slice(-5);
}

function normalizeTask(task, taskPath, projectSlug) {
  const relativeTaskPath = path.relative(repoRoot, taskPath);
  const phaseGuard = task.phase_guard ?? {};
  const linkedArtifacts = requireArray(
    task.linked_artifacts ?? [],
    `${relativeTaskPath} linked_artifacts`,
  );
  const sessionLog = requireArray(task.session_log ?? [], `${relativeTaskPath} session_log`);
  const artifactGroups = groupArtifacts(linkedArtifacts);
  const lifecyclePhase = lifecyclePhaseFor(task);
  const nextActionLabel = nextActionLabelFor(task, phaseGuard);
  const artifactLabels = Object.values(artifactGroups)
    .flatMap((group) => group.items)
    .map((artifact) => artifact.label)
    .join(" ");

  return {
    id: requireString(task.task_id, `${relativeTaskPath} task_id`),
    title: requireString(task.title, `${relativeTaskPath} title`),
    kind: requireString(task.task_kind ?? "workflow-change", `${relativeTaskPath} task_kind`),
    status: requireString(task.status, `${relativeTaskPath} status`),
    mattPhase: requireString(task.matt_phase, `${relativeTaskPath} matt_phase`),
    lifecyclePhase,
    updatedAt: requireString(task.updated_at, `${relativeTaskPath} updated_at`),
    explicitNextActionRequired: task.explicit_next_action_required === true,
    summary: typeof task.summary === "string" ? task.summary : "",
    nextActionLabel,
    continueCommand: `$continue-task project:${projectSlug} task:${task.task_id}`,
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
    linkedArtifacts,
    artifactGroups,
    artifactGroupList: artifactGroupOrder.map((group) => artifactGroups[group]),
    sessionLog,
    recentSessionEvents: recentSessionEventsFor(sessionLog),
    searchText: [
      task.task_id,
      task.title,
      task.task_kind,
      task.status,
      task.matt_phase,
      lifecyclePhase,
      nextActionLabel,
      artifactLabels,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase(),
    filePath: relativeTaskPath,
  };
}

function statsFor(tasks) {
  const stats = {
    open: 0,
    blocked: 0,
    inReview: 0,
    done: 0,
  };

  for (const task of tasks) {
    if (task.status === "done") {
      stats.done += 1;
    } else {
      stats.open += 1;
    }

    if (task.status === "blocked") stats.blocked += 1;
    if (task.mattPhase === "code-review") stats.inReview += 1;
  }

  return stats;
}

function hotPhaseFor(tasks) {
  const activeTasks = tasks.filter((task) => task.status !== "done");
  if (activeTasks.some((task) => task.status === "blocked")) return "blocked";

  const activePhases = new Set(activeTasks.map((task) => task.lifecyclePhase));
  const priority = ["implement", "code-review", "issues", "prd", "grilling", "intake"];
  return priority.find((phase) => activePhases.has(phase)) ?? "done";
}

async function loadProject(projectDir) {
  const projectPath = path.join(projectDir, "project.json");
  const indexPath = path.join(projectDir, "tasks", "index.json");

  if (!(await exists(projectPath)) || !(await exists(indexPath))) {
    return null;
  }

  const project = await readJson(projectPath);
  const index = await readJson(indexPath);
  const projectSlug = requireString(
    project.project_slug,
    `${path.relative(repoRoot, projectPath)} project_slug`,
  );
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

    tasks.push(normalizeTask(await readJson(taskPath), taskPath, projectSlug));
  }

  const stats = statsFor(tasks);

  return {
    slug: projectSlug,
    name: requireString(project.name, `${path.relative(repoRoot, projectPath)} name`),
    state: requireString(project.project_state, `${path.relative(repoRoot, projectPath)} state`),
    domain: typeof project.domain === "string" ? project.domain : "",
    goal: typeof project.goal === "string" ? project.goal : "",
    updatedAt: requireString(project.updated_at, `${path.relative(repoRoot, projectPath)} updated_at`),
    projectPath: path.relative(repoRoot, projectPath),
    taskIndexPath: path.relative(repoRoot, indexPath),
    tasks,
    stats,
    activeTaskCount: stats.open,
    hotPhase: hotPhaseFor(tasks),
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
    lifecycleStages: [
      { id: "intake", label: "Intake / Preflight" },
      { id: "grilling", label: "Grilling" },
      { id: "prd", label: "PRD" },
      { id: "issues", label: "Issues" },
      { id: "implement", label: "Implement" },
      { id: "code-review", label: "Code Review" },
      { id: "done", label: "Done" },
    ],
    projectCount: projects.length,
    taskCount,
    projects,
  };
}
