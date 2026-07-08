# Issue 001: Canonical PhilHealth, HMO, And Insurance Registry

## Parent

health-002

## What To Build

Create the first canonical registry artifact for the Philippines insurance and
HMO navigator. The registry should seed PhilHealth as the public payer anchor,
officially listed HMOs as HMO entities, and a small seed set of major insurance
companies for later insurance literacy workflows.

This slice must be verifiable on its own. It should not build the user-facing
navigator yet.

## Acceptance Criteria

- [x] Registry includes PhilHealth as a public health insurance anchor.
- [x] Registry includes HMO entities from the Insurance Commission HMO
      Certificate of Authority list.
- [x] Registry includes a seed set of major insurance companies with source
      provenance.
- [x] Each entity has a canonical ID, entity type, display name, aliases, source
      evidence, and last checked date.
- [x] Deduplication fields distinguish legal entity names, brands, aliases, and
      former names.
- [x] Validator catches duplicate canonical IDs, duplicate aliases across
      entities, missing source references, and unknown source IDs.
- [x] The artifact does not provide insurance advice, medical advice, legal
      advice, claims decisions, or plan recommendations.

## Blocked By

None - can start immediately.
