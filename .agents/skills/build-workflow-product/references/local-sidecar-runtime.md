# Local Sidecar Runtime

Load this reference when the target-project task reaches runtime, packaging,
harness, installation, upgrade, or removal decisions. It defines the product
contract; it is not application code, a starter, or a component template.

## Fixed Architecture

Every generated workflow product uses this shape:

- React, Vite, TypeScript, and Tailwind CSS are the fixed browser stack.
- A project-local Node.js TypeScript companion server is the browser's only
  bridge to approved workflow files and actions.
- The browser is a local sidecar. Do not introduce a native wrapper unless a
  separately tracked target-project decision proves an operating-system need.
- The harness owns the conversation, planning, model state, file editing, and
  human approval loop. The browser must not embed chat, a model runtime, a
  model API key, or a competing agent state.
- Radix primitives and Lucide icons are optional implementation choices. Use
  them only when they improve semantics, accessibility, or scanning without
  turning the product into a generic component-library skin.

Keep the React client untrusted and capability-poor. It receives projections,
invokes named actions, and renders results; it never receives raw filesystem,
shell, harness, credential, publishing, or consequential-action authority.

## Loopback Boundary

Bind the companion to `127.0.0.1` by default. A separately configured IPv6
listener may use only the loopback address. Never bind to a wildcard, LAN, or
public interface as a convenience. Display the effective host, port, project
root, and server version when the UI starts.

Treat every browser-server exchange as hostile input:

1. Maintain an explicit allowlist of route, method, action id, input schema,
   response schema, file family, and side-effect class. An unknown operation
   fails closed.
2. Validate request params, body, content type, size, and response payload with
   versioned schemas. Do not pass unknown fields through.
3. Accept only exact allowed `Origin` and `Host` values for the active local
   URL. Reject missing or mismatched browser origins on state-changing routes.
4. Issue a short-lived, unguessable per-run browser session with strict
   same-site cookies and CSRF protection. Scope it to this server and project;
   never place it in URLs or logs.
5. Resolve approved project-relative paths against the canonical project root,
   then reject traversal, absolute paths, device paths, unexpected symlinks,
   and real paths outside that root.
6. Prevent check-then-use and symlink-swap races. Resolve and mutate relative to
   already verified directory handles or descriptors; use no-follow semantics
   such as `O_NOFOLLOW` for every opened component; reject hard links where the
   operation cannot prove ownership; and recheck device, inode, type, and root
   containment immediately before commit. Create the temporary file inside the
   same verified directory, sync it, then atomically rename relative to that
   directory handle. Abort when any identity changes. A string realpath check
   followed by an ordinary later open is not sufficient TOCTOU protection.
7. Use narrow file operations and atomic writes. Never expose a generic read,
   write, glob, command, eval, terminal, or shell endpoint.
8. Return immutable typed state transitions and user-safe error envelopes.
   Keep stack traces, internal paths, and diagnostics on the trusted server.

Render untrusted Markdown or HTML through a maintained sanitizer. Disallow
script execution, unsafe URLs, inline event handlers, and unsanctioned remote
content; set a restrictive content-security policy. Treat filenames, workflow
output, and error text as data rather than markup.

Use structured, redacted logs. Remove credentials, authorization headers,
cookies, model keys, tokens, sensitive form values, and private document
content. Log action ids, schema versions, result classes, durations, and safe
correlation ids instead. Secrets stay in approved harness or server-side
environment boundaries; they are never published, materialized into browser
assets, returned to the client, or written into fixtures.

## Action Authority

Classify every allowlisted action before implementation:

| Class | Browser behavior | Required evidence |
| --- | --- | --- |
| Read-only projection | May run locally | Source family, freshness, empty/error state |
| Safe reversible project update | May run within explicit file approvals | Validated input, preview, diff, result, retry or recovery |
| Consequential or external | Must return to the harness for explicit human approval | Handoff payload, reason, proposed effect, approval state |
| Unsupported | Refuse | Stable refusal code and safe explanation |

Consequential includes destructive, clinical, financial, publishing,
credential, permission, external-write, and irreversible actions. The browser
may prepare a proposal but cannot authorize, simulate approval for, or execute
one independently.

## Filesystem-First Truth

Markdown, JSON, complete skill bundles, fixtures, configuration, and normal
project files remain canonical. Preserve each generated artifact's owning task,
source skill, inputs, approval boundary, and status in reviewable project
files. Browser state, search indexes, projections, and caches are derived and
disposable; deleting them must not delete project truth.

There is no database by default. Add one only through a separately tracked
target-project decision that demonstrates a real data-volume, concurrency,
query, or integrity requirement that canonical files cannot satisfy. Document
migration, backup, recovery, and ownership before adopting it.

## One Package Per Project

Ship one npm package per workflow project.

Each workflow project owns one independently named, versioned, and released npm
package. No umbrella package owns its UI, runtime, skills, files, editable
workspace, version, or release lifecycle. A future catalog may discover and
install packages, but it cannot couple them.

The published package contains, before publication:

- the built frontend and project-local Node.js TypeScript runtime;
- the complete callable skill set or workflow pack;
- every required project-local entrypoint and metadata surface for Codex,
  Claude Code, and opencode;
- fixtures, safe configuration, file manifests, migrations, and validation
  metadata needed by that product; and
- no secrets, credentials, machine-specific paths, or private local state.

Release validation must prove that every packaged harness surface exposes the
same intended capabilities and contracts. Do not generate, translate, copy,
register, or repair missing skills after installation. Opening the installed
project directory in a supported harness is the discovery and activation
boundary; never mutate global harness configuration.

npm is distribution and bootstrap only, not the operator's workflow surface.
An explicit bootstrap operation names a destination and materializes a normal,
user-owned, editable directory outside `node_modules`. Refuse a non-empty
destination unless the user selects an explicit reviewable merge. No postinstall startup is allowed. No hidden background process, daemon, implicit
UI launch, or global configuration change is allowed. Merely installing the
package or opening the folder must remain process-free.

Treat the package archive and manifest as untrusted input before extraction.
Validate every entry and link target before materializing anything: reject
absolute, traversal, drive/device, NUL-bearing, duplicate-normalized, and
out-of-root paths; reject symbolic links, hard links, device nodes, sockets,
and other non-regular entries; bound file count and unpacked size; then verify
the destination realpath, manifest membership, and content hash. Extract into
an owned temporary sibling and atomically promote only after the complete tree
passes. Never let archive metadata or lifecycle scripts write outside the
approved editable-project root.

## On-Demand Runtime Lifecycle

The product includes a callable UI-opening skill. Only an explicit invocation
may start or reuse the sidecar.

| Event | Required behavior |
| --- | --- |
| Start | Validate the project root and configuration, choose an approved loopback port, start the companion, wait for a health check, then open or report the exact local URL. |
| Reuse | Reuse only a healthy server whose identity, project root, protocol version, and ownership token match this product. Never attach to an arbitrary process. |
| Port conflict | Identify the conflict visibly. Select an explicit alternate allowed port and report it, or fail with a recovery instruction; never kill the occupying process. |
| Startup failure | Stop partial processes, preserve diagnostic logs, return a user-safe error and actionable recovery, and do not claim the UI is running. |
| URL handoff | Report host, port, URL, server identity, and how to stop it to the harness. Do not expose a network URL. |
| Stop | Use the matching project-local ownership record, request graceful shutdown, verify termination, clean only owned transient state, and report the result. |

Do not leave an orphan when the opener fails. Keep ownership and health records
project-local, derived, and safe to delete after verifying that the recorded
process belongs to this product.

## Reviewable Upgrades And Safe Removal

Publish a versioned manifest with file identity and content hashes. Before an
upgrade, compare installed files with the prior manifest and classify them as
unchanged, locally modified, user-created, removed upstream, or newly supplied.
Apply automatic replacement only to unchanged generated files. Present local
modifications as a reviewable merge or migration with previews, conflicts,
backups, and an abort path; never silently overwrite them.

Package removal and workspace deletion are different operations. Uninstalling
distribution metadata must not delete the editable project. A cleanup command
may list generated and user-created files, but deletion of user-created work or
the project directory requires explicit confirmation with the exact path and a
recoverable backup strategy. If ownership is ambiguous, preserve the files and
stop.

## Runtime Completion Gate

Do not call the runtime design complete until the target-project plan names the
allowlisted schemas and paths, loopback and origin policy, action authority,
canonical files, package contents, harness parity check, start/reuse/failure/
stop behavior, upgrade merge behavior, and removal safety. Missing any item is
a blocking contract gap, not downstream polish.
