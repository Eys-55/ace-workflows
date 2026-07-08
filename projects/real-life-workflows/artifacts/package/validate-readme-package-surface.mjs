#!/usr/bin/env node

import { execFile } from "node:child_process";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const projectDir = path.join(root, "projects/real-life-workflows");
const errors = [];

function fail(message) {
  errors.push(message);
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function requireFile(relativePath) {
  const filePath = path.join(projectDir, relativePath);
  try {
    await access(filePath);
  } catch {
    fail(`${relativePath}: missing required file`);
  }
}

function requireIncludes(contents, needle, label) {
  if (!contents.includes(needle)) {
    fail(`${label}: missing "${needle}"`);
  }
}

function requireNotIncludes(contents, needle, label) {
  if (contents.toLowerCase().includes(needle.toLowerCase())) {
    fail(`${label}: must not include "${needle}"`);
  }
}

function requireOrder(contents, before, after, label) {
  const beforeIndex = contents.indexOf(before);
  const afterIndex = contents.indexOf(after);
  if (beforeIndex === -1 || afterIndex === -1 || beforeIndex >= afterIndex) {
    fail(`${label}: expected "${before}" before "${after}"`);
  }
}

async function validateReadme() {
  const readme = await readFile(path.join(projectDir, "README.md"), "utf8");

  requireIncludes(readme, "Search a large workflow universe", "README.md");
  requireIncludes(readme, "assets/hero.png", "README.md");
  requireIncludes(readme, "19,000+", "README.md");
  requireIncludes(readme, "171 curated workflow doors", "README.md");
  requireIncludes(readme, "17 source repos", "README.md");
  requireIncludes(readme, "source-universe estimate", "README.md");
  requireIncludes(readme, "artifacts/counts/upstream-source-universe-counts.json", "README.md");
  requireIncludes(readme, "real-life-workflow-search", "README.md");
  requireIncludes(readme, "npm install ./projects/real-life-workflows", "README.md");
  requireIncludes(readme, "## Agent Runtime Usage", "README.md");
  requireIncludes(readme, "Use $real-life-workflow-search", "README.md");
  requireIncludes(readme, "## Package Smoke Test", "README.md");
  requireIncludes(readme, "Use this only to verify the local package command wrapper", "README.md");
  requireIncludes(readme, "npx real-life-workflow-search", "README.md");
  requireOrder(readme, "## Agent Runtime Usage", "## Package Smoke Test", "README.md");
  requireNotIncludes(readme, "171 repos", "README.md");
  requireNotIncludes(readme, "## Call The Skill", "README.md");
}

async function validateCounts() {
  const counts = await readJson(path.join(projectDir, "artifacts/counts/upstream-source-universe-counts.json"));
  const totals = counts.totals ?? {};
  if (totals.curated_doors !== 171) fail("counts: curated_doors must be 171");
  if (totals.source_repos !== 17) fail("counts: source_repos must be 17");
  if (totals.headline_source_universe !== 19180) {
    fail("counts: headline_source_universe must be 19180");
  }
  if (totals.headline_display !== "19,000+") fail("counts: headline_display must be 19,000+");
  if (!Array.isArray(counts.claim_boundaries) || counts.claim_boundaries.length === 0) {
    fail("counts: claim_boundaries must be non-empty");
  }
}

async function validatePackageMetadata() {
  const packageJson = await readJson(path.join(projectDir, "package.json"));
  if (packageJson.name !== "@ace-workflows/real-life-workflows") {
    fail("package.json: package name mismatch");
  }
  if (packageJson.bin?.["real-life-workflow-search"] !== "./skills/real-life-workflow-search/scripts/write-workflow-packet.mjs") {
    fail("package.json: missing real-life-workflow-search bin");
  }
  if (packageJson.exports?.["./skills/real-life-workflow-search"] !== "./skills/real-life-workflow-search/SKILL.md") {
    fail("package.json: missing skill export");
  }
  const files = packageJson.files ?? [];
  const requiredFiles = [
    "README.md",
    "skill-manifest.json",
    "assets/hero.png",
    "artifacts/counts/upstream-source-universe-counts.json",
    "skills/real-life-workflow-search/**",
    "quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json",
  ];
  for (const requiredFile of requiredFiles) {
    if (!files.includes(requiredFile)) {
      fail(`package.json: files missing ${requiredFile}`);
    }
  }
  if (files.some((entry) => entry.includes("/skills/") && entry.startsWith("quarantine/"))) {
    fail("package.json: must not package quarantined imported skill folders");
  }
}

async function validateSkill() {
  const skill = await readFile(
    path.join(projectDir, "skills/real-life-workflow-search/SKILL.md"),
    "utf8",
  );
  requireIncludes(skill, "name: real-life-workflow-search", "SKILL.md");
  requireIncludes(skill, "description: Search the Real Life Workflows source universe", "SKILL.md");
  requireIncludes(skill, "full workflow-understanding packet", "SKILL.md");
  requireIncludes(skill, "caller or primary project's approved artifact area", "SKILL.md");
  requireIncludes(skill, "provenance", "SKILL.md");
  requireIncludes(skill, "`node_modules`", "SKILL.md");
  requireIncludes(skill, "not active callable skills", "SKILL.md");
  requireIncludes(skill, "## Agent Runtime Usage", "SKILL.md");
  requireIncludes(skill, "## Skill Invocation", "SKILL.md");
  requireIncludes(skill, "Use $real-life-workflow-search", "SKILL.md");
  requireIncludes(skill, "## Package Smoke Test", "SKILL.md");
  requireIncludes(skill, "not the\nnormal operator-facing skill invocation path", "SKILL.md");
  requireIncludes(skill, "npx real-life-workflow-search", "SKILL.md");
  requireNotIncludes(skill, "## Run", "SKILL.md");
  requireOrder(skill, "## Skill Invocation", "## Package Smoke Test", "SKILL.md");

  const openaiYaml = await readFile(
    path.join(projectDir, "skills/real-life-workflow-search/agents/openai.yaml"),
    "utf8",
  );
  requireIncludes(openaiYaml, "display_name: \"Real-Life Workflow Search\"", "openai.yaml");
  requireIncludes(openaiYaml, "default_prompt: \"Use $real-life-workflow-search", "openai.yaml");

  await requireFile("skills/real-life-workflow-search/scripts/write-workflow-packet.mjs");
}

async function validatePackDryRun() {
  const { stdout } = await execFileAsync("npm", ["pack", "--dry-run", "--json"], {
    cwd: projectDir,
    maxBuffer: 1024 * 1024 * 5,
  });
  const result = JSON.parse(stdout)[0];
  const packedFiles = new Set((result.files ?? []).map((file) => file.path));
  const requiredPackedFiles = [
    "README.md",
    "assets/hero.png",
    "artifacts/counts/upstream-source-universe-counts.json",
    "skill-manifest.json",
    "skills/real-life-workflow-search/SKILL.md",
    "skills/real-life-workflow-search/agents/openai.yaml",
    "skills/real-life-workflow-search/scripts/write-workflow-packet.mjs",
    "quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json",
    "quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-link-seed.json",
  ];
  for (const requiredFile of requiredPackedFiles) {
    if (!packedFiles.has(requiredFile)) {
      fail(`npm pack: missing ${requiredFile}`);
    }
  }
  for (const file of packedFiles) {
    if (file.startsWith("quarantine/imports/2026-07-07-market-research-agent/skills/")) {
      fail(`npm pack: quarantined imported skill leaked into package: ${file}`);
    }
  }
}

async function main() {
  await Promise.all([
    requireFile("README.md"),
    requireFile("assets/hero.png"),
    requireFile("package.json"),
    requireFile("skill-manifest.json"),
    requireFile("artifacts/counts/upstream-source-universe-counts.json"),
  ]);

  await validateReadme();
  await validateCounts();
  await validatePackageMetadata();
  await validateSkill();
  await validatePackDryRun();

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }

  console.log("README and package surface are valid.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
