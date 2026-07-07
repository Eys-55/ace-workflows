#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const finderDir = path.join(root, "projects/real-life-workflows/artifacts/finder");
const packetsDir = path.join(finderDir, "packets");

const packetFiles = [
  "healthcare-pediatrics.md",
  "document-evidence.md",
  "high-stakes-compliance.md",
];

const requiredCategories = [
  "## Direct Matches",
  "## Strong Adjacent Matches",
  "## Supporting Building Blocks",
  "## Maybe Useful",
];

const requiredEntryFields = [
  "- Why it matters:",
  "- Why it is here:",
  "- What it does:",
  "- Source link:",
  "- Local door/source path:",
  "- Reliability:",
  "- Possible skill to extract:",
];

const errors = [];

function fail(message) {
  errors.push(message);
}

async function readText(filePath) {
  return readFile(filePath, "utf8");
}

function requireIncludes(contents, needle, label) {
  if (!contents.includes(needle)) {
    fail(`${label}: missing "${needle}"`);
  }
}

function countRecommendations(contents) {
  return [...contents.matchAll(/^### /gm)].length;
}

async function validatePacket(fileName) {
  const filePath = path.join(packetsDir, fileName);
  const contents = await readText(filePath);

  requireIncludes(contents, "# Workflow Understanding Packet", fileName);
  requireIncludes(contents, "What type of work or workflow are you trying to understand?", fileName);

  for (const category of requiredCategories) {
    requireIncludes(contents, category, fileName);
  }

  for (const field of requiredEntryFields) {
    requireIncludes(contents, field, fileName);
  }

  const recommendationCount = countRecommendations(contents);
  if (recommendationCount === 0) {
    fail(`${fileName}: must include at least one recommendation`);
  }
  if (recommendationCount > 50) {
    fail(`${fileName}: must not exceed 50 visible recommendations`);
  }

  if (fileName === "high-stakes-compliance.md") {
    requireIncludes(contents, "Human review boundary", fileName);
    requireIncludes(contents, "does not prove compliance", fileName);
  }
}

async function validateAudit() {
  const auditPath = path.join(finderDir, "door-vs-leaf-count-audit.json");
  const audit = JSON.parse(await readText(auditPath));

  if (audit.door_count !== 171) {
    fail(`door-vs-leaf-count-audit.json: expected door_count 171, found ${audit.door_count}`);
  }

  if (typeof audit.workflow_link_count !== "number" || audit.workflow_link_count <= 0) {
    fail("door-vs-leaf-count-audit.json: workflow_link_count must be positive");
  }

  if (audit.door_count_is_final_workflow_count !== false) {
    fail("door-vs-leaf-count-audit.json: door_count_is_final_workflow_count must be false");
  }

  if (!Array.isArray(audit.candidate_type_counts) || audit.candidate_type_counts.length === 0) {
    fail("door-vs-leaf-count-audit.json: candidate_type_counts must be non-empty");
  }

  if (!Array.isArray(audit.safety_boundaries) || audit.safety_boundaries.length === 0) {
    fail("door-vs-leaf-count-audit.json: safety_boundaries must be non-empty");
  }

  const auditMd = await readText(path.join(finderDir, "door-vs-leaf-count-audit.md"));
  requireIncludes(auditMd, "171 access doors", "door-vs-leaf-count-audit.md");
  requireIncludes(auditMd, "not the final workflow count", "door-vs-leaf-count-audit.md");
}

async function main() {
  for (const packetFile of packetFiles) {
    await validatePacket(packetFile);
  }

  await validateAudit();

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }

  console.log("Finder artifacts are valid.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
