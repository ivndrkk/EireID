import os
from playwright.sync_api import sync_playwright

def run_cuj_pagination(page):
    # Load the local HTML file
    file_path = f"file://{os.path.abspath('pages/allservices.html')}"
    page.goto(file_path, wait_until="commit")
    page.wait_for_timeout(1000)

    # 1. Show initial state
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)

    # 2. Click Load More
    page.get_by_role("button", name="Load More").click()
    page.wait_for_timeout(1000)

    # 3. Scroll to the new items
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    page.wait_for_timeout(1000)

    # 4. Click Load More again if visible
    load_more = page.get_by_role("button", name="Load More")
    if load_more.is_visible():
        load_more.click()
        page.wait_for_timeout(1000)
        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        page.wait_for_timeout(1000)

    # 5. Perform a search to show reset
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(500)
    page.get_by_placeholder("Search services...").fill("Passport")
    page.wait_for_timeout(1000) # Wait for debounce

    # Take screenshot of search results
    page.screenshot(path="/home/jules/verification/screenshots/verification_pagination.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        # Mock external libs
        context.add_init_script("window.gsap = { registerPlugin: () => {}, to: () => {}, set: () => {}, timeline: () => ({ to: () => ({ to: () => ({ to: () => ({ to: () => {} }) }) }) }), matchMedia: () => ({ add: () => {} }) };")
        context.add_init_script("window.ScrollTrigger = { update: () => {}, scrollerProxy: () => {}, addEventListener: () => {}, refresh: () => {}, create: () => {} };")
        context.add_init_script("window.LocomotiveScroll = class { on() {} scrollTo() {} update() {} stop() {} start() {} };")

        page = context.new_page()
        try:
            run_cuj_pagination(page)
        finally:
            context.close()
            browser.close()
