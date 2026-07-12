import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import { loadProject, loadWorkflowState } from "../src/lib/workflow-state.mjs";

test("loads a project without a task ledger", async (t) => {
  const projectDir = await mkdtemp(path.join(os.tmpdir(), "workflow-project-no-ledger-"));
  t.after(() => rm(projectDir, { recursive: true, force: true }));
  await writeFile(
    path.join(projectDir, "project.json"),
    `${JSON.stringify({
      project_slug: "no-ledger",
      name: "No Ledger",
      project_state: "active",
      domain: "fixture",
      goal: "Prove task tracking is optional.",
      updated_at: "2026-07-13",
    })}\n`,
  );

  const project = await loadProject(projectDir, { skills: [], errors: [] });
  assert.equal(project.slug, "no-ledger");
  assert.deepEqual(project.tasks, []);
  assert.equal(project.taskIndexPath, null);
});

test("loads all projects and task details from repo JSON", async () => {
  const state = await loadWorkflowState();
  const workflowFoundry = state.projects.find(
    (project) => project.slug === "workflow-foundry",
  );

  assert.equal(state.currentProjectSlug, "workflow-foundry");
  assert.ok(workflowFoundry, "workflow-foundry project should be present");
  assert.equal(workflowFoundry.state, "active");
  const expectedStats = workflowFoundry.tasks.reduce(
    (stats, task) => ({
      open: stats.open + (task.status === "done" ? 0 : 1),
      todo: stats.todo + (task.status === "todo" ? 1 : 0),
      inProgress: stats.inProgress + (task.status === "in-progress" ? 1 : 0),
      blocked: stats.blocked + (task.status === "blocked" ? 1 : 0),
      done: stats.done + (task.status === "done" ? 1 : 0),
    }),
    { open: 0, todo: 0, inProgress: 0, blocked: 0, done: 0 },
  );
  const expectedAttentionStatus =
    ["blocked", "in-progress", "todo"].find((status) =>
      workflowFoundry.tasks.some((task) => task.status === status),
    ) ?? "done";

  assert.deepEqual(workflowFoundry.stats, expectedStats);
  assert.equal(workflowFoundry.activeTaskCount, expectedStats.open);
  assert.equal(workflowFoundry.attentionStatus, expectedAttentionStatus);

  const trackerTask = workflowFoundry.tasks.find(
    (task) => task.id === "workflow-foundry-005",
  );

  assert.ok(trackerTask, "tracker task should be present");
  assert.equal(trackerTask.kind, "workflow-change");
  assert.equal(trackerTask.status, "done");
  assert.equal(trackerTask.nextAction, "none");
  assert.equal("lifecyclePhase" in trackerTask, false);
  assert.equal("phaseGuard" in trackerTask, false);
  assert.equal("continueCommand" in trackerTask, false);
  assert.ok(
    trackerTask.linkedArtifacts.includes(
      "projects/workflow-foundry/artifacts/prds/workflow-foundry-005-astro-tracker.md",
    ),
  );
  assert.equal(trackerTask.artifactGroups.prd.count, 1);
  assert.equal(trackerTask.artifactGroups.issues.count, 4);
  assert.equal(trackerTask.artifactGroups.tracker.count, 6);
  assert.equal(trackerTask.artifactGroups.tests.count, 2);
  assert.ok(
    trackerTask.artifactGroups.prd.items.some(
      (artifact) => artifact.label === "workflow-foundry-005-astro-tracker",
    ),
  );
});

test("derives task status, next action, artifact groups, and recent session events", async () => {
  const state = await loadWorkflowState();
  const workflowFoundry = state.projects.find(
    (project) => project.slug === "workflow-foundry",
  );
  const trackerRunnerTask = workflowFoundry.tasks.find(
    (task) => task.id === "workflow-foundry-009",
  );

  assert.ok(trackerRunnerTask, "tracker runner task should be present");
  assert.equal(trackerRunnerTask.status, "done");
  assert.equal(trackerRunnerTask.nextAction, "none");
  assert.equal(trackerRunnerTask.artifactGroups.skills.count, 2);
  assert.equal(trackerRunnerTask.artifactGroups.tests.count, 2);
  assert.equal(trackerRunnerTask.artifactGroups.issues.count, 4);
  assert.equal(trackerRunnerTask.recentSessionEvents.length, 5);
  assert.ok(
    trackerRunnerTask.searchText.includes("workflow-foundry-009-tracker-ui-runner"),
  );
});

test("includes snapshot metadata for generated tracker output", async () => {
  const state = await loadWorkflowState();

  assert.match(state.generatedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(state.projectCount, state.projects.length);
  assert.equal(
    state.taskCount,
    state.projects.reduce((total, project) => total + project.tasks.length, 0),
  );
});

test("projects deliverable readiness and the derived skill catalog read-only", async () => {
  const state = await loadWorkflowState();
  const workflowFoundry = state.projects.find(
    (project) => project.slug === "workflow-foundry",
  );
  const revamp = workflowFoundry.tasks.find(
    (task) => task.id === "workflow-foundry-006",
  );

  assert.ok(revamp.deliverableContracts.length >= 2);
  assert.equal(typeof revamp.deliverableReadiness.completion_ready, "boolean");
  assert.ok(Array.isArray(revamp.deliverableReadiness.blockers));
  assert.ok(
    state.skillCatalog.skills.some((skill) => skill.name === "workflow-tracker-ui"),
  );
  assert.deepEqual(state.skillCatalog.errors, []);
});
