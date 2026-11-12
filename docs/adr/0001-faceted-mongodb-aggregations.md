# ADR 0001: Faceted Aggregation Pipeline for Executive Telemetry

## Status
Accepted

## Context
The executive analytics dashboard requires portfolio metrics, capital distribution across four lifecycle phases, overdue risk calculations, and completion percentages.

Querying MongoDB multiple times sequentially (e.g., `countDocuments()`, `aggregate()`, `find()`) caused network overhead and inconsistent point-in-time snapshots during rapid status updates.

## Decision
We consolidated all analytics computations into a single MongoDB `$facet` aggregation pipeline within `analytics.controller.ts`.

## Consequences
### Positive
* **Single Round-Trip:** MongoDB resolves portfolio totals, status breakdowns, and date-comparison velocities in a single database operation.
* **Point-in-Time Consistency:** All KPI metrics derive from the same database snapshot.
* **Calculated Velocity:** Overdue project counts are resolved directly on the database engine using `$cond` expressions against `new Date()`.

### Negative / Trade-offs
* Pipeline complexity is higher than simple Mongoose queries, requiring thorough integration unit testing with mocked aggregation responses.
