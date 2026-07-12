import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("generated tracker snapshot contains read-only UI controls and task data", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");

  assert.match(html, /Read-only generated snapshot/);
  assert.match(html, /Dark mode/);
  assert.match(html, /Search projects/);
  assert.match(html, /Search selected project tasks/);
  assert.match(html, /Status overview/);
  assert.match(html, /Derived skill catalog/);
  assert.match(html, /Deliverable Readiness/);
  assert.match(html, /Runtime discovery/);
  assert.match(html, /In progress/);
  assert.match(html, /workflow-foundry-005/);
  assert.match(html, /Create dark-mode project task tracker UI/);
  assert.doesNotMatch(html, /\native Codex planning/);
  assert.match(html, /PRD/);
  assert.match(html, /Issues/);
  assert.match(html, /Skills/);
  assert.match(html, /Tracker/);
  assert.match(html, /Tests/);
  assert.match(html, /workflow-change/);
  assert.match(html, /in-progress/);
  assert.match(html, /data-project-button/);
  assert.match(html, /data-status-filter/);
  assert.doesNotMatch(html, /data-phase-filter/);
  assert.doesNotMatch(html, /data-copy-command/);
  assert.doesNotMatch(html, /<form/i);
});
