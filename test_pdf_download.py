import asyncio
import os
from playwright.async_api import async_playwright

async def inspect_pdf_download():
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

        # Let's inspect the action buttons/links in the first data row
        row = page.locator('table tbody tr, mat-row').nth(0)
        print('Row text:', await row.inner_text())
        buttons = await row.locator('button, a, mat-icon').all()
        print('Elements in row:', len(buttons))
        for idx, b in enumerate(buttons):
            t = await b.inner_text()
            aria = await b.get_attribute('aria-label') or ''
            title = await b.get_attribute('title') or ''
            tooltip = await b.get_attribute('mattooltip') or ''
            cls = await b.get_attribute('class') or ''
            print(f'  Elem {idx}: text={t!r}, aria={aria!r}, title={title!r}, tooltip={tooltip!r}, class={cls!r}')

        # Click the row or document number to open details
        doc_cell = row.locator('td').nth(3) # Document column
        print('Clicking document column:', await doc_cell.inner_text())
        await doc_cell.click()
        await page.wait_for_timeout(4000)
        print('URL after click:', page.url)

        # Check what appears on detail page / modal
        print('Detail page body excerpt:')
        body_text = await page.inner_text('body')
        for line in body_text.splitlines():
            if any(k in line.lower() for k in ['descargar', 'pdf', 'evento', 'acuse', 'recibo', 'acept', 'volver', 'regresar', 'detalle']):
                print('  >', line)

        # Check all buttons on detail page
        detail_buttons = await page.locator('button').all()
        print(f'Total buttons on detail page: {len(detail_buttons)}')
        for idx, b in enumerate(detail_buttons):
            bt = (await b.inner_text()).strip()
            btt = await b.get_attribute('mattooltip') or ''
            btitle = await b.get_attribute('title') or ''
            baria = await b.get_attribute('aria-label') or ''
            bclass = await b.get_attribute('class') or ''
            icons = await b.locator('mat-icon').all_inner_texts()
            print(f'  Btn {idx}: text={bt!r}, tooltip={btt!r}, title={btitle!r}, aria={baria!r}, icons={icons}')

        await browser.close()

if __name__ == '__main__':
    asyncio.run(inspect_pdf_download())
