import asyncio
import os
import re
from playwright.async_api import async_playwright

async def test_batch():
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

        await page.locator('text="Documentos"').first.click()
        await page.wait_for_timeout(1500)
        await page.locator('a[href*="inbox"]').first.click()
        await page.wait_for_timeout(5000)

        rows = await page.locator('table tbody tr, mat-row').all()
        print('Found rows:', len(rows))
        for i in range(min(3, len(rows))):
            row = page.locator('table tbody tr, mat-row').nth(i)
            doc_cell = row.locator('td').nth(3)
            doc_name = (await doc_cell.inner_text()).strip()
            print(f'Processing row {i}: {doc_name}')
            
            await doc_cell.click()
            await page.wait_for_timeout(3000)

            dl_btn = page.locator('button[mattooltip="Descargar PDF"], button:has(mat-icon:has-text("get_app"))').first
            if await dl_btn.count() > 0:
                target_file = os.path.abspath(f'uploads/invoices/Factura_{doc_name}.pdf')
                async with page.expect_download(timeout=20000) as dl_info:
                    await dl_btn.click()
                dl = await dl_info.value
                await dl.save_as(target_file)
                print(f'  Saved {doc_name} ({os.path.getsize(target_file)} bytes)')
            else:
                print(f'  No DL btn found for {doc_name}')
            
            await page.go_back()
            await page.wait_for_timeout(3000)

        await browser.close()

if __name__ == '__main__':
    asyncio.run(test_batch())
