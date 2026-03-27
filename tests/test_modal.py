import os
import re
import pytest
from playwright.sync_api import sync_playwright

def test_modal_functionality_allservices():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        context = browser.new_context()
        page = context.new_page()

        # Mocking external CDNs
        page.add_init_script("window.gsap = { registerPlugin: () => {}, to: () => {}, set: () => {}, timeline: () => ({ to: () => ({ to: () => ({ to: () => ({ to: () => {} }) }) }) }), matchMedia: () => ({ add: () => {} }) };")
        page.add_init_script("window.ScrollTrigger = { update: () => {}, scrollerProxy: () => {}, addEventListener: () => {}, refresh: () => {}, create: () => {} };")
        page.add_init_script("window.LocomotiveScroll = class { on() {} scrollTo() {} update() {} stop() {} start() {} };")

        page.on("console", lambda msg: print(f"CONSOLE: {msg.type}: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"PAGE ERROR: {exc}"))

        # Load the local HTML file
        file_path = f"file://{os.path.abspath('pages/allservices.html')}"
        page.goto(file_path, wait_until="commit")

        # Wait for data to load and cards to render
        page.wait_for_selector('.service-card', state="attached")

        # Click on the first service card to open modal
        page.click('.service-card')

        # Check if modal is open
        modal = page.locator('#service-modal')
        page.wait_for_selector('#service-modal.is-open', timeout=5000)
        assert "is-open" in modal.get_attribute("class")

        # Check details state is active
        assert "is-active" in page.locator('#sm-content-details').get_attribute("class")

        # Click "Apply Now"
        page.click('#sm-apply-btn')
        assert "is-active" in page.locator('#sm-content-step1').get_attribute("class")

        # Click "Confirm"
        page.click('#sm-confirm-btn')
        assert "is-active" in page.locator('#sm-content-step2').get_attribute("class")

        # Wait for success state (Scanning 3s + Loading 5s) - using a shorter wait for demo if possible or just verifying it's in step 2
        # Since we want to verify it DOES switch, we wait
        page.wait_for_selector('#sm-content-success.is-active', timeout=15000)

        # Close modal
        page.click('#sm-close-success-btn')

        # Verify modal is closed
        page.wait_for_selector('#service-modal:not(.is-open)', timeout=5000)
        assert "is-open" not in modal.get_attribute("class")

        browser.close()

def test_modal_functionality_resident():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        context = browser.new_context()
        page = context.new_page()

        # Mocking external CDNs
        page.add_init_script("window.gsap = { registerPlugin: () => {}, to: () => {}, set: () => {}, timeline: () => ({ to: () => ({ to: () => ({ to: () => ({ to: () => {} }) }) }) }), matchMedia: () => ({ add: () => {} }) };")
        page.add_init_script("window.ScrollTrigger = { update: () => {}, scrollerProxy: () => {}, addEventListener: () => {}, refresh: () => {}, create: () => {} };")
        page.add_init_script("window.LocomotiveScroll = class { on() {} scrollTo() {} update() {} stop() {} start() {} };")

        # Load the local HTML file
        file_path = f"file://{os.path.abspath('pages/resident.html')}"
        page.goto(file_path, wait_until="commit")

        # Wait for cards to render
        page.wait_for_selector('.service-card', state="attached")

        # Click on a service card
        page.click('.service-card')

        # Check if modal is open
        modal = page.locator('#service-modal')
        page.wait_for_selector('#service-modal.is-open', timeout=5000)
        assert "is-open" in modal.get_attribute("class")

        # Click "Apply Now"
        page.click('#sm-apply-btn')
        assert "is-active" in page.locator('#sm-content-step1').get_attribute("class")

        # Click "Cancel"
        page.click('#sm-cancel-btn')
        assert "is-active" in page.locator('#sm-content-cancelled').get_attribute("class")

        # Close
        page.click('#sm-close-cancelled-btn')
        page.wait_for_selector('#service-modal:not(.is-open)', timeout=5000)
        assert "is-open" not in modal.get_attribute("class")

        browser.close()

if __name__ == "__main__":
    pytest.main([__file__])
