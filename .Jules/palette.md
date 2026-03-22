# Palette's Journal

## 2025-05-15 - Accessible Interactive Containers
**Learning:** In projects using vanilla JS and static HTML for complex UIs, interactive "cards" (e.g., service cards) are often implemented using non-semantic tags like `article` or `div`. These elements are invisible to keyboard users and screen readers unless they are explicitly given a `role="button"` and `tabindex="0"`. Furthermore, an `onclick` handler is insufficient; a `keydown` listener for 'Enter' and 'Space' must be added to achieve parity with standard buttons.

**Action:** When making a container interactive:
1. Add `role="button"` and `tabindex="0"`.
2. Add an `aria-label` if the content doesn't clearly describe the action.
3. Add a `keydown` event listener in JS to handle 'Enter' and 'Space'.
4. Define a clear `:focus-visible` style in CSS to guide keyboard navigation.
