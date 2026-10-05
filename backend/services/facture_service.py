import asyncio
import os
import re
import json
import time
import zipfile
from typing import List, Dict, Any, Optional
from datetime import datetime
from playwright.async_api import async_playwright
from backend.repositories.mysql_repository import MySQLRepository
from backend.services.invoice_ai_service import InvoiceAIService

LOGIN_URL = "https://plataforma.facture.co/plataforma/login"
UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads", "invoices"))
PLAYWRIGHT_CHROMIUM_ARGS = [
    "--host-resolver-rules=MAP plataforma.facture.co 20.119.128.21, MAP api.facture.co 20.119.0.58",
    "--ignore-certificate-errors",
    "--disable-web-security",
    "--allow-running-insecure-content",
    "--disable-gpu",
    "--no-sandbox",
    "--disable-dev-shm-usage"
]

def ensure_extracted_pdf(file_path: str) -> None:
    """Si el archivo guardado es en realidad un ZIP de Facture con XML y PDF, extrae el PDF real."""
    if not os.path.exists(file_path) or not zipfile.is_zipfile(file_path):
        return
    try:
        with zipfile.ZipFile(file_path) as z:
            pdf_names = [n for n in z.namelist() if n.lower().endswith('.pdf')]
            if pdf_names:
                pdf_data = z.read(pdf_names[0])
                with open(file_path, 'wb') as f:
                    f.write(pdf_data)
    except Exception as e:
        print(f"Aviso extrayendo PDF de ZIP: {e}")

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

    def get_inbox_documents(
        self, 
        folder: Optional[str] = None, 
        payment_type: Optional[str] = None,
        status_tab: Optional[str] = None,
        search: Optional[str] = None, 
        limit: int = 10000
    ) -> List[Dict[str, Any]]:
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                sql = "SELECT * FROM facture_inbox_documents WHERE 1=1"
                params = []
                if folder and folder.lower() != "todos":
                    f_clean = folder.strip()
                    if f_clean.lower() in ["recibidos", "recibidos (crédito)", "recibidos (credito)"]:
                        sql += " AND folderType IN ('Recibidos', 'Recibidos (Crédito)')"
                    elif f_clean.lower() in ["contado", "recibidos (contado)", "recibidos ( contado )"]:
                        sql += " AND folderType IN ('Recibidos (contado)', 'Contado')"
                    elif f_clean.lower() in ["procesados (contado)", "procesados ( contado )"]:
                        sql += " AND folderType = 'Procesados (contado)'"
                    elif f_clean.lower() in ["procesados", "procesados (crédito)", "procesados (credito)"]:
                        sql += " AND folderType IN ('Procesados', 'Procesados (Crédito)')"
                    else:
                        sql += " AND (folderType = %s OR paymentType = %s)"
                        params.extend([f_clean, f_clean])
                if payment_type and payment_type.lower() != "todos":
                    sql += " AND paymentType = %s"
                    params.append(payment_type)
                if status_tab and status_tab.lower() != "todos":
                    sql += " AND statusTab = %s"
                    params.append(status_tab)
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
        if creds.get("isSyncing") == 1:
            return {
                "success": False,
                "message": "Una sincronización con Facture.co ya se encuentra en ejecución. Por favor espera a que termine.",
                "alreadyRunning": True
            }

        # Marcar inicio de sincronización en BD
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("UPDATE facture_credentials SET isSyncing = 1 WHERE id = 'default'")

        username = creds.get("username") or "TicsEnriko"
        password = creds.get("password") or "Septiembre2026*"
        nit = creds.get("nit") or "890330035"

        recibidos_credito_count = 0
        procesados_credito_count = 0
        recibidos_contado_count = 0
        procesados_contado_count = 0
        synced_docs = []

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=PLAYWRIGHT_CHROMIUM_ARGS)
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

                # 4. Esperar carga inicial
                await page.wait_for_timeout(5000)
                try:
                    await page.wait_for_load_state("networkidle", timeout=15000)
                except Exception:
                    pass

                # Helper para extraer todas las páginas de una tabla
                async def scrape_all_table_pages(folder_label: str, max_pages: int = 50) -> List[Dict[str, Any]]:
                    extracted = []
                    curr_page = 1
                    while curr_page <= max_pages:
                        await page.wait_for_timeout(1500)
                        rows = await page.locator("tr").all()
                        for r in rows:
                            try:
                                cells = await r.locator("td").all()
                                if len(cells) >= 9:
                                    doc_num = (await cells[3].inner_text()).strip() if len(cells) > 3 else ""
                                    doc_type = (await cells[4].inner_text()).strip() if len(cells) > 4 else "FACTURA DE VENTA"
                                    issuer = (await cells[5].inner_text()).strip() if len(cells) > 5 else ""
                                    issuer_nit = (await cells[6].inner_text()).strip() if len(cells) > 6 else ""
                                    emission_date = (await cells[7].inner_text()).strip() if len(cells) > 7 else ""
                                    detail = (await cells[8].inner_text()).strip() if len(cells) > 8 else ""
                                    reception_date = (await cells[9].inner_text()).strip() if len(cells) > 9 else emission_date

                                    # Parsear monto de forma robusta
                                    amount = 0.0
                                    amt_match = re.search(r"\$\s*([0-9.,]+)", detail)
                                    if amt_match:
                                        raw_amt = amt_match.group(1).strip()
                                        if "," in raw_amt and "." in raw_amt:
                                            if raw_amt.rfind(",") > raw_amt.rfind("."):
                                                raw_amt = raw_amt.replace(".", "").replace(",", ".")
                                            else:
                                                raw_amt = raw_amt.replace(",", "")
                                        elif "," in raw_amt:
                                            parts = raw_amt.split(",")
                                            if len(parts[-1]) == 2:
                                                raw_amt = raw_amt.replace(",", ".")
                                            else:
                                                raw_amt = raw_amt.replace(",", "")
                                        elif "." in raw_amt:
                                            parts = raw_amt.split(".")
                                            if len(parts[-1]) == 3 and len(parts) > 1:
                                                raw_amt = raw_amt.replace(".", "")
                                        try:
                                            amount = float(raw_amt)
                                        except Exception:
                                            pass

                                    if doc_num and doc_num.lower() != 'flag' and not doc_num.startswith('mat-'):
                                        extracted.append({
                                            "id": f"facture-{doc_num.replace(' ', '-').replace('/', '-')}",
                                            "documentNumber": doc_num,
                                            "docType": doc_type,
                                            "issuerName": issuer,
                                            "issuerNit": issuer_nit,
                                            "emissionDate": emission_date,
                                            "receptionDate": reception_date,
                                            "detailAmount": amount,
                                            "rawDetail": detail,
                                            "folderType": folder_label,
                                            "stage": "Recepción",
                                            "status": "Pendiente"
                                        })
                            except Exception:
                                pass

                        # Verificar siguiente página
                        next_btn = page.locator('button.mat-mdc-paginator-navigation-next, button[aria-label="Next page"], button[aria-label="Página siguiente"], button.mat-paginator-navigation-next').first
                        if await next_btn.count() > 0:
                            is_disabled = await next_btn.is_disabled()
                            if is_disabled:
                                break
                            await next_btn.click()
                            curr_page += 1
                            await page.wait_for_timeout(2000)
                        else:
                            break
                    return extracted

                # Extraer conteos globales si se encuentran en el texto
                body_text = await page.inner_text("body")
                rec_match = re.search(r"Recibidos\s*\(\s*(\d+)\s*\)", body_text)
                if rec_match:
                    recibidos_credito_count = int(rec_match.group(1))

                cont_match = re.search(r"Contado\s*\(?\s*(\d+)\s*\)?", body_text)
                if cont_match:
                    recibidos_contado_count = int(cont_match.group(1))

                # --- 1. RECIBIDOS (CRÉDITO) - Pestaña RECIBIDOS ---
                docs_recibidos_cred = await scrape_all_table_pages("Recibidos", max_pages=50)
                synced_docs.extend(docs_recibidos_cred)

                # --- 2. RECIBIDOS (CRÉDITO) - Pestaña PROCESADOS ---
                proc_tab = page.locator('button:has-text("PROCESADOS"), div:has-text("PROCESADOS")').last
                if await proc_tab.count() > 0:
                    try:
                        await proc_tab.click()
                        await page.wait_for_timeout(2500)
                        docs_proc_cred = await scrape_all_table_pages("Procesados", max_pages=20)
                        synced_docs.extend(docs_proc_cred)
                        procesados_credito_count = len(docs_proc_cred)
                    except Exception:
                        pass

                # --- 3. CONTADO (En sidebar) ---
                contado_node = page.locator('text="Contado"').first
                if await contado_node.count() > 0:
                    try:
                        await contado_node.click()
                        await page.wait_for_timeout(3500)

                        # Pestaña RECIBIDOS en Contado -> Recibidos (contado)
                        rec_tab_cont = page.locator('button:has-text("RECIBIDOS"), div:has-text("RECIBIDOS")').last
                        if await rec_tab_cont.count() > 0:
                            await rec_tab_cont.click()
                            await page.wait_for_timeout(2000)
                        docs_contado_rec = await scrape_all_table_pages("Recibidos (contado)", max_pages=30)
                        synced_docs.extend(docs_contado_rec)
                        if len(docs_contado_rec) > 0 and recibidos_contado_count == 0:
                            recibidos_contado_count = len(docs_contado_rec)

                        # Pestaña PROCESADOS en Contado -> Procesados (contado)
                        proc_tab_cont = page.locator('button:has-text("PROCESADOS"), div:has-text("PROCESADOS")').last
                        if await proc_tab_cont.count() > 0:
                            await proc_tab_cont.click()
                            await page.wait_for_timeout(2500)
                            docs_contado_proc = await scrape_all_table_pages("Procesados (contado)", max_pages=20)
                            synced_docs.extend(docs_contado_proc)
                            procesados_contado_count = len(docs_contado_proc)
                    except Exception:
                        pass

                await browser.close()

            # Guardar en base de datos
            with self.repo.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE facture_credentials
                        SET recibidosCount = %s, 
                            contadoCount = %s, 
                            recibidosCreditoCount = %s,
                            procesadosCreditoCount = %s,
                            recibidosContadoCount = %s,
                            procesadosContadoCount = %s,
                            lastSyncAt = NOW()
                        WHERE id = 'default'
                    """, (
                        recibidos_credito_count or len(docs_recibidos_cred),
                        recibidos_contado_count,
                        recibidos_credito_count or len(docs_recibidos_cred),
                        procesados_credito_count,
                        recibidos_contado_count,
                        procesados_contado_count
                    ))

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
                                rawDetail = VALUES(rawDetail),
                                folderType = VALUES(folderType);
                        """, (
                            doc["id"], doc["documentNumber"], doc["docType"], doc["issuerName"],
                            doc["issuerNit"], doc["emissionDate"], doc["receptionDate"],
                            doc["detailAmount"], doc["rawDetail"], doc["folderType"], doc["stage"], doc["status"]
                        ))

            self.add_audit_log(
                action_type="INBOX_SYNC",
                status="SUCCESS",
                message=f"Sincronización multi-página completada: {len(synced_docs)} documentos obtenidos en Recibidos (Crédito), Recibidos (contado) y Procesados (contado)."
            )

            return {
                "success": True,
                "recibidosCount": recibidos_credito_count or len(docs_recibidos_cred),
                "contadoCount": recibidos_contado_count,
                "recibidosCreditoCount": recibidos_credito_count or len(docs_recibidos_cred),
                "procesadosCreditoCount": procesados_credito_count,
                "recibidosContadoCount": recibidos_contado_count,
                "procesadosContadoCount": procesados_contado_count,
                "syncedDocsCount": len(synced_docs),
                "lastSyncAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
        except Exception as e:
            err_msg = str(e) or repr(e)
            self.add_audit_log(
                action_type="INBOX_SYNC_ERROR",
                status="ERROR",
                message=f"Error en sincronización con Facture: {err_msg}"
            )
            raise e
        finally:
            try:
                with self.repo.get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("UPDATE facture_credentials SET isSyncing = 0 WHERE id = 'default'")
            except Exception:
                pass

    def match_supplier_and_concept(self, issuer_name: str, issuer_nit: str, amount: float, raw_detail: str = "") -> Dict[str, Any]:
        """
        Valida si el emisor ya existe como Proveedor.
        - Si NO existe: sugiere crear el proveedor con concepto tipo 'factura'.
        - Si YA existe:
          - Revisa sus conceptos de tipo 'factura' (NUNCA cotizaciones).
          - Si tiene conceptos, busca el más cercano en valor histórico/detalle al monto de la factura.
          - Si no tiene conceptos de tipo 'factura', sugiere agregarlo a sus servicios.
        """
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                clean_nit = (issuer_nit or "").strip()
                clean_name = (issuer_name or "").strip()

                cur.execute("""
                    SELECT * FROM suppliers 
                    WHERE (nit != '' AND nit = %s) OR LOWER(name) = LOWER(%s)
                    LIMIT 1
                """, (clean_nit, clean_name))
                sup = cur.fetchone()

                # Concepto por defecto sugerido
                concept_title = raw_detail.strip() if raw_detail and len(raw_detail) < 60 else f"Facturación {clean_name}"
                if len(concept_title) > 60:
                    concept_title = concept_title[:57] + "..."

                if not sup:
                    return {
                        "isNewSupplier": True,
                        "supplierId": None,
                        "supplierName": clean_name,
                        "supplierNit": clean_nit,
                        "matchedConcept": concept_title,
                        "matchedConceptType": "factura",
                        "conceptAction": "CREATE_SUPPLIER_AND_CONCEPT",
                        "closestValueDifference": 0,
                        "allConcepts": []
                    }

                services = []
                if isinstance(sup.get("services"), str):
                    try:
                        services = json.loads(sup["services"])
                    except Exception:
                        services = []
                elif isinstance(sup.get("services"), list):
                    services = sup["services"]

                # Filtrar SOLO conceptos de tipo 'factura' (las de Facture son siempre Facturas, nunca cotizaciones)
                factura_concepts = [s for s in services if (s.get("type") or "factura").lower() == "factura"]

                if not factura_concepts:
                    return {
                        "isNewSupplier": False,
                        "supplierId": sup["id"],
                        "supplierName": sup["name"],
                        "supplierNit": sup["nit"] or clean_nit,
                        "matchedConcept": concept_title,
                        "matchedConceptType": "factura",
                        "conceptAction": "ADD_CONCEPT_TO_SUPPLIER",
                        "closestValueDifference": 0,
                        "allConcepts": services
                    }

                # Si el proveedor ya tiene conceptos de factura:
                # Consultar facturas históricas del mes anterior o anteriores para encontrar el concepto más cercano en valor
                cur.execute("""
                    SELECT service, value, emissionDate 
                    FROM invoices 
                    WHERE supplier = %s AND value > 0
                    ORDER BY emissionDate DESC
                """, (sup["name"],))
                hist_invoices = cur.fetchall()

                best_concept = None
                min_diff = float("inf")
                concept_values = {}

                for inv in hist_invoices:
                    s_name = inv["service"]
                    if s_name not in concept_values:
                        concept_values[s_name] = float(inv["value"] or 0.0)

                for fc in factura_concepts:
                    fc_name = fc.get("serviceName") or ""
                    if fc_name in concept_values:
                        val = concept_values[fc_name]
                        diff = abs(val - amount)
                        if diff < min_diff:
                            min_diff = diff
                            best_concept = fc_name

                if not best_concept:
                    best_concept = factura_concepts[0].get("serviceName") or concept_title
                    min_diff = 0

                return {
                    "isNewSupplier": False,
                    "supplierId": sup["id"],
                    "supplierName": sup["name"],
                    "supplierNit": sup["nit"] or clean_nit,
                    "matchedConcept": best_concept,
                    "matchedConceptType": "factura",
                    "conceptAction": "ATTACH_TO_EXISTING_CONCEPT",
                    "closestValueDifference": min_diff if min_diff != float("inf") else 0,
                    "allConcepts": services
                }

    def import_to_main_invoices(self, facture_doc_id: str) -> Dict[str, Any]:
        """
        Importa/Vincula un documento de Facture a la tabla principal `invoices`
        asegurando que el emisor pase a Proveedores y su concepto de Factura quede sincronizado.
        """
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM facture_inbox_documents WHERE id = %s", (facture_doc_id,))
                doc = cur.fetchone()
                if not doc:
                    raise ValueError("Documento de Facture no encontrado.")

                amount = float(doc["detailAmount"] or 0)
                issuer = doc["issuerName"]
                nit = doc["issuerNit"]
                doc_num = doc["documentNumber"]
                emission = doc["emissionDate"] or datetime.now().strftime("%Y-%m-%d")
                reception = doc["receptionDate"] or datetime.now().strftime("%Y-%m-%d")

                # 1. Matching inteligente de proveedor y concepto
                match_res = self.match_supplier_and_concept(
                    issuer_name=issuer,
                    issuer_nit=nit,
                    amount=amount,
                    raw_detail=doc["rawDetail"] or ""
                )

                matched_concept = match_res["matchedConcept"]
                sup_name = match_res["supplierName"]

                # Caso 1: Proveedor nuevo -> Crear proveedor en el módulo con concepto tipo 'factura'
                if match_res["isNewSupplier"]:
                    sup_id = f"sup-{int(time.time() * 1000)}"
                    new_services = [{
                        "id": f"srv-{int(time.time() * 1000)}",
                        "serviceName": matched_concept,
                        "type": "factura",
                        "enabled": True
                    }]
                    self.repo.save_supplier({
                        "id": sup_id,
                        "nit": nit,
                        "name": sup_name,
                        "contact": sup_name,
                        "phone": "",
                        "monthlyCount": 1,
                        "area": "General",
                        "services": new_services
                    })

                # Caso 2: Proveedor existente pero requiere agregar nuevo concepto de factura
                elif match_res["conceptAction"] == "ADD_CONCEPT_TO_SUPPLIER":
                    sup_id = match_res["supplierId"]
                    current_services = match_res["allConcepts"]
                    current_services.append({
                        "id": f"srv-{int(time.time() * 1000)}",
                        "serviceName": matched_concept,
                        "type": "factura",
                        "enabled": True
                    })
                    self.repo.update_supplier_services(sup_id, current_services)

                # 2. Asignar o vincular a la tabla principal `invoices`
                # Buscar si existe un placeholder del mes actual para este proveedor y concepto que esté vacío
                cur.execute("""
                    SELECT id FROM invoices 
                    WHERE supplier = %s AND service = %s 
                      AND (invoiceNumber = '' OR invoiceNumber = 'COT-' OR invoiceNumber LIKE 'rec-%%') 
                      AND (value = 0 OR value IS NULL)
                    ORDER BY id ASC
                    LIMIT 1
                """, (sup_name, matched_concept))
                placeholder = cur.fetchone()

                if placeholder:
                    # Reutilizar y actualizar el registro placeholder
                    inv_id = placeholder["id"]
                    cur.execute("""
                        UPDATE invoices 
                        SET invoiceNumber = %s,
                            emissionDate = %s,
                            deliveryDate = %s,
                            value = %s,
                            enFacture = 'SÍ'
                        WHERE id = %s
                    """, (doc_num, emission, reception, amount, inv_id))
                else:
                    # Insertar nuevo registro
                    inv_id = f"inv-{doc_num.replace(' ', '-').replace('/', '-')}"
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
                        sup_name,
                        matched_concept,
                        doc_num,
                        emission,
                        reception,
                        amount,
                        "NO",
                        "NO",
                        "",
                        "SÍ",
                        "NO"
                    ))

                # 3. Marcar documento como sincronizado
                cur.execute("UPDATE facture_inbox_documents SET isSyncedToMain = 1 WHERE id = %s", (facture_doc_id,))

                self.add_audit_log(
                    action_type="IMPORT_TO_MAIN",
                    status="SUCCESS",
                    message=f"Documento {doc_num} vinculado al Proveedor '{sup_name}' bajo el concepto '{matched_concept}'.",
                    doc_number=doc_num,
                    issuer=sup_name
                )

                return {
                    "success": True, 
                    "invoiceId": inv_id, 
                    "supplier": sup_name, 
                    "concept": matched_concept,
                    "isNewSupplier": match_res["isNewSupplier"],
                    "conceptAction": match_res["conceptAction"]
                }

    async def inspect_and_analyze_invoice(self, target_doc_number: str, force_download: bool = False) -> Dict[str, Any]:
        """
        Descarga la factura en PDF desde Facture.co (si no está descargada),
        ejecuta la lectura inteligente (IA / PDF Parser) para extraer ítems, precios,
        subtotal sin IVA, IVA discriminado y totales, y sugiere la vinculación a Proveedor.
        """
        clean_doc = target_doc_number.strip()
        expected_pdf_name = f"Factura_{clean_doc.replace(' ', '_').replace('/', '_')}.pdf"
        dest_pdf_path = os.path.join(UPLOADS_DIR, expected_pdf_name)

        doc_data = None
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM facture_inbox_documents WHERE documentNumber = %s OR id = %s", 
                            (clean_doc, f"facture-{clean_doc.replace(' ', '-').replace('/', '-')}"))
                doc_data = cur.fetchone()

        if not doc_data:
            doc_data = {
                "documentNumber": clean_doc,
                "issuerName": "",
                "issuerNit": "",
                "emissionDate": "",
                "dueDate": "",
                "detailAmount": 0.0,
                "rawDetail": ""
            }

        # 1. Verificar si el PDF existente en disco coincide realmente con esta factura
        if os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100 and not force_download:
            try:
                pdf_text = InvoiceAIService.extract_text_from_pdf(dest_pdf_path)
                clean_num_only = re.sub(r"^[A-Z\-_]+", "", clean_doc).strip()
                # Si el PDF existente no contiene ni el código completo ni el número de la factura
                if clean_doc.upper() not in pdf_text.upper() and (clean_num_only and clean_num_only not in pdf_text):
                    print(f"⚠️ El PDF en disco {dest_pdf_path} no corresponde a la factura {clean_doc}. Eliminando archivo cruzado para re-descargar.")
                    try: os.remove(dest_pdf_path)
                    except Exception: pass
            except Exception as e:
                print(f"Error verificando PDF en disco: {e}")

        # 2. Si no tenemos el PDF o se solicita forzar descarga, descargarlo vía Playwright
        if not os.path.exists(dest_pdf_path) or force_download or not doc_data.get("itemsJson"):
            creds = self.get_credentials()
            username = creds.get("username") or "TicsEnriko"
            password = creds.get("password") or "Septiembre2026*"
            nit = creds.get("nit") or "890330035"

            try:
                async with async_playwright() as p:
                    browser = await p.chromium.launch(headless=True, args=PLAYWRIGHT_CHROMIUM_ARGS)
                    context = await browser.new_context(
                        user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
                        viewport={"width": 1440, "height": 900},
                        accept_downloads=True
                    )
                    page = await context.new_page()

                    # Login & Empresa
                    await page.goto(LOGIN_URL, wait_until="networkidle", timeout=45000)
                    await page.locator('input[formcontrolname="usernameField"]').fill(username)
                    await page.locator('input[formcontrolname="passwordField"]').fill(password)
                    await page.locator('button[type="submit"]').click()

                    nit_input = page.locator('input[formcontrolname="nit"], #mat-input-2')
                    await nit_input.wait_for(state="visible", timeout=15000)
                    await nit_input.fill(nit)
                    await page.locator('button:has-text("Enviar")').click()

                    # Navegar y buscar documento en su carpeta correspondiente o global
                    folder_hint = (doc_data.get("folderType") or "Recibidos").lower()
                    await self._navigate_to_inbox_recibidos(page)

                    found = False
                    # Si la factura está marcada como Contado, ir a sección Contado
                    if "contado" in folder_hint:
                        contado_btn = page.locator('text="Contado"').first
                        if await contado_btn.count() > 0:
                            await contado_btn.click()
                            await page.wait_for_timeout(2000)
                        if "procesados" in folder_hint:
                            proc_t = page.locator('button:has-text("PROCESADOS"), div:has-text("PROCESADOS")').last
                            if await proc_t.count() > 0:
                                await proc_t.click()
                                await page.wait_for_timeout(1500)
                    elif "procesados" in folder_hint:
                        proc_t = page.locator('button:has-text("PROCESADOS"), div:has-text("PROCESADOS")').last
                        if await proc_t.count() > 0:
                            await proc_t.click()
                            await page.wait_for_timeout(1500)

                    found = await self._find_and_open_invoice_with_pagination(page, clean_doc, max_pages=20)

                    # Si no se encontró en la carpeta inicial, buscar en las demás pestañas
                    if not found:
                        await self._navigate_to_inbox_recibidos(page)
                        found = await self._find_and_open_invoice_with_pagination(page, clean_doc, max_pages=15)

                    if found:
                        # Extraer detalles de mat-card
                        try:
                            await page.wait_for_selector("mat-card", timeout=4000)
                            card_text = await page.inner_text("mat-card")
                            remitente_m = re.search(r"Remitente:\s*([^\n\r]+)", card_text)
                            monto_m = re.search(r"Monto:\s*\$\s*([\d,.]+)", card_text)
                            emision_m = re.search(r"Fecha de emisi[oó]n:\s*([\d\-]+)", card_text)
                            vence_m = re.search(r"Fecha de vencimiento:\s*([\d\-]+)", card_text)
                            tracking_m = re.search(r"Tracking ID:\s*([a-zA-Z0-9\-]+)", card_text)

                            if remitente_m: doc_data["issuerName"] = remitente_m.group(1).strip()
                            if emision_m: doc_data["emissionDate"] = emision_m.group(1).strip()
                            if vence_m: doc_data["dueDate"] = vence_m.group(1).strip()
                            if tracking_m: doc_data["trackingId"] = tracking_m.group(1).strip()
                            if monto_m: doc_data["detailAmount"] = InvoiceAIService._parse_currency_str(monto_m.group(1))
                        except Exception:
                            pass

                        # Descargar PDF usando el botón exacto de viewer-actions (get_app / Descargar PDF)
                        download_btn = page.locator(
                            '.viewer-actions button[mattooltip="Descargar PDF"], '
                            'button[mattooltip="Descargar PDF"], '
                            '.viewer-actions button:has(mat-icon:has-text("get_app")), '
                            'button:has(mat-icon:has-text("get_app")), '
                            'button[aria-label*="Descargar"], '
                            'button:has-text("Descargar"), '
                            'button:has-text("PDF"), '
                            'button[title*="Descargar"], '
                            'button[title*="PDF"], '
                            'mat-icon:has-text("download"), '
                            'mat-icon:has-text("picture_as_pdf")'
                        ).first
                        if await download_btn.count() > 0 and await download_btn.is_visible():
                            try:
                                async with page.expect_download(timeout=20000) as download_info:
                                    await download_btn.click()
                                download = await download_info.value
                                await download.save_as(dest_pdf_path)
                                ensure_extracted_pdf(dest_pdf_path)
                            except Exception:
                                pass

                    await browser.close()
            except Exception as e:
                print(f"Error descargando PDF en vivo: {e}")

        # 2. Validación de disponibilidad del PDF físico antes de llamar a la IA
        pdf_exists = os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100

        if not pdf_exists:
            # Si el PDF no está disponible, NO consumimos tokens de Gemini AI
            print(f"⚠️ Factura {clean_doc}: PDF no disponible. Omitiendo lectura con IA para no gastar tokens.")
            analysis = InvoiceAIService._deterministic_invoice_parser("", doc_data)
            analysis["aiSkipped"] = True
            analysis["aiReason"] = "El visor no encontró el archivo PDF físico de la factura. Se omitió la llamada a IA para proteger tokens."

            supplier_match = self.match_supplier_and_concept(
                issuer_name=doc_data.get("issuerName") or "",
                issuer_nit=doc_data.get("issuerNit") or "",
                amount=float(doc_data.get("detailAmount") or 0.0),
                raw_detail=doc_data.get("rawDetail") or ""
            )

            return {
                "success": True,
                "documentNumber": clean_doc,
                "analysis": analysis,
                "supplierMatch": supplier_match,
                "pdfAvailable": False,
                "aiSkipped": True,
                "message": "El visor no encontró el archivo PDF de la factura. Se omitió la lectura con IA para no consumir tokens.",
                "pdfUrl": None
            }

        # 2. Análisis con IA Multimodal (solo si el PDF existe y tiene contenido válido)
        analysis = InvoiceAIService.analyze_invoice_pdf(dest_pdf_path, doc_data)

        # 3. Matching de Proveedor y Concepto
        supplier_match = self.match_supplier_and_concept(
            issuer_name=doc_data.get("issuerName") or analysis["emisor"]["razonSocial"],
            issuer_nit=doc_data.get("issuerNit") or analysis["emisor"]["nit"],
            amount=float(analysis.get("totalConIva") or doc_data.get("detailAmount") or 0.0),
            raw_detail=analysis.get("conceptoPrincipalSugerido") or doc_data.get("rawDetail") or ""
        )

        # 4. Actualizar base de datos con los resultados del análisis
        items_json_str = json.dumps(analysis.get("items", []))
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE facture_inbox_documents
                    SET subtotalAmount = %s,
                        ivaAmount = %s,
                        itemsJson = %s,
                        aiSummary = %s,
                        dueDate = IF(%s != '', %s, dueDate),
                        pdfDownloaded = IF(%s = 1, 1, pdfDownloaded),
                        pdfPath = IF(%s != '', %s, pdfPath)
                    WHERE documentNumber = %s OR id = %s
                """, (
                    analysis.get("subtotalSinIva", 0.0),
                    analysis.get("totalIva", 0.0),
                    items_json_str,
                    analysis.get("resumenEjecutivo", ""),
                    doc_data.get("dueDate", ""), doc_data.get("dueDate", ""),
                    1 if os.path.exists(dest_pdf_path) else 0,
                    dest_pdf_path if os.path.exists(dest_pdf_path) else "",
                    dest_pdf_path if os.path.exists(dest_pdf_path) else "",
                    clean_doc, f"facture-{clean_doc.replace(' ', '-').replace('/', '-')}"
                ))

        return {
            "success": True,
            "documentNumber": clean_doc,
            "analysis": analysis,
            "supplierMatch": supplier_match,
            "pdfAvailable": True,
            "aiSkipped": bool(analysis.get("aiSkipped", False)),
            "pdfUrl": f"/uploads/invoices/{expected_pdf_name}" if os.path.exists(dest_pdf_path) else None
        }

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

    @staticmethod
    def _normalize_doc_id(val: str) -> str:
        """Normaliza un identificador de documento para comparación exacta (ej: 'FAC-FS284740' -> 'FS284740', 'FS 284740' -> 'FS284740')."""
        if not val:
            return ""
        clean = re.sub(r"[^A-Za-z0-9]", "", val).upper()
        for prefix in ["FACTURADEVENTA", "FACTURA", "FAC", "NOTACREDITO", "NOTA", "NC"]:
            if clean.startswith(prefix) and len(clean) > len(prefix):
                clean = clean[len(prefix):]
        return clean

    async def _find_and_open_invoice_with_pagination(self, page, target_doc_number: str, max_pages: int = 15) -> bool:
        """
        Busca un documento específico en la tabla de Recibidos con COINCIDENCIA EXACTA NORMALIZADA.
        Si no se encuentra en la página actual, navega por el paginador hasta encontrarlo.
        """
        clean_target = target_doc_number.strip().upper()
        target_norm = self._normalize_doc_id(clean_target)
        current_page_num = 1

        while current_page_num <= max_pages:
            await page.wait_for_timeout(1500)

            # 1. Buscar filas de la tabla y comprobar coincidencia EXACTA del número de documento
            rows = page.locator("mat-table mat-row, table tbody tr, tr")
            row_count = await rows.count()
            
            for i in range(row_count):
                row = rows.nth(i)
                cells = row.locator("mat-cell, td")
                cell_count = await cells.count()
                matched = False
                
                for c in range(cell_count):
                    try:
                        cell_raw = (await cells.nth(c).inner_text()).strip()
                        cell_norm = self._normalize_doc_id(cell_raw)
                        if (cell_norm and cell_norm == target_norm) or (cell_raw.upper() == clean_target):
                            matched = True
                            break
                    except Exception:
                        pass
                
                if matched:
                    self.add_audit_log(
                        action_type="INVOICE_LOCATED",
                        status="INFO",
                        message=f"Documento {clean_target} (norm: {target_norm}) localizado de forma exacta en la página {current_page_num} de Facture.",
                        doc_number=clean_target
                    )
                    # Click en enlace o botón específico de la fila
                    clickable = row.locator("a, button, [role='button'], mat-cell").first
                    if await clickable.count() > 0 and await clickable.is_visible():
                        await clickable.click()
                    else:
                        await row.click()
                    await page.wait_for_timeout(3500)
                    return True

            # 2. Si no se encuentra en la página actual, verificar botón de página siguiente
            next_page_btn = page.locator('button.mat-mdc-paginator-navigation-next, button[aria-label="Next page"], button[aria-label="Página siguiente"], button.mat-paginator-navigation-next').first
            
            if await next_page_btn.count() > 0:
                is_disabled = await next_page_btn.is_disabled()
                if is_disabled:
                    break
                
                # Avanzar a la siguiente página
                await next_page_btn.click()
                current_page_num += 1
                await page.wait_for_timeout(2500)
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
                browser = await p.chromium.launch(headless=True, args=PLAYWRIGHT_CHROMIUM_ARGS)
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

                # Extraer y persistir detalles completos del <mat-card> de la factura
                try:
                    await page.wait_for_selector("mat-card", timeout=4000)
                    card_text = await page.inner_text("mat-card")
                    remitente_m = re.search(r"Remitente:\s*([^\n\r]+)", card_text)
                    tipo_doc_m = re.search(r"Tipo de documento:\s*([^\n\r]+)", card_text)
                    num_doc_m = re.search(r"No\.\s*de documento:\s*([^\n\r]+)", card_text)
                    monto_m = re.search(r"Monto:\s*\$\s*([\d,.]+)", card_text)
                    emision_m = re.search(r"Fecha de emisi[oó]n:\s*([\d\-]+)", card_text)
                    vence_m = re.search(r"Fecha de vencimiento:\s*([\d\-]+)", card_text)
                    tracking_m = re.search(r"Tracking ID:\s*([a-zA-Z0-9\-]+)", card_text)

                    card_issuer = remitente_m.group(1).strip() if remitente_m else ""
                    card_doc_type = tipo_doc_m.group(1).strip() if tipo_doc_m else ""
                    card_doc_num = num_doc_m.group(1).strip() if num_doc_m else target_doc_number
                    card_amount = float(monto_m.group(1).replace(",", "")) if monto_m else 0.0
                    card_emission = emision_m.group(1).strip() if emision_m else ""
                    card_vence = vence_m.group(1).strip() if vence_m else ""
                    card_tracking = tracking_m.group(1).strip() if tracking_m else ""

                    with self.repo.get_connection() as conn:
                        with conn.cursor() as cur:
                            cur.execute("""
                                UPDATE facture_inbox_documents
                                SET issuerName = IF(%s != '', %s, issuerName),
                                    docType = IF(%s != '', %s, docType),
                                    emissionDate = IF(%s != '', %s, emissionDate),
                                    dueDate = %s,
                                    trackingId = %s,
                                    detailAmount = IF(%s > 0, %s, detailAmount)
                                WHERE documentNumber = %s OR id = %s
                            """, (
                                card_issuer, card_issuer,
                                card_doc_type, card_doc_type,
                                card_emission, card_emission,
                                card_vence,
                                card_tracking,
                                card_amount, card_amount,
                                target_doc_number, f"facture-{target_doc_number.replace(' ', '-').replace('/', '-')}"
                            ))
                except Exception:
                    pass

                # --- FASE 4: EJECUCIÓN DE EVENTOS EN BARRA SUPERIOR ---
                if execute_events:
                    steps_log.append({"phase": 4, "name": "Eventos DIAN / RADIAN", "status": "RUNNING"})
                    
                    # 1. Evento: Acuse de Recibo (030) - Icono 'drafts'
                    acuse_btn = page.locator('button:has(mat-icon:has-text("drafts")), button:has-text("Acuse"), button:has-text("Acuse de recibo"), button[title*="Acuse"]').first
                    if await acuse_btn.count() > 0 and await acuse_btn.is_visible():
                        await acuse_btn.click()
                        await page.wait_for_timeout(2000)
                        # Confirmar modal si aparece
                        confirm_btn = page.locator('mat-dialog-container button:has-text("Aceptar"), mat-dialog-container button:has-text("Confirmar"), mat-dialog-container button:has-text("Sí")').first
                        if await confirm_btn.count() > 0:
                            await confirm_btn.click()
                            await page.wait_for_timeout(3000)

                    # 2. Evento: Recibo del Bien / Servicio (032) - Icono 'received' SVG
                    recibo_btn = page.locator('button:has(mat-icon[svgicon="received"]), button:has(mat-icon[data-mat-icon-name="received"]), button:has-text("Recibo de Bien"), button:has-text("Recepción de Bien"), button:has-text("Recibo del bien"), button[title*="Recibo"]').first
                    if await recibo_btn.count() > 0 and await recibo_btn.is_visible():
                        await recibo_btn.click()
                        await page.wait_for_timeout(2000)
                        confirm_btn = page.locator('mat-dialog-container button:has-text("Aceptar"), mat-dialog-container button:has-text("Confirmar"), mat-dialog-container button:has-text("Sí")').first
                        if await confirm_btn.count() > 0:
                            await confirm_btn.click()
                            await page.wait_for_timeout(3000)

                    # 3. Evento: Aceptación Expresa (033) - Icono 'check_circle'
                    acept_btn = page.locator('button:has(mat-icon:has-text("check_circle")), button:has-text("Aceptación"), button:has-text("Aceptación expresa"), button[title*="Aceptación"]').first
                    if await acept_btn.count() > 0 and await acept_btn.is_visible():
                        await acept_btn.click()
                        await page.wait_for_timeout(2000)

                        # Rellenar los 3 campos de responsable (Nombre, Apellido, Cédula) si aparecen
                        name_input = page.locator('input[formcontrolname="nombre"], input[formcontrolname="name"], input[placeholder*="Nombre"]').first
                        if await name_input.count() > 0 and await name_input.is_visible():
                            await name_input.fill(resp_name)

                        last_input = page.locator('input[formcontrolname="apellido"], input[formcontrolname="lastname"], input[formcontrolname="lastName"], input[placeholder*="Apellido"]').first
                        if await last_input.count() > 0 and await last_input.is_visible():
                            await last_input.fill(resp_last)

                        id_input = page.locator('input[formcontrolname="cedula"], input[formcontrolname="documento"], input[formcontrolname="idNumber"], input[formcontrolname="identificacion"], input[placeholder*="Cédula"], input[placeholder*="Documento"]').first
                        if await id_input.count() > 0 and await id_input.is_visible():
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
                    download_btn = page.locator(
                        '.viewer-actions button[mattooltip="Descargar PDF"], '
                        'button[mattooltip="Descargar PDF"], '
                        '.viewer-actions button:has(mat-icon:has-text("get_app")), '
                        'button:has(mat-icon:has-text("get_app")), '
                        'button[aria-label*="Descargar"], '
                        'button:has-text("Descargar"), '
                        'button:has-text("PDF"), '
                        'button[title*="Descargar"], '
                        'button[title*="PDF"], '
                        'mat-icon:has-text("download"), '
                        'mat-icon:has-text("picture_as_pdf")'
                    ).first
                    
                    if await download_btn.count() > 0 and await download_btn.is_visible():
                        async with page.expect_download(timeout=20000) as download_info:
                            await download_btn.click()
                        download = await download_info.value
                        clean_fname = f"Factura_{target_doc_number.replace(' ', '_').replace('/', '_')}.pdf"
                        dest_path = os.path.join(UPLOADS_DIR, clean_fname)
                        await download.save_as(dest_path)
                        ensure_extracted_pdf(dest_path)
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
            err_msg = str(e) or repr(e)
            self.add_audit_log(
                action_type="WORKFLOW_ERROR",
                status="ERROR",
                message=f"Error en flujo automatizado para {target_doc_number}: {err_msg}",
                doc_number=target_doc_number
            )
            return {
                "success": False,
                "documentNumber": target_doc_number,
                "steps": steps_log,
                "error": err_msg,
                "completedAt": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
