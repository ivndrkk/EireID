import asyncio
import time
from playwright.async_api import async_playwright
import os

async def benchmark():
    async with async_playwright() as p:
        # Launch browser with file access for local HTML testing
        browser = await p.chromium.launch(args=["--allow-file-access-from-files"])
        page = await browser.new_page()

        # Get absolute path to index.html
        path = os.path.abspath("index.html")
        url = f"file://{path}"

        await page.goto(url)

        # 1. Benchmark FAQ Accordion Toggle
        # We'll measure the time taken to click multiple FAQ items
        print("--- Benchmarking FAQ Accordion ---")

        # Create many FAQ items to make the O(N) loop measurable
        await page.evaluate('''() => {
            const container = document.querySelector('.faq__accordion');
            const template = container.firstElementChild.cloneNode(true);
            for (let i = 0; i < 500; i++) {
                container.appendChild(template.cloneNode(true));
            }
            // Re-initialize logic if necessary or just simulate click
            window.initFAQAccordion();
        }''')

        faq_count = await page.evaluate('''() => document.querySelectorAll('.faq__item').length''')
        print(f"Found {faq_count} FAQ items.")

        # Measure 50 toggles
        iterations = 50
        start_perf = await page.evaluate('''() => performance.now()''')
        await page.evaluate(f'''async (iterations) => {{
            const buttons = document.querySelectorAll('.faq__question');
            for (let i = 0; i < iterations; i++) {{
                const btn = buttons[i % buttons.length];
                btn.click();
            }}
        }}''', iterations)
        end_perf = await page.evaluate('''() => performance.now()''')

        faq_duration = end_perf - start_perf
        print(f"FAQ Toggles (50 iterations on 500 items): {faq_duration:.4f} ms")
        print(f"Average per toggle: {faq_duration / iterations:.4f} ms")

        # 2. Benchmark Stat Counters Initialization
        print("\n--- Benchmarking Stat Counters Init ---")

        # Again, increase scale to make it measurable
        await page.evaluate('''() => {
            const container = document.querySelector('.stat-bar');
            const col = container.querySelector('.stat-bar__col').cloneNode(true);
            for (let i = 0; i < 200; i++) {
                container.appendChild(col.cloneNode(true));
            }
        }''')

        # Measure initialization phase
        stat_init_time = await page.evaluate('''() => {
            const stats = document.querySelectorAll('.stat-bar__number');
            const start = performance.now();
            stats.forEach(el => {
                el.removeAttribute('data-target');
                if (!el.getAttribute('data-target')) {
                    el.setAttribute('data-target', el.textContent.trim());
                }
            });
            return performance.now() - start;
        }''')

        print(f"Stat Counters Init (textContent, 200 items): {stat_init_time:.4f} ms")

        await browser.close()
        return faq_duration, stat_init_time

if __name__ == "__main__":
    asyncio.run(benchmark())
