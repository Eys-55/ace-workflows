import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const args = process.argv.slice(2);

function getArg(name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  return args[index + 1] ?? null;
}

function hasFlag(name) {
  return args.includes(name);
}

function usage() {
  console.log(`Usage:
  node scripts/query-workflow-state.mjs --list-projects
  node scripts/query-workflow-state.mjs --list-agents-md
  node scripts/query-workflow-state.mjs --project <slug> --agents-md
  node scripts/query-workflow-state.mjs --project <slug> --list-tasks [--status <status>] [--phase <phase>]
  node scripts/query-workflow-state.mjs --project <slug> --task <task-id>
`);
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function loadAgentsRegistry() {
  const registryFile = path.join(root, "registry", "agents-md.json");
  if (!(await exists(registryFile))) {
    throw new Error(`Missing ${path.relative(root, registryFile)}`);
  }

  const registry = await readJson(registryFile);
  return Array.isArray(registry.agents_md) ? registry.agents_md : [];
}

async function listAgentsMd(projectSlug = null) {
  const entries = await loadAgentsRegistry();
  const filtered = projectSlug
    ? entries.filter(
        (entry) => entry.owning_project === projectSlug || entry.role === "root-workflow-foundry",
      )
    : entries;

  if (filtered.length === 0) {
    console.log("No matching AGENTS.md registry entries found.");
    return;
  }

  for (const entry of filtered) {
    console.log(
      `${entry.path}\t${entry.role}\t${entry.scope}\t${entry.owning_project ?? "-"}\t${
        entry.live ? "live" : "inactive"
      }`,
    );
  }
}

async function listProjects() {
  const projectsDir = path.join(root, "projects");
  if (!(await exists(projectsDir))) {
    console.log("No projects directory found.");
    return;
  }

  const entries = await readdir(projectsDir, { withFileTypes: true });
  const projects = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);

  if (projects.length === 0) {
    console.log("No projects found.");
    return;
  }

  for (const project of projects.sort()) {
    const projectFile = path.join(projectsDir, project, "project.json");
    if (!(await exists(projectFile))) {
      console.log(`${project}\tmissing project.json`);
      continue;
    }

    const state = await readJson(projectFile);
    console.log(
      `${project}\t${state.project_state ?? "unknown"}\t${state.name ?? ""}`,
    );
  }
}

async function loadProject(projectSlug) {
  const projectDir = path.join(root, "projects", projectSlug);
  const projectFile = path.join(projectDir, "project.json");
  const indexFile = path.join(projectDir, "tasks", "index.json");

  if (!(await exists(projectFile))) {
    throw new Error(`Missing ${path.relative(root, projectFile)}`);
  }

  if (!(await exists(indexFile))) {
    throw new Error(`Missing ${path.relative(root, indexFile)}`);
  }

  return {
    projectDir,
    project: await readJson(projectFile),
    index: await readJson(indexFile),
  };
}

async function listTasks(projectSlug) {
  const status = getArg("--status");
  const phase = getArg("--phase");
  const { index } = await loadProject(projectSlug);
  const tasks = Array.isArray(index.tasks) ? index.tasks : [];
  const filtered = tasks.filter((task) => {
    if (status && task.status !== status) return false;
    if (phase && task.matt_phase !== phase) return false;
    return true;
  });

  if (filtered.length === 0) {
    console.log("No matching tasks found.");
    return;
  }

  for (const task of filtered) {
    console.log(
      `${task.task_id}\t${task.status}\t${task.matt_phase}\t${task.updated_at}\t${task.title}`,
    );
  }
}

async function printTask(projectSlug, taskId) {
  const { projectDir } = await loadProject(projectSlug);
  const taskFile = path.join(projectDir, "tasks", `${taskId}.json`);

  if (!(await exists(taskFile))) {
    throw new Error(`Missing ${path.relative(root, taskFile)}`);
  }

  const task = await readJson(taskFile);
  console.log(JSON.stringify(task, null, 2));
}

try {
  if (hasFlag("--help") || args.length === 0) {
    usage();
  } else if (hasFlag("--list-projects")) {
    await listProjects();
  } else if (hasFlag("--list-agents-md")) {
    await listAgentsMd();
  } else {
    const project = getArg("--project");
    if (!project) throw new Error("Missing --project <slug>");

    if (hasFlag("--agents-md")) {
      await listAgentsMd(project);
    } else if (hasFlag("--list-tasks")) {
      await listTasks(project);
    } else if (getArg("--task")) {
      await printTask(project, getArg("--task"));
    } else {
      usage();
      process.exitCode = 1;
    }
  }
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
