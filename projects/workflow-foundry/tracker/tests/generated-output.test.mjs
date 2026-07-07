import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("generated tracker snapshot contains read-only UI controls and task data", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");

  assert.match(html, /Read-only generated snapshot/);
  assert.match(html, /Dark mode/);
  assert.match(html, /Search projects/);
  assert.match(html, /Search selected project tasks/);
  assert.match(html, /Lifecycle rail/);
  assert.match(html, /Intake \/ Preflight/);
  assert.match(html, /workflow-foundry-005/);
  assert.match(html, /Create dark-mode project task tracker UI/);
  assert.match(html, /\$continue-task project:workflow-foundry task:workflow-foundry-005/);
  assert.match(html, /PRD/);
  assert.match(html, /Issues/);
  assert.match(html, /Skills/);
  assert.match(html, /Tracker/);
  assert.match(html, /Tests/);
  assert.match(html, /workflow-change/);
  assert.match(html, /code-review/);
  assert.match(html, /data-project-button/);
  assert.match(html, /data-phase-filter/);
  assert.match(html, /data-copy-command/);
  assert.doesNotMatch(html, /<form/i);
});
