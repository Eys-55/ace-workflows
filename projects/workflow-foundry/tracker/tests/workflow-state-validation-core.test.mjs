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

test("exercises changed-file linkage in a disposable git repository", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "workflow-state-changes-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await execFileAsync("git", ["init", "--quiet"], { cwd: root });
  const changedPath = path.join(root, "projects", "fixture", "tasks", "fixture-001.json");
  await mkdir(path.dirname(changedPath), { recursive: true });
  await writeFile(changedPath, "{}\n");

  const result = await validateWorkflowState({ root, includeChangedFiles: true });
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.includes(
      "projects/fixture/tasks/fixture-001.json changed but is not linked to a non-done tracker-maintenance task",
    ),
  );
});

test("keeps mismatched done status and phase invalid, completion-gated, and open for linkage", async (t) => {
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
  const indexPath = path.join(root, "projects/workflow-foundry/tasks/index.json");
  const artifact = "projects/workflow-foundry/artifacts/reviews/terminal-mismatch.md";
  const task = JSON.parse(await readFile(taskPath, "utf8"));
  const index = JSON.parse(await readFile(indexPath, "utf8"));
  const legacySourcePath = path.join(
    root,
    "projects/workflow-foundry/tasks/workflow-foundry-001.json",
  );
  const spoofedPath = path.join(
    root,
    "projects/workflow-foundry/tasks/spoofed-legacy.json",
  );
  const legacyTask = JSON.parse(await readFile(legacySourcePath, "utf8"));
  const mismatchedTask = {
    ...task,
    status: "done",
    matt_phase: "intake",
    linked_artifacts: [...task.linked_artifacts, artifact],
  };
  const mismatchedIndex = {
    ...index,
    tasks: [
      ...index.tasks.map((item) =>
        item.task_id === task.task_id
          ? { ...item, status: "done", matt_phase: "intake" }
          : item,
      ),
      {
        task_id: "spoofed-legacy",
        title: legacyTask.title,
        task_kind: legacyTask.task_kind,
        status: "done",
        matt_phase: "done",
        updated_at: legacyTask.updated_at,
      },
    ],
  };
  await writeFile(taskPath, `${JSON.stringify(mismatchedTask, null, 2)}\n`);
  await writeFile(indexPath, `${JSON.stringify(mismatchedIndex, null, 2)}\n`);
  await writeFile(spoofedPath, `${JSON.stringify(legacyTask, null, 2)}\n`);
  await mkdir(path.join(root, path.dirname(artifact)), { recursive: true });
  await writeFile(path.join(root, artifact), "# Terminal mismatch fixture\n");

  const result = await validateWorkflowState({ root, includeChangedFiles: true });
  assert.equal(result.ok, false);
  assert.ok(
    result.errors.includes(
      "projects/workflow-foundry/tasks/index.json status and matt_phase for workflow-foundry-007 must both be done or both be non-done",
    ),
  );
  assert.ok(
    result.errors.includes(
      "projects/workflow-foundry/tasks/workflow-foundry-007.json status and matt_phase must both be done or both be non-done",
    ),
  );
  assert.ok(
    result.errors.some(
      (error) =>
        error.includes("projects/workflow-foundry/tasks/workflow-foundry-007.json") &&
        error.includes("migration-pending"),
    ),
    "status done must still run completion readiness even when matt_phase is not done",
  );
  assert.ok(
    result.errors.includes(
      'projects/workflow-foundry/tasks/spoofed-legacy.json task_id must equal "spoofed-legacy"',
    ),
    "a grandfathered internal task id cannot bypass the indexed filename identity",
  );
  assert.ok(
    !result.errors.includes(`${artifact} changed but is not linked to a non-done task`),
    "a terminal mismatch must remain in the open-task linkage projection",
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

test("query CLI rejects project, task-id, and symlink escapes in both task modes", async (t) => {
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

  for (const mode of ["--task", "--task-readiness"]) {
    for (const invocation of [
      ["--project", "demo", mode, "../../escaped"],
      ["--project", "../outside-project", mode, "outside-001"],
      ["--project", "demo", mode, "demo-001"],
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
  }
});
