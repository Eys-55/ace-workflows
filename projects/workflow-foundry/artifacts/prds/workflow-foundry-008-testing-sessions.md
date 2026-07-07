# PRD: Project Testing Sessions

Task: `workflow-foundry-008`
Status: Ready for issue breakdown

## Problem Statement

The workflow foundry has reusable workflow skills and project trackers, but the
operator has no isolated way to use those workflows as real workflows while
capturing exactly how the agent behaved during the run.

Today, using a workflow and maintaining project state happen in the same normal
task context. That makes it harder to test how skills actually behave in live
use without risking accidental tracker edits, losing session state, or mixing
experimental runs into canonical project task history.

The user wants a testing mode that feels like letting the agent actually drive
the workflow on its own, while every relevant state of that run is saved in a
dedicated session record. The output should be the captured run state itself,
not recommendations, generated task actions, or normal workflow edits.

## Solution

Create a project testing-session workflow with one canonical callable slug and
explicit lifecycle actions. The operator starts a testing session for a selected
project, optionally gives the run a goal, and then the agent uses the selected
project workflows in a read-only isolated session.

The testing session writes only to its own session artifacts and the project
testing-session index. It does not edit project source, task JSON, skills,
scripts, or normal workflow artifacts. It also does not create recommendations,
continue tasks, initiate tasks, or mutate normal workflow state by default.

Each testing session is discoverable from project preload. Future agents can
find the project testing-session index, inspect prior session runs, and see the
captured state without reading a full transcript first.

## User Stories

1. As the operator, I want to start a testing session for a specific project, so
   that the agent knows which project workflows to exercise.
2. As the operator, I want to provide an optional goal for the session, so that
   the run has a clear focus without becoming a normal task.
3. As the operator, I want testing mode to be read-only against normal project
   state, so that live workflow use does not accidentally change canonical
   trackers or source artifacts.
4. As the operator, I want the agent to actually use the workflows during a
   testing session, so that I can observe real behavior rather than a synthetic
   checklist.
5. As the operator, I want the testing session to run independently, so that it
   behaves like a controlled road test rather than ordinary implementation
   work.
6. As the operator, I want every session to have its own durable folder, so that
   its logs and metadata do not mix with other sessions.
7. As the operator, I want every session to record metadata and status, so that
   I can tell what project was tested, when it ran, and how it ended.
8. As the operator, I want every session to record structured events, so that
   the agent's state transitions and tool activity can be inspected later.
9. As the operator, I want every session to preserve human-readable context, so
   that I can quickly understand what happened without parsing raw events first.
10. As the operator, I want a project-level testing-session index, so that
    agents can discover prior sessions during project preload.
11. As the operator, I want the index to store summaries and pointers, so that
    it stays lightweight and does not duplicate complete event logs.
12. As the operator, I want a status action for testing sessions, so that I can
    inspect whether a session is running, stopped, blocked, or complete.
13. As the operator, I want a stop action for testing sessions, so that I can
    explicitly end an independent run without converting it into a normal task.
14. As a future agent, I want testing sessions to be discoverable during
    initiate or continue preload, so that I can consider prior captured runs
    before making workflow decisions.
15. As a future agent, I want testing-session logs to be structured, so that I
    can reconstruct what happened without relying only on conversation memory.
16. As a future agent, I want testing-session writes to be narrowly scoped, so
    that I can trust normal project state was not changed by the test.
17. As a future agent, I want testing mode to avoid automatic recommendations,
    so that the run remains evidence rather than a decision-making step.
18. As a workflow maintainer, I want validation to detect malformed session
    indexes or logs, so that testing-session state remains reliable over time.
19. As a workflow maintainer, I want the implementation to preserve the
    skills-first workflow surface, so that the repo does not regress to legacy
    command shims.
20. As a workflow maintainer, I want the first implementation to cover start,
    stop, and status actions, so that the lifecycle is testable end to end.

## Implementation Decisions

- Use one canonical workflow skill named for testing sessions.
- Expose lifecycle behavior through explicit actions on that skill: start,
  stop, and status.
- Require a project slug when starting a session.
- Accept an optional free-text goal when starting a session.
- Require a session id when stopping or checking status.
- Keep `.agents/skills` as the canonical workflow surface.
- A slash-style operator entry may invoke the skill, but the skill remains the
  source of truth.
- Store testing sessions in the selected project's artifact area, grouped under
  a testing-sessions collection.
- Store a project-level testing-session index for machine-readable discovery.
- Store each session in its own deterministic session folder.
- Each session folder includes a metadata/status JSON file, a structured event
  stream file, and a human-readable transcript or notes file.
- The project-level index stores session summaries and pointers only, not full
  event streams.
- Testing-session writes are limited to the session folder and the project
  testing-session index.
- Testing mode is read-only against project source, task JSON, skills, scripts,
  tracker UI code, and ordinary workflow artifacts.
- Testing sessions do not create tasks, continue tasks, edit tasks, or emit
  recommendations by default.
- Testing sessions may record findings as observed state in the event stream,
  but findings are not converted into workflow actions automatically.
- The structured event stream includes started, preload-complete, decision,
  tool-run, artifact-read, finding, blocked, and completed-style events.
- Events include enough metadata to reconstruct the run: time, session id,
  project slug, optional task context, files touched inside the testing session,
  tool or command summary, result status, and rationale.
- Project preload should discover testing-session indexes when present.
- Query tooling should be able to surface testing-session index summaries.
- Initiate and continue task flows should know that testing-session state exists
  without loading full event streams by default.
- The tracker UI runner and project workflow view task remains separate; this
  PRD only needs to produce data surfaces that such a UI could read later.

## Testing Decisions

- Test the highest useful seam: testing-session command behavior against a
  fixture project, including start, status, and stop.
- Verify that start creates the session metadata, event stream, human-readable
  context file, and project-level index entry.
- Verify that status reads session state without modifying normal project task
  files.
- Verify that stop updates only testing-session state and records a stop event.
- Verify that malformed testing-session indexes fail validation.
- Verify that project preload discovers a testing-session index when present.
- Verify that preload does not require reading full event streams unless a
  later flow explicitly requests the session details.
- Verify that testing mode rejects or avoids writes outside the allowed
  testing-session state surface.
- Verify that no Python is introduced.
- Run workflow-state validation after adding the testing-session feature.

## Out of Scope

- Automatic creation of normal project tasks from testing-session findings.
- Automatic continuation of existing tasks from testing-session findings.
- Recommendations, summaries of what to do next, or prioritization decisions.
- Editing project source, task JSON, skills, scripts, or ordinary workflow
  artifacts during testing mode.
- Replacing normal initiate-task or continue-task behavior.
- Replacing the project task tracker.
- Building tracker UI changes for browsing testing sessions.
- Remote execution, background process supervision, or cross-machine session
  coordination.
- GitHub issue creation or synchronization.

## Further Notes

The testing-session workflow is evidence capture for live workflow use. It is
not a planner, reviewer, or task generator. The useful artifact is the session
state itself: what the agent loaded, decided, read, ran, observed, blocked on,
and how the run ended.

The implementation should preserve the repository's Matt Pocock and ECC
process: PRD first, issue breakdown next, then implementation with validation
and review.
