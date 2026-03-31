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
