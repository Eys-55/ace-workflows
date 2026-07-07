# Issue 005: Add safety boundaries and door-vs-leaf count audit

## Parent

`real-life-workflows-002` - Workflow Understanding Finder

## What to build

Add the verification layer that keeps workflow-understanding packets honest.
This slice should enforce high-stakes safety boundaries, preserve source
reliability labels, and quantify the difference between the 171 access doors
and the larger leaf-workflow universe behind them.

The result should make it clear when a packet is showing useful workflow
patterns versus verified authoritative claims.

## Acceptance criteria

- [x] High-stakes domains preserve human review boundaries in packet language.
- [x] Packets do not claim that catalog text proves correctness, compliance,
      safety, suitability, or legal/medical/financial conclusions.
- [x] Broken, sparse, canonicalized, and reachable sources are labeled visibly.
- [x] The audit reports the 171-door count separately from the expanded
      leaf-workflow count.
- [x] The audit can identify whether the expanded corpus is closer to the
      expected many-thousand-workflow scale.
- [x] The audit result is linked from the workflow-understanding task state.
- [x] The repo workflow-state validator still passes after this slice.

## Blocked by

- Issue 004: Save the reader-first Markdown packet

## User stories covered

- 12. Show reliability as a label
- 16. Keep doors separate from leaf workflows
- 17. Quantify the expanded workflow count
- 19. Preserve human review boundaries
- 20. Label broken or weak sources
