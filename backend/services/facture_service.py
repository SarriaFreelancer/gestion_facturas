import asyncio
import os
import re
from typing import List, Dict, Any, Optional
from datetime import datetime
from playwright.async_api import async_playwright
from backend.repositories.mysql_repository import MySQLRepository

LOGIN_URL = "https://plataforma.facture.co/plataforma/login"
UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "invoices"))

class FactureService:
    def __init__(self):
        self.repo = MySQLRepository()
        os.makedirs(UPLOADS_DIR, exist_ok=True)

    def get_credentials(self) -> Dict[str, Any]:
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM facture_credentials WHERE id = 'default'")
                row = cur.fetchone()
                if not row:
                    return {
                        "id": "default",
                        "username": "TicsEnriko",
                        "password": "Septiembre2026*",
                        "nit": "890330035",
                        "companyName": "ALIMENTOS ENRIKO S.A.S",
                        "responsibleName": "David",
                        "responsibleLastName": "Sarria",
                        "responsibleIdNumber": "1144000000",
                        "recibidosCount": 2148,
                        "contadoCount": 458,
                        "lastSyncAt": datetime.now()
                    }
                return row

    def save_credentials(self, data: Dict[str, Any]) -> bool:
        current = self.get_credentials()
        new_pass = data.get("password", "").strip()
        if not new_pass or new_pass.startswith("••••"):
            password_to_save = current.get("password") or "Septiembre2026*"
        else:
            password_to_save = new_pass

        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO facture_credentials (
                        id, username, password, nit, companyName,
                        responsibleName, responsibleLastName, responsibleIdNumber, autoSync
                    )
                    VALUES ('default', %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        username = VALUES(username),
                        password = VALUES(password),
                        nit = VALUES(nit),
                        companyName = VALUES(companyName),
                        responsibleName = VALUES(responsibleName),
                        responsibleLastName = VALUES(responsibleLastName),
                        responsibleIdNumber = VALUES(responsibleIdNumber),
                        autoSync = VALUES(autoSync);
                """, (
                    data.get("username", "TicsEnriko").strip(),
                    password_to_save,
                    data.get("nit", "890330035").strip(),
                    data.get("companyName", "ALIMENTOS ENRIKO S.A.S").strip(),
                    data.get("responsibleName", "David").strip(),
                    data.get("responsibleLastName", "Sarria").strip(),
                    data.get("responsibleIdNumber", "").strip(),
                    int(data.get("autoSync", 0) or 0)
                ))
                return True

    def get_inbox_documents(self, folder: Optional[str] = None, search: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                sql = "SELECT * FROM facture_inbox_documents WHERE 1=1"
                params = []
                if folder and folder.lower() != "todos":
                    sql += " AND folderType = %s"
                    params.append(folder)
                if search and search.strip():
                    term = f"%{search.strip()}%"
                    sql += " AND (documentNumber LIKE %s OR issuerName LIKE %s OR issuerNit LIKE %s OR rawDetail LIKE %s)"
                    params.extend([term, term, term, term])
                sql += " ORDER BY receptionDate DESC, createdAt DESC LIMIT %s"
                params.append(limit)
                cur.execute(sql, tuple(params))
                rows = cur.fetchall()
                for r in rows:
                    if "detailAmount" in r and r["detailAmount"] is not None:
                        r["detailAmount"] = float(r["detailAmount"])
                return rows

    def get_audit_logs(self, limit: int = 50) -> List[Dict[str, Any]]:
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM facture_audit_logs ORDER BY timestamp DESC LIMIT %s", (limit,))
                return cur.fetchall()

    def add_audit_log(self, action_type: str, status: str, message: str, doc_number: Optional[str] = None, issuer: Optional[str] = None):
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO facture_audit_logs (actionType, documentNumber, issuerName, status, message)
                    VALUES (%s, %s, %s, %s, %s)
                """, (action_type, doc_number, issuer, status, message))

    async def live_sync_inbox(self) -> Dict[str, Any]:
        creds = self.get_credentials()
        username = creds.get("username") or "TicsEnriko"
        password = creds.get("password") or "Septiembre2026*"
        nit = creds.get("nit") or "890330035"

        recibidos_count = 2148
        contado_count = 458
        synced_docs = []

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    viewport={"width": 1440, "height": 900}
                )
                page = await context.new_page()

                # 1. Login
                await page.goto(LOGIN_URL, wait_until="networkidle", timeout=45000)
                await page.locator('input[formcontrolname="usernameField"]').fill(username)
                await page.locator('input[formcontrolname="passwordField"]').fill(password)
                await page.locator('button[type="submit"]').click()

                # 2. NIT
                nit_input = page.locator('input[formcontrolname="nit"], #mat-input-2')
                await nit_input.wait_for(state="visible", timeout=15000)
                await nit_input.fill(nit)
                await page.locator('button:has-text("Enviar")').click()

                # 3. Documentos -> Inbox
                await page.wait_for_timeout(4000)
                docs_menu = page.locator('text="Documentos"')
                await docs_menu.wait_for(state="visible", timeout=10000)
                await docs_menu.click()
                await page.wait_for_timeout(1000)

                inbox_btn = page.locator('a[href*="inbox"]')
                await inbox_btn.wait_for(state="visible", timeout=10000)
                await inbox_btn.click()

                # 4. Esperar tabla
                await page.wait_for_timeout(5000)
                try:
                    await page.wait_for_load_state("networkidle", timeout=15000)
                except Exception:
                    pass

                # Extraer conteos de carpetas
                body_text = await page.inner_text("body")
                rec_match = re.search(r"Recibidos\s*\(\s*(\d+)\s*\)", body_text)
                if rec_match:
                    recibidos_count = int(rec_match.group(1))

                cont_match = re.search(r"Contado\s*\(?\s*(\d+)\s*\)?", body_text)
                if cont_match:
                    contado_count = int(cont_match.group(1))

                # Extraer filas de la tabla visibles
                rows = await page.locator("tr").all()
                for r in rows:
                    try:
                        cells = await r.locator("td").all()
                        if len(cells) >= 6:
                            doc_num = (await cells[1].inner_text()).strip()
                            doc_type = (await cells[2].inner_text()).strip() if len(cells) > 2 else "FACTURA DE VENTA"
                            issuer = (await cells[3].inner_text()).strip() if len(cells) > 3 else ""
                            issuer_nit = (await cells[4].inner_text()).strip() if len(cells) > 4 else ""
                            emission_date = (await cells[5].inner_text()).strip() if len(cells) > 5 else ""
                            detail = (await cells[6].inner_text()).strip() if len(cells) > 6 else ""
                            reception_date = (await cells[7].inner_text()).strip() if len(cells) > 7 else emission_date

                            # Extraer monto del detalle
                            amount = 0.0
                            amt_match = re.search(r"\$\s*([\d,.]+)", detail)
                            if amt_match:
                                amt_str = amt_match.group(1).replace(",", "")
                                try:
                                    amount = float(amt_str)
                                except Exception:
                                    pass

                            if doc_num:
                                synced_docs.append({
                                    "id": f"facture-{doc_num.replace(' ', '-').replace('/', '-')}",
                                    "documentNumber": doc_num,
                                    "docType": doc_type,
                                    "issuerName": issuer,
                                    "issuerNit": issuer_nit,
                                    "emissionDate": emission_date,
                                    "receptionDate": reception_date,
                                    "detailAmount": amount,
                                    "rawDetail": detail,
                                    "folderType": "Recibidos",
                                    "stage": "Recepción",
                                    "status": "Pendiente"
                                })
                    except Exception:
                        pass

                await browser.close()

            # Guardar en base de datos
            with self.repo.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE facture_credentials
                        SET recibidosCount = %s, contadoCount = %s, lastSyncAt = NOW()
                        WHERE id = 'default'
                    """, (recibidos_count, contado_count))

                    for doc in synced_docs:
                        cur.execute("""
                            INSERT INTO facture_inbox_documents (
                                id, documentNumber, docType, issuerName, issuerNit,
                                emissionDate, receptionDate, detailAmount, rawDetail, folderType, stage, status
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE
                                docType = VALUES(docType),
                                issuerName = VALUES(issuerName),
                                issuerNit = VALUES(issuerNit),
                                emissionDate = VALUES(emissionDate),
                                receptionDate = VALUES(receptionDate),
                                detailAmount = VALUES(detailAmount),
                                rawDetail = VALUES(rawDetail);
                        """, (
                            doc["id"], doc["documentNumber"], doc["docType"], doc["issuerName"],
                            doc["issuerNit"], doc["emissionDate"], doc["receptionDate"],
                            doc["detailAmount"], doc["rawDetail"], doc["folderType"], doc["stage"], doc["status"]
                        ))

            self.add_audit_log(
                action_type="INBOX_SYNC",
                status="SUCCESS",
                message=f"Sincronización exitosa: {recibidos_count} Recibidos (Crédito), {contado_count} Contado. {len(synced_docs)} documentos actualizados en caché."
            )

            return {
                "success": True,
                "recibidosCount": recibidos_count,
                "contadoCount": contado_count,
                "syncedDocsCount": len(synced_docs),
                "lastSyncAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        except Exception as e:
            self.add_audit_log(
                action_type="INBOX_SYNC_ERROR",
                status="ERROR",
                message=f"Error en sincronización con Facture: {str(e)}"
            )
            raise e

    def import_to_main_invoices(self, facture_doc_id: str) -> Dict[str, Any]:
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM facture_inbox_documents WHERE id = %s", (facture_doc_id,))
                doc = cur.fetchone()
                if not doc:
                    raise ValueError("Documento de Facture no encontrado.")

                # Crear o vincular factura en la tabla principal `invoices`
                inv_id = f"inv-{doc['documentNumber'].replace(' ', '-').replace('/', '-')}"
                cur.execute("""
                    INSERT INTO invoices (
                        id, supplier, service, invoiceNumber, emissionDate, deliveryDate,
                        value, signed, orderStd, oc, enFacture, delivered
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        supplier = VALUES(supplier),
                        service = VALUES(service),
                        value = VALUES(value),
                        enFacture = 'SÍ';
                """, (
                    inv_id,
                    doc["issuerName"],
                    f"Facturación Electrónica DIAN ({doc['docType']})",
                    doc["documentNumber"],
                    doc["emissionDate"] or datetime.now().strftime("%Y-%m-%d"),
                    doc["receptionDate"] or datetime.now().strftime("%Y-%m-%d"),
                    float(doc["detailAmount"] or 0),
                    "NO",
                    "NO",
                    "",
                    "SÍ",
                    "NO"
                ))

                # Marcar como sincronizada
                cur.execute("UPDATE facture_inbox_documents SET isSyncedToMain = 1 WHERE id = %s", (facture_doc_id,))

                self.add_audit_log(
                    action_type="IMPORT_TO_MAIN",
                    status="SUCCESS",
                    message=f"Documento {doc['documentNumber']} importado a Facturas generales con En Facture = SÍ.",
                    doc_number=doc["documentNumber"],
                    issuer=doc["issuerName"]
                )

                return {"success": True, "invoiceId": inv_id}

    async def _navigate_to_inbox_recibidos(self, page) -> None:
        """Navega de forma segura a Documentos -> Inbox -> Recibidos."""
        # Click en menú Documentos
        docs_menu = page.locator('text="Documentos"')
        await docs_menu.wait_for(state="visible", timeout=15000)
        await docs_menu.click()
        await page.wait_for_timeout(1000)

        # Click en Inbox
        inbox_btn = page.locator('a[href*="inbox"]')
        await inbox_btn.wait_for(state="visible", timeout=15000)
        await inbox_btn.click()
        await page.wait_for_timeout(3000)

        # Seleccionar pestaña Recibidos si existe
        recibidos_tab = page.locator('button:has-text("Recibidos"), div.mat-mdc-tab:has-text("Recibidos"), a:has-text("Recibidos")').first
        if await recibidos_tab.count() > 0:
            try:
                await recibidos_tab.click()
                await page.wait_for_timeout(2000)
            except Exception:
                pass

    async def _find_and_open_invoice_with_pagination(self, page, target_doc_number: str, max_pages: int = 15) -> bool:
        """
        Busca un documento específico en la tabla de Recibidos.
        Si no se encuentra en la página actual, navega por el paginador hasta encontrarlo.
        """
        clean_target = target_doc_number.strip().upper()
        current_page_num = 1

        while current_page_num <= max_pages:
            await page.wait_for_timeout(2000)

            # 1. Intentar buscar fila con el número de documento
            doc_link = page.locator(f'tr:has-text("{clean_target}") button, tr:has-text("{clean_target}") a, tr:has-text("{clean_target}")').first
            if await doc_link.count() > 0 and await doc_link.is_visible():
                self.add_audit_log(
                    action_type="INVOICE_LOCATED",
                    status="INFO",
                    message=f"Documento {clean_target} localizado en la página {current_page_num} de Recibidos.",
                    doc_number=clean_target
                )
                # Click para abrir el documento
                await doc_link.click()
                await page.wait_for_timeout(3000)
                return True

            # 2. Si no se encuentra, verificar botón de página siguiente
            next_page_btn = page.locator('button.mat-mdc-paginator-navigation-next, button[aria-label="Next page"], button[aria-label="Página siguiente"], button.mat-paginator-navigation-next').first
            
            if await next_page_btn.count() > 0:
                is_disabled = await next_page_btn.is_disabled()
                if is_disabled:
                    break
                
                # Avanzar a la siguiente página
                await next_page_btn.click()
                current_page_num += 1
                await page.wait_for_timeout(3000)
            else:
                break

        return False

    async def process_single_invoice_workflow(
        self, 
        target_doc_number: str, 
        execute_events: bool = False,
        download_pdf: bool = True,
        override_responsible: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Flujo de Fases Automatizado:
        - FASE 1: Login en Facture.co & Selección de Empresa (NIT 890330035).
        - FASE 2: Navegación a Documentos -> Inbox -> Recibidos.
        - FASE 3: Búsqueda con Paginación Automática del documento.
        - FASE 4: Apertura y Ejecución de Eventos en Barra Superior (Acuse, Recibo, Aceptación con 3 campos).
        - FASE 5: Descarga de la Factura en PDF.
        - FASE 6: Retorno Seguro a Recibidos mediante botón de flecha atrás.
        """
        creds = self.get_credentials()
        username = creds.get("username") or "TicsEnriko"
        password = creds.get("password") or "Septiembre2026*"
        nit = creds.get("nit") or "890330035"

        resp_name = (override_responsible or {}).get("name") or creds.get("responsibleName") or "DAVID"
        resp_last = (override_responsible or {}).get("lastName") or creds.get("responsibleLastName") or "SARRIA"
        resp_id = (override_responsible or {}).get("idNumber") or creds.get("responsibleIdNumber") or "1144078413"

        steps_log = []
        downloaded_file_path = None

        self.add_audit_log(
            action_type="WORKFLOW_START",
            status="INFO",
            message=f"Iniciando flujo automatizado por fases para documento {target_doc_number}.",
            doc_number=target_doc_number
        )

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True)
                context = await browser.new_context(
                    user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                    viewport={"width": 1440, "height": 900},
                    accept_downloads=True
                )
                page = await context.new_page()

                # --- FASE 1: LOGIN & SELECCIÓN DE EMPRESA ---
                steps_log.append({"phase": 1, "name": "Autenticación", "status": "RUNNING"})
                await page.goto(LOGIN_URL, wait_until="networkidle", timeout=45000)
                await page.locator('input[formcontrolname="usernameField"]').fill(username)
                await page.locator('input[formcontrolname="passwordField"]').fill(password)
                await page.locator('button[type="submit"]').click()

                # NIT Modal
                nit_input = page.locator('input[formcontrolname="nit"], #mat-input-2')
                await nit_input.wait_for(state="visible", timeout=15000)
                await nit_input.fill(nit)
                await page.locator('button:has-text("Enviar")').click()
                steps_log[-1]["status"] = "SUCCESS"

                # --- FASE 2: NAVEGACIÓN A INBOX -> RECIBIDOS ---
                steps_log.append({"phase": 2, "name": "Navegación a Recibidos", "status": "RUNNING"})
                await self._navigate_to_inbox_recibidos(page)
                steps_log[-1]["status"] = "SUCCESS"

                # --- FASE 3: BÚSQUEDA Y PAGINACIÓN ---
                steps_log.append({"phase": 3, "name": "Búsqueda & Paginación", "status": "RUNNING"})
                found = await self._find_and_open_invoice_with_pagination(page, target_doc_number, max_pages=20)
                if not found:
                    steps_log[-1]["status"] = "NOT_FOUND"
                    raise ValueError(f"El documento {target_doc_number} no fue encontrado en las páginas de Recibidos.")
                steps_log[-1]["status"] = "SUCCESS"

                # --- FASE 4: EJECUCIÓN DE EVENTOS EN BARRA SUPERIOR ---
                if execute_events:
                    steps_log.append({"phase": 4, "name": "Eventos DIAN / RADIAN", "status": "RUNNING"})
                    
                    # 1. Evento: Acuse de Recibo (030)
                    acuse_btn = page.locator('button:has-text("Acuse"), button:has-text("Acuse de recibo"), button[title*="Acuse"]').first
                    if await acuse_btn.count() > 0 and await acuse_btn.is_visible():
                        await acuse_btn.click()
                        await page.wait_for_timeout(2000)
                        # Confirmar modal si aparece
                        confirm_btn = page.locator('mat-dialog-container button:has-text("Aceptar"), mat-dialog-container button:has-text("Confirmar"), mat-dialog-container button:has-text("Sí")').first
                        if await confirm_btn.count() > 0:
                            await confirm_btn.click()
                            await page.wait_for_timeout(3000)

                    # 2. Evento: Recibo del Bien / Servicio (032)
                    recibo_btn = page.locator('button:has-text("Recibo de Bien"), button:has-text("Recepción de Bien"), button:has-text("Recibo del bien"), button[title*="Recibo"]').first
                    if await recibo_btn.count() > 0 and await recibo_btn.is_visible():
                        await recibo_btn.click()
                        await page.wait_for_timeout(2000)
                        confirm_btn = page.locator('mat-dialog-container button:has-text("Aceptar"), mat-dialog-container button:has-text("Confirmar"), mat-dialog-container button:has-text("Sí")').first
                        if await confirm_btn.count() > 0:
                            await confirm_btn.click()
                            await page.wait_for_timeout(3000)

                    # 3. Evento: Aceptación Expresa (033) con 3 campos obligatorios
                    acept_btn = page.locator('button:has-text("Aceptación"), button:has-text("Aceptación expresa"), button[title*="Aceptación"]').first
                    if await acept_btn.count() > 0 and await acept_btn.is_visible():
                        await acept_btn.click()
                        await page.wait_for_timeout(2000)

                        # Rellenar los 3 campos de responsable (Nombre, Apellido, Cédula)
                        name_input = page.locator('input[formcontrolname="nombre"], input[formcontrolname="name"], input[placeholder*="Nombre"]').first
                        if await name_input.count() > 0:
                            await name_input.fill(resp_name)

                        last_input = page.locator('input[formcontrolname="apellido"], input[formcontrolname="lastname"], input[formcontrolname="lastName"], input[placeholder*="Apellido"]').first
                        if await last_input.count() > 0:
                            await last_input.fill(resp_last)

                        id_input = page.locator('input[formcontrolname="cedula"], input[formcontrolname="documento"], input[formcontrolname="idNumber"], input[formcontrolname="identificacion"], input[placeholder*="Cédula"], input[placeholder*="Documento"]').first
                        if await id_input.count() > 0:
                            await id_input.fill(resp_id)

                        # Confirmar aceptación
                        send_btn = page.locator('mat-dialog-container button:has-text("Enviar"), mat-dialog-container button:has-text("Aceptar"), mat-dialog-container button:has-text("Confirmar")').first
                        if await send_btn.count() > 0:
                            await send_btn.click()
                            await page.wait_for_timeout(4000)

                    steps_log[-1]["status"] = "SUCCESS"
                else:
                    steps_log.append({"phase": 4, "name": "Eventos DIAN / RADIAN", "status": "SKIPPED_READONLY"})

                # --- FASE 5: DESCARGA DEL PDF ---
                if download_pdf:
                    steps_log.append({"phase": 5, "name": "Descarga de Factura (PDF)", "status": "RUNNING"})
                    download_btn = page.locator('button:has-text("Descargar"), button:has-text("PDF"), button[title*="Descargar"], button[title*="PDF"], mat-icon:has-text("download"), mat-icon:has-text("picture_as_pdf")').first
                    
                    if await download_btn.count() > 0 and await download_btn.is_visible():
                        async with page.expect_download(timeout=20000) as download_info:
                            await download_btn.click()
                        download = await download_info.value
                        clean_fname = f"Factura_{target_doc_number.replace(' ', '_').replace('/', '_')}.pdf"
                        dest_path = os.path.join(UPLOADS_DIR, clean_fname)
                        await download.save_as(dest_path)
                        downloaded_file_path = dest_path
                        steps_log[-1]["status"] = "SUCCESS"
                        steps_log[-1]["filePath"] = dest_path
                    else:
                        steps_log[-1]["status"] = "DOWNLOAD_BUTTON_NOT_FOUND"

                # --- FASE 6: RETORNO A RECIBIDOS CON BOTÓN DE FLECHA ATRÁS ---
                steps_log.append({"phase": 6, "name": "Retorno a Recibidos", "status": "RUNNING"})
                back_btn = page.locator('button:has-text("arrow_back"), button mat-icon:has-text("arrow_back"), button[aria-label="Volver"], button[aria-label="Atrás"], button:has-text("Volver")').first
                if await back_btn.count() > 0 and await back_btn.is_visible():
                    await back_btn.click()
                    await page.wait_for_timeout(3000)
                    steps_log[-1]["status"] = "SUCCESS"
                else:
                    # Fallback de navegación hacia atrás
                    await page.go_back()
                    await page.wait_for_timeout(2000)
                    steps_log[-1]["status"] = "SUCCESS_VIA_HISTORY"

                await browser.close()

            self.add_audit_log(
                action_type="WORKFLOW_COMPLETE",
                status="SUCCESS",
                message=f"Flujo completado para factura {target_doc_number}. Fases: {[s['name'] + ': ' + s['status'] for s in steps_log]}",
                doc_number=target_doc_number
            )

            return {
                "success": True,
                "documentNumber": target_doc_number,
                "steps": steps_log,
                "downloadedPdf": downloaded_file_path,
                "completedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }

        except Exception as e:
            self.add_audit_log(
                action_type="WORKFLOW_ERROR",
                status="ERROR",
                message=f"Error en flujo automatizado para {target_doc_number}: {str(e)}",
                doc_number=target_doc_number
            )
            return {
                "success": False,
                "documentNumber": target_doc_number,
                "steps": steps_log,
                "error": str(e),
                "completedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
