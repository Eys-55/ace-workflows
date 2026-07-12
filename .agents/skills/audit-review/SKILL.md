---
name: audit-review
description: Review audit evidence and dirty workflow state without mutation, classify findings, and produce a decision-complete cleanup plan. Use before remediation when scope or priorities need review.
---

# Audit Review

Turn audit evidence into a bounded, implementation-ready cleanup plan.

## Procedure

1. Read root instructions, the audit report, referenced evidence, current Git
   status, and affected project instructions and metadata.
2. Re-run cheap read-only checks when evidence may be stale.
3. Classify each finding as confirmed, stale, duplicate, accepted risk, or
   remediation candidate.
4. Group remediation by owning project and independently verifiable slice.
5. Define files, intended behavior, acceptance checks, dependencies, rollback
   concerns, and push boundary for every slice.
6. Preserve unrelated local changes and identify any collision before execution.
7. Write the cleanup plan in the nearest existing review artifact home when the
   user requested a durable plan.

The optional status ledger may provide context but never authorizes or blocks
cleanup. This skill performs no source, Git, ledger, or external mutation.

## Output

Return the reviewed findings, ordered cleanup slices, exact validation commands,
risks, and the direct `$audit-cleanup` invocation when remediation is approved.
