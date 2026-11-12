import asyncio
import os
from playwright.async_api import async_playwright

async def test_download_click():
    async with async_playwright() as p:
        browser = await p.chromium.launch(
            headless=True,
            args=['--no-sandbox', '--disable-setuid-sandbox', '--disable-blink-features=AutomationControlled']
        )
        context = await browser.new_context(viewport={'width': 1440, 'height': 900}, accept_downloads=True)
        page = await context.new_page()
        await page.goto('https://plataforma.facture.co/plataforma/login', wait_until='domcontentloaded')
        await page.wait_for_timeout(3000)

        await page.locator('input[formcontrolname="usernameField"], #mat-input-0').first.fill('TicsEnriko')
        await page.locator('input[formcontrolname="passwordField"], #mat-input-1').first.fill('Septiembre2026*')
        await page.locator('button:has-text("Iniciar sesión"), button[type="submit"]').first.click()
        await page.wait_for_timeout(4000)

        nit_input = page.locator('input[formcontrolname="nit"], input[placeholder*="NIT"]').first
        if await nit_input.count() > 0:
            await nit_input.fill('890330035')
            send_btn = page.locator('.cdk-overlay-pane button:has-text("Enviar"), button:has-text("Enviar")').first
            await send_btn.click(force=True)
            await page.wait_for_timeout(5000)

        # Navigate to inbox
        await page.locator('text="Documentos"').first.click()
        await page.wait_for_timeout(1500)
        await page.locator('a[href*="inbox"]').first.click()
        await page.wait_for_timeout(5000)

        row = page.locator('table tbody tr, mat-row').nth(0)
        doc_cell = row.locator('td').nth(3)
        doc_name = (await doc_cell.inner_text()).strip()
        print('Opening doc:', doc_name)
        await doc_cell.click()
        await page.wait_for_timeout(4000)

        dl_btn = page.locator('button[mattooltip="Descargar PDF"], button:has(mat-icon:has-text("get_app"))').first
        print('DL btn count:', await dl_btn.count(), 'is_visible:', await dl_btn.is_visible())

        target_file = os.path.abspath(f'uploads/invoices/test_download_{doc_name}.pdf')
        print('Expecting download to:', target_file)

        async with page.expect_download(timeout=25000) as dl_info:
            await dl_btn.click()
        dl = await dl_info.value
        await dl.save_as(target_file)
        print('Download finished! Saved file size:', os.path.getsize(target_file), 'bytes')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_download_click())
