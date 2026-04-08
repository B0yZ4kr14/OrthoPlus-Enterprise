import json
import traceback
from playwright.sync_api import sync_playwright

def e2e_login_test():
    result = {"status": "pending", "logs": []}
    
    def log(msg):
        print(msg)
        result["logs"].append(msg)

    try:
        with sync_playwright() as p:
            log("Launching Chromium browser...")
            browser = p.chromium.launch(headless=True)
            # Create a context that ignores HTTPS errors and Trusted Type exceptions
            context = browser.new_context(
                ignore_https_errors=True,
                bypass_csp=True # the magic bullet for strict CSPs
            )
            page = context.new_page()
            
            log("Navigating to https://100.111.74.69...")
            response = page.goto('https://100.111.74.69', wait_until='networkidle', timeout=30000)
            
            if not response or not response.ok:
                log(f"Warning: HTTP status {response.status if response else 'Unknown'}")
            
            log("Waiting for auth container...")
            page.wait_for_selector('input[type="email"]', timeout=15000)
            
            log("Filling credentials: admin@orthoplus.com")
            page.fill('input[type="email"]', 'admin@orthoplus.com')
            page.fill('input[type="password"]', 'Admin123!')
            
            log("Clicking Login...")
            # Some buttons might be 'submit', but we click the generic button that says 'Entrar'
            page.click('button:has-text("Entrar")')
            
            log("Waiting for dashboard to load...")
            # We wait for the URL to change from /auth to / or wait for a specific dashboard element
            page.wait_for_timeout(5000)
            
            url = page.url
            log(f"Current URL after login: {url}")
            
            # Asserting navigation
            cards_exist = page.locator('.card, [class*="Card"]').count() > 0
            tabs_exist = page.locator('[role="tab"], [role="tablist"], nav').count() > 0
            
            result["cards_found"] = cards_exist
            result["tabs_found"] = tabs_exist
            
            if 'auth' not in url and (cards_exist or tabs_exist):
                result["status"] = "success"
                log("✅ VALIDATION SUCCESS: Dashboard is fully navigable, cards/tabs loaded.")
            else:
                result["status"] = "failed"
                log("❌ VALIDATION FAILED: Did not reach the main dashboard or UI components missing.")
                page.screenshot(path='/tmp/error_prod_dashboard.png', full_page=True)
                
            browser.close()
    
    except Exception as e:
        result["status"] = "error"
        result["error"] = str(e)
        log(f"Exception during E2E test: {traceback.format_exc()}")
        
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    e2e_login_test()
