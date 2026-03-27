## 2024-05-22 - [Search & DOM Optimization]
**Learning:** Pre-computing search-ready strings (e.g., lowercase versions) during the data initialization phase significantly reduces CPU overhead during high-frequency filtering events. Combining this with `DocumentFragment` batching and debouncing provides a massive boost to perceived and actual performance in vanilla JS applications by minimizing layout thrashing and redundant string operations.
**Action:** When implementing search or list filtering, always check if searchable fields can be normalized upfront. Prioritize `DocumentFragment` for any UI updates involving more than 5-10 elements to keep reflows to a minimum.

## 2024-05-23 - [Single-Pass Greedy Similarity Filter]
**Learning:** For recommendation systems or "similar item" logic in smaller datasets, replacing multiple `.filter()` passes with a single `for` loop to collect both matches and fallback items (greedy collection) reduces CPU overhead by half or more. Using pre-computed tag `Set`s for constant-time membership checks inside these loops eliminates the O(N) overhead of repeated array inclusions.
**Action:** Use a single loop to partition or collect data when multiple selection criteria (e.g., primary matches vs fallbacks) are required from the same source array.
