import asyncio
import os
import time
from playwright.async_api import async_playwright

async def run_benchmark():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--allow-file-access-from-files"])
        page = await browser.new_page()

        path = os.path.abspath("pages/resident.html")
        url = f"file://{path}"

        await page.goto(url)
        await page.set_viewport_size({"width": 1200, "height": 800})

        # Give some time for Locomotive Scroll to init and ScrollTrigger to refresh
        await asyncio.sleep(2)

        print("--- Benchmarking Resident Tabs logic (N=5000) ---")

        duration = await page.evaluate('''async () => {
            const section = document.getElementById('resident-tabs');
            if (!section) return 0;

            // Re-trigger a scroll so that onScroll gets something to work with
            // Since it's inside an IIFE, we can't call it directly unless we modify it
            // but we can at least measure its impact by triggering many events

            const start = performance.now();
            for (let i = 0; i < 5000; i++) {
                window.dispatchEvent(new Event('scroll'));
            }
            return performance.now() - start;
        }''')

        print(f"Total time: {duration:.4f} ms")
        print(f"Average time per scroll: {duration / 5000:.4f} ms")

        await browser.close()
        return duration

if __name__ == "__main__":
    asyncio.run(run_benchmark())
