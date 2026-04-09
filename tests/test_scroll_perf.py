import asyncio
import os
from playwright.async_api import async_playwright

async def benchmark_scroll():
    async with async_playwright() as p:
        browser = await p.chromium.launch(args=["--allow-file-access-from-files"])
        page = await browser.new_page()

        path = os.path.abspath("pages/resident.html")
        url = f"file://{path}"

        await page.goto(url)

        # Inject performance measurement into onScroll
        await page.evaluate('''() => {
            const section = document.getElementById('resident-tabs');
            if (!section) return;

            window.onScrollTimes = [];
            const originalOnScroll = window.onScrollForBenchmark; // We'll need to expose it
        }''')

        # Actually, it's wrapped in an IIFE, so I can't easily reach it.
        # I'll modify the file temporarily to expose it or just measure the whole scroll event.

        await page.set_viewport_size({"width": 1200, "height": 800})

        # Measure scroll event performance
        print("--- Benchmarking Resident Tabs Scroll ---")

        # Scroll up and down multiple times
        start_time = await page.evaluate('''performance.now()''')
        for i in range(10):
            await page.mouse.wheel(0, 500)
            await asyncio.sleep(0.05)
            await page.mouse.wheel(0, -500)
            await asyncio.sleep(0.05)
        end_time = await page.evaluate('''performance.now()''')

        print(f"Total time for 20 scroll actions: {end_time - start_time:.4f} ms")

        # Let's try to measure layout thrashing specifically.
        # We can use the 'requestAnimationFrame' to see if we drop frames.

        await browser.close()

if __name__ == "__main__":
    asyncio.run(benchmark_scroll())
