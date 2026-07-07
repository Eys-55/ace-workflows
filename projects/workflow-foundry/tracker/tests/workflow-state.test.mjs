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

  const trackerTask = workflowFoundry.tasks.find(
    (task) => task.id === "workflow-foundry-005",
  );

  assert.ok(trackerTask, "tracker task should be present");
  assert.equal(trackerTask.kind, "workflow-change");
  assert.equal(trackerTask.status, "in-progress");
  assert.equal(trackerTask.mattPhase, "code-review");
  assert.equal(trackerTask.explicitNextActionRequired, true);
  assert.equal(trackerTask.phaseGuard.selectedNextAction, "code-review");
  assert.ok(
    trackerTask.linkedArtifacts.includes(
      "projects/workflow-foundry/artifacts/prds/workflow-foundry-005-astro-tracker.md",
    ),
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
