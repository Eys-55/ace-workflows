import { execFile } from "node:child_process";
import { readdir, readFile, stat } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import {
  deriveCanonicalSkillCatalog,
  parseCanonicalSkillFrontmatter,
  validateCatalogInventoryText,
} from "./workflow-skill-catalog.mjs";
import { createProjectValidation } from "./workflow-state-project-validation.mjs";
import {
  allowedAgentRoles,
  allowedQuarantineStatuses,
  createValidationRules,
  findCommandFirstViolations,
  projectAgentsForbiddenPatterns,
} from "./workflow-state-validation-rules.mjs";
import { validateTestingSessionState } from "./testing-session-state.mjs";

const execFileAsync = promisify(execFile);

export async function validateWorkflowState(options = {}) {
  if (
    typeof options !== "object" ||
    options === null ||
    Array.isArray(options) ||
    (options.root !== undefined && (typeof options.root !== "string" || options.root.trim() === ""))
  ) {
    return {
      ok: false,
      errors: ["validator-input-invalid: options must be an object with an optional path-string root"],
    };
  }

  const requestedRoot = options.root ?? process.cwd();
  const root = path.resolve(requestedRoot);
  const errors = [];

  async function exists(filePath) {
    try {
      await stat(filePath);
      return true;
    } catch {
      return false;
    }
  }

  async function listFiles(directory) {
    if (!(await exists(directory))) return [];
    const entries = await readdir(directory, { withFileTypes: true });
    const files = [];
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) files.push(...(await listFiles(fullPath)));
      else files.push(fullPath);
    }
    return files;
  }

  function relative(filePath) {
    return path.relative(root, filePath);
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

  const validationRules = createValidationRules({ errors, relative });
  const { requireArray, requireString } = validationRules;
  const { validateProject } = createProjectValidation({
    root,
    errors,
    exists,
    readJson,
    relative,
    rules: validationRules,
  });

  async function listRepositoryFiles() {
    try {
      const { stdout } = await execFileAsync(
        "git",
        ["ls-files", "-z", "--cached", "--others", "--exclude-standard"],
        { cwd: root },
      );
      return stdout
        .split("\0")
        .filter(Boolean)
        .map((file) => path.join(root, file));
    } catch (error) {
      errors.push(`git file inventory failed: ${error.message}`);
      return [];
    }
  }

  async function validateNoLegacyWorkflowTokens() {
    const retiredPrefix = String.fromCharCode(109, 97, 116, 116);
    const retiredSurname = String.fromCharCode(112, 111, 99, 111, 99, 107);
    const retiredNamePattern = new RegExp(`\\b(?:${retiredPrefix}|${retiredSurname})\\b`, "i");
    const legacyTokens = [
      [retiredPrefix, retiredSurname].join(" "),
      [retiredPrefix, "phase"].join("_"),
      ["phase", "guard"].join("_"),
      ["explicit", "next", "action", "required"].join("_"),
      ["initiate", "task"].join("-"),
      ["continue", "task"].join("-"),
      ["ask", retiredPrefix].join("-"),
      ["grill", "with", "docs"].join("-"),
      ["to", "prd"].join("-"),
      ["to", "issues"].join("-"),
      ["grill", "ing"].join(""),
    ];
    for (const filePath of await listRepositoryFiles()) {
      if (!(await exists(filePath))) continue;
      const contents = await readText(filePath);
      if (contents.includes("\0")) continue;
      const normalized = contents.toLowerCase();
      if (retiredNamePattern.test(contents)) {
        errors.push(`${relative(filePath)} contains a removed workflow name`);
      }
      for (const token of legacyTokens) {
        if (normalized.includes(token)) {
          errors.push(`${relative(filePath)} contains removed workflow token "${token}"`);
        }
      }
    }
  }

  function parseSkillFrontmatter(contents, filePath) {
    const parsed = parseCanonicalSkillFrontmatter(contents);
    for (const issue of parsed.errors) {
      errors.push(`${relative(filePath)} ${issue.code}: ${issue.message}`);
    }
    for (const key of ["name", "description"]) {
      if (!parsed.fields[key]) {
        errors.push(`${relative(filePath)} frontmatter must include "${key}"`);
      }
    }
    return parsed.fields;
  }

  function validateNoPrimarySlashInvocation(filePath, contents, skillNames) {
    const escapedNames = skillNames.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
    if (escapedNames.length === 0) return;
    const pattern = new RegExp(`(^|\\s)/(?:${escapedNames.join("|")})\\b`);
    if (pattern.test(contents)) {
      errors.push(
        `${relative(filePath)} must use $skill-name invocation, not primary slash-command invocation`,
      );
    }
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

  async function validateSkillFirstRuntimeSurfaces(files) {
    for (const filePath of files.filter(isSkillFirstRuntimeSurfaceFile)) {
      const contents = await readText(filePath);
      for (const violation of findCommandFirstViolations(contents)) {
        errors.push(
          `${relative(filePath)}:${violation.line} presents command-first skill usage under "${violation.heading}"; move commands under an exact Developer Verification, Developer Verification Mode, Package Smoke Test, Deterministic Validation, Query Helper, or Internal Support heading`,
        );
      }
    }
  }

  async function validateSkillSurface(files) {
    const skillRoot = path.join(root, ".agents", "skills");
    if (!(await exists(skillRoot))) {
      errors.push(".agents/skills is missing");
      return { version: 1, source: ".agents/skills", skills: [], errors: [] };
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

    const catalog = await deriveCanonicalSkillCatalog({ root });
    for (const issue of catalog.errors) {
      errors.push(`${issue.path}: ${issue.code}: ${issue.message}`);
    }
    const helpFile = path.join(root, ".agents", "skills", "workflow-help", "SKILL.md");
    if (await exists(helpFile)) {
      const helpContents = await readText(helpFile);
      if (!helpContents.includes("--skill-catalog")) {
        errors.push(
          ".agents/skills/workflow-help/SKILL.md must consume the derived --skill-catalog query instead of a manual inventory",
        );
      }
      if (helpContents.includes("CODEX-DISCOVERABLE SKILL FILES")) {
        errors.push(
          ".agents/skills/workflow-help/SKILL.md must not maintain a hard-coded skill-file inventory",
        );
      }
      for (const issue of validateCatalogInventoryText(helpContents, catalog)) {
        errors.push(`.agents/skills/workflow-help/SKILL.md ${issue.code}: ${issue.message}`);
      }
    }
    for (const filePath of [
      path.join(root, "AGENTS.md"),
      path.join(root, ".agents", "skills", "workflow-help", "SKILL.md"),
    ]) {
      if (await exists(filePath)) {
        validateNoPrimarySlashInvocation(
          filePath,
          await readText(filePath),
          catalog.skills.map((skill) => skill.name),
        );
      }
    }
    return catalog;
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
        errors.push(`${relative(registryFile)} entry ${entry.path} owning_project must be string or null`);
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

  function listSkillImportFiles(files, importRoot) {
    const relativeImportRoot = relative(importRoot);
    return files
      .map(relative)
      .filter(
        (file) =>
          file.startsWith(`${relativeImportRoot}/skills/`) && file.endsWith("/SKILL.md"),
      )
      .sort();
  }

  async function validateQuarantineImport(projectSlug, importRoot, files) {
    const markerFile = path.join(importRoot, "quarantine.json");
    const markerPath = relative(markerFile);
    const skillFiles = listSkillImportFiles(files, importRoot);
    if (skillFiles.length === 0) return;
    if (!(await exists(markerFile))) {
      errors.push(`${relative(importRoot)} contains imported skills but is missing quarantine.json`);
      return;
    }
    const marker = await readJson(markerFile);
    if (!marker) return;
    for (const key of ["project_slug", "import_id", "status", "active_skill_surface_path"]) {
      requireString(marker, key, markerFile);
    }
    requireArray(marker, "boundaries", markerFile);
    requireArray(marker, "imported_skills", markerFile);
    const expectedImportId = path.basename(importRoot);
    if (marker.import_id !== expectedImportId) {
      errors.push(`${markerPath} import_id must equal "${expectedImportId}"`);
    }
    if (marker.project_slug !== projectSlug) {
      errors.push(`${markerPath} project_slug must equal "${projectSlug}"`);
    }
    if (!allowedQuarantineStatuses.has(marker.status)) {
      errors.push(`${markerPath} status must be "quarantined"`);
    }
    for (const [key, expected] of Object.entries({
      source_evidence_only: true,
      callable: false,
      active_skill_surface: false,
      discoverable_as_active_skill: false,
      report_as_project_skills: false,
      promotable_as_is: false,
    })) {
      if (marker[key] !== expected) errors.push(`${markerPath} ${key} must be ${expected}`);
    }
    if (marker.imported_skill_count !== skillFiles.length) {
      errors.push(
        `${markerPath} imported_skill_count must equal imported SKILL.md count ${skillFiles.length}`,
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
        errors.push(`${markerPath} imported_skills must include ${skillFile}`);
      }
    }
    for (const skillPath of markerSkillPaths) {
      if (!actualSkillPaths.has(skillPath)) {
        errors.push(`${markerPath} imported_skills includes missing file ${skillPath}`);
      }
    }
  }

  async function validateQuarantineImports(files) {
    const importRoots = new Set();
    for (const file of files) {
      const match = relative(file).match(
        /^(projects\/[^/]+)\/quarantine\/imports\/([^/]+)\/skills\/[^/]+\/SKILL\.md$/,
      );
      if (match) importRoots.add(`${match[1]}/quarantine/imports/${match[2]}`);
    }
    for (const importRoot of [...importRoots].sort()) {
      const [, projectSlug] = importRoot.match(/^projects\/([^/]+)\/quarantine\/imports\//) ?? [];
      if (projectSlug) await validateQuarantineImport(projectSlug, path.join(root, importRoot), files);
    }
  }

  const files = await listFiles(root);
  for (const file of files) {
    if (!file.includes(`${path.sep}.git${path.sep}`) && file.endsWith(".py")) {
      errors.push(`${relative(file)} is forbidden: Python files are not allowed`);
    }
  }
  const skillCatalog = await validateSkillSurface(files);
  await validateSkillFirstRuntimeSurfaces(files);
  await validateQuarantineImports(files);
  await validateNoLegacyWorkflowTokens();
  const agentsEntries = await validateAgentsRegistry(files);

  const projectsDir = path.join(root, "projects");
  if (await exists(projectsDir)) {
    const entries = await readdir(projectsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        await validateProject(path.join(projectsDir, entry.name), agentsEntries, skillCatalog);
      }
    }
  }
  errors.push(...(await validateTestingSessionState({ root })));

  return { ok: errors.length === 0, errors: [...errors] };
}
