import { existsSync, lstatSync, readFileSync, readdirSync, realpathSync } from "node:fs";
import { lstat, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { findCommandFirstViolations } from "./workflow-state-validation-rules.mjs";

export const SKILL_CATALOG_VERSION = 1;

const skillFrontmatterKeys = new Set(["name", "description"]);
const interfaceKeys = new Set(["display_name", "short_description", "default_prompt"]);

function catalogError(code, targetPath, message) {
  return { code, path: targetPath, message };
}

function normalizeRelative(root, targetPath) {
  return path.relative(root, targetPath).split(path.sep).join("/") || ".";
}

function isWithin(parent, candidate) {
  return candidate === parent || candidate.startsWith(`${parent}${path.sep}`);
}

async function inspectPath(targetPath) {
  try {
    return { stats: await lstat(targetPath), error: null };
  } catch (error) {
    return { stats: null, error };
  }
}

function parseScalar(rawValue, key) {
  const value = rawValue.trim();
  if (["|", ">", "|-", ">-", "|+", ">+"].includes(value)) {
    return { value: null, error: `${key} must use a single-line scalar.` };
  }
  if (/^[\[{&*!]/.test(value)) {
    return { value: null, error: `${key} uses an unsupported YAML value.` };
  }
  if (value.startsWith('"')) {
    if (value.length < 2 || !value.endsWith('"')) {
      return { value: null, error: `${key} has an unmatched double quote.` };
    }
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed !== "string") throw new TypeError("not a string");
      return { value: parsed.trim(), error: null };
    } catch {
      return { value: null, error: `${key} is not a supported double-quoted scalar.` };
    }
  }
  if (value.startsWith("'")) {
    if (value.length < 2 || !value.endsWith("'")) {
      return { value: null, error: `${key} has an unmatched single quote.` };
    }
    const inner = value.slice(1, -1);
    if (inner.replace(/''/g, "").includes("'")) {
      return { value: null, error: `${key} is not a supported single-quoted scalar.` };
    }
    return { value: inner.replace(/''/g, "'").trim(), error: null };
  }
  if (/['"]/.test(value)) {
    return { value: null, error: `${key} contains a quote outside a supported quoted scalar.` };
  }
  if (/\s+#/.test(value) || /:\s/.test(value)) {
    return { value: null, error: `${key} uses unsupported plain-scalar YAML syntax.` };
  }
  return { value, error: null };
}

function parseFlatMapping(lines, { allowedKeys, indentation = "", context }) {
  const fields = {};
  const errors = [];
  const seen = new Set();

  for (const [index, line] of lines.entries()) {
    if (line.trim() === "") continue;
    const pattern = indentation === "" ? /^([A-Za-z0-9_-]+):\s*(.*)$/ : /^ {2}([A-Za-z0-9_-]+):\s*(.*)$/;
    const field = line.match(pattern);
    if (!field || (indentation === "  " && !line.startsWith("  "))) {
      errors.push({
        code: "catalog-yaml-invalid",
        message: `${context} line ${index + 1} is outside the supported YAML subset.`,
      });
      continue;
    }
    const key = field[1];
    if (!allowedKeys.has(key)) {
      errors.push({
        code: "catalog-yaml-invalid",
        message: `${context} key ${key} is not supported.`,
      });
      continue;
    }
    if (seen.has(key)) {
      errors.push({
        code: "catalog-yaml-duplicate-key",
        message: `${context} repeats key ${key}.`,
      });
      continue;
    }
    seen.add(key);
    const scalar = parseScalar(field[2], key);
    if (scalar.error) {
      errors.push({ code: "catalog-yaml-invalid", message: `${context} ${scalar.error}` });
      continue;
    }
    fields[key] = scalar.value;
  }

  return { fields, errors };
}

export function parseCanonicalSkillFrontmatter(contents) {
  if (typeof contents !== "string") {
    return {
      fields: {},
      errors: [{ code: "catalog-yaml-invalid", message: "Skill contents must be text." }],
    };
  }
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) {
    return {
      fields: {},
      errors: [{ code: "catalog-yaml-invalid", message: "SKILL.md must start with closed YAML frontmatter." }],
    };
  }
  return parseFlatMapping(match[1].split(/\r?\n/), {
    allowedKeys: skillFrontmatterKeys,
    context: "Skill frontmatter",
  });
}

function parseInterfaceMetadata(contents) {
  if (typeof contents !== "string") {
    return {
      fields: {},
      errors: [{ code: "catalog-yaml-invalid", message: "Interface metadata must be text." }],
    };
  }
  const lines = contents.split(/\r?\n/);
  const nonEmpty = lines.map((line, index) => ({ line, index })).filter(({ line }) => line.trim() !== "");
  if (nonEmpty.length === 0 || nonEmpty[0].line !== "interface:") {
    return {
      fields: {},
      errors: [{ code: "catalog-yaml-invalid", message: "agents/openai.yaml must start with interface:." }],
    };
  }
  const trailing = lines.slice(nonEmpty[0].index + 1);
  const parsed = parseFlatMapping(trailing, {
    allowedKeys: interfaceKeys,
    indentation: "  ",
    context: "Interface metadata",
  });
  if (trailing.some((line) => line === "interface:")) {
    parsed.errors.push({
      code: "catalog-yaml-duplicate-key",
      message: "Interface metadata repeats key interface.",
    });
  }
  return parsed;
}

function validateSkillSemantics(contents) {
  const body = contents.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, "");
  const wordCount = body.match(/\b[A-Za-z0-9_$./<>:-]+\b/g)?.length ?? 0;
  const sectionCount = body.match(/^##\s+.+$/gm)?.length ?? 0;
  const instructionCount = body.match(/^\s*(?:\d+\.|[-*])\s+.+$/gm)?.length ?? 0;
  const hasContext = /\b(?:context|input|preflight|require|required|read|load|scope|when)\b/i.test(body);
  const hasWorkflow = /\b(?:workflow|process|step|route|start|run|open|review|build|create|validate)\b/i.test(body);
  const hasOutcome = /\b(?:output|result|return|report|complete|completion|boundary|blocker|failure|fail|stop|handoff)\b/i.test(body);
  const independentActions = new Set(
    (body.match(/\b(?:capture|check|classify|compare|create|derive|evaluate|grade|implement|inspect|load|open|produce|read|record|resolve|review|transform|validate|write)\b/gi) ?? [])
      .map((action) => action.toLowerCase()),
  );

  if (
    wordCount < 80 ||
    sectionCount < 2 ||
    instructionCount < 2 ||
    !hasContext ||
    !hasWorkflow ||
    !hasOutcome ||
    independentActions.size < 2
  ) {
    return catalogError(
      "catalog-semantic-thin-wrapper",
      "SKILL.md",
      "SKILL.md must define substantive context, independent workflow actions, failure or boundary behavior, and an output or completion contract.",
    );
  }
  return null;
}

function listBundleFilesSync(root, bundlePath, errors) {
  const files = [];
  function visit(directory) {
    let entries;
    try {
      entries = readdirSync(directory, { withFileTypes: true });
    } catch (error) {
      errors.push(catalogError("catalog-read-failed", normalizeRelative(root, directory), `${normalizeRelative(root, directory)} cannot be read: ${error.message}`));
      return;
    }
    for (const entry of entries) {
      const target = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) {
        errors.push(catalogError("catalog-symlink-forbidden", normalizeRelative(root, target), `${normalizeRelative(root, target)} must not be a symbolic link.`));
      } else if (entry.isDirectory()) visit(target);
      else if (entry.isFile()) files.push(target);
    }
  }
  visit(bundlePath);
  return files;
}

export function validateSkillBundle(options = {}) {
  const result = { ready: false, errors: [], skill: null, policyPaths: [] };
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    result.errors.push(catalogError("catalog-input-invalid", "bundle", "Bundle validation options must be an object."));
    return result;
  }
  const { ownershipBoundary, runtimeVisibility } = options;
  const expectedVisibility = {
    "canonical-foundry": "canonical-active",
    "project-packaged": "project-local-inactive",
    "standalone-product": "standalone-only",
  }[ownershipBoundary];
  if (!expectedVisibility || runtimeVisibility !== expectedVisibility || typeof options.root !== "string" || typeof options.bundlePath !== "string") {
    result.errors.push(catalogError("catalog-input-invalid", "bundle", "Bundle root, path, ownership, and runtime visibility must agree."));
    return result;
  }

  const root = path.resolve(options.root);
  const bundlePath = path.isAbsolute(options.bundlePath) ? path.resolve(options.bundlePath) : path.resolve(root, options.bundlePath);
  const relativeBundle = normalizeRelative(root, bundlePath);
  if (!isWithin(root, bundlePath)) {
    result.errors.push(catalogError("catalog-boundary-escape", relativeBundle, `${relativeBundle} resolves outside its declared product root.`));
    return result;
  }
  let resolvedRoot;
  try {
    if (lstatSync(root).isSymbolicLink()) throw new Error("declared product root is a symbolic link");
    resolvedRoot = realpathSync(root);
    let cursor = root;
    for (const segment of path.relative(root, bundlePath).split(path.sep).filter(Boolean)) {
      cursor = path.join(cursor, segment);
      if (lstatSync(cursor).isSymbolicLink()) throw new Error(`${normalizeRelative(root, cursor)} is a symbolic link`);
    }
  } catch (error) {
    result.errors.push(catalogError("catalog-symlink-forbidden", relativeBundle, `${relativeBundle} has an unsafe bundle path: ${error.message}`));
    return result;
  }

  const requiredPaths = [
    [bundlePath, "directory"],
    [path.join(bundlePath, "SKILL.md"), "file"],
    [path.join(bundlePath, "agents"), "directory"],
    [path.join(bundlePath, "agents", "openai.yaml"), "file"],
  ];
  for (const [targetPath, kind] of requiredPaths) {
    try {
      const stats = lstatSync(targetPath);
      if (stats.isSymbolicLink()) {
        result.errors.push(catalogError("catalog-symlink-forbidden", normalizeRelative(root, targetPath), `${normalizeRelative(root, targetPath)} must not be a symbolic link.`));
        continue;
      }
      if (kind === "file" ? !stats.isFile() : !stats.isDirectory()) throw new Error(`must be a regular ${kind}`);
      if (!isWithin(resolvedRoot, realpathSync(targetPath))) {
        result.errors.push(catalogError("catalog-boundary-escape", normalizeRelative(root, targetPath), `${normalizeRelative(root, targetPath)} resolves outside its product root.`));
      }
    } catch (error) {
      result.errors.push(catalogError("catalog-bundle-incomplete", normalizeRelative(root, targetPath), `${normalizeRelative(root, targetPath)} ${error.message}`));
    }
  }
  if (result.errors.length > 0) return result;

  const skillPath = path.join(bundlePath, "SKILL.md");
  const metadataPath = path.join(bundlePath, "agents", "openai.yaml");
  let skillContents;
  let metadataContents;
  try {
    skillContents = readFileSync(skillPath, "utf8");
    metadataContents = readFileSync(metadataPath, "utf8");
  } catch (error) {
    result.errors.push(catalogError("catalog-read-failed", relativeBundle, `${relativeBundle} cannot be read: ${error.message}`));
    return result;
  }
  const frontmatterResult = parseCanonicalSkillFrontmatter(skillContents);
  const metadataResult = parseInterfaceMetadata(metadataContents);
  const frontmatter = frontmatterResult.fields;
  const metadata = metadataResult.fields;
  for (const yamlError of [...frontmatterResult.errors, ...metadataResult.errors]) {
    result.errors.push(catalogError(yamlError.code, relativeBundle, yamlError.message));
  }
  const name = options.expectedName ?? path.basename(bundlePath);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name) || frontmatter.name !== name) {
    result.errors.push(catalogError("catalog-identity-mismatch", relativeBundle, `Skill identity must match lowercase-hyphenated folder ${name}.`));
  }
  if (!frontmatter.description?.trim()) result.errors.push(catalogError("catalog-trigger-missing", normalizeRelative(root, skillPath), "Skill frontmatter must include a trigger description."));
  for (const field of interfaceKeys) {
    if (!metadata[field]?.trim()) result.errors.push(catalogError("catalog-bundle-incomplete", normalizeRelative(root, metadataPath), `agents/openai.yaml must include interface.${field}.`));
  }
  const invocationPattern = new RegExp(`(^|[^A-Za-z0-9_-])\\$${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(?![A-Za-z0-9_-])`);
  if (metadata.default_prompt && !invocationPattern.test(metadata.default_prompt)) {
    result.errors.push(catalogError("catalog-invocation-mismatch", normalizeRelative(root, metadataPath), `Default prompt must invoke $${name}.`));
  }
  const semanticError = validateSkillSemantics(skillContents);
  if (semanticError) result.errors.push({ ...semanticError, path: normalizeRelative(root, skillPath) });

  const bundleFiles = listBundleFilesSync(root, bundlePath, result.errors);
  const supportFiles = bundleFiles.filter((file) => file !== skillPath && file !== metadataPath);
  for (const supportFile of supportFiles) {
    const relativeSupport = normalizeRelative(bundlePath, supportFile);
    if (!skillContents.includes(relativeSupport)) {
      result.errors.push(catalogError("catalog-unreferenced-helper", normalizeRelative(root, supportFile), `${relativeSupport} is not referenced directly by SKILL.md.`));
    }
  }
  const markdownContents = [];
  for (const markdownPath of [skillPath, ...supportFiles.filter((file) => path.extname(file).toLowerCase() === ".md")]) {
    let contents;
    try {
      contents = markdownPath === skillPath ? skillContents : readFileSync(markdownPath, "utf8");
    } catch (error) {
      result.errors.push(catalogError("catalog-read-failed", normalizeRelative(root, markdownPath), `${normalizeRelative(root, markdownPath)} cannot be read: ${error.message}`));
      continue;
    }
    markdownContents.push({ path: markdownPath, contents });
    for (const violation of findCommandFirstViolations(contents)) {
      result.errors.push(catalogError("catalog-command-first", `${normalizeRelative(root, markdownPath)}:${violation.line}`, `Operator command appears under non-support heading "${violation.heading}".`));
    }
  }

  const policyTexts = [];
  for (const declaredPolicy of Array.isArray(options.policyPaths) ? options.policyPaths : []) {
    const policyPath = path.isAbsolute(declaredPolicy) ? path.resolve(declaredPolicy) : path.resolve(root, declaredPolicy);
    try {
      if (!isWithin(root, policyPath) || lstatSync(policyPath).isSymbolicLink() || !lstatSync(policyPath).isFile() || !isWithin(resolvedRoot, realpathSync(policyPath))) throw new Error("policy escapes its product boundary");
      policyTexts.push(readFileSync(policyPath, "utf8"));
      result.policyPaths.push(normalizeRelative(root, policyPath));
    } catch (error) {
      result.errors.push(catalogError("catalog-policy-missing", normalizeRelative(root, policyPath), `${normalizeRelative(root, policyPath)} cannot provide product policy: ${error.message}`));
    }
  }
  if (ownershipBoundary !== "canonical-foundry" && policyTexts.length === 0) {
    result.errors.push(catalogError("catalog-policy-missing", relativeBundle, "Packaged and standalone bundles require product-owned policy context."));
  }
  const policyText = policyTexts.join("\n");
  if (/python\s+(?:is\s+)?(?:not allowed|forbidden)/i.test(policyText)) {
    for (const helper of supportFiles.filter((file) => /\.py$/i.test(file))) {
      result.errors.push(catalogError("catalog-policy-violation", normalizeRelative(root, helper), "Python helper violates the declared product policy."));
    }
    for (const markdown of markdownContents.filter(({ contents }) => /(?:^|\n)\s*(?:(?:[-*]|\d+[.)]|>)\s+|\$\s+)*(?:python|python3)\b/im.test(contents))) {
      result.errors.push(catalogError("catalog-policy-violation", normalizeRelative(root, markdown.path), "Python command violates the declared product policy."));
    }
  }
  result.ready = result.errors.length === 0;
  if (result.ready) {
    result.skill = {
      name,
      invocation: `$${name}`,
      description: frontmatter.description,
      displayName: metadata.display_name,
      shortDescription: metadata.short_description,
      defaultPrompt: metadata.default_prompt,
      bundlePath: relativeBundle,
      skillPath: normalizeRelative(root, skillPath),
      metadataPath: normalizeRelative(root, metadataPath),
      runtimeVisibility,
      runtimeTargets: ["codex"],
    };
  }
  return result;
}

export function validateCatalogInventoryText(contents, catalog) {
  if (typeof contents !== "string" || !Array.isArray(catalog?.skills)) {
    return [
      catalogError(
        "catalog-input-invalid",
        "catalog",
        "Catalog inventory validation requires text contents and a skills array.",
      ),
    ];
  }
  const known = new Set(catalog.skills.map((skill) => skill?.name).filter(Boolean));
  const errors = [];
  for (const [index, line] of contents.split(/\r?\n/).entries()) {
    const inventory = line.match(/^\s*-\s+\$([a-z0-9]+(?:-[a-z0-9]+)*)\s*(?::|$)/);
    if (!inventory || inventory[1] === "skill-name" || known.has(inventory[1])) continue;
    errors.push(
      catalogError(
        "catalog-phantom-entry",
        `line:${index + 1}`,
        `$${inventory[1]} is listed but has no complete canonical bundle.`,
      ),
    );
  }
  return errors;
}

export async function deriveCanonicalSkillCatalog(options = {}) {
  const result = {
    version: SKILL_CATALOG_VERSION,
    source: ".agents/skills",
    skills: [],
    errors: [],
  };
  if (typeof options !== "object" || options === null || Array.isArray(options)) {
    result.errors.push(catalogError("catalog-input-invalid", "options", "Catalog options must be an object."));
    return result;
  }
  const root = options.root ?? process.cwd();
  if (typeof root !== "string" || root.trim() === "") {
    result.errors.push(catalogError("catalog-input-invalid", "root", "Catalog root must be a path string."));
    return result;
  }

  const absoluteRoot = path.resolve(root);
  const agentsRoot = path.join(absoluteRoot, ".agents");
  const canonicalRoot = path.join(absoluteRoot, ".agents", "skills");
  const agentsInspection = await inspectPath(agentsRoot);
  if (!agentsInspection.error && agentsInspection.stats.isSymbolicLink()) {
    result.errors.push(
      catalogError("catalog-symlink-forbidden", ".agents", "Canonical .agents root must not be a symbolic link."),
    );
    return result;
  }
  const rootInspection = await inspectPath(canonicalRoot);
  if (rootInspection.error) {
    result.errors.push(
      catalogError("catalog-bundle-incomplete", ".agents/skills", "Canonical skill root is missing."),
    );
    return result;
  }
  if (rootInspection.stats.isSymbolicLink()) {
    result.errors.push(
      catalogError("catalog-symlink-forbidden", ".agents/skills", "Canonical skill root must not be a symbolic link."),
    );
    return result;
  }
  if (!rootInspection.stats.isDirectory()) {
    result.errors.push(
      catalogError("catalog-read-failed", ".agents/skills", "Canonical skill root must be a directory."),
    );
    return result;
  }

  let entries;
  try {
    entries = await readdir(canonicalRoot, { withFileTypes: true });
  } catch (error) {
    result.errors.push(
      catalogError("catalog-read-failed", ".agents/skills", `Canonical skill root cannot be read: ${error.message}`),
    );
    return result;
  }

  const candidates = [...entries].sort((a, b) => a.name.localeCompare(b.name));
  for (const entry of candidates) {
    const bundlePath = path.join(canonicalRoot, entry.name);
    if (entry.isSymbolicLink()) {
      const relativeBundle = normalizeRelative(absoluteRoot, bundlePath);
      result.errors.push(catalogError("catalog-symlink-forbidden", relativeBundle, `${relativeBundle} must not be a symbolic link.`));
      continue;
    }
    if (!entry.isDirectory()) continue;
    const validation = validateSkillBundle({
      root: absoluteRoot,
      bundlePath,
      expectedName: entry.name,
      ownershipBoundary: "canonical-foundry",
      runtimeVisibility: "canonical-active",
      policyPaths: [],
    });
    if (!validation.ready) result.errors.push(...validation.errors);
    else result.skills.push(validation.skill);
  }

  return result;
}
