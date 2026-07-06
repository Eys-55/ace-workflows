import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const allowedProjectStates = new Set(["active", "paused", "archived"]);
const allowedStatuses = new Set(["todo", "in-progress", "blocked", "done"]);
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

function validateContextSnapshot(task, filePath) {
  requireObject(task, "context_snapshot", filePath);
  if (!task.context_snapshot) return;

  requireString(task.context_snapshot, "summary", filePath);
  requireArray(task.context_snapshot, "must_load", filePath);
}

function validateTask(task, filePath, projectSlug) {
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

  const taskIds = new Set();
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

    validateTask(task, taskFile, projectSlug);

    if (task.title !== item.title) {
      errors.push(`${relative(indexFile)} title mismatch for ${item.task_id}`);
    }

    if (task.status !== item.status) {
      errors.push(`${relative(indexFile)} status mismatch for ${item.task_id}`);
    }

    if (task.matt_phase !== item.matt_phase) {
      errors.push(`${relative(indexFile)} matt_phase mismatch for ${item.task_id}`);
    }
  }
}

const files = await listFiles(root);
for (const file of files) {
  if (file.includes(`${path.sep}.git${path.sep}`)) continue;
  if (file.endsWith(".py")) {
    errors.push(`${relative(file)} is forbidden: Python files are not allowed`);
  }
}

const agentsEntries = await validateAgentsRegistry(files);

const projectsDir = path.join(root, "projects");
if (await exists(projectsDir)) {
  const projectEntries = await readdir(projectsDir, { withFileTypes: true });
  for (const entry of projectEntries) {
    if (entry.isDirectory()) {
      await validateProject(path.join(projectsDir, entry.name), agentsEntries);
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Workflow state is valid.");
