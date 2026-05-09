# Palette's Journal

## 2025-05-15 - Accessible Interactive Containers
**Learning:** In projects using vanilla JS and static HTML for complex UIs, interactive "cards" (e.g., service cards) are often implemented using non-semantic tags like `article` or `div`. These elements are invisible to keyboard users and screen readers unless they are explicitly given a `role="button"` and `tabindex="0"`. Furthermore, an `onclick` handler is insufficient; a `keydown` listener for 'Enter' and 'Space' must be added to achieve parity with standard buttons.

**Action:** When making a container interactive:
1. Add `role="button"` and `tabindex="0"`.
2. Add an `aria-label` if the content doesn't clearly describe the action.
3. Add a `keydown` event listener in JS to handle 'Enter' and 'Space'.
4. Define a clear `:focus-visible` style in CSS to guide keyboard navigation.

## 2025-05-16 - Standardizing Page Structure for Accessibility
**Learning:** In legacy or multi-page static sites, consistent use of landmark roles (like `<main>`) is often overlooked on subpages. Implementing a "Skip to Content" link effectively requires a reliable target across all pages. Retrofitting `<main>` tags with unique IDs (e.g., `id="main-content"`) and `tabindex="-1"` not only enables the skip link but also fixes broken semantic structure that would otherwise confuse screen reader users.

**Action:** Before implementing site-wide accessibility features like skip links:
1. Audit all HTML files for the presence of the `<main>` landmark.
2. Ensure every page has exactly one `<main>` element wrapping the primary content (excluding header/footer).
3. Add `tabindex="-1"` to the skip link target to ensure focus is correctly moved in all browsers.

## 2025-05-17 - Essential Keyboard Navigation for Custom Dropdowns
**Learning:** Custom dropdown (combobox) implementations often miss "Home" and "End" key navigation, which are expected behaviors for accessible components. Users rely on these shortcuts to quickly navigate long lists without multiple arrow key presses. Implementing these requires a centralized selection logic that can be easily triggered by both sequential (Up/Down) and jump (Home/End) inputs.

**Action:** When building custom selection components:
1. Always implement `Home` (index 0) and `End` (last index) key listeners in addition to `ArrowUp` and `ArrowDown`.
2. Ensure that the logic for updating the highlighted state (`aria-activedescendant`) and scrolling the active element into view is shared across all navigation keys to maintain consistency.

## 2025-05-18 - Keyboard Accessibility for Hover Dropdowns
**Learning:** Purely hover-based navigation dropdowns are a major accessibility barrier for keyboard users. By applying the `:focus-within` pseudo-class to the parent container, the dropdown's visibility and associated animations (like icon rotation) can be triggered automatically when any child element (e.g., the trigger link or sub-menu items) receives focus.

**Action:** When implementing hover-activated UI elements:
1. Ensure the container also reacts to `:focus-within`.
2. Apply the same visibility and transform rules to the focus state as the hover state to maintain a consistent experience across input methods.

## 2025-05-19 - Resettable State for Reusable Modals
**Learning:** In static sites where modals are hidden/shown rather than unmounted, asynchronous success states (e.g., "Thank You" messages) can become "stale" if the user closes and re-opens the modal. Standardizing a reset mechanism that restores the original form, clears loading indicators (`.is-loading`), and resets accessibility attributes (`aria-busy`) is critical for a predictable user experience.

**Action:** When implementing success states in persistent UI components:
1. Create a `resetModal` function (or equivalent) that is called on both 'Close' button clicks and backdrop clicks.
2. Ensure the reset logic covers: form visibility, success message hiding, clearing input values, and restoring button states (enabled, no spinner, `aria-busy="false"`).
3. Use CSS transitions (e.g., `opacity` and `transform`) to make the switch between form and success states feel fluid rather than abrupt.

## 2026-05-09 - Accessibility Standard for Floating Assistants
**Learning:** Floating assistant modals (like Rua AI) require a specific WAI-ARIA pattern to be truly accessible: a focus trap, 'Escape' key dismissal, auto-focus on the primary interaction element (with a delay to account for CSS transitions), and focus restoration to the trigger. Without these, keyboard and screen reader users can easily become "lost" in the background page or trapped in a state where they cannot easily dismiss the assistant.

**Action:** When implementing floating assistants:
1. Use `aria-haspopup="dialog"` and manage `aria-expanded` on the trigger.
2. Implement a vanilla JS focus trap within the modal to prevent Tabbing out of context.
3. Call `.focus()` on the main input with a ~300ms delay to ensure the element is visible and interactive in the accessibility tree after transitions.
4. Always restore focus to the original trigger upon closure.
5. Provide clear visual focus indicators (e.g., `:focus-visible`) for all triggers, including Floating Action Buttons (FABs).
