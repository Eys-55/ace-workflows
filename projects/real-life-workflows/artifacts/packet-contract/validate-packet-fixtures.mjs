#!/usr/bin/env node

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const contractDir = path.join(root, "projects/real-life-workflows/artifacts/packet-contract");
const fixturesDir = path.join(contractDir, "fixtures");

const requiredCategories = [
  "Direct Matches",
  "Strong Adjacent Matches",
  "Supporting Building Blocks",
  "Maybe Useful",
];

const requiredRecommendationFields = [
  "workflow_name",
  "why_it_matters",
  "why_it_is_here",
  "what_it_does",
  "source_link",
  "local_door_source_path",
  "reliability",
  "possible_skill_to_extract",
];

const requiredFixtureTypes = new Set([
  "narrow",
  "broad",
  "supporting_building_blocks",
  "high_stakes",
]);

const errors = [];

function fail(message) {
  errors.push(message);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function requireNonEmptyString(object, key, fileName) {
  if (!isNonEmptyString(object?.[key])) {
    fail(`${fileName}: missing non-empty string field "${key}"`);
  }
}

function validateRecommendation(recommendation, fileName, categoryName, index) {
  for (const field of requiredRecommendationFields) {
    requireNonEmptyString(recommendation, field, `${fileName} ${categoryName}[${index}]`);
  }
}

function validateCategory(category, fileName) {
  requireNonEmptyString(category, "name", fileName);

  if (!Array.isArray(category.recommendations)) {
    fail(`${fileName}: category "${category.name}" recommendations must be an array`);
    return;
  }

  category.recommendations.forEach((recommendation, index) => {
    validateRecommendation(recommendation, fileName, category.name, index);
  });
}

function validateFixture(fixture, fileName) {
  requireNonEmptyString(fixture, "fixture_type", fileName);
  requireNonEmptyString(fixture, "raw_request", fileName);
  requireNonEmptyString(fixture, "intake_question", fileName);
  requireNonEmptyString(fixture, "understanding_target", fileName);
  requireNonEmptyString(fixture, "markdown_packet_intent", fileName);

  if (!requiredFixtureTypes.has(fixture.fixture_type)) {
    fail(`${fileName}: fixture_type must be one of ${Array.from(requiredFixtureTypes).join(", ")}`);
  }

  if (fixture.intake_question !== "What type of work or workflow are you trying to understand?") {
    fail(`${fileName}: intake_question must match the universal intake question`);
  }

  if (!Array.isArray(fixture.categories)) {
    fail(`${fileName}: categories must be an array`);
    return;
  }

  const categoryNames = fixture.categories.map((category) => category.name);
  for (const requiredCategory of requiredCategories) {
    if (!categoryNames.includes(requiredCategory)) {
      fail(`${fileName}: missing category "${requiredCategory}"`);
    }
  }

  fixture.categories.forEach((category) => validateCategory(category, fileName));

  const recommendationCount = fixture.categories.reduce(
    (count, category) => count + (Array.isArray(category.recommendations) ? category.recommendations.length : 0),
    0,
  );

  if (recommendationCount === 0) {
    fail(`${fileName}: fixture must include at least one visible recommendation`);
  }

  if (fixture.fixture_type === "broad" && recommendationCount < 4) {
    fail(`${fileName}: broad fixture must include at least four visible recommendations`);
  }

  if (fixture.fixture_type === "high_stakes" && fixture.high_stakes_human_boundary !== true) {
    fail(`${fileName}: high_stakes fixture must set high_stakes_human_boundary to true`);
  }

  if (recommendationCount > 50) {
    fail(`${fileName}: visible recommendation count must not exceed 50`);
  }
}

async function main() {
  const fixtureFiles = (await readdir(fixturesDir))
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();

  const seenFixtureTypes = new Set();

  for (const fileName of fixtureFiles) {
    const fixturePath = path.join(fixturesDir, fileName);
    const fixture = JSON.parse(await readFile(fixturePath, "utf8"));
    seenFixtureTypes.add(fixture.fixture_type);
    validateFixture(fixture, fileName);
  }

  for (const requiredType of requiredFixtureTypes) {
    if (!seenFixtureTypes.has(requiredType)) {
      fail(`fixtures: missing required fixture_type "${requiredType}"`);
    }
  }

  if (errors.length > 0) {
    console.error(errors.map((error) => `- ${error}`).join("\n"));
    process.exit(1);
  }

  console.log(`Packet fixture contract is valid (${fixtureFiles.length} fixtures).`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
