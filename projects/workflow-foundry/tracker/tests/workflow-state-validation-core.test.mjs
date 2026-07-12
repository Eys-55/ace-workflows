import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { validateWorkflowState } from "../../../../scripts/workflow-state-validation-core.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testDir, "../../../..");
const execFileAsync = promisify(execFile);
const cliPath = path.join(repoRoot, "scripts", "validate-workflow-state.mjs");
const queryCliPath = path.join(repoRoot, "scripts", "query-workflow-state.mjs");

test("validates the current repository without changed-file checks", async () => {
  const result = await validateWorkflowState({
    root: repoRoot,
    includeChangedFiles: false,
  });

  assert.deepEqual(result, { ok: true, errors: [] });
});

test("returns structured errors for an invalid empty repository", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-state-validation-core-"));
  t.after(() => rm(root, { recursive: true, force: true }));

  const result = await validateWorkflowState({
    root,
    includeChangedFiles: false,
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.includes(".agents/skills is missing"));
  assert.ok(result.errors.includes("registry/agents-md.json is missing"));
});

test("keeps validation modules below the repository file-size ceiling", async () => {
  for (const relativePath of [
    "scripts/workflow-state-validation-core.mjs",
    "scripts/workflow-state-validation-rules.mjs",
    "scripts/workflow-state-project-validation.mjs",
  ]) {
    const contents = await readFile(path.join(repoRoot, relativePath), "utf8");
    assert.ok(
      contents.split(/\r?\n/).length <= 800,
      `${relativePath} must stay at or below 800 lines`,
    );
  }
  const facade = await readFile(
    path.join(repoRoot, "scripts/workflow-state-validation-core.mjs"),
    "utf8",
  );
  assert.match(facade, /workflow-state-validation-rules\.mjs/);
  assert.match(facade, /workflow-state-project-validation\.mjs/);
});

test("does not gate work on changed-file task linkage", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-state-changes-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await execFileAsync("git", ["init", "--quiet"], { cwd: root });
  const changedPath = path.join(root, "projects", "fixture", "tasks", "fixture-001.json");
  await mkdir(path.dirname(changedPath), { recursive: true });
  await writeFile(changedPath, "{}\n");

  const result = await validateWorkflowState({ root, includeChangedFiles: true });
  assert.equal(result.ok, false);
  assert.ok(
    !result.errors.some((error) => error.includes("changed but is not linked")),
  );
});

test("legacy scan covers untracked Astro and JSONL files", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-state-legacy-files-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await execFileAsync("git", ["init", "--quiet"], { cwd: root });
  const retiredName = String.fromCharCode(109, 97, 116, 116);
  await writeFile(path.join(root, "new-view.astro"), `<p>${retiredName}</p>\n`);
  await writeFile(
    path.join(root, "events.jsonl"),
    `${JSON.stringify({ field: ["phase", "guard"].join("_") })}\n`,
  );

  const result = await validateWorkflowState({ root, includeChangedFiles: false });
  assert.ok(result.errors.includes("new-view.astro contains a removed workflow name"));
  assert.ok(
    result.errors.some((error) => error.startsWith("events.jsonl contains removed workflow token")),
  );
});

test("rejects removed lifecycle fields in task details and indexes", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-state-terminal-invariant-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await cp(repoRoot, root, {
    recursive: true,
    filter(source) {
      const relativeSource = path.relative(repoRoot, source);
      return !(
        relativeSource === ".git" ||
        relativeSource.split(path.sep).includes("node_modules") ||
        relativeSource.split(path.sep).includes("dist")
      );
    },
  });
  await execFileAsync("git", ["init", "--quiet"], { cwd: root });
  await execFileAsync("git", ["add", "."], { cwd: root });
  await execFileAsync(
    "git",
    [
      "-c",
      "user.name=Fixture",
      "-c",
      "user.email=fixture@example.com",
      "-c",
      "commit.gpgsign=false",
      "-c",
      "core.hooksPath=/dev/null",
      "commit",
      "--quiet",
      "-m",
      "baseline",
    ],
    { cwd: root },
  );

  const taskPath = path.join(
    root,
    "projects/workflow-foundry/tasks/workflow-foundry-007.json",
  );
  const contractedTaskPath = path.join(
    root,
    "projects/workflow-foundry/tasks/workflow-foundry-015.json",
  );
  const indexPath = path.join(root, "projects/workflow-foundry/tasks/index.json");
  const task = JSON.parse(await readFile(taskPath, "utf8"));
  const contractedTask = JSON.parse(await readFile(contractedTaskPath, "utf8"));
  const index = JSON.parse(await readFile(indexPath, "utf8"));
  const retiredPrefix = String.fromCharCode(109, 97, 116, 116);
  const removedLifecycleField = [retiredPrefix, "phase"].join("_");
  const removedWriteGate = ["phase", "guard"].join("_");
  const taskWithRemovedFields = {
    ...task,
    [removedLifecycleField]: "intake",
    [removedWriteGate]: {
      selected_next_action: "none",
      approved_artifacts: [],
      process_exceptions: [],
    },
  };
  const indexWithRemovedField = {
    ...index,
    tasks: index.tasks.map((item) =>
      item.task_id === task.task_id
        ? { ...item, [removedLifecycleField]: "intake", updated_at: "1900-01-01" }
        : item,
    ),
  };
  await writeFile(taskPath, `${JSON.stringify(taskWithRemovedFields, null, 2)}\n`);
  await writeFile(indexPath, `${JSON.stringify(indexWithRemovedField, null, 2)}\n`);
  contractedTask.deliverable_contracts[0].required_artifacts[0].locator = "../../escape.md";
  await writeFile(contractedTaskPath, `${JSON.stringify(contractedTask, null, 2)}\n`);

  const result = await validateWorkflowState({ root, includeChangedFiles: false });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes(`removed field ${removedLifecycleField}`)));
  assert.ok(result.errors.some((error) => error.includes(`removed field ${removedWriteGate}`)));
  assert.ok(result.errors.some((error) => error.includes("updated_at mismatch")));
  assert.ok(
    result.errors.some(
      (error) => error.includes("workflow-foundry-015.json contract-routing-invalid"),
    ),
  );
});

test("query CLI treats a missing task index as an empty optional ledger", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-query-optional-ledger-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "projects", "demo"), { recursive: true });
  await writeFile(path.join(root, "projects", "demo", "project.json"), '{"project_slug":"demo"}\n');

  const result = await execFileAsync(
    process.execPath,
    [queryCliPath, "--project", "demo", "--list-tasks"],
    { cwd: root },
  );
  assert.equal(result.stdout, "No matching tasks found.\n");
});

test("query CLI rejects the removed phase filter", async () => {
  await assert.rejects(
    execFileAsync(process.execPath, [queryCliPath, "--project", "workflow-foundry", "--list-tasks", "--phase", "done"], { cwd: repoRoot }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /Unsupported argument: --phase/);
      return true;
    },
  );
});

test("preserves the thin CLI success and failure contracts", async (t) => {
  const valid = await execFileAsync(process.execPath, [cliPath], { cwd: repoRoot });
  assert.equal(valid.stdout, "Workflow state is valid.\n");
  assert.equal(valid.stderr, "");

  const invalidRoot = await mkdtemp(path.join(os.tmpdir(), "workflow-state-cli-"));
  t.after(() => rm(invalidRoot, { recursive: true, force: true }));
  await assert.rejects(
    execFileAsync(process.execPath, [cliPath], { cwd: invalidRoot }),
    (error) => {
      assert.equal(error.code, 1);
      assert.match(error.stderr, /^- \.agents\/skills is missing/m);
      assert.equal(error.stdout, "");
      return true;
    },
  );
});

test("query CLI rejects project, task-id, and symlink escapes", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-query-boundary-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const demoTasks = path.join(root, "projects", "demo", "tasks");
  const outsideTasks = path.join(root, "outside-project", "tasks");
  await mkdir(demoTasks, { recursive: true });
  await mkdir(outsideTasks, { recursive: true });
  await writeFile(path.join(root, "projects", "demo", "project.json"), "{}\n");
  await writeFile(path.join(demoTasks, "index.json"), '{"tasks":[]}\n');
  await writeFile(path.join(root, "projects", "escaped.json"), '{"secret":"task traversal"}\n');
  await writeFile(path.join(root, "outside-project", "project.json"), "{}\n");
  await writeFile(path.join(outsideTasks, "index.json"), '{"tasks":[]}\n');
  await writeFile(path.join(outsideTasks, "outside-001.json"), '{"secret":"project traversal"}\n');
  await writeFile(path.join(root, "outside-task.json"), '{"secret":"symlink traversal"}\n');
  await symlink(path.join(root, "outside-task.json"), path.join(demoTasks, "demo-001.json"));

  for (const invocation of [
    ["--project", "demo", "--task", "../../escaped"],
    ["--project", "../outside-project", "--task", "outside-001"],
    ["--project", "demo", "--task", "demo-001"],
  ]) {
    await assert.rejects(
      execFileAsync(process.execPath, [queryCliPath, ...invocation], { cwd: root }),
      (error) => {
        assert.equal(error.code, 1);
        assert.match(
          error.stderr,
          /Invalid --project|Invalid task id|outside its selected project's tasks directory/,
        );
        assert.equal(error.stdout, "");
        return true;
      },
    );
  }
});
