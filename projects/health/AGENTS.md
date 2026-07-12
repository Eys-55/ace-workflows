# Health Project AGENTS.md

This file contains live project/domain instructions for the `health` workflow
project only.

Root `AGENTS.md` owns repository workflow architecture, optional status-ledger
conventions, ECC guidance, validation, and repo-wide safety. Do not redefine
those mechanics here.

Use this project to build health workflow packs that help an agentic engineer
understand real healthcare work before designing agents around it.

Use this file for:

- domain vocabulary
- project-specific source rules
- project-specific output expectations
- agent behavior for this project domain

## Domain Boundaries

Health workflows are high-stakes operational workflows. Treat clinical,
billing, compliance, referral, scheduling, care-coordination, pharmacy,
laboratory, insurance, and public-health workflows as separate domains until a
task narrows the scope.

Do not provide medical advice, diagnosis, treatment decisions, or patient-
specific recommendations. Workflow artifacts may explain process, roles,
handoffs, documents, evidence needs, and risk controls.

## Source Rules

Prefer public, inspectable sources such as government guidance, professional
association guidance, payer/provider public manuals, public forms, academic
workflow descriptions, and vendor documentation.

Record source boundaries clearly. If a workflow packet is based on an example,
label the geography, organization type, and evidence level instead of implying
universal healthcare practice.

## Output Expectations

Health workflow outputs should educate first:

- what job the workflow does
- who participates
- what inputs and records move through the workflow
- where handoffs and failure modes happen
- what an agent can safely automate
- what must remain human-reviewed
- what evidence would prove the workflow packet is correct
