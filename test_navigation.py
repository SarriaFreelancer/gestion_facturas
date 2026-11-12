import asyncio
from playwright.async_api import async_playwright

async def inspect_navigation():
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
            await page.wait_for_timeout(5000)

        print('At:', page.url)
        # Click Documentos
        docs_menu = page.locator('text="Documentos"')
        print('Docs menu count:', await docs_menu.count())
        await docs_menu.first.click()
        await page.wait_for_timeout(2000)

        inbox_btn = page.locator('a[href*="inbox"], button:has-text("Inbox"), span:has-text("Inbox")')
        print('Inbox btn count:', await inbox_btn.count())
        await inbox_btn.first.click()
        await page.wait_for_timeout(5000)
        print('After Inbox URL:', page.url)

        # Inspect table rows
        rows = await page.locator('table tr, mat-row').all()
        print('Total rows on page 1:', len(rows))
        for r in rows[:10]:
            print('ROW:', (await r.inner_text()).replace('\n', ' | '))

        await browser.close()

if __name__ == '__main__':
    asyncio.run(inspect_navigation())
