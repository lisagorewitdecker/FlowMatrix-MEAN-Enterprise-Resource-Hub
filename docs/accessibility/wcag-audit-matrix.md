# WCAG 2.1 Conformance Audit (Level AA)

| WCAG Criterion | Level | Implementation in FlowMatrix | Verification Method |
| :--- | :--- | :--- | :--- |
| **1.3.1 Info & Relationships** | A | Semantic landmarks (`<main>`, `<aside>`, `<section>`, `<article>`), hierarchical heading structures (`h1` -> `h3`), and accessible table markup (`<caption>`, `<th scope="col">`). | Screen reader inspection (VoiceOver / NVDA) |
| **1.4.1 Use of Color** | A | Status badges pair color fills with unique glyph indicators (`●`) and explicit text labels. Never relies solely on hue. | Grayscale contrast emulation audit |
| **1.4.3 Contrast (Minimum)** | AA | All UI foreground elements maintain a minimum contrast ratio of 4.5:1 against the dark palette (`#090d16` / `#0b1120`). | Chrome DevTools Contrast Checker |
| **2.1.1 Keyboard** | A | Entire Kanban lifecycle can be operated without a pointer device via keyboard focus fallbacks and `<select>` controls. | Full keyboard navigation (`Tab` / `Shift+Tab` / `Enter`) |
| **2.4.1 Bypass Blocks** | A | Implemented a dedicated "Skip to main content" link at the root of `main-layout.component.ts`. | Initial `Tab` key event inspection |
| **4.1.3 Status Messages** | AA | Dynamic data operations (Kanban counts, filter adjustments, analytics refreshes) announce via `aria-live="polite"`. | Assistive technology event monitoring |
