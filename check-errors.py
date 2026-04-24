from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(args=["--no-sandbox"])
        page = browser.new_page()
        page.on("console", lambda msg: print(f"Console: {msg.text}"))
        page.on("pageerror", lambda exc: print(f"Page Error: {exc}"))
        print("Navigating...")
        response = page.goto("http://100.111.74.69")
        print(f"Status: {response.status}")
        page.wait_for_timeout(3000)
        browser.close()

if __name__ == "__main__":
    run()
