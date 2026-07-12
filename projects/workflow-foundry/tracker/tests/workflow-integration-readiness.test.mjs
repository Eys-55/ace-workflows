import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { deriveCanonicalSkillCatalog } from "../../../../scripts/workflow-skill-catalog.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(testDir, "../../../..");

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

test("integrated main exposes the completed product builder without advancing downstream tasks", async () => {
  const [foundry006, foundry015, foundry016, health008, realLife006, catalog] = await Promise.all([
    readJson("projects/workflow-foundry/tasks/workflow-foundry-006.json"),
    readJson("projects/workflow-foundry/tasks/workflow-foundry-015.json"),
    readJson("projects/workflow-foundry/tasks/workflow-foundry-016.json"),
    readJson("projects/health/tasks/health-008.json"),
    readJson("projects/real-life-workflows/tasks/real-life-workflows-006.json"),
    deriveCanonicalSkillCatalog({ root }),
  ]);

  assert.deepEqual([foundry006.status, foundry015.status, foundry016.status], ["done", "done", "done"]);

  const productBuilder = catalog.skills.find((skill) => skill.name === "build-workflow-product");
  assert.equal(productBuilder?.runtimeVisibility, "canonical-active");
  assert.equal(productBuilder?.skillPath, ".agents/skills/build-workflow-product/SKILL.md");

  const selectedHealthSkills = health008.capability_dependencies.flatMap((dependency) =>
    dependency.selected_skills.map((skill) => skill.skill),
  );
  assert.ok(selectedHealthSkills.includes("build-workflow-product"));
  assert.equal(health008.status, "done");

  assert.equal(realLife006.status, "in-progress");
  assert.equal(realLife006.capability_dependencies, undefined);
});
