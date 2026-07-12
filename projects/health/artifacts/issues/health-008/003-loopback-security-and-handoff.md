# Loopback security and harness handoff

Type: AFK

## What to build

Harden the companion boundary around the tracer. Enforce exact Host and Origin,
short-lived project-scoped sessions, CSRF on state-changing routes, restrictive
browser policy, redacted diagnostics, and stable refusal envelopes. Any request
for a coverage, claims, eligibility, ranking, purchase, clinical, external, or
destructive decision must stop at an inspectable harness or human handoff.

## Acceptance criteria

- [ ] Integration tests reject disallowed host/origin, missing CSRF, unknown actions, injection content, and traversal attempts.
- [ ] Browser assets contain no model credentials, generic shell, raw filesystem, or arbitrary command capability.
- [ ] Consequential requests return `awaiting-harness-approval` or a stable refusal, never execute independently.
- [ ] Logs and error responses omit cookies, tokens, sensitive form text, stack traces, and private machine paths.
- [ ] Security headers and content rendering prevent executable untrusted markup.

## User stories covered

US-16, US-24, US-25, US-27, US-28, US-34, US-36 through US-38.

## Blocked by

Issue 002.
