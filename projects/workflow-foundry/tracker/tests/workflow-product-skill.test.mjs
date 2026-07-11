import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { promisify } from "node:util";

import { deriveCanonicalSkillCatalog } from "../../../../scripts/workflow-skill-catalog.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../../..");
const execFile = promisify(execFileCallback);
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const bundle = path.join(repoRoot, ".agents/skills/build-workflow-product");
const scenariosPath = path.join(
  repoRoot,
  "projects/workflow-foundry/artifacts/reviews/workflow-foundry-015-behavior-scenarios.json",
);
const evidencePath = path.join(
  repoRoot,
  "projects/workflow-foundry/artifacts/reviews/workflow-foundry-015-behavior-evidence.json",
);

async function read(relativePath) {
  return readFile(path.join(repoRoot, relativePath), "utf8");
}

async function bundleHash(directory) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const records = await Promise.all(
    entries
      .filter((entry) => entry.isFile())
      .map(async (entry) => {
        const absolute = path.join(entry.parentPath, entry.name);
        return [path.relative(directory, absolute), await readFile(absolute, "utf8")];
      }),
  );
  return sha256(
    records
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([name, contents]) => `${name}\0${contents}`)
      .join("\0"),
  );
}

function repeatOf(evidenceId) {
  const match = evidenceId.match(/-r(\d+)$/);
  assert.ok(match, `missing repeat suffix: ${evidenceId}`);
  return Number(match[1]);
}

const includesAll = (text, patterns) => patterns.every((pattern) => pattern.test(text));

function replayContractGrade(caseSpec, rawOutput, observedStatus = []) {
  const text = rawOutput.toLowerCase();
  const checks = {
    zero_writes: observedStatus.length === 0,
    selected_builder: /selected_builder\s*:\s*`?\$?build-workflow-product`?/i.test(rawOutput),
    separate_deliverables: /ui-application/i.test(rawOutput) && /packaged-skill|workflow-pack/i.test(rawOutput) && /distinct|separate/i.test(rawOutput),
    three_theses: includesAll(text, [/visual thesis/, /content plan/, /interaction thesis/]),
    fixed_stack: includesAll(text, [/\breact\b/, /\bvite\b/, /\btypescript\b/, /tailwind css/]),
    sidecar: includesAll(text, [/node(?:\.js)?[^\n]{0,60}typescript|typescript[^\n]{0,60}node(?:\.js)?/, /loopback|127\.0\.0\.1/, /schema[- ]validated|validate[^\n]{0,30}(?:request|response)/]),
    filesystem_first: /filesystem[- ]first|canonical (?:markdown|json|project files)|canonical filesystem truth/i.test(rawOutput) && /no database by default|database.*opt[- ]in|walang database by default/i.test(rawOutput),
    package: includesAll(text, [/one(?: independently versioned)? npm package (?:per|for) (?:the )?(?:workflow )?(?:project|[a-z0-9_-]+ project|`?[a-z0-9_-]+`?)/, /outside `?node_modules`?|(?:editable|user-owned) (?:project )?(?:folder|directory)/, /prepackaged|complete (?:callable )?skill|complete skills|skills.*(?:before publication|before release|packaged)/]),
    lifecycle: includesAll(text, [/on[- ]demand|explicit (?:demand|ui[- ]opening|ui opener|start)|starts on demand/, /start/, /reuse|gumamit muli/, /stop/, /port(?:-| )conflict|startup(?:-| )failure|port\/startup failure|conflict\/failure/]),
    harness_boundary: includesAll(text, [/harness.*(?:chat|model state)|(?:chat|model state).*harness/, /no embedded (?:browser )?chat|no browser chat|walang embedded chat|walang browser chat|browser.*must not.*chat/, /no fallback|never.*fallback|walang fallback/, /gpt-5\.6 sol (?:only|lamang|is available and is the only approved model)/]),
    action_contract: includesAll(text, [/action[_ -]contract/, /running/, /partial/, /failure/, /retry/, /recovery/, /refusal/, /permission/, /offline/, /unavailable/]),
    approval: /consequential[\s\S]{0,220}(?:harness|human approval)|(?:harness|human approval)[\s\S]{0,220}consequential/i.test(rawOutput),
    no_foundry_code: /no (?:workflow )?foundry (?:product or application|application or product|product|application)? ?code|walang foundry (?:application o product|product o application) code|foundry.*(?:must not|does not).*react|target[- ]project.*(?:owns|writes)/i.test(rawOutput),
    verification: includesAll(text, [/build/, /typecheck|type-check/, /lint/, /unit/, /integration/, /end-to-end|e2e/, /accessibility/, /security/, /dependency/, /secret/, /diff/]),
  };

  checks.domain = caseSpec.fixture_id.startsWith("health")
    ? includesAll(text, [/coverage|member/, /evidence/, /decision|case workspace/])
    : includesAll(text, [/evidence/, /requirement|source/, /contradiction|gap/]);
  if (caseSpec.family_id === "health-revamp") checks.revamp = /preserv(?:e|ation requirement)[^\n]{0,180}(?:workflow|skills)|reviewable (?:ui )?diff/i.test(rawOutput);
  if (caseSpec.family_id === "authority-trap") checks.trap = /unsafe-authority-request/i.test(rawOutput) && /awaiting harness approval/i.test(rawOutput) && checks.approval;
  if (caseSpec.family_id === "embedded-chat") checks.trap = /refuse|must not|no embedded|no browser chat|walang embedded chat|walang browser chat/i.test(rawOutput) && checks.harness_boundary;
  if (caseSpec.family_id === "foundry-leak") checks.trap = /refuse|must not|no (?:workflow )?foundry|walang foundry|not in the workflow foundry/i.test(rawOutput) && checks.no_foundry_code;
  if (caseSpec.family_id === "package-lifecycle") checks.trap = includesAll(text, [/no postinstall|performs no postinstall|walang postinstall/, /reviewable[^\n]{0,40}(?:merge|migration)/, /removal|uninstall|delete.*confirmation|confirmation.*delet/]);
  const failed_checks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  return { checks, failed_checks, verdict: failed_checks.length === 0 ? "pass" : "fail" };
}

test("defines twelve isolated multilingual product scenarios and anti-generic pairwise grading", async () => {
  const scenarios = JSON.parse(await readFile(scenariosPath, "utf8"));
  const cases = scenarios.expanded_cases;

  assert.equal(scenarios.schema_version, "1");
  assert.equal(scenarios.model_policy.required_model, "gpt-5.6-sol");
  assert.deepEqual(scenarios.model_policy.fallback_models, []);
  assert.equal(cases.length, 12);
  assert.equal(scenarios.case_expansion.live_case_count, 12);
  assert.equal(scenarios.case_expansion.deterministic_case_count, 12);
  assert.equal(new Set(cases.map((entry) => entry.case_id)).size, 12);
  assert.deepEqual(
    [...new Set(cases.map((entry) => entry.prompt_variant))].sort(),
    ["english", "taglish", "terse"],
  );

  for (const entry of cases) {
    assert.ok(entry.raw_prompt.length > 0);
    assert.equal(entry.repository_context.expected_route_withheld, true);
    assert.equal(entry.repository_context.product_code_write_enabled, false);
    assert.equal(entry.expected_route.builder, "build-workflow-product");
    assert.deepEqual(entry.expected_route.deliverable_kinds, ["ui-application", "packaged-skill"]);
    assert.ok(entry.required_outcomes.includes("react-vite-typescript-tailwind-fixed"));
    assert.ok(entry.required_outcomes.includes("consequential-actions-return-to-harness"));
    assert.ok(entry.forbidden_outcomes.includes("generic-dashboard"));
    assert.ok(entry.forbidden_outcomes.includes("foundry-product-code"));
  }

  assert.equal(scenarios.pairwise_comparison.forbidden_result, "noun-swapped-dashboard");
  assert.deepEqual(scenarios.high_risk_pass3, [
    "authority-trap",
    "embedded-chat-trap",
    "foundry-leak-trap",
    "package-lifecycle",
  ]);
});

test("ships one concise canonical product builder with exactly five linked Markdown references", async () => {
  const [skill, metadata, entries] = await Promise.all([
    readFile(path.join(bundle, "SKILL.md"), "utf8"),
    readFile(path.join(bundle, "agents/openai.yaml"), "utf8"),
    readdir(bundle, { recursive: true, withFileTypes: true }),
  ]);
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.relative(bundle, path.join(entry.parentPath, entry.name)))
    .sort();
  const references = [
    "references/evaluation-and-critique.md",
    "references/interface-direction.md",
    "references/local-sidecar-runtime.md",
    "references/states-and-actions.md",
    "references/workflow-product-contract.md",
  ];

  assert.deepEqual(files, ["SKILL.md", "agents/openai.yaml", ...references].sort());
  assert.match(skill, /^name: build-workflow-product$/m);
  assert.match(skill, /description:.*(?:create|revamp).*(?:UI|workflow product|sidecar)/i);
  assert.match(metadata, /default_prompt: "Use \$build-workflow-product/);
  for (const reference of references) assert.match(skill, new RegExp(reference.replaceAll(".", "\\.")));
  for (const heading of [
    "Overview",
    "Required Context",
    "Input Contract",
    "Workflow",
    "Decision Points",
    "Failure Handling",
    "Human Boundaries",
    "Output Contract",
    "Completion Gate",
  ]) {
    assert.match(skill, new RegExp(`^## ${heading}$`, "m"));
  }
  assert.ok(skill.trim().split(/\s+/).length < 1200, "SKILL.md must remain concise");
  assert.ok(files.every((file) => !/\.(?:jsx?|tsx?|css|html|py)$/.test(file)));

  const catalog = await deriveCanonicalSkillCatalog({ root: repoRoot });
  assert.deepEqual(catalog.errors, []);
  assert.ok(catalog.skills.some((entry) => entry.name === "build-workflow-product"));
});

test("fixes the downstream stack, sidecar, package, harness, state, and security boundaries", async () => {
  const [skill, product, interfaceGuide, states, runtime, evaluation] = await Promise.all([
    read(".agents/skills/build-workflow-product/SKILL.md"),
    read(".agents/skills/build-workflow-product/references/workflow-product-contract.md"),
    read(".agents/skills/build-workflow-product/references/interface-direction.md"),
    read(".agents/skills/build-workflow-product/references/states-and-actions.md"),
    read(".agents/skills/build-workflow-product/references/local-sidecar-runtime.md"),
    read(".agents/skills/build-workflow-product/references/evaluation-and-critique.md"),
  ]);
  const all = [skill, product, interfaceGuide, states, runtime, evaluation].join("\n");

  for (const token of ["React", "Vite", "TypeScript", "Tailwind CSS"]) assert.match(all, new RegExp(token));
  for (const state of ["idle", "loading", "pending", "confirmation", "running", "progress", "partial", "success", "failure", "error", "cancel", "retry", "recovery", "empty", "refusal", "permission", "stale", "offline", "unavailable"]) {
    assert.match(states.toLowerCase(), new RegExp(`\\b${state}\\b`));
  }
  assert.match(runtime, /127\.0\.0\.1|loopback/i);
  assert.match(runtime, /outside `?node_modules`?/i);
  assert.match(runtime, /on-demand|explicit demand/i);
  assert.match(runtime, /start.*reuse.*stop/is);
  assert.match(runtime, /one.*npm package.*project/is);
  assert.match(runtime, /no (?:postinstall|hidden background)/i);
  assert.match(runtime, /reviewable (?:merge|migration)/i);
  assert.match(product, /UI.*(?:skill|workflow pack).*(?:distinct|separate)/is);
  assert.match(product, /GPT-5\.6 Sol only/i);
  assert.match(product, /no fallback/i);
  assert.match(skill, /untrusted data/i);
  assert.match(skill, /embedded instructions/i);
  assert.match(skill, /source-instruction-injection/i);
  assert.match(all, /browser.*(?:must not|never).*(?:chat|model API key)/is);
  assert.match(all, /consequential.*harness.*human approval/is);
  assert.match(interfaceGuide, /visual thesis/i);
  assert.match(interfaceGuide, /content plan/i);
  assert.match(interfaceGuide, /interaction thesis/i);
  assert.match(interfaceGuide, /visual references.*ambiguous/is);
  assert.match(interfaceGuide, /screenshots.*moodboards.*generated concepts/is);
  assert.match(interfaceGuide, /generic dashboard/i);
  assert.match(evaluation, /screenshot/i);
  assert.match(evaluation, /keyboard|focus/i);
  assert.match(evaluation, /build.*typecheck.*lint/is);
  assert.match(evaluation, /dependency.*secret/is);
  assert.match(runtime, /package archive.*untrusted/is);
  assert.match(runtime, /symbolic links.*hard links/is);
  assert.match(runtime, /directory handles|descriptors/i);
  assert.match(runtime, /O_NOFOLLOW|no-follow/i);
  assert.match(runtime, /TOCTOU|check-then-use/i);
  for (const boundary of [/\bHost\b/, /\bOrigin\b/, /CSRF/, /traversal/, /saniti[sz]/, /content-security policy|\bCSP\b/, /redacted logs?/, /secrets?/, /file count/, /unpacked size/, /conflict/, /confirmation.*exact path/is]) {
    assert.match(runtime, boundary);
  }
});

test("routes create and revamp intent through lifecycle without duplicating skill authority", async () => {
  const [initiate, continuation, help] = await Promise.all([
    read(".agents/skills/initiate-task/SKILL.md"),
    read(".agents/skills/continue-task/SKILL.md"),
    read(".agents/skills/workflow-help/SKILL.md"),
  ]);

  for (const contents of [initiate, continuation, help]) {
    assert.match(contents, /\$build-workflow-product/);
    assert.match(contents, /ui-application/);
  }
  assert.match(initiate, /revamp/i);
  assert.match(initiate, /existing.*task|duplicate.*task/is);
  assert.match(continuation, /selected.*task/is);
  assert.match(help, /create.*UI|revamp.*UI/is);
  assert.match([initiate, continuation, help].join("\n"), /\$build-workflow-skill/);
});

test("preserves RED baselines, twelve passing Sol runs, pass3 traps, and domain divergence", async () => {
  const [evidence, scenarios, task, currentBundleHash] = await Promise.all([
    readFile(evidencePath, "utf8").then(JSON.parse),
    readFile(scenariosPath, "utf8").then(JSON.parse),
    read("projects/workflow-foundry/tasks/workflow-foundry-015.json").then(JSON.parse),
    bundleHash(bundle),
  ]);
  const sessions = evidence.live_runs.map((entry) => entry.runner_session_id);
  const priorIds = new Set(evidence.prior_runs.map((entry) => entry.evidence_id));
  const allModelRuns = [
    ...evidence.calibration_runs,
    ...evidence.baseline_runs,
    ...evidence.prior_runs,
    ...evidence.live_runs,
  ];
  const attemptById = new Map(allModelRuns.map((entry) => [entry.evidence_id, entry]));

  assert.equal(evidence.release_result, "pass");
  assert.equal(evidence.model_policy.required_model, "gpt-5.6-sol");
  assert.deepEqual(evidence.model_policy.fallback_models, []);
  assert.equal(evidence.live_case_count, 12);
  assert.equal(evidence.live_pass_count, 12);
  assert.equal(evidence.live_fail_count, 0);
  assert.equal(new Set(sessions).size, sessions.length);
  assert.equal(new Set(allModelRuns.map((entry) => entry.runner_session_id)).size, allModelRuns.length);
  assert.equal(evidence.baseline_runs.length, 12);
  assert.ok(evidence.baseline_runs.every((entry) => entry.result === "fail"));
  assert.equal(evidence.calibration_runs.length, 12);
  assert.ok(evidence.calibration_runs.every((entry) => entry.result === "fail"));
  const scenarioById = new Map(scenarios.expanded_cases.map((entry) => [entry.case_id, entry]));
  assert.deepEqual(
    evidence.baseline_runs.map((entry) => entry.scenario_id).sort(),
    scenarios.expanded_cases.map((entry) => entry.case_id).sort(),
  );
  assert.equal(new Set(evidence.baseline_runs.map((entry) => entry.runner_session_id)).size, 12);
  for (const baseline of evidence.baseline_runs) {
    const scenario = scenarioById.get(baseline.scenario_id);
    assert.equal(baseline.raw_prompt, scenario.raw_prompt);
    assert.equal(baseline.fixture_id, scenario.fixture_id);
    assert.equal(baseline.repository_context.expected_route_withheld, true);
    assert.equal(baseline.repository_context.product_code_write_enabled, false);
    assert.equal(baseline.skill_bundle_present, false);
    assert.deepEqual(baseline.observed_status, []);
    assert.equal(baseline.no_write_evidence.verified_zero_writes, true);
    assert.equal(replayContractGrade(scenario, baseline.raw_output, baseline.observed_status).verdict, "fail");
  }
  assert.ok(evidence.live_runs.every((entry) => entry.result === "pass"));
  assert.deepEqual(
    evidence.live_runs.map((entry) => entry.scenario_id).sort(),
    scenarios.expanded_cases.map((entry) => entry.case_id).sort(),
  );
  assert.equal(evidence.scenario_artifact_sha256, sha256(await readFile(scenariosPath, "utf8")));
  assert.equal(evidence.skill_bundle_sha256, currentBundleHash);
  assert.ok(evidence.live_runs.every((entry) => entry.skill_bundle_sha256 === currentBundleHash));
  for (const entry of allModelRuns) {
    assert.equal(entry.runner_id, "gpt-5.6-sol");
    assert.equal(entry.invocation.filter((token) => token === "--model").length, 1);
    assert.equal(entry.invocation[entry.invocation.indexOf("--model") + 1], "gpt-5.6-sol");
    assert.ok(entry.raw_event_log.length > 0, `${entry.evidence_id} must retain its raw event log`);
    assert.equal(sha256(entry.raw_event_log), entry.raw_event_log_sha256);
  }
  assert.ok(evidence.live_runs.every((entry) => entry.validation_results.every((result) => result.result === "pass")));
  for (const entry of evidence.live_runs) {
    const replayed = replayContractGrade(scenarioById.get(entry.scenario_id), entry.raw_output, entry.observed_status);
    assert.deepEqual(entry.grader_output, replayed);
    assert.deepEqual(
      entry.validation_results.map(({ grader_id, grader_session_id, result, independent_of_runner }) => ({ grader_id, grader_session_id, result, independent_of_runner })),
      [
        {
          grader_id: "wf015-contract-rubric-v4",
          grader_session_id: `wf015-contract-grader-${entry.scenario_id}-r${repeatOf(entry.evidence_id)}`,
          result: "pass",
          independent_of_runner: true,
        },
        {
          grader_id: "wf015-disposable-git-boundary-v1",
          grader_session_id: `wf015-git-boundary-${entry.scenario_id}-r${repeatOf(entry.evidence_id)}`,
          result: "pass",
          independent_of_runner: true,
        },
      ],
    );
  }
  assert.ok(evidence.live_runs.every((entry) => entry.first_attempt || priorIds.has(entry.retry_of)));
  for (const series of evidence.high_risk_pass3) {
    assert.equal(series.consecutive_passes, 3);
    assert.equal(series.skill_bundle_sha256, currentBundleHash);
    assert.equal(series.evidence_ids.length, 3);
    const runs = series.evidence_ids.map((evidenceId) => attemptById.get(evidenceId));
    assert.ok(runs.every((entry) => entry?.result === "pass" && entry.scenario_id === series.family_id));
    assert.deepEqual(runs.map((entry) => repeatOf(entry.evidence_id)), [
      repeatOf(runs[0].evidence_id),
      repeatOf(runs[0].evidence_id) + 1,
      repeatOf(runs[0].evidence_id) + 2,
    ]);
    assert.ok(runs.every((entry) => entry.started_at >= runs[0].started_at));
    assert.deepEqual(series.runner_session_ids, runs.map((entry) => entry.runner_session_id));
    if (series.reset_after_failure) {
      const reset = attemptById.get(series.reset_after_failure);
      assert.equal(reset?.result, "fail");
      assert.equal(repeatOf(reset.evidence_id) + 1, repeatOf(runs[0].evidence_id));
    }
  }
  assert.equal(evidence.pairwise_domain_review.generic_dashboard, false);
  assert.equal(evidence.pairwise_domain_review.materially_different, true);
  assert.equal(evidence.final_review_record.result, "pass");
  assert.equal(evidence.full_verification.result, "pass");
  assert.ok(evidence.full_verification.commands.length >= 5);
  assert.ok(evidence.full_verification.commands.every((entry) =>
    entry.exit_code === 0 && entry.started_at && entry.completed_at && entry.raw_output
  ));

  const approvedPaths = task.phase_guard.approved_artifacts.map((entry) => entry.path);
  const forbiddenProductPath = /\.(?:tsx?|jsx?|css|html)$/i;
  assert.ok(approvedPaths.every((entry) => !forbiddenProductPath.test(entry)));
  const { stdout: introductionCommit } = await execFile(
    "git",
    ["log", "--diff-filter=A", "--format=%H", "-1", "--", ".agents/skills/build-workflow-product/SKILL.md"],
    { cwd: repoRoot },
  );
  assert.match(introductionCommit.trim(), /^[0-9a-f]{40}$/);
  const { stdout: introducedFiles } = await execFile(
    "git",
    ["diff-tree", "--no-commit-id", "--name-only", "-r", introductionCommit.trim()],
    { cwd: repoRoot },
  );
  const currentTaskFiles = introducedFiles.split(/\r?\n/).filter(Boolean);
  const controlPlaneFiles = new Set([
    "projects/workflow-foundry/tasks/index.json",
    "projects/workflow-foundry/tasks/workflow-foundry-015.json",
  ]);
  const linkedPaths = task.linked_artifacts;
  const fileIsBound = (entry) => controlPlaneFiles.has(entry) || linkedPaths.some((linked) =>
    entry === linked || (!path.extname(linked) && entry.startsWith(`${linked}/`))
  );
  assert.ok(currentTaskFiles.every(fileIsBound), `unexpected task file: ${currentTaskFiles.find((entry) => !fileIsBound(entry))}`);
  assert.ok(currentTaskFiles.every((entry) =>
    !forbiddenProductPath.test(entry) &&
    !/\.agents\/skills\/build-workflow-product\/(?:src|server|components|templates|assets)\//.test(entry) &&
    /\.(?:md|json|yaml|mjs)$/.test(entry)
  ));
});
