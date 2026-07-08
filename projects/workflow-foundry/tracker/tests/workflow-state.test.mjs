import assert from "node:assert/strict";
import { test } from "node:test";
import { loadWorkflowState } from "../src/lib/workflow-state.mjs";

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
      blocked: stats.blocked + (task.status === "blocked" ? 1 : 0),
      inReview: stats.inReview + (task.mattPhase === "code-review" ? 1 : 0),
      done: stats.done + (task.status === "done" ? 1 : 0),
    }),
    { open: 0, blocked: 0, inReview: 0, done: 0 },
  );
  const expectedHotPhase =
    ["implement", "code-review", "issues", "prd", "grilling", "intake"].find(
      (phase) =>
        workflowFoundry.tasks.some(
          (task) => task.status !== "done" && task.lifecyclePhase === phase,
        ),
    ) ?? "done";

  assert.deepEqual(workflowFoundry.stats, expectedStats);
  assert.equal(workflowFoundry.activeTaskCount, expectedStats.open);
  assert.equal(workflowFoundry.hotPhase, expectedHotPhase);

  const trackerTask = workflowFoundry.tasks.find(
    (task) => task.id === "workflow-foundry-005",
  );

  assert.ok(trackerTask, "tracker task should be present");
  assert.equal(trackerTask.kind, "workflow-change");
  assert.equal(trackerTask.status, "done");
  assert.equal(trackerTask.mattPhase, "done");
  assert.equal(trackerTask.lifecyclePhase, "done");
  assert.equal(trackerTask.explicitNextActionRequired, true);
  assert.equal(trackerTask.phaseGuard.selectedNextAction, "none");
  assert.equal(
    trackerTask.continueCommand,
    "$continue-task project:workflow-foundry task:workflow-foundry-005",
  );
  assert.equal(trackerTask.nextActionLabel, "explicit next action required");
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

test("derives task command, lifecycle, artifact groups, and recent session events", async () => {
  const state = await loadWorkflowState();
  const workflowFoundry = state.projects.find(
    (project) => project.slug === "workflow-foundry",
  );
  const trackerRunnerTask = workflowFoundry.tasks.find(
    (task) => task.id === "workflow-foundry-009",
  );

  assert.ok(trackerRunnerTask, "tracker runner task should be present");
  assert.equal(trackerRunnerTask.status, "done");
  assert.equal(trackerRunnerTask.lifecyclePhase, "done");
  assert.equal(
    trackerRunnerTask.continueCommand,
    "$continue-task project:workflow-foundry task:workflow-foundry-009",
  );
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
