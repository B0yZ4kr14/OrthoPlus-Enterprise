#!/usr/bin/env python3
import json
import traceback
import sys
from playwright.sync_api import sync_playwright

def e2e_login_test(target_url="https://tsiapp.io"):
    result = {"status": "pending", "logs": []}
    
    def log(msg):
        print(f"[E2E AUDITOR] {msg}")
        result["logs"].append(msg)

    try:
        with sync_playwright() as p:
            log("1. Init Chromium Browser (Headless Mode)...")
            browser = p.chromium.launch(headless=True)
            
            # The most important Context arguments for the SaaS Audit.
            # Bypass strict UI blocking over the HTTPS domain
            context = browser.new_context(
                ignore_https_errors=True,
                bypass_csp=True, 
                viewport={"width": 1920, "height": 1080}
            )
            page = context.new_page()
            
            log(f"2. Navigating to {target_url}...")
            response = page.goto(target_url, wait_until='networkidle', timeout=30000)
            
            if not response or not response.ok:
                log(f"Warning: HTTP status {response.status if response else 'Unknown'} received.")
            
            log("3. Awaiting Auth Container injection onto DOM...")
            page.wait_for_selector('input[type="email"]', timeout=15000)
            
            log("4. Injecting Base Administrator Pattern: admin@orthoplus.com")
            page.fill('input[type="email"]', 'admin@orthoplus.com')
            page.fill('input[type="password"]', 'Admin123!')
            
            log("5. Issuing POST signal via GUI action (Login Submit)...")
            page.click('button:has-text("Entrar")')
            
            log("6. Standing by for Dashboard hydration...")
            # We wait for the domain redirection to resolve token parsing and load the main app layout.
            page.wait_for_timeout(5000)
            
            current_url = page.url
            log(f"Current DOM URL: {current_url}")
            
            log("7. Auditing DOM Locators (Cards & Sidebar Tabs)...")
            cards_exist = page.locator('.card, [class*="Card"]').count() > 0
            tabs_exist = page.locator('[role="tab"], [role="tablist"], nav').count() > 0
            
            result["metrics"] = {
                "cards_found_in_dom": cards_exist,
                "tabs_found_in_dom": tabs_exist
            }
            
            if 'auth' not in current_url and (cards_exist or tabs_exist):
                result["status"] = "success"
                log("✅ VALIDATION SUCCESS: The domain Nginx setup resolved the strict React App bounds. Dashboard is functional.")
            else:
                result["status"] = "failed"
                log("❌ VALIDATION FAILED: Did not reach the main dashboard or specific UI components are missing.")
                page.screenshot(path='/tmp/error_prod_orthoplus_domain.png', full_page=True)
                
            browser.close()
    
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        log(f"Fatal EXCEPTION during E2E: {traceback.format_exc()}")
        
    print("\n--- JSON OUTPUT REPORT ---")
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    url = sys.argv[1] if len(sys.argv) > 1 else "https://tsiapp.io"
    e2e_login_test(url)
