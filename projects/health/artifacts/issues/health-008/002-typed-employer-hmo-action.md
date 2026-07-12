# Typed employer-HMO action

Type: AFK

## What to build

Add the loopback companion and one schema-validated action,
`start-employer-hmo-intake`. The browser sends only a bounded non-PHI intent;
the companion maps it to the approved `coverage-intake` then
`coverage-navigator` route and returns the validated canonical packet. Canonical
files remain the source of truth.

## Acceptance criteria

- [ ] A failing integration test is recorded before the action implementation.
- [ ] The companion binds only to `127.0.0.1` and exposes an allowlisted health and action surface.
- [ ] Request and response schemas reject unknown actions, malformed fields, oversized input, and PHI-like free text.
- [ ] The UI shows idle, running/progress, success, failure, refusal, offline, retry, and recovery states in visible text.
- [ ] Repeated submissions are idempotent or rejected server-side; browser disabling is not the concurrency guard.
- [ ] The result records the `coverage-intake` and `coverage-navigator` route and renders the packet from the action response.

## User stories covered

US-13 through US-21, US-23 through US-30, US-32 through US-35.

## Blocked by

Issue 001.
