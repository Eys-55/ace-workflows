#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "../../..");
const dataDir = path.join(
  packageRoot,
  "quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos",
);
const searchIndexPath = path.join(dataDir, "workflow-search-index.json");
const linkSeedPath = path.join(dataDir, "workflow-link-seed.json");

const categoryLabels = [
  "Direct Matches",
  "Strong Adjacent Matches",
  "Supporting Building Blocks",
  "Maybe Useful",
];

const supportingTerms = new Set([
  "audit",
  "classification",
  "compliance",
  "document",
  "evidence",
  "handoff",
  "intake",
  "packet",
  "privacy",
  "review",
  "source",
  "validation",
]);

const highStakesTerms = new Set([
  "clinical",
  "compliance",
  "health",
  "healthcare",
  "hipaa",
  "legal",
  "medical",
  "patient",
  "phi",
  "safety",
]);

function parseArgs(argv) {
  const args = {
    limit: 12,
    output: "",
    query: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--limit") {
      args.limit = Number(argv[index + 1]);
      index += 1;
    } else if (arg === "--output") {
      args.output = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--query") {
      args.query = argv[index + 1] ?? "";
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!Number.isFinite(args.limit)) {
    throw new Error("--limit must be a number");
  }

  args.limit = Math.max(1, Math.min(50, Math.floor(args.limit)));
  return args;
}

async function loadJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

function tokenize(value) {
  return String(value ?? "")
    .toLowerCase()
    .split(/[^a-z0-9]+/u)
    .filter((term) => term.length >= 2);
}

function textForRow(row) {
  return [
    row.workflow_name,
    row.workflow_family,
    row.normalized_domain,
    row.original_domain,
    row.original_workflow_type,
    row.real_life_job,
    row.input_contract,
    row.output_artifact,
    row.trigger,
    row.validation_gate,
    row.what_to_copy,
    row.what_to_ignore,
    row.door_category,
    row.door_browse_use,
    row.tags,
    row.query_keywords,
    row.searchable_text,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function scoreRow(row, queryTerms) {
  const haystack = textForRow(row);
  const exactName = String(row.workflow_name ?? "").toLowerCase();
  let relevanceScore = 0;

  for (const term of queryTerms) {
    if (haystack.includes(term)) relevanceScore += 4;
    if (exactName.includes(term)) relevanceScore += 2;
    if (String(row.tags ?? "").toLowerCase().includes(term)) relevanceScore += 1;
    if (String(row.query_keywords ?? "").toLowerCase().includes(term)) relevanceScore += 1;
  }

  if (relevanceScore === 0) return 0;

  let qualityBonus = 0;
  if (row.quality_tier === "gold") qualityBonus += 0.5;
  if (row.quality_tier === "silver") qualityBonus += 0.25;
  if (row.confidence === "high") qualityBonus += 0.5;
  if (row.confidence === "medium-high") qualityBonus += 0.35;
  if (row.confidence === "medium") qualityBonus += 0.25;

  return relevanceScore + qualityBonus;
}

function classifyRow(row, score, queryTerms) {
  const haystack = textForRow(row);
  const matchedTerms = queryTerms.filter((term) => haystack.includes(term)).length;
  const hasSupportingTerm = queryTerms.some((term) => supportingTerms.has(term))
    || tokenize(haystack).some((term) => supportingTerms.has(term));
  const isHealthcareQuery = queryTerms.some((term) => ["health", "healthcare", "pediatric", "pediatrics"].includes(term));
  const isHealthcareRow = ["health", "healthcare", "medical", "patient", "clinical"].some((term) => haystack.includes(term));

  if (matchedTerms === 0) return "";
  if (matchedTerms >= Math.min(2, queryTerms.length) || (isHealthcareQuery && isHealthcareRow)) {
    return "Direct Matches";
  }
  if (score >= 4) {
    return hasSupportingTerm ? "Supporting Building Blocks" : "Strong Adjacent Matches";
  }
  return "Maybe Useful";
}

function makeSkillSlug(name) {
  return String(name || "workflow-source")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 64);
}

function repoSlug(row) {
  if (row.source_repo) return String(row.source_repo).toLowerCase();
  const match = String(row.source_url ?? "").match(/github\.com\/([^/]+\/[^/]+)/iu);
  return match ? match[1].toLowerCase() : "";
}

function expansionCandidatesForRow(row, linkSeed, queryTerms) {
  const rowRepo = repoSlug(row);
  return (linkSeed.workflow_links ?? [])
    .filter((link) => {
      const linkRepo = String(link.repo ?? "").toLowerCase();
      const linkText = [
        link.workflow_or_skill_name,
        link.domain_hint,
        link.cluster,
        link.why_this_is_a_workflow,
        link.aliases,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const repoMatches = rowRepo && linkRepo === rowRepo;
      const queryMatches = queryTerms.some((term) => linkText.includes(term));
      const sameName = String(link.workflow_or_skill_name ?? "").toLowerCase()
        === String(row.workflow_name ?? "").toLowerCase();
      return repoMatches && (queryMatches || sameName);
    })
    .slice(0, 3)
    .map((link) => ({
      name: link.workflow_or_skill_name,
      type: link.candidate_type,
      url: link.folder_or_file_url,
      needsSecondPass: Boolean(link.needs_second_pass),
    }));
}

function makeRecommendation(row, category, score, linkSeed, queryTerms) {
  const reliability = [
    row.quality_tier ? `tier=${row.quality_tier}` : "",
    row.confidence ? `confidence=${row.confidence}` : "",
    row.source_url_status ? `source=${row.source_url_status}` : "",
  ]
    .filter(Boolean)
    .join("; ");

  return {
    category,
    score,
    title: row.workflow_name || row.workflow_id,
    whyItMatters: row.real_life_job || row.door_browse_use || "This source may expose reusable workflow structure.",
    whyItIsHere: row.trigger || `Matched the query through ${row.normalized_domain || "general"} workflow metadata.`,
    whatItDoes: row.what_to_copy || row.output_artifact || "Use as a candidate source for workflow structure and extraction.",
    sourceLink: row.source_url || row.canonical_source_url || "source link unavailable",
    localPath: `workflow-search-index.json#${row.workflow_id}`,
    reliability: reliability || "unrated",
    possibleSkill: makeSkillSlug(row.workflow_name),
    expansionCandidates: expansionCandidatesForRow(row, linkSeed, queryTerms),
  };
}

function selectRecommendations(rows, linkSeed, query, limit) {
  const queryTerms = tokenize(query);
  if (queryTerms.length === 0) {
    throw new Error("Provide --query with at least one searchable term.");
  }

  const scoredRows = rows
    .map((row) => {
      const score = scoreRow(row, queryTerms);
      const category = classifyRow(row, score, queryTerms);
      return { row, score, category };
    })
    .filter((entry) => entry.category)
    .sort((a, b) => b.score - a.score || String(a.row.workflow_name).localeCompare(String(b.row.workflow_name)));

  const buckets = new Map(categoryLabels.map((label) => [label, []]));
  for (const entry of scoredRows) {
    buckets.get(entry.category).push(makeRecommendation(entry.row, entry.category, entry.score, linkSeed, queryTerms));
  }

  const selected = new Map(categoryLabels.map((label) => [label, []]));
  for (const label of categoryLabels) {
    const first = buckets.get(label)[0];
    if (first) selected.get(label).push(first);
  }

  let selectedCount = [...selected.values()].reduce((count, items) => count + items.length, 0);
  for (const label of categoryLabels) {
    for (const recommendation of buckets.get(label).slice(1)) {
      if (selectedCount >= limit) break;
      selected.get(label).push(recommendation);
      selectedCount += 1;
    }
  }

  return selected;
}

function renderRecommendation(recommendation) {
  const expansionLine = recommendation.expansionCandidates.length > 0
    ? recommendation.expansionCandidates
      .map((candidate) => `${candidate.name} (${candidate.type}${candidate.needsSecondPass ? ", second pass" : ""})`)
      .join("; ")
    : "No seed expansion candidate found in the packaged source data.";
  return [
    `### ${recommendation.title}`,
    `- Why it matters: ${recommendation.whyItMatters}`,
    `- Why it is here: ${recommendation.whyItIsHere}`,
    `- What it does: ${recommendation.whatItDoes}`,
    `- Source link: ${recommendation.sourceLink}`,
    `- Local door/source path: ${recommendation.localPath}`,
    `- Reliability: ${recommendation.reliability}`,
    `- Possible skill to extract: ${recommendation.possibleSkill}`,
    `- Expansion candidates: ${expansionLine}`,
  ].join("\n");
}

function renderPacket({ query, limit, outputPath, recommendations }) {
  const queryTerms = new Set(tokenize(query));
  const needsHumanBoundary = [...queryTerms].some((term) => highStakesTerms.has(term));
  const visibleCount = [...recommendations.values()].reduce((count, items) => count + items.length, 0);
  const sections = categoryLabels.map((label) => {
    const items = recommendations.get(label);
    const body = items.length > 0
      ? items.map(renderRecommendation).join("\n\n")
      : "_No visible recommendations in this category for this run._";
    return `## ${label}\n\n${body}`;
  });

  return [
    "# Workflow Understanding Packet",
    "",
    `- Query: ${query}`,
    "- Intake question: What type of work or workflow are you trying to understand?",
    `- Visible recommendation count: ${visibleCount}`,
    `- Visible recommendation cap: ${limit}`,
    `- Written artifact path: ${outputPath}`,
    "- Packet rule: Keep descriptions and links here; read source workflows directly before extracting or creating a skill.",
    needsHumanBoundary
      ? "- Human review boundary: This packet is for workflow understanding only and does not prove compliance, clinical correctness, eligibility, coverage, legal sufficiency, or safety."
      : "- Human review boundary: Required before external action, publication, or applying a workflow to a person, system, or regulated decision.",
    "",
    "## Provenance",
    "",
    "- Package: @ace-workflows/real-life-workflows",
    "- Skill: real-life-workflow-search",
    "- Source universe: 171 curated workflow doors across 17 source repos, backed by a 19,000+ upstream-flow source-universe estimate.",
    "- Source boundary: Quarantined imported skills are source evidence only and are not active callable skills.",
    "",
    ...sections,
    "",
  ].join("\n");
}

function assertSafeOutput(output) {
  if (!output) {
    throw new Error("Provide --output inside the caller or primary project's approved artifact area.");
  }

  const resolved = path.resolve(process.cwd(), output);
  const parts = resolved.split(path.sep);
  const protectedSegments = new Set(["node_modules", ".git"]);

  if (parts.some((part) => protectedSegments.has(part))) {
    throw new Error("--output must not write into node_modules or .git.");
  }
  if (resolved.endsWith(`${path.sep}AGENTS.md`)) {
    throw new Error("--output must not overwrite AGENTS.md.");
  }
  if (resolved.includes(`${path.sep}tasks${path.sep}`)) {
    throw new Error("--output must not write into task tracker files.");
  }
  if (resolved.includes(`${path.sep}skills${path.sep}`) && resolved.endsWith(`${path.sep}SKILL.md`)) {
    throw new Error("--output must not overwrite skill definitions.");
  }

  return resolved;
}

function helpText() {
  return [
    "Usage:",
    "  real-life-workflow-search --query \"customer billing exceptions\" --output projects/example/artifacts/workflow-packets/customer-billing-exceptions.md",
    "  real-life-workflow-search --query \"document evidence\" --limit 20 --output projects/example/artifacts/workflow-packets/document-evidence.md",
    "",
    "The output path must be inside the caller or primary project's approved artifact area.",
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(helpText());
    return;
  }

  const outputPath = assertSafeOutput(args.output);
  const [searchIndex, linkSeed] = await Promise.all([
    loadJson(searchIndexPath),
    loadJson(linkSeedPath),
  ]);
  const recommendations = selectRecommendations(searchIndex.rows ?? [], linkSeed, args.query, args.limit);
  const packet = renderPacket({
    query: args.query,
    limit: args.limit,
    outputPath: path.relative(process.cwd(), outputPath),
    recommendations,
  });

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, packet, "utf8");
  console.log(`Wrote workflow-understanding packet: ${path.relative(process.cwd(), outputPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
