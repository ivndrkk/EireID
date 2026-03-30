
import pytest
from playwright.sync_api import sync_playwright
import os

def test_filtering_logic():
    with sync_playwright() as p:
        # Launch browser with file access
        browser = p.chromium.launch(args=["--allow-file-access-from-files"])
        page = browser.new_page()

        # Resolve path to allservices.html
        path = os.path.abspath("pages/allservices.html")
        page.goto(f"file://{path}")

        # Wait for data to load and grid to populate
        page.wait_for_selector(".service-card")

        # Initial count
        initial_count = page.locator(".service-card").count()
        print(f"Initial cards: {initial_count}")
        assert initial_count > 0

        # Test Tag Filter
        # 1. Open Tag Dropdown
        page.click("#tag-dropdown .custom-dropdown__trigger")

        # 2. Select a tag (e.g., 'Health')
        # We need to find an item in the list. Let's look for 'Health'
        tag_to_select = "Health"
        # The labels in populateFilters are capitalized: t.charAt(0).toUpperCase() + t.slice(1)
        # But data-value is the raw tag (likely lowercase).

        # Let's find a tag item that isn't 'All Tags'
        tag_item = page.locator("#tag-list .custom-dropdown__item").nth(1)
        tag_value = tag_item.get_attribute("data-value")
        tag_label = tag_item.text_content().strip()

        print(f"Selecting tag: {tag_label} (value: {tag_value})")
        tag_item.click()

        # Wait for filter to apply
        page.wait_for_timeout(500)

        filtered_count = page.locator(".service-card").count()
        print(f"Filtered cards: {filtered_count}")
        assert filtered_count > 0, "No cards found after filtering"

        # Check if all visible cards have the tag
        cards = page.locator(".service-card")
        for i in range(cards.count()):
            card_tags = [t.lower() for t in cards.nth(i).locator(".service-card__tag").all_inner_texts()]
            assert tag_value.lower() in card_tags, f"Card {i} missing tag {tag_value}"

        # Test Provider Filter
        page.click("#provider-dropdown .custom-dropdown__trigger")
        provider_item = page.locator("#provider-list .custom-dropdown__item").nth(1)
        provider_to_select = provider_item.inner_text()
        print(f"Selecting provider: {provider_to_select}")
        provider_item.click()

        page.wait_for_timeout(500)

        final_count = page.locator(".service-card").count()
        print(f"Final count with both filters: {final_count}")

        browser.close()

if __name__ == "__main__":
    test_filtering_logic()
