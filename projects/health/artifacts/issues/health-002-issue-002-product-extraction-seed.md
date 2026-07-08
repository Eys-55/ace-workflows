# Issue 002: Product And Benefit Extraction Seed Catalog

## Parent

health-002

## What To Build

Create the next vertical slice for the Philippines insurance and HMO navigator:
a registry-linked seed catalog of benefit and product surfaces. The catalog
should teach the future navigator which product families exist before any deep
plan extraction, comparison, or user-facing recommendation logic is built.

This slice must anchor each product or benefit surface to a canonical entity in
the registry. It should include PhilHealth first, HMO product patterns second,
and insurer health-protection surfaces third.

## Acceptance Criteria

- [x] Catalog includes PhilHealth benefit categories from official PhilHealth
      sources.
- [x] Catalog includes an HMO regulatory product template from the Insurance
      Commission HMO product circular.
- [x] Catalog includes provider-published HMO product surfaces for selected
      HMOs already present in the canonical registry.
- [x] Catalog includes insurer health-protection surfaces for selected major
      insurers already present in the canonical registry.
- [x] Every product surface references an existing registry `entity_id`.
- [x] Every product surface has normalized product type, market segment,
      coverage tags, source evidence, extraction status, and last checked date.
- [x] Validator rejects unknown entity IDs, unknown source IDs, duplicate
      product IDs, duplicate aliases within an entity, unsupported coverage
      tags, and recommendation/coverage-decision fields.
- [x] The artifact does not provide insurance advice, medical advice, legal
      advice, claims decisions, coverage determinations, rankings, or plan
      recommendations.

## Blocked By

None - issue 001 registry artifacts exist and the product catalog can validate
against them.
