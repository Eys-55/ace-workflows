# Workflow Understanding Packet

- Query: healthcare pediatrics
- Intake question: What type of work or workflow are you trying to understand?
- Visible recommendation count: 8
- Visible recommendation cap: 12
- Packet rule: Keep descriptions and links here; read source workflows directly before extracting or creating a skill.
- Human review boundary: This packet is for workflow understanding only and does not prove compliance, clinical correctness, eligibility, coverage, legal sufficiency, or safety.

## Direct Matches

### Medical skills
- Why it matters: Reusable reference for patient, referral, administrative, and medical-document packet preparation workflows.
- Why it is here: Use when cataloging healthcare administrative skill patterns for regulated document review and handoff workflows.
- What it does: Only copy packet assembly, checklist, summarization, and review-handoff structure after source verification.
- Source link: https://github.com/CaseMark/skills/tree/main/med
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0007
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: medical-skills
- Expansion candidates: All skills audit export (manifest, second pass); Medical skills (category, second pass)

### Medical document workflows
- Why it matters: Reusable reference for medical document workflow skills, including document cleanup, summarization, checklist creation, and review-ready handoff.
- Why it is here: Use when looking for medical-document preparation, cleanup, summarization, checklist, or handoff workflow patterns.
- What it does: Copy only the document preparation and review-handoff shape after verifying the source files directly.
- Source link: https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills/tree/main/skills
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0016
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: medical-document-workflows
- Expansion candidates: Medical document workflows (category, second pass); README Skills Overview (manifest, second pass)

### README Available Skills
- Why it matters: Support biomedical or clinical research work such as clinical trial lookup, variant interpretation, drug safety review, clinical documentation, and treatment-plan drafting with human oversight.
- Why it is here: Use when the reader wants healthcare workflows beyond administration and needs research or clinical-document examples.
- What it does: Copy research routing, source lookup, and clinical-document review structures only after source verification and human review boundaries are preserved.
- Source link: https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/README.md
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0021
- Reliability: tier=gold; confidence=high
- Possible skill to extract: readme-available-skills
- Expansion candidates: README Available Skills (manifest, second pass)

## Strong Adjacent Matches

### Healthcare industry pack
- Why it matters: Produce publication-ready long-form content with research, fact-checking, humanization, review, and Word document output; healthcare-specific behavior was not verified at the requested folder link.
- Why it is here: It is healthcare-adjacent and can inform research, fact-checking, review, and publication handoff patterns around healthcare topics.
- What it does: Copy only the research, fact-checking, review, and output-handoff structure after verifying the source path.
- Source link: https://github.com/indranilbanerjee/contentforge/tree/main/skills/healthcare
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0083
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: healthcare-industry-pack

### Industry Use Cases
- Why it matters: Browse healthcare-related agent examples such as medical report insight, patient-data health assistant concepts, health insurance claiming, and medical chatbot patterns.
- Why it is here: It offers adjacent healthcare examples when the query is broad and the reader is still narrowing the kind of pediatric or health workflow they want.
- What it does: Use as a browse surface for example workflow families, not as a finished clinical or compliance workflow.
- Source link: https://github.com/ashishpatel26/500-AI-Agents-Projects/blob/main/README.md
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0063
- Reliability: tier=silver; confidence=medium
- Possible skill to extract: industry-use-cases

## Supporting Building Blocks

### Plugin manifest
- Why it matters: Reusable reference for a healthcare skills package manifest that may identify available medical document workflow surfaces.
- Why it is here: It may help expand from a broad healthcare door into specific package-level medical workflow candidates.
- What it does: Use it to discover package structure and candidate workflow entry points before deeper source reading.
- Source link: https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills/blob/main/openclaw.plugin.json
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0017
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: plugin-manifest

### README Skills Overview
- Why it matters: Reusable reference for README-level overview of healthcare and medical document skills.
- Why it is here: It can guide the next expansion pass before reading individual medical-document workflow files.
- What it does: Use as a map, then verify every referenced skill or workflow directly.
- Source link: https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills/blob/main/README.md
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0018
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: readme-skills-overview

## Maybe Useful

### USE-CASES
- Why it matters: Browse health-adjacent examples such as wearable dashboarding, lab result organization, and medical reimbursement filing.
- Why it is here: It is not pediatric-specific, but it may surface adjacent workflow patterns around health records, reimbursement, and patient-facing tools.
- What it does: Use only as a discovery surface for ideas that must be rewritten under the packet contract.
- Source link: https://github.com/mergisi/awesome-openclaw-agents/blob/main/USE-CASES.md
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0113
- Reliability: tier=silver; confidence=medium
- Possible skill to extract: use-cases
