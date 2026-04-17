## 2024-05-22 - [Search & DOM Optimization]
**Learning:** Pre-computing search-ready strings (e.g., lowercase versions) during the data initialization phase significantly reduces CPU overhead during high-frequency filtering events. Combining this with `DocumentFragment` batching and debouncing provides a massive boost to perceived and actual performance in vanilla JS applications by minimizing layout thrashing and redundant string operations.
**Action:** When implementing search or list filtering, always check if searchable fields can be normalized upfront. Prioritize `DocumentFragment` for any UI updates involving more than 5-10 elements to keep reflows to a minimum.

## 2024-05-23 - [Single-Pass Greedy Similarity Filter]
**Learning:** For recommendation systems or "similar item" logic in smaller datasets, replacing multiple `.filter()` passes with a single `for` loop to collect both matches and fallback items (greedy collection) reduces CPU overhead by half or more. Using pre-computed tag `Set`s for constant-time membership checks inside these loops eliminates the O(N) overhead of repeated array inclusions.
**Action:** Use a single loop to partition or collect data when multiple selection criteria (e.g., primary matches vs fallbacks) are required from the same source array.

## 2024-05-24 - [Incremental List Rendering]
**Learning:** In vanilla JS applications with large datasets, clearing the entire parent container for pagination ("Load More") causes significant DOM churn and layout thrashing. Utilizing an `isAppend` flag combined with `DocumentFragment` allows for O(1) DOM insertions that preserve existing nodes, resulting in smoother transitions and better memory efficiency.
**Action:** Always implement incremental rendering (appending) for "Load More" patterns instead of full-grid re-renders. Use `DocumentFragment` to batch the new items before a single insertion into the live DOM.

## 2024-05-25 - [Search Data Normalization & Set Lookups]
**Learning:** For high-frequency search/filter logic on static data, pre-computing normalized search strings (concatenating and lowercasing fields during init) and using `Set` for filter criteria provides a significant (~82%) performance boost. This avoids redundant O(N) string operations and O(M) array lookups inside the O(N) filter loop.
**Action:** Pre-normalize searchable fields during the data initialization phase and convert multi-select filter arrays to `Set` objects for O(1) membership checks during search/filtering.

## 2026-04-01 - [High-Frequency Interaction Optimization]
**Learning:** For mouse-driven animations (like 3D tilt), calling `getBoundingClientRect()` inside the `mousemove` handler triggers layout thrashing (forced synchronous layout). Caching this value on `mouseenter` and invalidating it only on `scroll` or `resize` events keeps the interaction loop free of expensive reflows. Combined with `gsap.quickTo()`, this ensures a smooth 60fps experience by minimizing both CPU work and garbage collection.
**Action:** Always cache element dimensions/positions before entering a high-frequency event loop. Use `gsap.quickTo()` instead of `gsap.to()` for continuous property updates.

## 2026-05-15 - [Accordion & Stat Counter Initialization]
**Learning:** In components with many interactive elements (e.g., long FAQ lists or numerous stat counters), O(N) operations during event handling and forced reflows during initialization are major bottlenecks. Tracking the active item in a persistent object allows for O(1) state transitions, while using `textContent` instead of `innerText` for initial value setup avoids redundant layout calculations. These changes combined resulted in a ~71-82% performance improvement in our benchmarks.
**Action:** Use a tracking object/variable for single-active-item components (accordions, tabs) to avoid O(N) loops on every interaction. Favor `textContent` for mass DOM updates where CSS-aware text retrieval is not required.

## 2026-04-17 - [Canvas Hero Graph Animation Optimization]
**Learning:** High-frequency canvas animations (60fps) are extremely sensitive to DOM lookups, linear gradient creation, and array allocations (like `.slice().map()`) within the render loop. Caching DOM references and gradients, using `Path2D` to reuse geometry for both fill and stroke, and replacing array transformations with direct `for` loops significantly reduces per-frame latency and GC pressure. In this case, these optimizations yielded a ~46% performance improvement (from ~150.7ms to ~81.4ms for 10,000 iterations).
**Action:** Always cache DOM elements, expensive drawing objects (gradients, Path2D), and calculate static dimensions outside high-frequency animation loops. Replace functional array methods with direct loops in hot paths to avoid heap churn.
