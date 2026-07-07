import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import {
  createTestingSession,
  discoverTestingSessions,
  getTestingSessionStatus,
  recordTestingSessionEvent,
  stopTestingSession,
  validateTestingSessionState,
} from "../../../../scripts/testing-session-state.mjs";

async function makeRepoRoot() {
  const root = await mkdtemp(path.join(os.tmpdir(), "testing-session-state-"));
  const projectDir = path.join(root, "projects", "demo");

  await mkdir(path.join(projectDir, "tasks"), { recursive: true });
  await writeFile(
    path.join(projectDir, "project.json"),
    `${JSON.stringify(
      {
        project_slug: "demo",
        name: "Demo Project",
        project_state: "active",
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    path.join(projectDir, "tasks", "index.json"),
    `${JSON.stringify({ project_slug: "demo", tasks: [] }, null, 2)}\n`,
  );

  return root;
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function readJsonl(filePath) {
  const contents = await readFile(filePath, "utf8");
  return contents
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

test("creates an isolated project testing-session state bundle", async () => {
  const root = await makeRepoRoot();
  const result = await createTestingSession({
    root,
    projectSlug: "demo",
    goal: "Exercise the workflow without normal tracker writes.",
    sessionId: "demo-2026-07-07T000000Z",
    now: "2026-07-07T00:00:00.000Z",
    actor: "codex",
  });

  assert.equal(result.session.session_id, "demo-2026-07-07T000000Z");
  assert.equal(result.session.project_slug, "demo");
  assert.equal(result.session.status, "active");
  assert.equal(
    result.session.path,
    "projects/demo/artifacts/testing-sessions/demo-2026-07-07T000000Z",
  );

  const sessionDir = path.join(root, result.session.path);
  const session = await readJson(path.join(sessionDir, "session.json"));
  const index = await readJson(
    path.join(root, "projects", "demo", "artifacts", "testing-sessions", "index.json"),
  );
  const events = await readJsonl(path.join(sessionDir, "events.jsonl"));
  const taskFiles = await readdir(path.join(root, "projects", "demo", "tasks"));

  assert.equal(session.goal, "Exercise the workflow without normal tracker writes.");
  assert.deepEqual(events.map((event) => event.type), ["started", "preload_complete"]);
  assert.equal(index.sessions.length, 1);
  assert.equal(index.sessions[0].session_id, "demo-2026-07-07T000000Z");
  assert.equal(index.sessions[0].events_path, `${result.session.path}/events.jsonl`);
  assert.equal(index.sessions[0].event_count, 2);
  assert.equal(index.sessions[0].events, undefined);
  assert.deepEqual(taskFiles, ["index.json"]);

  for (const event of events) {
    assert.equal(event.session_id, "demo-2026-07-07T000000Z");
    assert.equal(event.project_slug, "demo");
    assert.equal(event.actor, "codex");
    assert.match(event.timestamp, /^\d{4}-\d{2}-\d{2}T/);
    assert.ok(Array.isArray(event.files_read));
    assert.ok(Array.isArray(event.files_written));
    assert.equal(typeof event.result_status, "string");
    assert.equal(typeof event.rationale, "string");
  }
});

test("discovers lightweight summaries and stops a testing session", async () => {
  const root = await makeRepoRoot();
  await createTestingSession({
    root,
    projectSlug: "demo",
    goal: "Check status and stop controls.",
    sessionId: "demo-2026-07-07T010000Z",
    now: "2026-07-07T01:00:00.000Z",
  });

  const active = await getTestingSessionStatus({
    root,
    sessionId: "demo-2026-07-07T010000Z",
  });
  const summaries = await discoverTestingSessions({ root, projectSlug: "demo" });

  assert.equal(active.status, "active");
  assert.equal(active.project_slug, "demo");
  assert.equal(active.events, undefined);
  assert.equal(summaries.length, 1);
  assert.equal(summaries[0].session_id, "demo-2026-07-07T010000Z");
  assert.equal(summaries[0].events, undefined);

  const recorded = await recordTestingSessionEvent({
    root,
    sessionId: "demo-2026-07-07T010000Z",
    type: "tool_run",
    now: "2026-07-07T01:10:00.000Z",
    actor: "codex",
    filesRead: ["projects/demo/project.json"],
    filesWritten: [
      "projects/demo/artifacts/testing-sessions/demo-2026-07-07T010000Z/events.jsonl",
    ],
    toolSummary: "node scripts/query-workflow-state.mjs --project demo --list-tasks",
    resultStatus: "ok",
    rationale: "Captured a read-only project query inside the testing session.",
  });

  assert.equal(recorded.summary.status, "active");
  assert.equal(recorded.summary.event_count, 3);

  const stopped = await stopTestingSession({
    root,
    sessionId: "demo-2026-07-07T010000Z",
    now: "2026-07-07T01:15:00.000Z",
    actor: "operator",
    rationale: "Operator requested stop.",
  });
  const afterStop = await getTestingSessionStatus({
    root,
    sessionId: "demo-2026-07-07T010000Z",
  });
  const events = await readJsonl(path.join(root, afterStop.events_path));

  assert.equal(stopped.session.status, "stopped");
  assert.equal(afterStop.status, "stopped");
  assert.equal(afterStop.stopped_at, "2026-07-07T01:15:00.000Z");
  assert.equal(afterStop.event_count, 4);
  assert.equal(events.at(-2).type, "tool_run");
  assert.equal(events.at(-1).type, "completed");
  assert.equal(events.at(-1).result_status, "stopped");
});

test("validates testing-session indexes and event JSONL", async () => {
  const root = await makeRepoRoot();
  const result = await createTestingSession({
    root,
    projectSlug: "demo",
    sessionId: "demo-2026-07-07T020000Z",
    now: "2026-07-07T02:00:00.000Z",
  });

  assert.deepEqual(await validateTestingSessionState({ root }), []);

  await writeFile(path.join(root, result.session.path, "events.jsonl"), "{bad json\n");
  const failures = await validateTestingSessionState({ root });

  assert.match(failures.join("\n"), /events\.jsonl line 1 is not valid JSON/);
});

test("rejects missing session metadata and escaped testing-session pointers", async () => {
  const root = await makeRepoRoot();
  const result = await createTestingSession({
    root,
    projectSlug: "demo",
    sessionId: "demo-2026-07-07T030000Z",
    now: "2026-07-07T03:00:00.000Z",
  });
  const sessionFile = path.join(root, result.session.session_path);
  const indexFile = path.join(
    root,
    "projects",
    "demo",
    "artifacts",
    "testing-sessions",
    "index.json",
  );
  const session = await readJson(sessionFile);
  const index = await readJson(indexFile);

  const { status, ...sessionWithoutStatus } = session;
  await writeFile(sessionFile, `${JSON.stringify(sessionWithoutStatus, null, 2)}\n`);
  let failures = await validateTestingSessionState({ root });

  assert.match(failures.join("\n"), /session\.json status must be a non-empty string/);

  await writeFile(sessionFile, `${JSON.stringify(session, null, 2)}\n`);
  await writeFile(
    indexFile,
    `${JSON.stringify(
      {
        ...index,
        sessions: [
          {
            ...index.sessions[0],
            events_path: "projects/demo/tasks/index.json",
          },
        ],
      },
      null,
      2,
    )}\n`,
  );
  failures = await validateTestingSessionState({ root });

  assert.match(
    failures.join("\n"),
    /events_path must stay under projects\/demo\/artifacts\/testing-sessions\/demo-2026-07-07T030000Z/,
  );
});

test("rejects malformed testing-session index shape", async () => {
  const root = await makeRepoRoot();
  const indexDir = path.join(
    root,
    "projects",
    "demo",
    "artifacts",
    "testing-sessions",
  );

  await mkdir(indexDir, { recursive: true });
  await writeFile(
    path.join(indexDir, "index.json"),
    `${JSON.stringify({ project_slug: "demo", sessions: {} }, null, 2)}\n`,
  );

  const failures = await validateTestingSessionState({ root });

  assert.match(failures.join("\n"), /index\.json must include sessions array/);
});
