#!/usr/bin/env node

import { readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const registryPath = path.resolve(
  process.cwd(),
  "projects/health/artifacts/registries/philippines-health-coverage-registry.json",
);

const allowedEntityTypes = new Set([
  "public-payer",
  "hmo",
  "life-insurer",
  "non-life-insurer",
  "composite-insurer",
]);

const allowedSourceTypes = new Set([
  "regulator",
  "public-payer",
  "provider",
  "market-performance",
  "educational",
]);

const allowedPriorities = new Set(["primary", "secondary", "seed"]);
const allowedStatuses = new Set(["official-anchor", "listed", "listed-with-regulatory-note", "seed"]);
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
  if (!Array.isArray(object?.[key])) {
    errors.push(`${context}.${key} must be an array`);
    return;
  }

  for (const [index, value] of object[key].entries()) {
    if (typeof value !== "string" || value.trim() === "") {
      errors.push(`${context}.${key}[${index}] must be a non-empty string`);
    }
  }
}

function validateRegistry(registry) {
  const errors = [];
  const sourceIds = new Set();
  const entityIds = new Set();
  const aliasOwners = new Map();

  if (registry.version !== 1) errors.push("version must be 1");
  requireString(errors, registry, "generated_for", "registry");
  requireString(errors, registry, "last_checked_at", "registry");
  if (typeof registry.last_checked_at === "string" && !datePattern.test(registry.last_checked_at)) {
    errors.push("registry.last_checked_at must use YYYY-MM-DD");
  }

  if (!Array.isArray(registry.sources) || registry.sources.length === 0) {
    errors.push("sources must be a non-empty array");
  } else {
    for (const [index, source] of registry.sources.entries()) {
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

  if (!Array.isArray(registry.entities) || registry.entities.length === 0) {
    errors.push("entities must be a non-empty array");
  } else {
    for (const [index, entity] of registry.entities.entries()) {
      const context = `entities[${index}]`;
      for (const key of [
        "entity_id",
        "entity_type",
        "canonical_name",
        "display_name",
        "country",
        "priority",
        "status",
        "last_checked_at",
      ]) {
        requireString(errors, entity, key, context);
      }
      for (const key of ["aliases", "source_ids"]) {
        requireStringArray(errors, entity, key, context);
      }
      for (const key of ["brand_names", "former_names", "official_domains"]) {
        if (entity[key] !== undefined) requireStringArray(errors, entity, key, context);
      }

      if (typeof entity.entity_id === "string") {
        if (!slugPattern.test(entity.entity_id)) errors.push(`${context}.entity_id must be a lowercase slug`);
        if (entityIds.has(entity.entity_id)) errors.push(`${context}.entity_id is duplicated`);
        entityIds.add(entity.entity_id);
      }
      if (typeof entity.entity_type === "string" && !allowedEntityTypes.has(entity.entity_type)) {
        errors.push(`${context}.entity_type is not allowed`);
      }
      if (typeof entity.priority === "string" && !allowedPriorities.has(entity.priority)) {
        errors.push(`${context}.priority is not allowed`);
      }
      if (typeof entity.status === "string" && !allowedStatuses.has(entity.status)) {
        errors.push(`${context}.status is not allowed`);
      }
      if (entity.country !== "Philippines") {
        errors.push(`${context}.country must be Philippines`);
      }
      if (typeof entity.last_checked_at === "string" && !datePattern.test(entity.last_checked_at)) {
        errors.push(`${context}.last_checked_at must use YYYY-MM-DD`);
      }

      for (const sourceId of entity.source_ids ?? []) {
        if (!sourceIds.has(sourceId)) errors.push(`${context}.source_ids references unknown source "${sourceId}"`);
      }

      for (const alias of [
        entity.canonical_name,
        entity.display_name,
        entity.legal_name,
        ...(entity.aliases ?? []),
        ...(entity.brand_names ?? []),
        ...(entity.former_names ?? []),
      ].filter(Boolean)) {
        const normalized = normalizeAlias(alias);
        if (!normalized) continue;
        const owner = aliasOwners.get(normalized);
        if (owner && owner !== entity.entity_id) {
          errors.push(`alias "${alias}" collides between ${owner} and ${entity.entity_id}`);
        }
        aliasOwners.set(normalized, entity.entity_id);
      }
    }
  }

  const entityTypes = new Set((registry.entities ?? []).map((entity) => entity.entity_type));
  for (const requiredType of ["public-payer", "hmo"]) {
    if (!entityTypes.has(requiredType)) errors.push(`registry must include at least one ${requiredType}`);
  }
  if (!["life-insurer", "non-life-insurer", "composite-insurer"].some((type) => entityTypes.has(type))) {
    errors.push("registry must include at least one insurance-company seed");
  }

  const philHealth = registry.entities?.find((entity) => entity.entity_id === "philhealth");
  if (!philHealth || philHealth.entity_type !== "public-payer" || philHealth.priority !== "primary") {
    errors.push("philhealth must exist as the primary public-payer anchor");
  }

  return errors;
}

const registry = JSON.parse(await readFile(registryPath, "utf8"));
const errors = validateRegistry(registry);

if (errors.length > 0) {
  console.error(errors.map((error) => `- ${error}`).join("\n"));
  process.exit(1);
}

const counts = registry.entities.reduce((accumulator, entity) => {
  accumulator[entity.entity_type] = (accumulator[entity.entity_type] ?? 0) + 1;
  return accumulator;
}, {});

console.log(
  `Registry valid: ${registry.entities.length} entities, ${registry.sources.length} sources, counts=${JSON.stringify(counts)}`,
);
