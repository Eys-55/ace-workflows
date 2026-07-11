import {
  appendFile,
  mkdir,
  readdir,
  readFile,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const allowedEventTypes = new Set([
  "started",
  "preload_complete",
  "decision",
  "tool_run",
  "artifact_read",
  "finding",
  "blocked",
  "completed",
]);
const allowedSessionStatuses = new Set(["active", "stopped", "completed", "blocked"]);
const sessionIdPattern = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const projectSlugPattern = /^[a-z0-9][a-z0-9-]*$/;
const privateTextPatterns = [
  /(?:^|[\s"'(])(?:\/Users\/|\/home\/|[A-Za-z]:\\Users\\)/i,
  /\b(?:cancer|serious disease|diagnos(?:is|ed)|medical condition|no insurance|uninsured)\b/i,
  /\b(?:policy number|claim number|member id|date of birth)\b/i,
  /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
  /\b(?:api[_-]?key|client[_-]?secret|private[_-]?key|password)\s*[:=]/i,
  /\b(?:ghp_[A-Za-z0-9]{20,}|sk-[A-Za-z0-9]{16,})\b/,
];

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

function normalizeRoot(root) {
  return path.resolve(root ?? process.cwd());
}

function relativePath(root, filePath) {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function projectDir(root, projectSlug) {
  return path.join(root, "projects", projectSlug);
}

function testingSessionsDir(root, projectSlug) {
  return path.join(projectDir(root, projectSlug), "artifacts", "testing-sessions");
}

function indexPath(root, projectSlug) {
  return path.join(testingSessionsDir(root, projectSlug), "index.json");
}

function assertProjectSlug(projectSlug) {
  if (typeof projectSlug !== "string" || !projectSlugPattern.test(projectSlug)) {
    throw new Error("projectSlug must be a lowercase hyphenated project slug");
  }
}

function assertSessionId(sessionId) {
  if (typeof sessionId !== "string" || !sessionIdPattern.test(sessionId)) {
    throw new Error("sessionId must contain only letters, digits, dots, underscores, or hyphens");
  }
}

function publicSafeTextError(value) {
  if (typeof value !== "string" || value === "") return null;
  return privateTextPatterns.some((pattern) => pattern.test(value))
    ? "failed the best-effort sensitive-pattern screen; use only neutral, redacted testing-session text"
    : null;
}

function assertPublicSafeText(value, label) {
  const error = publicSafeTextError(value);
  if (error) throw new Error(`${label} ${error}`);
}

function repositoryRelativePathError(value) {
  if (typeof value !== "string" || value.trim() === "") {
    return "must be a non-empty repository-relative testing-session path";
  }
  const normalized = value.replaceAll("\\", "/");
  const isAbsolute =
    path.posix.isAbsolute(value) ||
    path.win32.isAbsolute(value) ||
    normalized.startsWith("//") ||
    normalized.startsWith("~/");
  if (isAbsolute || normalized.split("/").includes("..")) {
    return "must be a repository-relative testing-session path without traversal";
  }
  return null;
}

function assertRepositoryRelativePaths(values, label) {
  if (!Array.isArray(values)) throw new Error(`${label} must be an array`);
  for (const [index, value] of values.entries()) {
    const error = repositoryRelativePathError(value);
    if (error) throw new Error(`${label}[${index}] ${error}`);
  }
}

function toIsoTimestamp(value = new Date()) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value !== "string") {
    throw new Error("now must be an ISO timestamp string or Date");
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid timestamp: ${value}`);
  }

  return date.toISOString();
}

function createSessionId(projectSlug, timestamp) {
  const stamp = timestamp.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${projectSlug}-${stamp}`;
}

async function loadProjectFiles(root, projectSlug) {
  assertProjectSlug(projectSlug);

  const projectFile = path.join(projectDir(root, projectSlug), "project.json");
  const taskIndexFile = path.join(projectDir(root, projectSlug), "tasks", "index.json");

  if (!(await exists(projectFile))) {
    throw new Error(`Missing ${relativePath(root, projectFile)}`);
  }
  if (!(await exists(taskIndexFile))) {
    throw new Error(`Missing ${relativePath(root, taskIndexFile)}`);
  }

  const project = await readJson(projectFile);
  const taskIndex = await readJson(taskIndexFile);

  if (project.project_slug !== projectSlug) {
    throw new Error(`${relativePath(root, projectFile)} project_slug must equal "${projectSlug}"`);
  }
  if (taskIndex.project_slug !== projectSlug) {
    throw new Error(`${relativePath(root, taskIndexFile)} project_slug must equal "${projectSlug}"`);
  }

  return {
    project,
    taskIndex,
    projectFile: relativePath(root, projectFile),
    taskIndexFile: relativePath(root, taskIndexFile),
  };
}

async function loadIndex(root, projectSlug) {
  const filePath = indexPath(root, projectSlug);
  if (!(await exists(filePath))) {
    return {
      schema_version: 1,
      project_slug: projectSlug,
      updated_at: null,
      sessions: [],
    };
  }

  const index = await readJson(filePath);
  if (index.project_slug !== projectSlug) {
    throw new Error(`${relativePath(root, filePath)} project_slug must equal "${projectSlug}"`);
  }
  if (!Array.isArray(index.sessions)) {
    throw new Error(`${relativePath(root, filePath)} must include sessions array`);
  }

  return index;
}

function createEvent({
  type,
  timestamp,
  actor,
  sessionId,
  projectSlug,
  taskContext = null,
  filesRead = [],
  filesWritten = [],
  toolSummary = "",
  resultStatus,
  rationale,
}) {
  if (!allowedEventTypes.has(type)) {
    throw new Error(`Invalid testing-session event type: ${type}`);
  }
  assertPublicSafeText(toolSummary, "toolSummary");
  assertPublicSafeText(rationale, "rationale");
  assertPublicSafeText(
    typeof taskContext === "string" ? taskContext : JSON.stringify(taskContext ?? ""),
    "taskContext",
  );
  assertRepositoryRelativePaths(filesRead, "filesRead");
  assertRepositoryRelativePaths(filesWritten, "filesWritten");

  return {
    timestamp,
    type,
    actor,
    session_id: sessionId,
    project_slug: projectSlug,
    task_context: taskContext,
    files_read: [...filesRead],
    files_written: [...filesWritten],
    tool_summary: toolSummary,
    result_status: resultStatus,
    rationale,
  };
}

function createSummary(session, eventCount) {
  return {
    session_id: session.session_id,
    project_slug: session.project_slug,
    status: session.status,
    goal: session.goal,
    actor: session.actor,
    started_at: session.started_at,
    updated_at: session.updated_at,
    stopped_at: session.stopped_at,
    path: session.path,
    session_path: session.session_path,
    events_path: session.events_path,
    notes_path: session.notes_path,
    event_count: eventCount,
  };
}

function upsertSummary(index, summary, timestamp) {
  const sessions = index.sessions.filter(
    (item) => item.session_id !== summary.session_id,
  );

  return {
    ...index,
    updated_at: timestamp,
    sessions: [...sessions, summary].sort((left, right) =>
      left.started_at.localeCompare(right.started_at),
    ),
  };
}

async function readJsonl(filePath) {
  const contents = await readFile(filePath, "utf8");
  return contents
    .trim()
    .split("\n")
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

async function findProjectSlugs(root) {
  const projectsRoot = path.join(root, "projects");
  if (!(await exists(projectsRoot))) return [];

  const entries = await readdir(projectsRoot, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function locateSession(root, sessionId, projectSlug = null) {
  assertSessionId(sessionId);
  if (projectSlug) assertProjectSlug(projectSlug);

  const projectSlugs = projectSlug ? [projectSlug] : await findProjectSlugs(root);
  for (const slug of projectSlugs) {
    const filePath = indexPath(root, slug);
    if (!(await exists(filePath))) continue;

    const index = await readJson(filePath);
    const summary = Array.isArray(index.sessions)
      ? index.sessions.find((item) => item.session_id === sessionId)
      : null;
    if (summary) {
      return { projectSlug: slug, index, summary, indexFile: filePath };
    }
  }

  throw new Error(`Testing session not found: ${sessionId}`);
}

export async function createTestingSession({
  root = process.cwd(),
  projectSlug,
  goal = "",
  sessionId = null,
  now = new Date(),
  actor = "testing-session",
  taskContext = null,
} = {}) {
  const resolvedRoot = normalizeRoot(root);
  const timestamp = toIsoTimestamp(now);
  assertPublicSafeText(goal, "goal");
  assertPublicSafeText(
    typeof taskContext === "string" ? taskContext : JSON.stringify(taskContext ?? ""),
    "taskContext",
  );
  const projectFiles = await loadProjectFiles(resolvedRoot, projectSlug);
  const resolvedSessionId = sessionId ?? createSessionId(projectSlug, timestamp);

  assertSessionId(resolvedSessionId);

  const sessionsDir = testingSessionsDir(resolvedRoot, projectSlug);
  const sessionDir = path.join(sessionsDir, resolvedSessionId);
  const sessionRelativeDir = relativePath(resolvedRoot, sessionDir);
  const sessionFile = path.join(sessionDir, "session.json");
  const eventsFile = path.join(sessionDir, "events.jsonl");
  const notesFile = path.join(sessionDir, "notes.md");
  const indexFile = indexPath(resolvedRoot, projectSlug);

  if (await exists(sessionDir)) {
    throw new Error(`Testing session already exists: ${sessionRelativeDir}`);
  }

  await mkdir(sessionDir, { recursive: true });

  const session = {
    schema_version: 1,
    session_id: resolvedSessionId,
    project_slug: projectSlug,
    status: "active",
    goal: typeof goal === "string" ? goal : "",
    actor,
    started_at: timestamp,
    updated_at: timestamp,
    stopped_at: null,
    path: sessionRelativeDir,
    session_path: `${sessionRelativeDir}/session.json`,
    events_path: `${sessionRelativeDir}/events.jsonl`,
    notes_path: `${sessionRelativeDir}/notes.md`,
    read_only_boundary: {
      normal_project_state: "read-only",
      allowed_writes: [
        "projects/<project-slug>/artifacts/testing-sessions/index.json",
        "projects/<project-slug>/artifacts/testing-sessions/<session-id>/",
      ],
    },
  };
  const index = await loadIndex(resolvedRoot, projectSlug);
  const filesWritten = [
    session.session_path,
    session.events_path,
    session.notes_path,
    relativePath(resolvedRoot, indexFile),
  ];
  const events = [
    createEvent({
      type: "started",
      timestamp,
      actor,
      sessionId: resolvedSessionId,
      projectSlug,
      taskContext,
      filesRead: [projectFiles.projectFile, projectFiles.taskIndexFile],
      filesWritten,
      toolSummary: "testing-session action:start",
      resultStatus: "active",
      rationale: "Started isolated testing session state for the selected project.",
    }),
    createEvent({
      type: "preload_complete",
      timestamp,
      actor,
      sessionId: resolvedSessionId,
      projectSlug,
      taskContext,
      filesRead: [projectFiles.projectFile, projectFiles.taskIndexFile],
      filesWritten: [session.events_path],
      toolSummary: "project preload for testing-session",
      resultStatus: "ok",
      rationale:
        "Loaded project metadata and task index without editing normal project state.",
    }),
  ];
  const summary = createSummary(session, events.length);
  const nextIndex = upsertSummary(index, summary, timestamp);

  await writeJson(sessionFile, session);
  await writeFile(
    notesFile,
    [
      `# Testing Session ${resolvedSessionId}`,
      "",
      `Project: ${projectSlug}`,
      `Status: active`,
      `Started: ${timestamp}`,
      `Goal: ${session.goal || "(none)"}`,
      "",
      "This file captures human-readable session notes. Structured state lives in session.json and events.jsonl.",
      "",
    ].join("\n"),
  );
  await writeFile(eventsFile, `${events.map((event) => JSON.stringify(event)).join("\n")}\n`);
  await writeJson(indexFile, nextIndex);

  return {
    session,
    summary,
    index: nextIndex,
  };
}

export async function discoverTestingSessions({ root = process.cwd(), projectSlug = null } = {}) {
  const resolvedRoot = normalizeRoot(root);
  const projectSlugs = projectSlug ? [projectSlug] : await findProjectSlugs(resolvedRoot);
  const summaries = [];

  for (const slug of projectSlugs) {
    if (projectSlug) assertProjectSlug(slug);
    const filePath = indexPath(resolvedRoot, slug);
    if (!(await exists(filePath))) continue;

    const index = await readJson(filePath);
    if (!Array.isArray(index.sessions)) continue;
    summaries.push(...index.sessions.map((summary) => ({ ...summary })));
  }

  return summaries.sort((left, right) => left.started_at.localeCompare(right.started_at));
}

export async function getTestingSessionStatus({
  root = process.cwd(),
  sessionId,
  projectSlug = null,
} = {}) {
  const resolvedRoot = normalizeRoot(root);
  const located = await locateSession(resolvedRoot, sessionId, projectSlug);
  return { ...located.summary };
}

export async function stopTestingSession({
  root = process.cwd(),
  sessionId,
  projectSlug = null,
  now = new Date(),
  actor = "testing-session",
  rationale = "Operator requested testing session stop.",
} = {}) {
  const resolvedRoot = normalizeRoot(root);
  const timestamp = toIsoTimestamp(now);
  const located = await locateSession(resolvedRoot, sessionId, projectSlug);
  const sessionFile = path.join(resolvedRoot, located.summary.session_path);
  const eventsFile = path.join(resolvedRoot, located.summary.events_path);
  const session = await readJson(sessionFile);
  const previousEvents = await readJsonl(eventsFile);

  if (!["active", "blocked"].includes(session.status)) {
    return {
      session,
      summary: located.summary,
      index: located.index,
    };
  }

  const nextSession = {
    ...session,
    status: "stopped",
    updated_at: timestamp,
    stopped_at: timestamp,
  };
  const event = createEvent({
    type: "completed",
    timestamp,
    actor,
    sessionId,
    projectSlug: located.projectSlug,
    filesRead: [located.summary.session_path, located.summary.events_path],
    filesWritten: [
      located.summary.session_path,
      located.summary.events_path,
      relativePath(resolvedRoot, located.indexFile),
    ],
    toolSummary: "testing-session action:stop",
    resultStatus: "stopped",
    rationale,
  });
  const nextSummary = createSummary(nextSession, previousEvents.length + 1);
  const nextIndex = upsertSummary(located.index, nextSummary, timestamp);

  await writeJson(sessionFile, nextSession);
  await appendFile(eventsFile, `${JSON.stringify(event)}\n`);
  await writeJson(located.indexFile, nextIndex);

  return {
    session: nextSession,
    summary: nextSummary,
    index: nextIndex,
  };
}

function nextSessionStatus(currentStatus, eventType, resultStatus) {
  if (eventType === "blocked") return "blocked";
  if (eventType === "completed") {
    return resultStatus === "stopped" ? "stopped" : "completed";
  }
  return currentStatus;
}

export async function recordTestingSessionEvent({
  root = process.cwd(),
  sessionId,
  projectSlug = null,
  type,
  now = new Date(),
  actor = "testing-session",
  taskContext = null,
  filesRead = [],
  filesWritten = [],
  toolSummary = "",
  resultStatus = "ok",
  rationale = "Recorded testing-session event.",
} = {}) {
  const resolvedRoot = normalizeRoot(root);
  const timestamp = toIsoTimestamp(now);
  const located = await locateSession(resolvedRoot, sessionId, projectSlug);
  const sessionFile = path.join(resolvedRoot, located.summary.session_path);
  const eventsFile = path.join(resolvedRoot, located.summary.events_path);
  const session = await readJson(sessionFile);
  const previousEvents = await readJsonl(eventsFile);

  if (!["active", "blocked"].includes(session.status)) {
    throw new Error(`Cannot record event for ${session.status} testing session: ${sessionId}`);
  }

  const automaticFilesRead = [located.summary.session_path, located.summary.events_path];
  const automaticFilesWritten = [
    located.summary.session_path,
    located.summary.events_path,
    relativePath(resolvedRoot, located.indexFile),
  ];
  const event = createEvent({
    type,
    timestamp,
    actor,
    sessionId,
    projectSlug: located.projectSlug,
    taskContext,
    filesRead: [...new Set([...filesRead, ...automaticFilesRead])],
    filesWritten: [...new Set([...filesWritten, ...automaticFilesWritten])],
    toolSummary,
    resultStatus,
    rationale,
  });
  const nextStatus = nextSessionStatus(session.status, type, resultStatus);
  const nextSession = {
    ...session,
    status: nextStatus,
    updated_at: timestamp,
    stopped_at: nextStatus === "stopped" ? timestamp : session.stopped_at,
  };
  const nextSummary = createSummary(nextSession, previousEvents.length + 1);
  const nextIndex = upsertSummary(located.index, nextSummary, timestamp);

  await writeJson(sessionFile, nextSession);
  await appendFile(eventsFile, `${JSON.stringify(event)}\n`);
  await writeJson(located.indexFile, nextIndex);

  return {
    session: nextSession,
    summary: nextSummary,
    index: nextIndex,
    event,
  };
}

function requireValidationString(value, label, errors) {
  if (typeof value !== "string" || value.trim() === "") {
    errors.push(`${label} must be a non-empty string`);
  }
}

function requireValidationArray(value, label, errors) {
  if (!Array.isArray(value)) {
    errors.push(`${label} must be an array`);
  }
}

function validatePublicSafeText(value, label, errors) {
  const error = publicSafeTextError(value);
  if (error) errors.push(`${label} ${error}`);
}

function validateRepositoryRelativePaths(values, label, errors) {
  if (!Array.isArray(values)) return;
  for (const [index, value] of values.entries()) {
    const error = repositoryRelativePathError(value);
    if (error) errors.push(`${label}[${index}] ${error}`);
  }
}

async function validateEventsFile(root, eventsFile, sessionId, projectSlug, expectedCount, errors) {
  if (!(await exists(eventsFile))) {
    errors.push(`${relativePath(root, eventsFile)} is missing`);
    return;
  }

  const contents = await readFile(eventsFile, "utf8");
  const lines = contents
    .trim()
    .split("\n")
    .filter(Boolean);

  if (lines.length !== expectedCount) {
    errors.push(
      `${relativePath(root, eventsFile)} has ${lines.length} events but index records ${expectedCount}`,
    );
  }

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    let event;
    try {
      event = JSON.parse(line);
    } catch {
      errors.push(`${relativePath(root, eventsFile)} line ${lineNumber} is not valid JSON`);
      continue;
    }

    requireValidationString(event.timestamp, `${relativePath(root, eventsFile)} line ${lineNumber} timestamp`, errors);
    requireValidationString(event.actor, `${relativePath(root, eventsFile)} line ${lineNumber} actor`, errors);
    requireValidationString(event.result_status, `${relativePath(root, eventsFile)} line ${lineNumber} result_status`, errors);
    requireValidationString(event.rationale, `${relativePath(root, eventsFile)} line ${lineNumber} rationale`, errors);
    requireValidationArray(event.files_read, `${relativePath(root, eventsFile)} line ${lineNumber} files_read`, errors);
    requireValidationArray(event.files_written, `${relativePath(root, eventsFile)} line ${lineNumber} files_written`, errors);
    validatePublicSafeText(event.tool_summary, `${relativePath(root, eventsFile)} line ${lineNumber} tool_summary`, errors);
    validatePublicSafeText(event.rationale, `${relativePath(root, eventsFile)} line ${lineNumber} rationale`, errors);
    validatePublicSafeText(
      typeof event.task_context === "string" ? event.task_context : JSON.stringify(event.task_context ?? ""),
      `${relativePath(root, eventsFile)} line ${lineNumber} task_context`,
      errors,
    );
    validateRepositoryRelativePaths(event.files_read, `${relativePath(root, eventsFile)} line ${lineNumber} files_read`, errors);
    validateRepositoryRelativePaths(event.files_written, `${relativePath(root, eventsFile)} line ${lineNumber} files_written`, errors);

    if (!allowedEventTypes.has(event.type)) {
      errors.push(`${relativePath(root, eventsFile)} line ${lineNumber} has invalid type "${event.type}"`);
    }
    if (event.session_id !== sessionId) {
      errors.push(`${relativePath(root, eventsFile)} line ${lineNumber} session_id must equal "${sessionId}"`);
    }
    if (event.project_slug !== projectSlug) {
      errors.push(`${relativePath(root, eventsFile)} line ${lineNumber} project_slug must equal "${projectSlug}"`);
    }
  }
}

async function validateSessionSummary(root, projectSlug, summary, indexFile, errors) {
  const indexLabel = relativePath(root, indexFile);

  for (const key of [
    "session_id",
    "project_slug",
    "status",
    "started_at",
    "updated_at",
    "path",
    "session_path",
    "events_path",
    "notes_path",
  ]) {
    requireValidationString(summary?.[key], `${indexLabel} summary ${key}`, errors);
  }

  if (summary?.project_slug !== projectSlug) {
    errors.push(`${indexLabel} summary project_slug must equal "${projectSlug}"`);
  }
  if (!allowedSessionStatuses.has(summary?.status)) {
    errors.push(`${indexLabel} summary has invalid status "${summary?.status}"`);
  }
  if (typeof summary?.event_count !== "number" || summary.event_count < 0) {
    errors.push(`${indexLabel} summary event_count must be a non-negative number`);
  }
  if (Object.hasOwn(summary ?? {}, "events")) {
    errors.push(`${indexLabel} summary must not inline full events`);
  }

  const expectedSessionDir =
    typeof summary?.session_id === "string"
      ? `projects/${projectSlug}/artifacts/testing-sessions/${summary.session_id}`
      : null;
  const expectedPaths = expectedSessionDir
    ? {
        path: expectedSessionDir,
        session_path: `${expectedSessionDir}/session.json`,
        events_path: `${expectedSessionDir}/events.jsonl`,
        notes_path: `${expectedSessionDir}/notes.md`,
      }
    : {};

  const hasPathError = Object.entries(expectedPaths).some(([key, expectedPath]) => {
    if (summary?.[key] !== expectedPath) {
      errors.push(`${indexLabel} summary ${key} must stay under ${expectedSessionDir}`);
      return true;
    }
    return false;
  });

  if (hasPathError) return;

  const sessionFile = path.join(root, summary.session_path ?? "");
  const eventsFile = path.join(root, summary.events_path ?? "");
  const notesFile = path.join(root, summary.notes_path ?? "");

  if (!(await exists(sessionFile))) {
    errors.push(`${summary.session_path} is missing`);
    return;
  }
  if (!(await exists(notesFile))) {
    errors.push(`${summary.notes_path} is missing`);
  }

  let session;
  try {
    session = await readJson(sessionFile);
  } catch (error) {
    errors.push(`${relativePath(root, sessionFile)} is not valid JSON: ${error.message}`);
    return;
  }

  if (session.session_id !== summary.session_id) {
    errors.push(`${relativePath(root, sessionFile)} session_id must equal index summary`);
  }
  for (const key of [
    "session_id",
    "project_slug",
    "status",
    "started_at",
    "updated_at",
    "path",
    "session_path",
    "events_path",
    "notes_path",
  ]) {
    requireValidationString(session?.[key], `${relativePath(root, sessionFile)} ${key}`, errors);
  }
  if (session.project_slug !== projectSlug) {
    errors.push(`${relativePath(root, sessionFile)} project_slug must equal "${projectSlug}"`);
  }
  if (!allowedSessionStatuses.has(session.status)) {
    errors.push(`${relativePath(root, sessionFile)} has invalid status "${session.status}"`);
  }
  if (session.status !== summary.status) {
    errors.push(`${relativePath(root, sessionFile)} status must equal index summary`);
  }
  validatePublicSafeText(session.goal, `${relativePath(root, sessionFile)} goal`, errors);

  if (await exists(notesFile)) {
    validatePublicSafeText(
      await readFile(notesFile, "utf8"),
      `${relativePath(root, notesFile)} contents`,
      errors,
    );
  }

  await validateEventsFile(
    root,
    eventsFile,
    summary.session_id,
    projectSlug,
    summary.event_count,
    errors,
  );
}

export async function validateTestingSessionState({ root = process.cwd() } = {}) {
  const resolvedRoot = normalizeRoot(root);
  const errors = [];
  const projectSlugs = await findProjectSlugs(resolvedRoot);

  for (const projectSlug of projectSlugs) {
    const filePath = indexPath(resolvedRoot, projectSlug);
    if (!(await exists(filePath))) continue;

    let index;
    try {
      index = await readJson(filePath);
    } catch (error) {
      errors.push(`${relativePath(resolvedRoot, filePath)} is not valid JSON: ${error.message}`);
      continue;
    }

    if (index.project_slug !== projectSlug) {
      errors.push(`${relativePath(resolvedRoot, filePath)} project_slug must equal "${projectSlug}"`);
    }
    if (!Array.isArray(index.sessions)) {
      errors.push(`${relativePath(resolvedRoot, filePath)} must include sessions array`);
      continue;
    }

    const seenSessionIds = new Set();
    for (const summary of index.sessions) {
      if (seenSessionIds.has(summary.session_id)) {
        errors.push(`${relativePath(resolvedRoot, filePath)} repeats session_id "${summary.session_id}"`);
      }
      seenSessionIds.add(summary.session_id);
      await validateSessionSummary(resolvedRoot, projectSlug, summary, filePath, errors);
    }
  }

  return errors;
}

function readTokenArg(args, name) {
  const prefix = `${name}:`;
  const token = args.find((item) => item.startsWith(prefix));
  if (token) return token.slice(prefix.length).replace(/^"|"$/g, "");

  const flagIndex = args.indexOf(`--${name}`);
  if (flagIndex !== -1) return args[flagIndex + 1] ?? null;

  return null;
}

function readListArg(args, name) {
  const value = readTokenArg(args, name);
  if (!value) return [];
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function runCli(args = process.argv.slice(2)) {
  const action = readTokenArg(args, "action") ?? args[0] ?? null;
  const root = readTokenArg(args, "root") ?? process.cwd();
  const projectSlug = readTokenArg(args, "project");
  const sessionId = readTokenArg(args, "session");
  const goal = readTokenArg(args, "goal") ?? "";
  const actor = readTokenArg(args, "actor") ?? "testing-session";
  const eventType = readTokenArg(args, "type");
  const resultStatus = readTokenArg(args, "result") ?? readTokenArg(args, "result_status") ?? "ok";
  const toolSummary = readTokenArg(args, "summary") ?? "";
  const rationale = readTokenArg(args, "rationale") ?? "Recorded testing-session event.";

  if (action === "start") {
    const result = await createTestingSession({ root, projectSlug, goal, actor });
    console.log(JSON.stringify(result.summary, null, 2));
    return;
  }

  if (action === "status") {
    const summary = await getTestingSessionStatus({ root, projectSlug, sessionId });
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  if (action === "stop") {
    const result = await stopTestingSession({ root, projectSlug, sessionId, actor });
    console.log(JSON.stringify(result.summary, null, 2));
    return;
  }

  if (action === "log") {
    const result = await recordTestingSessionEvent({
      root,
      projectSlug,
      sessionId,
      type: eventType,
      actor,
      filesRead: readListArg(args, "read"),
      filesWritten: readListArg(args, "write"),
      toolSummary,
      resultStatus,
      rationale,
    });
    console.log(JSON.stringify(result.summary, null, 2));
    return;
  }

  if (action === "discover") {
    const summaries = await discoverTestingSessions({ root, projectSlug });
    console.log(JSON.stringify(summaries, null, 2));
    return;
  }

  if (action === "validate") {
    const validationErrors = await validateTestingSessionState({ root });
    if (validationErrors.length > 0) {
      console.error(validationErrors.map((error) => `- ${error}`).join("\n"));
      process.exitCode = 1;
      return;
    }
    console.log("Testing-session state is valid.");
    return;
  }

  console.log(`Usage:
  node scripts/testing-session-state.mjs action:start project:<slug> [goal:"..."]
  node scripts/testing-session-state.mjs action:status session:<session-id> [project:<slug>]
  node scripts/testing-session-state.mjs action:stop session:<session-id> [project:<slug>]
  node scripts/testing-session-state.mjs action:log session:<session-id> type:<event-type> [read:path[,path]] [write:path[,path]]
  node scripts/testing-session-state.mjs action:discover [project:<slug>]
  node scripts/testing-session-state.mjs action:validate
`);
  process.exitCode = 1;
}

const currentFile = fileURLToPath(import.meta.url);
if (process.argv[1] && path.resolve(process.argv[1]) === currentFile) {
  runCli().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
