
import time
import json
import os
from playwright.sync_api import sync_playwright

def benchmark_scroll():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        path = os.path.abspath("index.html")

        # Add init script to override addEventListener before any script runs
        page.add_init_script("""
            window.perfData = {
                callCount: 0,
                totalTime: 0,
                maxTime: 0,
                handlers: []
            };

            const originalAddEventListener = window.addEventListener;
            window.addEventListener = function(type, listener, options) {
                if (type === 'scroll') {
                    const originalListener = listener;
                    const wrappedListener = function(e) {
                        const start = performance.now();
                        originalListener(e);
                        const duration = performance.now() - start;
                        window.perfData.callCount++;
                        window.perfData.totalTime += duration;
                        window.perfData.maxTime = Math.max(window.perfData.maxTime, duration);
                    };
                    window.perfData.handlers.push(type);
                    return originalAddEventListener.call(this, type, wrappedListener, options);
                }
                return originalAddEventListener.call(this, type, listener, options);
            };
        """)

        page.goto(f"file://{path}")

        # Wait for initialization
        time.sleep(1)

        # Perform many scrolls to simulate heavy usage
        scroll_steps = 1000
        for i in range(scroll_steps):
            page.evaluate(f"window.scrollTo(0, {i * 10})")
            # Forcing some delay to allow browser to trigger events
            if i % 100 == 0:
                time.sleep(0.1)

        # Give it a moment to finish any pending work
        time.sleep(1)

        perf_results = page.evaluate("window.perfData")
        if perf_results:
            print(json.dumps(perf_results, indent=2))
        else:
            print("No perf results obtained")

        browser.close()

if __name__ == "__main__":
    benchmark_scroll()
