#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const catalogDir = path.join(
  root,
  "projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos",
);
const searchIndexPath = path.join(catalogDir, "workflow-search-index.json");
const doorCatalogPath = path.join(catalogDir, "workflow-door-catalog.json");
const linkSeedPath = path.join(catalogDir, "workflow-link-seed.json");

const categoryLabels = [
  "Direct Matches",
  "Strong Adjacent Matches",
  "Supporting Building Blocks",
  "Maybe Useful",
];

const supportingTerms = new Set([
  "audit",
  "checklist",
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
  "summary",
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
    audit: false,
    limit: 12,
    output: "",
    query: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--audit") {
      args.audit = true;
    } else if (arg === "--limit") {
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

  if (matchedTerms === 0) {
    return "";
  }
  if (matchedTerms >= Math.min(2, queryTerms.length) || (isHealthcareQuery && isHealthcareRow)) {
    return "Direct Matches";
  }
  if (score >= 4) {
    return hasSupportingTerm ? "Supporting Building Blocks" : "Strong Adjacent Matches";
  }
  if (score > 0) {
    return "Maybe Useful";
  }
  return "";
}

function makeSkillSlug(name) {
  return String(name || "workflow-source")
    .toLowerCase()
    .replace(/[^a-z0-9]+/gu, "-")
    .replace(/^-|-$/gu, "")
    .slice(0, 64);
}

function relativePath(filePath) {
  return path.relative(root, filePath);
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
  const sourcePath = `${relativePath(searchIndexPath)}#${row.workflow_id}`;
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
    localPath: sourcePath,
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
    : "No seed expansion candidate found in the quarantined import.";
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

function renderPacket({ query, limit, recommendations }) {
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
    "- Packet rule: Keep descriptions and links here; read source workflows directly before extracting or creating a skill.",
    needsHumanBoundary
      ? "- Human review boundary: This packet is for workflow understanding only and does not prove compliance, clinical correctness, eligibility, coverage, legal sufficiency, or safety."
      : "- Human review boundary: Required before external action, publication, or applying a workflow to a person, system, or regulated decision.",
    "",
    ...sections,
    "",
  ].join("\n");
}

function buildAudit({ doorCatalog, linkSeed, searchIndex }) {
  const candidateTypeCounts = new Map();
  for (const link of linkSeed.workflow_links ?? []) {
    const type = link.candidate_type || "unknown";
    candidateTypeCounts.set(type, (candidateTypeCounts.get(type) ?? 0) + 1);
  }

  return {
    generated_at: "2026-07-07",
    source: "quarantined market-research-agent import",
    door_count: doorCatalog.door_count,
    door_row_count: doorCatalog.rows?.length ?? 0,
    search_index_row_count: searchIndex.rows?.length ?? 0,
    workflow_link_count: linkSeed.workflow_link_count,
    door_count_is_final_workflow_count: false,
    expanded_leaf_workflow_count_status: "not fully materialized in the quarantine import",
    user_reported_leaf_workflow_scale: "almost ten thousand workflows",
    candidate_type_counts: [...candidateTypeCounts.entries()].map(([type, count]) => ({ type, count })),
    safety_boundaries: [
      "Treat the 171 rows as access doors, not finished workflows.",
      "Do not claim the expanded leaf-workflow count until a deeper expansion pass quantifies it.",
      "Do not copy full source workflow text into reader packets; store links and descriptions for extraction.",
      "High-stakes packets do not prove compliance, clinical correctness, legal sufficiency, or safety.",
    ],
  };
}

function renderAudit(audit) {
  const counts = audit.candidate_type_counts
    .map((entry) => `- ${entry.type}: ${entry.count}`)
    .join("\n");
  const boundaries = audit.safety_boundaries.map((boundary) => `- ${boundary}`).join("\n");

  return [
    "# Door vs Leaf Count Audit",
    "",
    `The quarantine currently exposes ${audit.door_count} access doors. This is not the final workflow count.`,
    "",
    `- Workflow link count in seed file: ${audit.workflow_link_count}`,
    `- Search index row count: ${audit.search_index_row_count}`,
    `- Expanded leaf-workflow count status: ${audit.expanded_leaf_workflow_count_status}`,
    `- User-reported expected scale: ${audit.user_reported_leaf_workflow_scale}`,
    "",
    "## Candidate Types",
    "",
    counts,
    "",
    "## Safety Boundaries",
    "",
    boundaries,
    "",
  ].join("\n");
}

function helpText() {
  return [
    "Usage:",
    "  node projects/real-life-workflows/artifacts/finder/workflow-understanding-finder.mjs --query \"healthcare pediatrics\" --limit 12",
    "  node projects/real-life-workflows/artifacts/finder/workflow-understanding-finder.mjs --query \"document evidence\" --output projects/real-life-workflows/artifacts/finder/packets/document-evidence.md",
    "  node projects/real-life-workflows/artifacts/finder/workflow-understanding-finder.mjs --audit",
  ].join("\n");
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(helpText());
    return;
  }

  const [searchIndex, doorCatalog, linkSeed] = await Promise.all([
    loadJson(searchIndexPath),
    loadJson(doorCatalogPath),
    loadJson(linkSeedPath),
  ]);

  if (args.audit) {
    const audit = buildAudit({ doorCatalog, linkSeed, searchIndex });
    console.log(JSON.stringify(audit, null, 2));
    return;
  }

  const recommendations = selectRecommendations(searchIndex.rows ?? [], linkSeed, args.query, args.limit);
  const packet = renderPacket({ query: args.query, limit: args.limit, recommendations });

  if (args.output) {
    await writeFile(path.join(root, args.output), packet, "utf8");
  } else {
    console.log(packet);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
