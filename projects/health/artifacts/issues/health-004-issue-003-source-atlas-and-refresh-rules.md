# Issue 003: Source Atlas And Refresh Rules

## Parent

health-004

## What To Build

Create a source atlas for the Philippines insurance and HMO navigator. The atlas
must classify sources by role, authority, refresh cadence, and allowed use so
later slices do not confuse regulator authority, provider product descriptions,
public-payer benefits, and workflow-understanding evidence.

## Acceptance Criteria

- [x] Atlas includes PhilHealth, Insurance Commission, provider, insurer, and
      workflow-packet source roles.
- [x] Atlas marks regulator and public-payer sources as official authority
      sources.
- [x] Atlas marks provider and insurer pages as product-description evidence,
      not authorization proof.
- [x] Atlas marks real-life-workflows packet material as workflow evidence only.
- [x] Atlas defines refresh cadence, allowed use, and blocked use for each
      source role.
- [x] Validator checks source IDs and rejects recommendation or decision fields.

## Blocked By

None. Registry and product catalog sources already exist.
