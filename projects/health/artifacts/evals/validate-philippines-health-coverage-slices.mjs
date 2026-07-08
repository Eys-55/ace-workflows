#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const paths = {
  registry: "projects/health/artifacts/registries/philippines-health-coverage-registry.json",
  productCatalog: "projects/health/artifacts/product-catalog/philippines-health-coverage-product-catalog.json",
  sourceAtlas: "projects/health/artifacts/source-atlas/philippines-health-coverage-source-atlas.json",
  deepDive: "projects/health/artifacts/deep-dives/maxicare-hmo-deep-dive-packet.json",
  comparison: "projects/health/artifacts/comparison/philippines-health-coverage-comparison-readiness.json",
  navigator: "projects/health/artifacts/navigator/philippines-health-coverage-navigator-flow.json",
  evals: "projects/health/artifacts/evals/philippines-health-coverage-eval-fixtures.json",
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/u;
const forbiddenKeyPattern = /(recommendation_rank|best_for|guaranteed_coverage|claims_decision|eligibility_decision|coverage_determination)/iu;
const forbiddenTextPattern = /\b(best plan|claim approved|guaranteed coverage|you are covered|you are eligible)\b/iu;

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.resolve(root, relativePath), "utf8"));
}

function requireString(errors, value, context) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${context} must be a non-empty string`);
  }
}

function requireArray(errors, value, context) {
  if (!Array.isArray(value) || value.length === 0) {
    errors.push(`${context} must be a non-empty array`);
  }
}

function walkForForbiddenFields(errors, value, context, allowForbiddenText = false) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkForForbiddenFields(errors, item, `${context}[${index}]`, allowForbiddenText));
    return;
  }

  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      if (forbiddenKeyPattern.test(key)) {
        errors.push(`${context}.${key} uses forbidden decision/recommendation field naming`);
      }
      const childAllowsForbiddenText =
        allowForbiddenText ||
        key === "blocked_outputs" ||
        key === "blocked_if_any_output_contains" ||
        key === "forbidden_behavior" ||
        key === "refusal_triggers";
      walkForForbiddenFields(errors, child, `${context}.${key}`, childAllowsForbiddenText);
    }
    return;
  }

  if (!allowForbiddenText && typeof value === "string" && forbiddenTextPattern.test(value)) {
    errors.push(`${context} contains forbidden decision/recommendation wording`);
  }
}

function assertCommonArtifact(errors, artifact, context) {
  if (artifact.version !== 1) errors.push(`${context}.version must be 1`);
  requireString(errors, artifact.generated_for, `${context}.generated_for`);
  requireString(errors, artifact.last_checked_at, `${context}.last_checked_at`);
  if (typeof artifact.last_checked_at === "string" && !datePattern.test(artifact.last_checked_at)) {
    errors.push(`${context}.last_checked_at must use YYYY-MM-DD`);
  }
  requireString(errors, artifact.advice_boundary, `${context}.advice_boundary`);
  walkForForbiddenFields(errors, artifact, context);
}

const [registry, productCatalog, sourceAtlas, deepDive, comparison, navigator, evals] = await Promise.all([
  readJson(paths.registry),
  readJson(paths.productCatalog),
  readJson(paths.sourceAtlas),
  readJson(paths.deepDive),
  readJson(paths.comparison),
  readJson(paths.navigator),
  readJson(paths.evals),
]);

const errors = [];
const registryEntityIds = new Set((registry.entities ?? []).map((entity) => entity.entity_id));
const catalogProductIds = new Set((productCatalog.product_surfaces ?? []).map((product) => product.product_id));
const catalogSourceIds = new Set((productCatalog.sources ?? []).map((source) => source.source_id));
const registrySourceIds = new Set((registry.sources ?? []).map((source) => source.source_id));
const knownSourceIds = new Set([
  ...catalogSourceIds,
  ...registrySourceIds,
  "health-workflow-candidates-packet",
  "philippines-insurance-hmo-workflows-packet",
]);

for (const [name, artifact] of Object.entries({ sourceAtlas, deepDive, comparison, navigator, evals })) {
  assertCommonArtifact(errors, artifact, name);
}

requireArray(errors, sourceAtlas.source_roles, "sourceAtlas.source_roles");
for (const [index, role] of (sourceAtlas.source_roles ?? []).entries()) {
  requireString(errors, role.role_id, `sourceAtlas.source_roles[${index}].role_id`);
  requireArray(errors, role.source_ids, `sourceAtlas.source_roles[${index}].source_ids`);
  if (role.human_review_required !== true) {
    errors.push(`sourceAtlas.source_roles[${index}].human_review_required must be true`);
  }
  for (const sourceId of role.source_ids ?? []) {
    if (!knownSourceIds.has(sourceId)) {
      errors.push(`sourceAtlas.source_roles[${index}] references unknown source_id ${sourceId}`);
    }
  }
}

if (!registryEntityIds.has(deepDive.entity_id)) {
  errors.push(`deepDive.entity_id references unknown registry entity ${deepDive.entity_id}`);
}
for (const productId of deepDive.product_surface_ids ?? []) {
  if (!catalogProductIds.has(productId)) {
    errors.push(`deepDive.product_surface_ids references unknown product ${productId}`);
  }
}
if ((deepDive.blocked_outputs ?? []).length < 4) {
  errors.push("deepDive.blocked_outputs must state major refusal boundaries");
}

requireArray(errors, comparison.comparison_dimensions, "comparison.comparison_dimensions");
if ((comparison.blocked_outputs ?? []).length < 6) {
  errors.push("comparison.blocked_outputs must include ranking and decision boundaries");
}

requireArray(errors, navigator.entry_questions, "navigator.entry_questions");
requireArray(errors, navigator.routes, "navigator.routes");
const routeIds = new Set((navigator.routes ?? []).map((route) => route.route_id));
for (const [index, question] of (navigator.entry_questions ?? []).entries()) {
  for (const routeId of question.routes_to ?? []) {
    if (!routeIds.has(routeId)) {
      errors.push(`navigator.entry_questions[${index}] routes to unknown route ${routeId}`);
    }
  }
}
if (!routeIds.has("refusal-with-human-review")) {
  errors.push("navigator must include refusal-with-human-review route");
}

requireArray(errors, evals.fixtures, "evals.fixtures");
if ((evals.fixtures ?? []).length < 5) {
  errors.push("evals.fixtures must include at least five fixtures");
}
for (const [index, fixture] of (evals.fixtures ?? []).entries()) {
  requireString(errors, fixture.fixture_id, `evals.fixtures[${index}].fixture_id`);
  requireArray(errors, fixture.expected_behavior, `evals.fixtures[${index}].expected_behavior`);
  requireArray(errors, fixture.forbidden_behavior, `evals.fixtures[${index}].forbidden_behavior`);
}

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

console.log(
  `Health coverage slices valid: ${sourceAtlas.source_roles.length} source roles, ${deepDive.product_surface_ids.length} deep-dive products, ${comparison.comparison_dimensions.length} comparison dimensions, ${navigator.routes.length} navigator routes, ${evals.fixtures.length} eval fixtures`,
);
