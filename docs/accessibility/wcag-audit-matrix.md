# WCAG 2.1 AA Implementation and Verification Plan

The following table describes planned accessibility features and verification steps; it is not a conformance audit. Implementation and audit results remain pending until the frontend is available.

| WCAG Criterion | Level | Planned Implementation | Planned Verification |
| :--- | :--- | :--- | :--- |
| **1.3.1 Info & Relationships** | A | Use semantic landmarks (`<main>`, `<aside>`, `<section>`, `<article>`), hierarchical heading structures (`h1` -> `h3`), and accessible table markup (`<caption>`, `<th scope="col">`). | Screen reader inspection (VoiceOver / NVDA) |
| **1.4.1 Use of Color** | A | Pair status badge colors with unique glyph indicators (`●`) and explicit text labels; do not rely solely on hue. | Grayscale contrast emulation audit |
| **1.4.3 Contrast (Minimum)** | AA | Target a minimum contrast ratio of 4.5:1 for UI foreground elements against the dark palette (`#090d16` / `#0b1120`). | Chrome DevTools Contrast Checker |
| **2.1.1 Keyboard** | A | Support operation of the entire Kanban lifecycle without a pointer via keyboard focus fallbacks and `<select>` controls. | Full keyboard navigation (`Tab` / `Shift+Tab` / `Enter`) |
| **2.4.1 Bypass Blocks** | A | Add a dedicated "Skip to main content" link to the main layout. | Initial `Tab` key event inspection |
| **4.1.3 Status Messages** | AA | Announce dynamic data operations (Kanban counts, filter adjustments, analytics refreshes) via `aria-live="polite"`. | Assistive technology event monitoring |
