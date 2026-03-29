import os
import pytest
from playwright.sync_api import sync_playwright

def test_bolt_pagination_allservices():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        context = browser.new_context()
        page = context.new_page()

        # Mocking external CDNs
        page.add_init_script("window.gsap = { registerPlugin: () => {}, to: () => {}, set: () => {}, timeline: () => ({ to: () => ({ to: () => ({ to: () => ({ to: () => {} }) }) }) }), matchMedia: () => ({ add: () => {} }) };")
        page.add_init_script("window.ScrollTrigger = { update: () => {}, scrollerProxy: () => {}, addEventListener: () => {}, refresh: () => {}, create: () => {} };")
        page.add_init_script("window.LocomotiveScroll = class { on() {} scrollTo() {} update() {} stop() {} start() {} };")

        # Load the local HTML file
        file_path = f"file://{os.path.abspath('pages/allservices.html')}"
        page.goto(file_path, wait_until="commit")

        # Wait for data to load and cards to render
        page.wait_for_selector('.service-card', state="attached")

        # Get initial card count
        initial_cards = page.locator('.service-card').count()
        print(f"Initial cards: {initial_cards}")
        assert initial_cards > 0

        # Click "Load More"
        load_more_btn = page.locator('#load-more-btn')
        if load_more_btn.is_visible():
            load_more_btn.click()
            # Wait for more cards to appear
            page.wait_for_function(f"document.querySelectorAll('.service-card').length > {initial_cards}")

            new_count = page.locator('.service-card').count()
            print(f"Cards after load more: {new_count}")
            assert new_count > initial_cards
        else:
            print("Load More button not visible (possibly all data already loaded or small screen)")

        # Verify search resets pagination
        search_input = page.locator('#search-input')
        search_input.fill('Passport')
        # Debounce is 250ms
        page.wait_for_timeout(500)

        search_count = page.locator('.service-card').count()
        print(f"Cards after search: {search_count}")
        # Assuming 'Passport' returns fewer results than initial + load more
        # Also check if it's back to a smaller page size
        assert search_count <= initial_cards or search_count == 2 # 2 passport services in data

        browser.close()

if __name__ == "__main__":
    pytest.main([__file__])
