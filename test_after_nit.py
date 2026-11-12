import asyncio
from playwright.async_api import async_playwright

async def inspect_after_nit():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        )
        page = await browser.new_page(viewport={'width': 1440, 'height': 900})
        await page.goto('https://plataforma.facture.co/plataforma/login', wait_until='domcontentloaded')
        await page.wait_for_timeout(3000)

        user_input = page.locator('input[formcontrolname="usernameField"], #mat-input-0').first
        await user_input.fill('TicsEnriko')
        pass_input = page.locator('input[formcontrolname="passwordField"], #mat-input-1').first
        await pass_input.fill('Septiembre2026*')

        submit_btn = page.locator('button:has-text("Iniciar sesión"), button[type="submit"]').first
        await submit_btn.click()
        await page.wait_for_timeout(4000)

        nit_input = page.locator('input[formcontrolname="nit"], input[placeholder*="NIT"]').first
        if await nit_input.count() > 0:
            await nit_input.fill('890330035')
            send_btn = page.locator('.cdk-overlay-pane button:has-text("Enviar"), button:has-text("Enviar")').first
            await send_btn.click(force=True)
            await page.wait_for_timeout(6000)
            print('URL after NIT:', page.url)
            body_text = await page.inner_text('body')
            print('BODY TEXT:\n', body_text[:1000])
            
            # Let's see if there is any menu, navbar, or sidebar
            elements = await page.locator('nav, mat-toolbar, mat-sidenav, a, button').all_inner_texts()
            print('Interactive elements:', [e.strip() for e in elements if e.strip()][:30])

        await browser.close()

if __name__ == '__main__':
    asyncio.run(inspect_after_nit())
