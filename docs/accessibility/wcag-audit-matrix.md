# WCAG 2.1 Accessibility Verification Plan (Level AA)

| WCAG Criterion | Level | Planned Implementation | Planned Verification |
| :--- | :--- | :--- | :--- |
| **1.3.1 Info & Relationships** | A | Planned semantic landmarks (`<main>`, `<aside>`, `<section>`, `<article>`), hierarchical heading structures (`h1` -> `h3`), and accessible table markup (`<caption>`, `<th scope="col">`). | Planned screen reader inspection (VoiceOver / NVDA) |
| **1.4.1 Use of Color** | A | Planned status badges pair color fills with unique glyph indicators (`●`) and explicit text labels, without relying solely on hue. | Planned grayscale contrast emulation audit |
| **1.4.3 Contrast (Minimum)** | AA | Planned minimum contrast ratio of 4.5:1 for all UI foreground elements against the dark palette (`#090d16` / `#0b1120`). | Planned Chrome DevTools Contrast Checker |
| **2.1.1 Keyboard** | A | The planned Kanban lifecycle will be operable without a pointer device via keyboard focus fallbacks and `<select>` controls. | Planned full keyboard navigation (`Tab` / `Shift+Tab` / `Enter`) |
| **2.4.1 Bypass Blocks** | A | A dedicated "Skip to main content" link at the root of `main-layout.component.ts` is planned. | Planned initial `Tab` key event inspection |
| **4.1.3 Status Messages** | AA | Planned announcements via `aria-live="polite"` for dynamic data operations (Kanban counts, filter adjustments, analytics refreshes). | Planned assistive technology event monitoring |
