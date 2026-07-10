import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  deriveCanonicalSkillCatalog,
  validateCatalogInventoryText,
  validateSkillBundle,
} from "../../../../scripts/workflow-skill-catalog.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../../..");

async function writeSkill(root, name, { metadata = true, invocation = `$${name}`, bundlePath = null } = {}) {
  const bundle = bundlePath ?? path.join(root, ".agents", "skills", name);
  await mkdir(path.join(bundle, "agents"), { recursive: true });
  await writeFile(
    path.join(bundle, "SKILL.md"),
    [
      "---",
      `name: ${name}`,
      `description: Use when the fixture needs ${name}.`,
      "---",
      "",
      `# ${name}`,
      "",
      "Use this fixture skill when a caller needs a deterministic catalog example.",
      "It accepts one named request and keeps all writes inside the fixture root.",
      "",
      "## Required Context",
      "",
      "Read the fixture request, the local policy, and the expected output path.",
      "Stop when any required value is missing or the destination is ambiguous.",
      "",
      "## Workflow",
      "",
      "1. Validate the named input and confirm the allowed boundary.",
      "2. Produce the smallest requested fixture output.",
      "3. Compare the observed result with the declared contract.",
      "4. Record a stable failure instead of guessing when validation fails.",
      "",
      "## Output Contract",
      "",
      "Return the selected identity, observed files, validation result, and blockers.",
      "Do not report completion until required evidence exists and review passes.",
      "",
    ].join("\n"),
  );
  if (metadata) {
    await writeFile(
      path.join(bundle, "agents", "openai.yaml"),
      `interface:\n  display_name: "Fixture"\n  short_description: "Fixture skill"\n  default_prompt: "Use ${invocation} for this fixture."\n`,
    );
  }
  return bundle;
}

test("uses one substantive bundle validator for packaged products without catalog promotion", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-packaged-bundle-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const policyPath = path.join(root, "projects", "fixture", "AGENTS.md");
  await mkdir(path.dirname(policyPath), { recursive: true });
  await writeFile(policyPath, "# Fixture Policy\n\nPython is not allowed. Keep commands under developer verification.\n");
  const bundlePath = await writeSkill(root, "packaged-skill", {
    bundlePath: path.join(root, "projects", "fixture", "skills", "packaged-skill"),
  });

  const validation = validateSkillBundle({
    root,
    bundlePath,
    ownershipBoundary: "project-packaged",
    runtimeVisibility: "project-local-inactive",
    policyPaths: [policyPath],
  });
  assert.equal(validation.ready, true);
  assert.deepEqual(validation.errors, []);

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.deepEqual(catalog.skills, []);
});

test("generic bundle validation rejects duplicate YAML, commands, helpers, and policy violations", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-generic-bundle-invalid-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const policyPath = path.join(root, "projects", "fixture", "AGENTS.md");
  await mkdir(path.dirname(policyPath), { recursive: true });
  await writeFile(policyPath, "# Fixture Policy\n\nPython is not allowed in this product.\n");
  const bundlePath = await writeSkill(root, "invalid-packaged", {
    bundlePath: path.join(root, "projects", "fixture", "skills", "invalid-packaged"),
  });
  await writeFile(
    path.join(bundlePath, "agents", "openai.yaml"),
    'interface:\n  display_name: "First"\n  display_name: "Second"\n  short_description: "Invalid"\n  default_prompt: "Use $invalid-packaged."\n',
  );
  await mkdir(path.join(bundlePath, "references"), { recursive: true });
  await writeFile(path.join(bundlePath, "references", "unused.md"), "unused\n");
  await mkdir(path.join(bundlePath, "scripts"), { recursive: true });
  await writeFile(path.join(bundlePath, "scripts", "helper.py"), "print('helper')\n");
  const skillPath = path.join(bundlePath, "SKILL.md");
  const skill = await readFile(skillPath, "utf8");
  await writeFile(skillPath, `${skill}\nUse scripts/helper.py when needed.\n\n## Workflow Commands\n\nnpm install unsafe-helper\n\n## Developer Verification\n\npython scripts/helper.py\n`);

  const validation = validateSkillBundle({
    root,
    bundlePath,
    ownershipBoundary: "project-packaged",
    runtimeVisibility: "project-local-inactive",
    policyPaths: [policyPath],
  });
  assert.equal(validation.ready, false);
  assert.ok(validation.errors.some((error) => error.code === "catalog-yaml-duplicate-key"));
  assert.ok(validation.errors.some((error) => error.code === "catalog-unreferenced-helper"));
  assert.ok(validation.errors.some((error) => error.code === "catalog-command-first"));
  assert.ok(validation.errors.some((error) => error.code === "catalog-policy-violation"));
});

test("derives complete canonical bundles and excludes packaged skills", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-fixture-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeSkill(root, "alpha-skill");
  await writeSkill(path.join(root, "projects", "fixture"), "packaged-skill");

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.deepEqual(catalog.errors, []);
  assert.deepEqual(catalog.skills.map((skill) => skill.name), ["alpha-skill"]);
  assert.equal(catalog.skills[0].invocation, "$alpha-skill");
  assert.equal(catalog.skills[0].runtimeVisibility, "canonical-active");
});

test("rejects incomplete metadata and mismatched default invocation", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-invalid-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeSkill(root, "missing-metadata", { metadata: false });
  await writeSkill(root, "wrong-invocation", { invocation: "$another-skill" });

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.ok(catalog.errors.some((error) => error.code === "catalog-bundle-incomplete"));
  assert.ok(catalog.errors.some((error) => error.code === "catalog-invocation-mismatch"));
  assert.deepEqual(catalog.skills, []);
});

test("reconciles the current workflow-tracker-ui help mismatch from one catalog", async () => {
  const catalog = await deriveCanonicalSkillCatalog({ root: repoRoot });
  const help = await readFile(
    path.join(repoRoot, ".agents", "skills", "workflow-help", "SKILL.md"),
    "utf8",
  );

  assert.deepEqual(catalog.errors, []);
  assert.ok(catalog.skills.some((skill) => skill.name === "workflow-tracker-ui"));
  assert.match(help, /--skill-catalog/);
  assert.doesNotMatch(help, /CODEX-DISCOVERABLE SKILL FILES/);
});

test("rejects malformed YAML shapes, prefix invocations, and phantom inventory entries", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-yaml-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeSkill(root, "prefix-skill", { invocation: "$prefix-skill-extra" });
  await writeSkill(root, "block-description");
  await writeFile(
    path.join(root, ".agents", "skills", "block-description", "SKILL.md"),
    "---\nname: block-description\ndescription: |\n  multiline trigger\n---\n\n# Block\n",
  );
  await writeSkill(root, "nested-metadata");
  await writeFile(
    path.join(root, ".agents", "skills", "nested-metadata", "agents", "openai.yaml"),
    "not_interface:\n  display_name: \"Wrong\"\n  short_description: \"Wrong\"\n  default_prompt: \"Use $nested-metadata.\"\n",
  );

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.equal(catalog.skills.length, 0);
  assert.ok(catalog.errors.some((error) => error.code === "catalog-invocation-mismatch"));
  assert.ok(catalog.errors.some((error) => error.code === "catalog-trigger-missing"));
  assert.ok(catalog.errors.some((error) => error.code === "catalog-bundle-incomplete"));

  const phantom = validateCatalogInventoryText("ACTIVE SKILLS\n- $phantom-skill", {
    skills: [],
  });
  assert.deepEqual(phantom.map((error) => error.code), ["catalog-phantom-entry"]);
});

test("rejects an unreferenced support helper", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-helper-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeSkill(root, "helper-skill");
  const helper = path.join(root, ".agents", "skills", "helper-skill", "references", "unused.md");
  await mkdir(path.dirname(helper), { recursive: true });
  await writeFile(helper, "unused\n");

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.ok(catalog.errors.some((error) => error.code === "catalog-unreferenced-helper"));
  assert.deepEqual(catalog.skills, []);
});

test("rejects duplicate keys and unmatched quotes in the supported YAML subset", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-strict-yaml-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  await writeSkill(root, "duplicate-frontmatter");
  await writeFile(
    path.join(root, ".agents", "skills", "duplicate-frontmatter", "SKILL.md"),
    [
      "---",
      "name: duplicate-frontmatter",
      "name: shadow-name",
      "description: Use when duplicate keys must fail.",
      "---",
      "",
      "# Duplicate",
    ].join("\n"),
  );

  await writeSkill(root, "unmatched-quote");
  await writeFile(
    path.join(root, ".agents", "skills", "unmatched-quote", "SKILL.md"),
    "---\nname: unmatched-quote\ndescription: \"Use when a quote is never closed.\n---\n\n# Invalid\n",
  );

  await writeSkill(root, "duplicate-interface");
  await writeFile(
    path.join(root, ".agents", "skills", "duplicate-interface", "agents", "openai.yaml"),
    [
      "interface:",
      "  display_name: \"First\"",
      "  display_name: \"Second\"",
      "  short_description: \"Duplicate metadata\"",
      "  default_prompt: \"Use $duplicate-interface.\"",
    ].join("\n"),
  );

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.deepEqual(catalog.skills, []);
  assert.equal(
    catalog.errors.filter((error) => error.code === "catalog-yaml-duplicate-key").length,
    2,
  );
  assert.ok(catalog.errors.some((error) => error.code === "catalog-yaml-invalid"));
});

test("rejects symlinked bundles, bundle parents, and required files", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-symlinks-"));
  const outside = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-outside-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  t.after(() => rm(outside, { recursive: true, force: true }));

  await writeSkill(outside, "linked-bundle");
  await mkdir(path.join(root, ".agents", "skills"), { recursive: true });
  await symlink(
    path.join(outside, ".agents", "skills", "linked-bundle"),
    path.join(root, ".agents", "skills", "linked-bundle"),
  );

  const requiredLinkBundle = path.join(root, ".agents", "skills", "linked-required-file");
  await mkdir(path.join(requiredLinkBundle, "agents"), { recursive: true });
  await writeFile(
    path.join(outside, "outside-skill.md"),
    "---\nname: linked-required-file\ndescription: Use when links must fail.\n---\n\n# Linked\n",
  );
  await symlink(path.join(outside, "outside-skill.md"), path.join(requiredLinkBundle, "SKILL.md"));
  await writeFile(
    path.join(requiredLinkBundle, "agents", "openai.yaml"),
    "interface:\n  display_name: \"Linked\"\n  short_description: \"Linked\"\n  default_prompt: \"Use $linked-required-file.\"\n",
  );

  const linkedParentBundle = path.join(root, ".agents", "skills", "linked-agents-parent");
  await mkdir(linkedParentBundle, { recursive: true });
  await writeFile(
    path.join(linkedParentBundle, "SKILL.md"),
    "---\nname: linked-agents-parent\ndescription: Use when parent links must fail.\n---\n\n# Linked\n",
  );
  await mkdir(path.join(outside, "agents-parent"), { recursive: true });
  await writeFile(
    path.join(outside, "agents-parent", "openai.yaml"),
    "interface:\n  display_name: \"Linked\"\n  short_description: \"Linked\"\n  default_prompt: \"Use $linked-agents-parent.\"\n",
  );
  await symlink(path.join(outside, "agents-parent"), path.join(linkedParentBundle, "agents"));

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.deepEqual(catalog.skills, []);
  assert.equal(
    catalog.errors.filter((error) => error.code === "catalog-symlink-forbidden").length,
    3,
  );
});

test("rejects a canonical root reached through a symlinked parent", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-linked-root-"));
  const outside = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-linked-root-outside-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await writeSkill(outside, "outside-skill");
  await symlink(path.join(outside, ".agents"), path.join(root, ".agents"));

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.deepEqual(catalog.skills, []);
  assert.ok(catalog.errors.some((error) => error.code === "catalog-symlink-forbidden"));
});

test("rejects a validly shaped but semantically thin wrapper", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-thin-wrapper-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeSkill(root, "thin-wrapper");
  await writeFile(
    path.join(root, ".agents", "skills", "thin-wrapper", "SKILL.md"),
    "---\nname: thin-wrapper\ndescription: Use when the helper should do the work.\n---\n\n# Thin Wrapper\n\nRun the helper script.\n",
  );

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.deepEqual(catalog.skills, []);
  assert.ok(catalog.errors.some((error) => error.code === "catalog-semantic-thin-wrapper"));
});

test("rejects a padded pointer-only wrapper with headings and list items", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-padded-wrapper-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeSkill(root, "padded-wrapper");
  await writeFile(
    path.join(root, ".agents", "skills", "padded-wrapper", "SKILL.md"),
    [
      "---",
      "name: padded-wrapper",
      "description: Use when a padded pointer should still fail.",
      "---",
      "",
      "# Padded Wrapper",
      "",
      "This wrapper is for a caller when the named helper is present. The surrounding",
      "language repeats policy, ownership, safety, quality, evidence, state, identity,",
      "scope, intent, routing, artifacts, metadata, evaluation, and completion terms",
      "without defining any independent behavior of its own.",
      "",
      "## Required Context",
      "",
      "Use the request, helper name, project name, task name, phase name, target name,",
      "runtime name, evidence name, owner name, and status name supplied by the caller.",
      "",
      "## Workflow",
      "",
      "1. Use $other-skill for the actual workflow.",
      "2. Run the helper for the actual behavior.",
      "3. Invoke $other-skill for every decision.",
      "4. Call the helper again for every branch.",
      "",
      "## Output Contract",
      "",
      "The output, result, failure, boundary, blocker, handoff, and completion status",
      "all come from the other skill. If it cannot act, stop without a local outcome.",
      "",
    ].join("\n"),
  );

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.deepEqual(catalog.skills, []);
  assert.ok(catalog.errors.some((error) => error.code === "catalog-semantic-thin-wrapper"));
});

test("returns structured errors for malformed catalog inputs instead of throwing", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-catalog-malformed-input-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, ".agents"), { recursive: true });
  await writeFile(path.join(root, ".agents", "skills"), "not a directory\n");

  const catalog = await deriveCanonicalSkillCatalog({ root });
  assert.deepEqual(catalog.skills, []);
  assert.ok(catalog.errors.some((error) => error.code === "catalog-read-failed"));

  const invalidOptions = await deriveCanonicalSkillCatalog(null);
  assert.deepEqual(invalidOptions.skills, []);
  assert.ok(invalidOptions.errors.some((error) => error.code === "catalog-input-invalid"));

  assert.deepEqual(validateCatalogInventoryText(null, null), [
    {
      code: "catalog-input-invalid",
      path: "catalog",
      message: "Catalog inventory validation requires text contents and a skills array.",
    },
  ]);
});

test("uses the same catalog module across validator, query, lifecycle, dependency, and tracker consumers", async () => {
  const files = await Promise.all(
    [
      "scripts/workflow-state-validation-core.mjs",
      "scripts/query-workflow-state.mjs",
      "projects/workflow-foundry/tracker/src/lib/workflow-state.mjs",
      ".agents/skills/workflow-help/SKILL.md",
      ".agents/skills/initiate-task/SKILL.md",
      ".agents/skills/continue-task/SKILL.md",
    ].map(async (relativePath) => ({
      relativePath,
      contents: await readFile(path.join(repoRoot, relativePath), "utf8"),
    })),
  );

  for (const file of files.slice(0, 3)) {
    assert.match(
      file.contents,
      /workflow-skill-catalog\.mjs/,
      `${file.relativePath} must import the shared catalog`,
    );
  }
  for (const file of files.slice(3)) {
    assert.match(file.contents, /--skill-catalog/);
  }
});
