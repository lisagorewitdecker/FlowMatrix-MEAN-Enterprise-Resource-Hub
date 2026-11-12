# ADR 0001: Faceted Aggregation Pipeline for Executive Telemetry

## Status
Accepted

## Context
The planned executive analytics dashboard will need portfolio metrics, capital distribution across four lifecycle phases, overdue risk calculations, and completion percentages.

If these metrics are computed with multiple sequential MongoDB queries (e.g., `countDocuments()`, `aggregate()`, `find()`), the additional network overhead could increase latency and produce inconsistent point-in-time snapshots during rapid status updates.

## Decision
Use a single MongoDB `$facet` aggregation pipeline for the analytics computations when implementing `analytics.controller.ts`.

## Consequences
### Positive
* **Single Round-Trip:** MongoDB can resolve portfolio totals, status breakdowns, and date-comparison velocities in a single database operation.
* **Point-in-Time Consistency:** All KPI metrics can derive from the same database snapshot.
* **Calculated Velocity:** Overdue project counts can be resolved directly on the database engine using `$cond` expressions against `new Date()`.

### Negative / Trade-offs
* Pipeline complexity will be higher than simple Mongoose queries, requiring thorough integration testing with mocked aggregation responses.
