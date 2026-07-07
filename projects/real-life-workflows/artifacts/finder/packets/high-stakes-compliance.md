# Workflow Understanding Packet

- Query: healthcare PHI compliance audit
- Intake question: What type of work or workflow are you trying to understand?
- Visible recommendation count: 7
- Visible recommendation cap: 12
- Packet rule: Keep descriptions and links here; read source workflows directly before extracting or creating a skill.
- Human review boundary: This packet is for workflow understanding only and does not prove compliance, clinical correctness, eligibility, coverage, legal sufficiency, or safety.

## Direct Matches

### README Available Skills
- Why it matters: Support biomedical or clinical research work such as clinical trial lookup, variant interpretation, drug safety review, clinical documentation, and treatment-plan drafting with human oversight.
- Why it is here: The query is high stakes and healthcare-related; this door has the strongest reliability signal while still requiring human oversight.
- What it does: Copy research routing, source lookup, and clinical-document review structures only after source verification and human review boundaries are preserved.
- Source link: https://github.com/K-Dense-AI/scientific-agent-skills/blob/main/README.md
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0021
- Reliability: tier=gold; confidence=high
- Possible skill to extract: readme-available-skills
- Expansion candidates: README Available Skills (manifest, second pass)

### Medical skills
- Why it matters: Reusable reference for patient, referral, administrative, and medical-document packet preparation workflows.
- Why it is here: PHI-adjacent packet work needs source provenance, completeness checks, and human review before action.
- What it does: Only copy packet assembly, checklist, summarization, and review-handoff structure after source verification.
- Source link: https://github.com/CaseMark/skills/tree/main/med
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0007
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: medical-skills
- Expansion candidates: All skills audit export (manifest, second pass); Medical skills (category, second pass)

## Strong Adjacent Matches

### Medical document workflows
- Why it matters: Reusable reference for medical document workflow skills, including document cleanup, summarization, checklist creation, and review-ready handoff.
- Why it is here: It is adjacent to PHI compliance because document workflows need provenance, minimal disclosure, review, and safe handoff boundaries.
- What it does: Copy only the document preparation and review-handoff shape after verifying the source files directly.
- Source link: https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills/tree/main/skills
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0016
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: medical-document-workflows

### Pharma industry pack
- Why it matters: Produce researched, fact-checked, reviewed content with publication-ready Word output; pharma-specific workflow behavior was not verified at the requested folder link.
- Why it is here: Pharma content can be compliance-adjacent, but this row is not enough to treat it as a compliance workflow.
- What it does: Use only as a source for research and review handoff shapes after source verification.
- Source link: https://github.com/indranilbanerjee/contentforge/tree/main/skills/pharma
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0085
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: pharma-industry-pack

## Supporting Building Blocks

### Plugin manifest
- Why it matters: Reusable reference for a healthcare skills package manifest that may identify available medical document workflow surfaces.
- Why it is here: Manifest review can locate the actual leaf workflows before any compliance-sensitive extraction.
- What it does: Use it to discover package structure and candidate workflow entry points before deeper source reading.
- Source link: https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills/blob/main/openclaw.plugin.json
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0017
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: plugin-manifest

### README Skills Overview
- Why it matters: Reusable reference for README-level overview of healthcare and medical document skills.
- Why it is here: It can guide source expansion, but it is not enough to claim PHI compliance.
- What it does: Use as a map, then verify every referenced skill or workflow directly.
- Source link: https://github.com/FreedomIntelligence/OpenClaw-Medical-Skills/blob/main/README.md
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0018
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: readme-skills-overview

## Maybe Useful

### Healthcare industry pack
- Why it matters: Produce publication-ready long-form content with research, fact-checking, humanization, review, and Word document output; healthcare-specific behavior was not verified at the requested folder link.
- Why it is here: It may contribute fact-checking and human review patterns, but it does not prove compliance.
- What it does: Copy only the research, fact-checking, review, and output-handoff structure after verifying the source path.
- Source link: https://github.com/indranilbanerjee/contentforge/tree/main/skills/healthcare
- Local door/source path: projects/real-life-workflows/quarantine/imports/2026-07-07-market-research-agent/data-agentic-repos/workflow-search-index.json#surface-0083
- Reliability: tier=needs_verification; confidence=low
- Possible skill to extract: healthcare-industry-pack
