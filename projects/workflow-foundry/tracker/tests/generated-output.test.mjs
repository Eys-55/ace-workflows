import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

test("generated tracker snapshot contains read-only UI controls and task data", async () => {
  const html = await readFile(new URL("../dist/index.html", import.meta.url), "utf8");

  assert.match(html, /Read-only generated snapshot/);
  assert.match(html, /Dark mode/);
  assert.match(html, /Current project only/);
  assert.match(html, /workflow-foundry-005/);
  assert.match(html, /Create dark-mode project task tracker UI/);
  assert.match(html, /workflow-change/);
  assert.match(html, /code-review/);
  assert.doesNotMatch(html, /<form/i);
});
