import asyncio
from playwright.async_api import async_playwright

PLAYWRIGHT_CHROMIUM_ARGS = [
    "--host-resolver-rules=MAP plataforma.facture.co 20.119.128.21, MAP api.facture.co 20.119.0.58",
    "--ignore-certificate-errors",
    "--disable-web-security",
    "--allow-running-insecure-content",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage",
    "--disable-blink-features=AutomationControlled"
]

async def inspect_procesados():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True, args=PLAYWRIGHT_CHROMIUM_ARGS)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
            viewport={"width": 1440, "height": 900}
        )
        page = await context.new_page()
        try:
            await page.goto("https://plataforma.facture.co/plataforma/login", wait_until="domcontentloaded", timeout=45000)
            user_input = page.locator('input[formcontrolname="usernameField"], input[placeholder*="Usuario"], #mat-input-0').first
            await user_input.wait_for(state="visible", timeout=20000)
            await user_input.fill("TicsEnriko")
            await page.locator('input[formcontrolname="passwordField"], #mat-input-1').first.fill("Septiembre2026*")
            await page.locator('button[type="submit"]').click()
            await page.wait_for_timeout(3500)

            nit_input = page.locator('input[formcontrolname="nit"], #mat-input-2').first
            if await nit_input.count() > 0 and await nit_input.is_visible():
                await nit_input.fill("890330035")
                await page.locator('button:has-text("Enviar")').click()
                await page.wait_for_timeout(4000)

            # Navigate to Documentos -> Inbox
            docs_menu = page.locator('text="Documentos"')
            await docs_menu.wait_for(state="visible", timeout=10000)
            await docs_menu.click()
            await page.wait_for_timeout(1000)

            inbox_btn = page.locator('a[href*="inbox"], [routerlink*="inbox"], mat-list-item:has-text("Inbox")').first
            await inbox_btn.click()
            await page.wait_for_timeout(4000)

            print("Current URL:", page.url)

            # Check all tabs on the page
            tabs = await page.evaluate("""() => {
                return Array.from(document.querySelectorAll('div[role=\"tab\"], .mat-mdc-tab, button')).map(e => ({
                    text: e.innerText.trim(),
                    classes: e.className
                })).filter(e => e.text.length > 0 && e.text.length < 50);
            }""")
            print("Tabs / buttons found:", tabs)

            # Click PROCESADOS
            proc_tab = page.locator('div[role="tab"]:has-text("PROCESADOS"), .mat-mdc-tab:has-text("PROCESADOS"), button:has-text("PROCESADOS")').first
            print("PROCESADOS tab count:", await proc_tab.count())
            if await proc_tab.count() > 0:
                print("Clicking PROCESADOS tab...")
                await proc_tab.click()
                await page.wait_for_timeout(4000)
                
                # Get first 5 rows of PROCESADOS
                rows_data = await page.evaluate("""() => {
                    const trs = Array.from(document.querySelectorAll('tbody tr'));
                    return trs.slice(0, 5).map(tr => {
                        const tds = Array.from(tr.querySelectorAll('td'));
                        return tds.map((td, idx) => ({
                            idx: idx,
                            text: td.innerText.trim()
                        }));
                    });
                }""")
                print(f"PROCESADOS found {len(rows_data)} rows. First 3 rows:")
                for i, r in enumerate(rows_data[:3]):
                    print(f"--- Row {i} ---")
                    for c in r:
                        if c['text']:
                            print(f"  Col {c['idx']}: {c['text']}")

        except Exception as e:
            print("Error in inspect_procesados:", e)
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(inspect_procesados())
