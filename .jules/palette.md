## 2025-05-15 - [Async Modal State Management]
**Learning:** For modals containing forms (e.g., Waitlist), hiding the form on success is insufficient for multi-interaction sessions. The modal closure must trigger a complete state reset—restoring form visibility, hiding success indicators, and clearing all loading classes/ARIA attributes—to ensure the interface remains intuitive for subsequent opens.
**Action:** Always attach a reset listener to the modal's close trigger or use a MutationObserver/Global State to ensure form-to-success transitions are reversible upon dismissal.

## 2025-05-15 - [Non-Intrusive Loading Indicators]
**Learning:** Implementing loading states via `::after` pseudo-elements on a global `.is-loading` utility class provides a highly maintainable way to add feedback without modifying the DOM structure of every button. Setting the button text to `color: transparent !important` while the spinner is active maintains the button's dimensions, preventing layout shift.
**Action:** Use CSS-based spinners with `currentColor` and `transparent` text for high-fidelity loading states that automatically adapt to the component's theme.
