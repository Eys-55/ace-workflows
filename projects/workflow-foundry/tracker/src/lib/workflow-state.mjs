import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { projectDeliverableReadiness } from "../../../../../scripts/workflow-deliverable-contracts.mjs";
import { deriveCanonicalSkillCatalog } from "../../../../../scripts/workflow-skill-catalog.mjs";

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

function recentSessionEventsFor(sessionLog) {
  return sessionLog.slice(-5);
}

function normalizeTask(task, taskPath, skillCatalog) {
  const relativeTaskPath = path.relative(repoRoot, taskPath);
  const linkedArtifacts = requireArray(
    task.linked_artifacts ?? [],
    `${relativeTaskPath} linked_artifacts`,
  );
  const sessionLog = requireArray(task.session_log ?? [], `${relativeTaskPath} session_log`);
  const artifactGroups = groupArtifacts(linkedArtifacts);
  const nextAction = task.status === "done"
    ? "none"
    : requireString(task.next_action, `${relativeTaskPath} next_action`);
  const deliverableReadiness = projectDeliverableReadiness({
    task,
    root: repoRoot,
    catalog: skillCatalog,
  });
  const artifactLabels = Object.values(artifactGroups)
    .flatMap((group) => group.items)
    .map((artifact) => artifact.label)
    .join(" ");

  return {
    id: requireString(task.task_id, `${relativeTaskPath} task_id`),
    title: requireString(task.title, `${relativeTaskPath} title`),
    kind: requireString(task.task_kind ?? "workflow-change", `${relativeTaskPath} task_kind`),
    status: requireString(task.status, `${relativeTaskPath} status`),
    updatedAt: requireString(task.updated_at, `${relativeTaskPath} updated_at`),
    summary: typeof task.summary === "string" ? task.summary : "",
    nextAction,
    deliverableContracts: deliverableReadiness.contracts.map((contract) => ({
      deliverableId: contract.deliverable_id,
      kind: contract.kind,
      operation: contract.operation,
      role: contract.role,
      ownershipBoundary: contract.ownership_boundary,
      targetSurface: contract.target_surface,
      runtimeVisibility: contract.runtime_visibility,
      runtimeTargets: contract.runtime_targets,
    })),
    deliverableReadiness,
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
      nextAction,
      artifactLabels,
      deliverableReadiness.state,
      deliverableReadiness.blockers.map((blocker) => blocker.code).join(" "),
      (task.deliverable_contracts ?? [])
        .map((contract) => `${contract.kind} ${contract.role} ${contract.target_surface}`)
        .join(" "),
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
    todo: 0,
    inProgress: 0,
    blocked: 0,
    done: 0,
  };

  for (const task of tasks) {
    if (task.status === "done") {
      stats.done += 1;
    } else {
      stats.open += 1;
    }

    if (task.status === "blocked") stats.blocked += 1;
    if (task.status === "todo") stats.todo += 1;
    if (task.status === "in-progress") stats.inProgress += 1;
  }

  return stats;
}

function attentionStatusFor(tasks) {
  return ["blocked", "in-progress", "todo"].find((status) =>
    tasks.some((task) => task.status === status),
  ) ?? "done";
}

export async function loadProject(projectDir, skillCatalog) {
  const projectPath = path.join(projectDir, "project.json");
  const indexPath = path.join(projectDir, "tasks", "index.json");

  if (!(await exists(projectPath))) return null;

  const project = await readJson(projectPath);
  const indexExists = await exists(indexPath);
  const index = indexExists ? await readJson(indexPath) : { tasks: [] };
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

    tasks.push(normalizeTask(await readJson(taskPath), taskPath, skillCatalog));
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
    taskIndexPath: indexExists ? path.relative(repoRoot, indexPath) : null,
    tasks,
    stats,
    activeTaskCount: stats.open,
    attentionStatus: attentionStatusFor(tasks),
  };
}

export async function loadWorkflowState() {
  const entries = await readdir(projectsRoot, { withFileTypes: true });
  const projects = [];
  const skillCatalog = await deriveCanonicalSkillCatalog({ root: repoRoot });

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const project = await loadProject(path.join(projectsRoot, entry.name), skillCatalog);
    if (project) projects.push(project);
  }

  projects.sort((left, right) => left.slug.localeCompare(right.slug));

  const taskCount = projects.reduce((total, project) => total + project.tasks.length, 0);

  return {
    generatedAt: new Date().toISOString(),
    currentProjectSlug: "workflow-foundry",
    statusStages: [
      { id: "todo", label: "Todo" },
      { id: "in-progress", label: "In progress" },
      { id: "blocked", label: "Blocked" },
      { id: "done", label: "Done" },
    ],
    projectCount: projects.length,
    taskCount,
    skillCatalog,
    projects,
  };
}
