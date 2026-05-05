import os
import pytest
from playwright.sync_api import sync_playwright

def test_ai_modal_accessibility():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, args=["--allow-file-access-from-files"])
        context = browser.new_context()
        page = context.new_page()

        # Mocking external CDNs
        page.add_init_script("window.gsap = { registerPlugin: () => {}, to: () => {}, set: () => {}, timeline: () => ({ to: () => ({ to: () => ({ to: () => ({ to: () => {} }) }) }) }), matchMedia: () => ({ add: () => {} }), quickTo: () => {} };")
        page.add_init_script("window.ScrollTrigger = { update: () => {}, scrollerProxy: () => {}, addEventListener: () => {}, refresh: () => {}, create: () => {} };")
        page.add_init_script("window.LocomotiveScroll = class { on() {} scrollTo() {} update() {} stop() {} start() {} };")

        # Load the local HTML file
        file_path = f"file://{os.path.abspath('index.html')}"
        page.goto(file_path, wait_until="domcontentloaded")

        fab = page.locator('#ai-fab')
        modal = page.locator('#ai-modal')
        chat_input = page.locator('#ai-chat-input')
        close_btn = page.locator('#ai-modal-close')
        submit_btn = page.locator('.ai-chat-submit')

        # Wait for FAB to be attached to DOM
        fab.wait_for(state="attached")

        # Manually make FAB visible since ScrollTrigger is mocked
        fab.evaluate("el => el.classList.add('is-visible')")
        page.wait_for_selector('#ai-fab.is-visible', timeout=5000)

        # 1. Test FAB Click & Auto-focus
        fab.click()
        page.wait_for_selector('#ai-modal.is-open', timeout=5000)

        # Log active element for debugging
        for _ in range(10):
            page.wait_for_timeout(500)
            active_id = page.evaluate("document.activeElement.id")
            active_tag = page.evaluate("document.activeElement.tagName")
            active_class = page.evaluate("document.activeElement.className")
            print(f"DEBUG: Active element: ID='{active_id}', Tag='{active_tag}', Class='{active_class}'")
            if active_id == 'ai-chat-input':
                break

        assert page.evaluate("document.activeElement.id") == "ai-chat-input"

        # 2. Test Focus Trap (Forward)
        # Tab 1: Input -> Submit
        page.keyboard.press("Tab")
        assert page.evaluate("document.activeElement.classList.contains('ai-chat-submit')")

        # Tab 2 (Wrap): Submit -> Close
        page.keyboard.press("Tab")
        assert page.evaluate("document.activeElement.id") == "ai-modal-close"

        # Tab 3: Close -> Input
        page.keyboard.press("Tab")
        assert page.evaluate("document.activeElement.id") == "ai-chat-input"

        # 3. Test Focus Trap (Backward)
        # Currently on Chat Input
        page.keyboard.down("Shift")
        page.keyboard.press("Tab")
        page.keyboard.up("Shift")
        # Input -> Close
        assert page.evaluate("document.activeElement.id") == "ai-modal-close"

        page.keyboard.down("Shift")
        page.keyboard.press("Tab")
        page.keyboard.up("Shift")
        # Close (Wrap) -> Submit
        assert page.evaluate("document.activeElement.classList.contains('ai-chat-submit')")

        # 4. Test Escape key handling
        page.keyboard.press("Escape")
        page.wait_for_selector('#ai-modal:not(.is-open)', timeout=5000)
        assert "is-open" not in modal.get_attribute("class")

        # Focus should return to FAB
        assert page.evaluate("document.activeElement.id") == "ai-fab"

        # 5. Test Close button & focus return
        fab.click()
        page.wait_for_selector('#ai-modal.is-open', timeout=5000)
        close_btn.click()
        page.wait_for_selector('#ai-modal:not(.is-open)', timeout=5000)
        assert page.evaluate("document.activeElement.id") == "ai-fab"

        browser.close()

if __name__ == "__main__":
    pytest.main([__file__])
