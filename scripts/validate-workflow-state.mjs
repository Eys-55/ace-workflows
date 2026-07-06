import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
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
    "dependencies",
    "related_tasks",
    "linked_artifacts",
    "session_log",
  ]) {
    requireArray(task, key, filePath);
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

async function validateProject(projectDir) {
  const projectSlug = path.basename(projectDir);
  const projectFile = path.join(projectDir, "project.json");
  const indexFile = path.join(projectDir, "tasks", "index.json");

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

  if (project.project_slug !== projectSlug) {
    errors.push(`${relative(projectFile)} project_slug must equal "${projectSlug}"`);
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
    if (task) validateTask(task, taskFile, projectSlug);
  }
}

const files = await listFiles(root);
for (const file of files) {
  if (file.includes(`${path.sep}.git${path.sep}`)) continue;
  if (file.endsWith(".py")) {
    errors.push(`${relative(file)} is forbidden: Python files are not allowed`);
  }
}

const projectsDir = path.join(root, "projects");
if (await exists(projectsDir)) {
  const projectEntries = await readdir(projectsDir, { withFileTypes: true });
  for (const entry of projectEntries) {
    if (entry.isDirectory()) {
      await validateProject(path.join(projectsDir, entry.name));
    }
  }
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log("Workflow state is valid.");
