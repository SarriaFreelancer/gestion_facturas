import asyncio
from playwright.async_api import async_playwright

async def check_login():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        )
        page = await browser.new_page(viewport={'width': 1440, 'height': 900})
        await page.goto('https://plataforma.facture.co/plataforma/login', wait_until='domcontentloaded')
        await page.wait_for_timeout(3000)
        print('URL:', page.url)

        user_input = page.locator('input[formcontrolname="usernameField"], #mat-input-0').first
        await user_input.fill('TicsEnriko')
        pass_input = page.locator('input[formcontrolname="passwordField"], #mat-input-1').first
        await pass_input.fill('Septiembre2026*')

        submit_btn = page.locator('button:has-text("Iniciar sesión"), button[type="submit"]').first
        await submit_btn.click()
        await page.wait_for_timeout(4000)
        print('After login click URL:', page.url)

        # Check modal / dialog
        dialogs = page.locator('mat-dialog-container, .cdk-overlay-pane')
        print('Dialog count:', await dialogs.count())
        if await dialogs.count() > 0:
            print('Dialog text:', (await dialogs.first.inner_text())[:200])

        nit_input = page.locator('input[formcontrolname="nit"], input[placeholder*="NIT"]').first
        if await nit_input.count() > 0:
            print('NIT input visible:', await nit_input.is_visible())
            await nit_input.fill('890330035')
            send_btn = page.locator('.cdk-overlay-pane button:has-text("Enviar"), button:has-text("Enviar")').first
            print('Send button visible:', await send_btn.is_visible())
            await send_btn.click(force=True)
            await page.wait_for_timeout(5000)
            print('After send URL:', page.url)
        await browser.close()

if __name__ == '__main__':
    asyncio.run(check_login())
