# Issue 001: Define the workflow-understanding packet contract

## Parent

`real-life-workflows-002` - Workflow Understanding Finder

## What to build

Create the first verifiable slice for the workflow-understanding finder by
defining the packet contract and fixture expectations. This slice should make
the final reader-facing artifact testable before any retrieval or expansion
logic is added.

The result should prove that a workflow-understanding packet can represent a
raw request, the universal intake question, all four fixed categories, visible
recommendation entries, reliability labels, local/source links, and the required
`Why it matters` field.

## Acceptance criteria

- [x] The packet contract includes all four fixed categories: Direct Matches,
      Strong Adjacent Matches, Supporting Building Blocks, and Maybe Useful.
- [x] Empty categories remain visible in valid packets.
- [x] Each visible recommendation includes `Why it matters`, `Why it is here`,
      `What it does`, source link, local door/source path, reliability, and
      possible skill to extract.
- [x] Fixtures cover narrow, broad, supporting-building-block, and high-stakes
      workflow-understanding requests.
- [x] The contract treats the output as reader-first Markdown, not machine-first
      JSON.
- [x] The repo workflow-state validator still passes after this slice.

## Blocked by

None - can start immediately.

## User stories covered

- 1. Ask what type of work or workflow to understand
- 2. Work for any work area
- 7. Use the same four categories
- 8. Explain why each workflow matters
- 9. Explain why each workflow is here
- 10. Summarize what each workflow does
- 11. Include source links and local paths
- 12. Show reliability as a label
- 15. Save as Markdown
