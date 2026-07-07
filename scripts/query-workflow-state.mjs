import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { discoverTestingSessions } from "./testing-session-state.mjs";

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
  node scripts/query-workflow-state.mjs --project <slug> --snapshot
  node scripts/query-workflow-state.mjs --project <slug> --quarantine-imports
  node scripts/query-workflow-state.mjs --project <slug> --testing-sessions
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

async function countImportedSkillFiles(importDir) {
  const skillsDir = path.join(importDir, "skills");
  if (!(await exists(skillsDir))) return 0;

  const entries = await readdir(skillsDir, { withFileTypes: true });
  let count = 0;
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (await exists(path.join(skillsDir, entry.name, "SKILL.md"))) {
      count += 1;
    }
  }
  return count;
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
  if (projectSlug) {
    await loadProject(projectSlug);
  }

  const filtered = projectSlug
    ? entries.filter(
        (entry) => entry.owning_project === projectSlug || entry.role === "root-workflow-foundry",
      )
    : entries;

  if (
    projectSlug &&
    !filtered.some((entry) => entry.role === "project-domain" && entry.owning_project === projectSlug)
  ) {
    throw new Error(`Missing registered project AGENTS.md for ${projectSlug}`);
  }

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
      `${task.task_id}\t${task.task_kind ?? "workflow-change"}\t${task.status}\t${task.matt_phase}\t${task.updated_at}\t${task.title}`,
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

async function printTestingSessions(projectSlug) {
  await loadProject(projectSlug);

  const sessions = await discoverTestingSessions({ root, projectSlug });
  if (sessions.length === 0) {
    console.log("No testing sessions found.");
    return;
  }

  for (const session of sessions) {
    console.log(
      `${session.session_id}\t${session.status}\t${session.updated_at}\t${session.event_count}\t${session.path}\t${session.goal ?? ""}`,
    );
  }
}

async function printQuarantineImports(projectSlug) {
  const { projectDir } = await loadProject(projectSlug);
  const importsDir = path.join(projectDir, "quarantine", "imports");

  if (!(await exists(importsDir))) {
    console.log("No quarantine imports found.");
    return;
  }

  const entries = await readdir(importsDir, { withFileTypes: true });
  const importDirs = entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();

  if (importDirs.length === 0) {
    console.log("No quarantine imports found.");
    return;
  }

  for (const importId of importDirs) {
    const importDir = path.join(importsDir, importId);
    const markerFile = path.join(importDir, "quarantine.json");
    const importedSkillCount = await countImportedSkillFiles(importDir);

    if (!(await exists(markerFile))) {
      console.log(
        `${importId}\tmissing-quarantine-json\t${importedSkillCount}\tfalse\tfalse\t${path.relative(root, importDir)}`,
      );
      continue;
    }

    const marker = await readJson(markerFile);
    console.log(
      [
        marker.import_id ?? importId,
        marker.status ?? "unknown",
        marker.imported_skill_count ?? importedSkillCount,
        marker.callable === true ? "callable" : "not-callable",
        marker.report_as_project_skills === true ? "reportable-as-project-skills" : "not-project-skills",
        path.relative(root, markerFile),
      ].join("\t"),
    );
  }
}

async function printProjectSnapshot(projectSlug) {
  const { project, index } = await loadProject(projectSlug);
  const agentsEntries = await loadAgentsRegistry();
  const testingSessions = await discoverTestingSessions({ root, projectSlug });
  const projectAgents = agentsEntries.filter(
    (entry) => entry.owning_project === projectSlug || entry.role === "root-workflow-foundry",
  );

  if (!projectAgents.some((entry) => entry.role === "project-domain")) {
    throw new Error(`Missing registered project AGENTS.md for ${projectSlug}`);
  }

  console.log("PROJECT");
  console.log(`${project.project_slug}\t${project.project_state}\t${project.name}`);
  console.log(`goal\t${project.goal ?? ""}`);
  console.log(`domain\t${project.domain ?? ""}`);
  console.log(`agents_md\t${project.agents_md ?? ""}`);

  console.log("\nAGENTS_MD");
  for (const entry of projectAgents) {
    console.log(
      `${entry.path}\t${entry.role}\t${entry.scope}\t${entry.owning_project ?? "-"}\t${
        entry.live ? "live" : "inactive"
      }`,
    );
  }

  console.log("\nTASKS");
  const tasks = Array.isArray(index.tasks) ? index.tasks : [];
  if (tasks.length === 0) {
    console.log("No tasks found.");
    return;
  }

  for (const task of tasks) {
    console.log(
      `${task.task_id}\t${task.task_kind ?? "workflow-change"}\t${task.status}\t${task.matt_phase}\t${task.updated_at}\t${task.title}`,
    );
  }

  console.log("\nTESTING_SESSIONS");
  if (testingSessions.length === 0) {
    console.log("No testing sessions found.");
    return;
  }

  for (const session of testingSessions) {
    console.log(
      `${session.session_id}\t${session.status}\t${session.updated_at}\t${session.event_count}\t${session.path}\t${session.goal ?? ""}`,
    );
  }
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
    } else if (hasFlag("--snapshot")) {
      await printProjectSnapshot(project);
    } else if (hasFlag("--quarantine-imports")) {
      await printQuarantineImports(project);
    } else if (hasFlag("--testing-sessions")) {
      await printTestingSessions(project);
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
