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
