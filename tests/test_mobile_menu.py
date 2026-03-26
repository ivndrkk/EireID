import pytest
import re
from playwright.sync_api import Page, expect
import os

# Get the absolute path to index.html
FILE_PATH = f"file://{os.path.abspath('index.html')}"

def test_mobile_menu_toggle(page: Page):
    # Set viewport to mobile size
    page.set_viewport_size({"width": 375, "height": 667})

    # Load the page
    page.goto(FILE_PATH)

    # Selectors
    menu_toggle = page.locator("#mobile-menu-toggle")
    nav_list = page.locator("#nav-list")

    # 1. Initial State: Menu should not have 'is-open' class and aria-expanded should be false
    expect(menu_toggle).to_be_visible()
    expect(menu_toggle).to_have_attribute("aria-expanded", "false")
    expect(nav_list).not_to_have_class(re.compile(r"is-open"))

    # 2. Click Toggle: Menu should open
    menu_toggle.click()
    expect(menu_toggle).to_have_attribute("aria-expanded", "true")
    expect(nav_list).to_have_class(re.compile(r"is-open"))

    # 3. Click Toggle again: Menu should close
    menu_toggle.click()
    expect(menu_toggle).to_have_attribute("aria-expanded", "false")
    expect(nav_list).not_to_have_class(re.compile(r"is-open"))

def test_mobile_menu_navigation_closes_menu(page: Page):
    # Set viewport to mobile size
    page.set_viewport_size({"width": 375, "height": 667})

    # Load the page
    page.goto(FILE_PATH)

    # Selectors
    menu_toggle = page.locator("#mobile-menu-toggle")
    nav_list = page.locator("#nav-list")
    about_btn = page.locator("#nav-about-btn")

    # Open menu
    menu_toggle.click()
    expect(nav_list).to_have_class(re.compile(r"is-open"))

    # Click a link that closes the menu (About EireID has specific logic for this)
    about_btn.click()

    # Assert menu is closed
    expect(menu_toggle).to_have_attribute("aria-expanded", "false")
    expect(nav_list).not_to_have_class(re.compile(r"is-open"))
