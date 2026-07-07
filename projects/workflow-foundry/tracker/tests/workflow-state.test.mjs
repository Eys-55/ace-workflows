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
  assert.equal(workflowFoundry.stats.open, 10);
  assert.equal(workflowFoundry.stats.blocked, 0);
  assert.equal(workflowFoundry.stats.inReview, 3);
  assert.equal(workflowFoundry.stats.done, 2);
  assert.equal(workflowFoundry.activeTaskCount, 10);
  assert.equal(workflowFoundry.hotPhase, "code-review");

  const trackerTask = workflowFoundry.tasks.find(
    (task) => task.id === "workflow-foundry-005",
  );

  assert.ok(trackerTask, "tracker task should be present");
  assert.equal(trackerTask.kind, "workflow-change");
  assert.equal(trackerTask.status, "in-progress");
  assert.equal(trackerTask.mattPhase, "code-review");
  assert.equal(trackerTask.lifecyclePhase, "code-review");
  assert.equal(trackerTask.explicitNextActionRequired, true);
  assert.equal(trackerTask.phaseGuard.selectedNextAction, "code-review");
  assert.equal(
    trackerTask.continueCommand,
    "$continue-task project:workflow-foundry task:workflow-foundry-005",
  );
  assert.equal(trackerTask.nextActionLabel, "code-review");
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
  assert.equal(trackerRunnerTask.lifecyclePhase, "code-review");
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
