# Workflow Understanding Packet

- Query: document evidence packet review
- Intake question: What type of work or workflow are you trying to understand?
- Visible recommendation count: 7
- Visible recommendation cap: 12
- Packet rule: Keep descriptions and links here; read source workflows directly before extracting or creating a skill.
- Human review boundary: Required before external action, publication, or applying a workflow to a person, system, or regulated decision.

## Direct Matches

### Medical document workflows
- Why it matters: Reusable reference for medical document workflow skills, including document cleanup, summarization, checklist creation, and review-ready handoff.
- Why it is here: The query asks for document evidence review, and this door explicitly names document cleanup, summaries, checklists, and review handoff.
- What it does: Copy only the document preparation and review-handoff shape after verifying the source files directly.
- Source link: https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills/tree/main/skills
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0016
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: medical-document-workflows
- Expansion candidates: Medical document workflows (category, second pass); README Skills Overview (manifest, second pass)

### Medical skills
- Why it matters: Reusable reference for patient, referral, administrative, and medical-document packet preparation workflows.
- Why it is here: It can provide a packet-preparation pattern where source provenance and review readiness matter.
- What it does: Only copy packet assembly, checklist, summarization, and review-handoff structure after source verification.
- Source link: https://github.com/CaseMark/skills/tree/main/med
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0007
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: medical-skills
- Expansion candidates: All skills audit export (manifest, second pass); Medical skills (category, second pass)

## Strong Adjacent Matches

### README Available Skills
- Why it matters: Support biomedical or clinical research work such as clinical trial lookup, variant interpretation, drug safety review, clinical documentation, and treatment-plan drafting with human oversight.
- Why it is here: Clinical documentation and research lookup are adjacent to evidence packet construction when the reader needs source-backed review.
- What it does: Copy research routing, source lookup, and clinical-document review structures only after source verification and human review boundaries are preserved.
- Source link: https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/README.md
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0021
- Reliability: tier=gold; confidence=high
- Possible skill to extract: readme-available-skills

### CRE Due Diligence plugin pack
- Why it matters: Route commercial real estate due-diligence requests across rent roll, operating expense, market, physical, environmental, title, and tenant-credit review workflows.
- Why it is here: It is not healthcare or pediatric work, but due diligence is a strong adjacent evidence-review pattern with structured source review and handoff.
- What it does: Copy routing, evidence grouping, and reviewer handoff patterns; do not copy domain conclusions across domains.
- Source link: https://github.com/ahacker-1/cre-agent-skills/tree/main/plugins/cre-due-diligence
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0044
- Reliability: tier=silver; confidence=medium
- Possible skill to extract: cre-due-diligence-plugin-pack

## Supporting Building Blocks

### README Skills Overview
- Why it matters: Reusable reference for README-level overview of healthcare and medical document skills.
- Why it is here: It is useful as a map before drilling into exact document packet workflows.
- What it does: Use as a source index, then read the referenced workflow files directly.
- Source link: https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills/blob/main/README.md
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0018
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: readme-skills-overview

### Plugin manifest
- Why it matters: Reusable reference for a healthcare skills package manifest that may identify available medical document workflow surfaces.
- Why it is here: Manifests can expose the leaf workflows behind a door before a deeper expansion pass.
- What it does: Use it to locate candidate skill files and verify the workflow body before extraction.
- Source link: https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills/blob/main/openclaw.plugin.json
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0017
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: plugin-manifest

## Maybe Useful

### Healthcare industry pack
- Why it matters: Produce publication-ready long-form content with research, fact-checking, humanization, review, and Word document output; healthcare-specific behavior was not verified at the requested folder link.
- Why it is here: Fact-checking and Word output can be useful when the evidence packet is reader-facing rather than operational.
- What it does: Copy only the research, fact-checking, review, and output-handoff structure after verifying the source path.
- Source link: https://github.com/indranilbanerjee/contentforge/tree/main/skills/healthcare
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0083
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: healthcare-industry-pack
