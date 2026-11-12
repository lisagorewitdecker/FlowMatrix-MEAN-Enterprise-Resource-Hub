# ADR 0002: Dual-Modality Interaction Model for Kanban Board

## Status
Accepted

## Context
Standard drag-and-drop boards (like Trello or Jira) are notoriously inaccessible to keyboard-only and screen-reader users, violating WCAG 2.1 Criterion 2.1.1 (Keyboard).

## Decision
We implemented a dual-modality interaction pattern:
1. **Pointer Devices:** Angular CDK Drag & Drop with interactive drop lists and ghost placeholders.
2. **Keyboard & Assistive Tech:** Each project card features a focusable `<select>` element labeled via `.sr-only` utility classes. When focused via keyboard `Tab`, the user can select an alternative status with the arrow keys.
3. **Screen Reader Feedback:** Dynamic status updates and filter changes announce to assistive tech using dedicated `role="status"` and `aria-live="polite"` regions.

## Consequences
### Positive
* Full WCAG 2.1 AA compliance for drag-and-drop workflows without compromising touch/mouse ergonomics.
