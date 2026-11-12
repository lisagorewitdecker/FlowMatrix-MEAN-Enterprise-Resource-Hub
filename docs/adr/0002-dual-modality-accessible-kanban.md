# ADR 0002: Dual-Modality Interaction Model for Kanban Board

## Status
Accepted design; implementation and verification pending

## Context
The planned Kanban board needs an interaction model that supports pointer, keyboard, and assistive-technology users. A keyboard alternative is one part of accessibility; conformance must be evaluated against all applicable WCAG 2.1 A/AA criteria after implementation.

## Decision
The accepted design for the planned board is a dual-modality interaction pattern:
1. **Pointer Devices:** Use Angular CDK Drag & Drop with interactive drop lists and ghost placeholders.
2. **Keyboard & Assistive Tech:** Provide a focusable `<select>` element on each project card, labeled via `.sr-only` utility classes, so users can select an alternative status with the arrow keys.
3. **Screen Reader Feedback:** Announce dynamic status updates and filter changes to assistive technology using dedicated `role="status"` and `aria-live="polite"` regions.

## Consequences
### Positive
* The design is intended to support keyboard and assistive-technology use without compromising touch/mouse ergonomics. It does not establish WCAG conformance; implementation and an audit of all applicable A/AA criteria are still required.
