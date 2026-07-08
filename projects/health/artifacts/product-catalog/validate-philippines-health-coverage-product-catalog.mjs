#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const registryPath = path.resolve(
  process.cwd(),
  "projects/health/artifacts/registries/philippines-health-coverage-registry.json",
);
const catalogPath = path.resolve(
  process.cwd(),
  "projects/health/artifacts/product-catalog/philippines-health-coverage-product-catalog.json",
);

const allowedProductTypes = new Set([
  "public-benefit-category",
  "hmo-regulatory-template",
  "individual-family-hmo",
  "group-hmo",
  "sme-hmo",
  "corporate-hmo",
  "prepaid-health-card",
  "emergency-health-card",
  "insurer-health-protection",
  "critical-illness-insurance",
  "medical-insurance",
]);

const allowedCoverageTags = new Set([
  "public-benefit",
  "inpatient",
  "outpatient",
  "emergency",
  "preventive",
  "dental",
  "maternity",
  "diagnostic",
  "teleconsult",
  "provider-network",
  "critical-illness",
  "life-cover",
  "hospital-income",
  "travel-assist",
  "wellness",
  "reimbursement",
  "cashless-access",
  "prepaid",
]);

const allowedMarketSegments = new Set([
  "public-member",
  "individual",
  "family",
  "employee",
  "employer",
  "sme",
  "corporate",
  "ofw",
  "senior",
  "general",
]);

const allowedEvidenceLevels = new Set(["official", "regulator-template", "provider-published"]);
const allowedExtractionStatuses = new Set(["seed", "category-level", "needs-deep-dive"]);
const allowedSourceTypes = new Set(["public-payer", "regulator", "provider", "insurer", "educational"]);
const forbiddenProductKeys = new Set([
  "recommendation_rank",
  "best_for",
  "guaranteed_coverage",
  "price_recommendation",
  "claims_decision",
  "eligibility_decision",
]);
const datePattern = /^\d{4}-\d{2}-\d{2}$/u;
const slugPattern = /^[a-z0-9][a-z0-9-]*$/u;

function normalizeAlias(value) {
  return String(value)
    .toLowerCase()
    .replace(/&/gu, "and")
    .replace(/\b(incorporated|inc|corporation|corp|company|co|ltd)\b\.?/gu, "")
    .replace(/[^a-z0-9]+/gu, " ")
    .trim()
    .replace(/\s+/gu, " ");
}

function requireString(errors, object, key, context) {
  if (typeof object?.[key] !== "string" || object[key].trim() === "") {
    errors.push(`${context}.${key} must be a non-empty string`);
  }
}

function requireStringArray(errors, object, key, context) {
  if (!Array.isArray(object?.[key]) || object[key].length === 0) {
    errors.push(`${context}.${key} must be a non-empty array`);
    return;
  }

  for (const [index, value] of object[key].entries()) {
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`${context}.${key}[${index}] must be a non-empty string`);
    }
  }
}

function validateCatalog(catalog, registry) {
  const errors = [];
  const registryEntities = new Map((registry.entities ?? []).map((entity) => [entity.entity_id, entity]));
  const sourceIds = new Set();
  const productIds = new Set();
  const aliasesByEntity = new Map();

  if (catalog.version !== 1) errors.push("version must be 1");
  requireString(errors, catalog, "generated_for", "catalog");
  requireString(errors, catalog, "last_checked_at", "catalog");
  requireString(errors, catalog, "registry_reference", "catalog");
  requireString(errors, catalog, "advice_boundary", "catalog");
  if (typeof catalog.last_checked_at === "string" && !datePattern.test(catalog.last_checked_at)) {
    errors.push("catalog.last_checked_at must use YYYY-MM-DD");
  }

  if (!Array.isArray(catalog.sources) || catalog.sources.length === 0) {
    errors.push("sources must be a non-empty array");
  } else {
    for (const [index, source] of catalog.sources.entries()) {
      const context = `sources[${index}]`;
      for (const key of ["source_id", "source_type", "title", "url", "authority_level", "last_checked_at"]) {
        requireString(errors, source, key, context);
      }
      if (typeof source.source_id === "string") {
        if (!slugPattern.test(source.source_id)) errors.push(`${context}.source_id must be a lowercase slug`);
        if (sourceIds.has(source.source_id)) errors.push(`${context}.source_id is duplicated`);
        sourceIds.add(source.source_id);
      }
      if (typeof source.source_type === "string" && !allowedSourceTypes.has(source.source_type)) {
        errors.push(`${context}.source_type is not allowed`);
      }
      if (typeof source.last_checked_at === "string" && !datePattern.test(source.last_checked_at)) {
        errors.push(`${context}.last_checked_at must use YYYY-MM-DD`);
      }
    }
  }

  if (!Array.isArray(catalog.regulatory_patterns) || catalog.regulatory_patterns.length === 0) {
    errors.push("regulatory_patterns must be a non-empty array");
  } else {
    for (const [index, pattern] of catalog.regulatory_patterns.entries()) {
      const context = `regulatory_patterns[${index}]`;
      for (const key of ["pattern_id", "applies_to_entity_type", "pattern_name", "last_checked_at", "educational_summary", "advice_boundary"]) {
        requireString(errors, pattern, key, context);
      }
      for (const key of ["coverage_tags", "source_ids"]) {
        requireStringArray(errors, pattern, key, context);
      }
      if (typeof pattern.pattern_id === "string" && !slugPattern.test(pattern.pattern_id)) {
        errors.push(`${context}.pattern_id must be a lowercase slug`);
      }
      if (pattern.applies_to_entity_type !== "hmo") {
        errors.push(`${context}.applies_to_entity_type must be hmo`);
      }
      if (typeof pattern.last_checked_at === "string" && !datePattern.test(pattern.last_checked_at)) {
        errors.push(`${context}.last_checked_at must use YYYY-MM-DD`);
      }
      for (const sourceId of pattern.source_ids ?? []) {
        if (!sourceIds.has(sourceId)) errors.push(`${context}.source_ids references unknown source "${sourceId}"`);
      }
      for (const tag of pattern.coverage_tags ?? []) {
        if (!allowedCoverageTags.has(tag)) errors.push(`${context}.coverage_tags contains unsupported value "${tag}"`);
      }
    }
  }

  if (!Array.isArray(catalog.product_surfaces) || catalog.product_surfaces.length === 0) {
    errors.push("product_surfaces must be a non-empty array");
  } else {
    for (const [index, product] of catalog.product_surfaces.entries()) {
      const context = `product_surfaces[${index}]`;
      for (const key of forbiddenProductKeys) {
        if (Object.hasOwn(product, key)) errors.push(`${context}.${key} is forbidden`);
      }

      for (const key of [
        "product_id",
        "entity_id",
        "entity_type_snapshot",
        "product_name",
        "product_type",
        "evidence_level",
        "extraction_status",
        "last_checked_at",
        "educational_summary",
        "advice_boundary",
      ]) {
        requireString(errors, product, key, context);
      }
      for (const key of ["market_segments", "coverage_tags", "source_ids", "user_questions"]) {
        requireStringArray(errors, product, key, context);
      }
      if (product.product_aliases !== undefined) requireStringArray(errors, product, "product_aliases", context);
      if (product.human_review_required !== true) errors.push(`${context}.human_review_required must be true`);

      if (typeof product.product_id === "string") {
        if (!slugPattern.test(product.product_id)) errors.push(`${context}.product_id must be a lowercase slug`);
        if (productIds.has(product.product_id)) errors.push(`${context}.product_id is duplicated`);
        productIds.add(product.product_id);
      }

      const registryEntity = registryEntities.get(product.entity_id);
      if (!registryEntity) {
        errors.push(`${context}.entity_id references unknown registry entity "${product.entity_id}"`);
      } else if (product.entity_type_snapshot !== registryEntity.entity_type) {
        errors.push(`${context}.entity_type_snapshot does not match registry entity type for ${product.entity_id}`);
      }

      if (typeof product.product_type === "string" && !allowedProductTypes.has(product.product_type)) {
        errors.push(`${context}.product_type is not allowed`);
      }
      if (typeof product.evidence_level === "string" && !allowedEvidenceLevels.has(product.evidence_level)) {
        errors.push(`${context}.evidence_level is not allowed`);
      }
      if (typeof product.extraction_status === "string" && !allowedExtractionStatuses.has(product.extraction_status)) {
        errors.push(`${context}.extraction_status is not allowed`);
      }
      if (typeof product.last_checked_at === "string" && !datePattern.test(product.last_checked_at)) {
        errors.push(`${context}.last_checked_at must use YYYY-MM-DD`);
      }

      for (const sourceId of product.source_ids ?? []) {
        if (!sourceIds.has(sourceId)) errors.push(`${context}.source_ids references unknown source "${sourceId}"`);
      }
      for (const segment of product.market_segments ?? []) {
        if (!allowedMarketSegments.has(segment)) errors.push(`${context}.market_segments contains unsupported value "${segment}"`);
      }
      for (const tag of product.coverage_tags ?? []) {
        if (!allowedCoverageTags.has(tag)) errors.push(`${context}.coverage_tags contains unsupported value "${tag}"`);
      }

      const entityAliasMap = aliasesByEntity.get(product.entity_id) ?? new Map();
      for (const alias of [product.product_name, ...(product.product_aliases ?? [])]) {
        const normalized = normalizeAlias(alias);
        if (!normalized) continue;
        const owner = entityAliasMap.get(normalized);
        if (owner && owner !== product.product_id) {
          errors.push(`product alias "${alias}" collides within ${product.entity_id} between ${owner} and ${product.product_id}`);
        }
        entityAliasMap.set(normalized, product.product_id);
      }
      aliasesByEntity.set(product.entity_id, entityAliasMap);
    }
  }

  const products = catalog.product_surfaces ?? [];
  if (!products.some((product) => product.entity_id === "philhealth")) {
    errors.push("catalog must include at least one PhilHealth product or benefit surface");
  }
  if (!products.some((product) => product.entity_type_snapshot === "hmo")) {
    errors.push("catalog must include at least one HMO product surface");
  }
  if (!products.some((product) => product.product_type === "insurer-health-protection" || product.product_type === "critical-illness-insurance" || product.product_type === "medical-insurance")) {
    errors.push("catalog must include at least one insurer health-protection surface");
  }
  if (!(catalog.regulatory_patterns ?? []).some((pattern) => pattern.applies_to_entity_type === "hmo")) {
    errors.push("catalog must include at least one HMO regulatory pattern");
  }

  return errors;
}

const [registry, catalog] = await Promise.all([
  readFile(registryPath, "utf8").then(JSON.parse),
  readFile(catalogPath, "utf8").then(JSON.parse),
]);
const errors = validateCatalog(catalog, registry);

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

const counts = catalog.product_surfaces.reduce((accumulator, product) => {
  accumulator[product.entity_type_snapshot] = (accumulator[product.entity_type_snapshot] ?? 0) + 1;
  return accumulator;
}, {});

console.log(
  `Product catalog valid: ${catalog.product_surfaces.length} product surfaces, ${catalog.regulatory_patterns.length} regulatory patterns, ${catalog.sources.length} sources, counts=${JSON.stringify(counts)}`,
);
