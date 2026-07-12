# Open Health UI skill and lifecycle

Type: AFK

## What to build

Create the independently callable `open-health-ui` skill and the explicit local
lifecycle it controls. The skill starts or reuses only a matching healthy
project-owned server, reports the exact loopback URL and identity, handles port
conflicts without killing other processes, and stops only its owned process.
Opening the project or installing the package must start nothing.

## Acceptance criteria

- [ ] `skills/open-health-ui/SKILL.md` and `agents/openai.yaml` form a complete independently callable bundle.
- [ ] Lifecycle tests cover clean start, verified reuse, visible port conflict, startup cleanup, URL handoff, and explicit stop.
- [ ] Ownership records are project-local, disposable, and verified before reuse or stop.
- [ ] The package contains the built UI, runtime, complete seven-skill workflow surface, opener skill, fixtures, and validators.
- [ ] No postinstall, global harness mutation, hidden daemon, or implicit browser startup exists.

## User stories covered

US-29, US-30, US-35, US-39, US-40.

## Blocked by

Issues 002 and 003.
