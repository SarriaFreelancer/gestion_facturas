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
    "--disable-dev-shm-usage",
    "--disable-blink-features=AutomationControlled"
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
                sql = """
                    SELECT f.*,
                           IF(i.id IS NOT NULL, 1, 0) as isSyncedToMain,
                           i.id as linkedInvoiceId,
                           i.area as linkedArea,
                           i.supplier as linkedSupplier,
                           i.contractNumber as linkedContractNumber,
                           i.approvalStatus as linkedApprovalStatus,
                           i.enFacture as linkedEnFacture,
                           COALESCE(NULLIF(f.aiReadingStatus, ''), NULLIF(i.aiReadingStatus, ''), 'PENDIENTE') as aiReadingStatus,
                           COALESCE(NULLIF(f.aiShortSummary, ''), NULLIF(i.aiShortSummary, ''), '') as aiShortSummary
                    FROM facture_inbox_documents f
                    LEFT JOIN invoices i ON f.documentNumber = i.invoiceNumber
                    WHERE 1=1
                """
                params = []
                if folder and folder.lower() != "todos":
                    f_clean = folder.strip()
                    if f_clean.lower() in ["recibidos", "recibidos (crédito)", "recibidos (credito)"]:
                        sql += " AND f.folderType IN ('Recibidos', 'Recibidos (Crédito)')"
                    elif f_clean.lower() in ["contado", "recibidos (contado)", "recibidos ( contado )"]:
                        sql += " AND f.folderType IN ('Recibidos (contado)', 'Contado')"
                    elif f_clean.lower() in ["procesados (contado)", "procesados ( contado )"]:
                        sql += " AND f.folderType = 'Procesados (contado)'"
                    elif f_clean.lower() in ["procesados", "procesados (crédito)", "procesados (credito)"]:
                        sql += " AND f.folderType IN ('Procesados', 'Procesados (Crédito)')"
                    else:
                        sql += " AND (f.folderType = %s OR f.paymentType = %s)"
                        params.extend([f_clean, f_clean])
                if payment_type and payment_type.lower() != "todos":
                    sql += " AND f.paymentType = %s"
                    params.append(payment_type)
                if status_tab and status_tab.lower() != "todos":
                    sql += " AND f.statusTab = %s"
                    params.append(status_tab)
                if search and search.strip():
                    term = f"%{search.strip()}%"
                    sql += " AND (f.documentNumber LIKE %s OR f.issuerName LIKE %s OR f.issuerNit LIKE %s OR f.rawDetail LIKE %s)"
                    params.extend([term, term, term, term])
                sql += " ORDER BY GREATEST(COALESCE(NULLIF(f.emissionDate, ''), '1970-01-01'), COALESCE(NULLIF(f.receptionDate, ''), '1970-01-01')) DESC, f.receptionDate DESC, f.createdAt DESC LIMIT %s"
                params.append(limit)
                cur.execute(sql, tuple(params))
                rows = cur.fetchall()
                for r in rows:
                    if "detailAmount" in r and r["detailAmount"] is not None:
                        r["detailAmount"] = float(r["detailAmount"])
                    if not r.get("linkedInvoiceId"):
                        r["isSyncedToMain"] = 0

                    # Sanitizar aiShortSummary: NUNCA permitir texto genérico de recepción
                    ai_s = (r.get("aiShortSummary") or "").strip()
                    if "SE RECIBE DOCUMENTO" in ai_s.upper():
                        ai_s = ""

                    if not ai_s:
                        # Si no hay aiShortSummary, intentar construir a partir de itemsJson
                        raw_items = r.get("itemsJson")
                        if raw_items:
                            try:
                                itms = json.loads(raw_items) if isinstance(raw_items, str) else raw_items
                                if itms and isinstance(itms, list):
                                    built = InvoiceAIService._build_short_summary(itms, f"Servicio {r.get('issuerName')}")
                                    if built and "SE RECIBE DOCUMENTO" not in built.upper():
                                        ai_s = built
                            except Exception:
                                pass
                    if not ai_s and r.get("issuerName"):
                        ai_s = f"Servicio {r.get('issuerName')}"

                    r["aiShortSummary"] = ai_s
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

                # 1. Login & NIT
                await self._ensure_logged_in(page, username, password, nit)

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

                # Concepto por defecto sugerido (nunca usar el texto genérico de recepción de documento)
                if raw_detail and not "SE RECIBE DOCUMENTO" in raw_detail.upper() and len(raw_detail) < 60:
                    concept_title = raw_detail.strip()
                else:
                    concept_title = f"Servicio {clean_name}"
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

                if not best_concept or "SE RECIBE DOCUMENTO" in best_concept.upper():
                    first_srv = (factura_concepts[0].get("serviceName") or "").strip() if factura_concepts else ""
                    if first_srv and not "SE RECIBE DOCUMENTO" in first_srv.upper():
                        best_concept = first_srv
                    else:
                        best_concept = concept_title
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

    def import_to_main_invoices(self, facture_doc_id: str, area: Optional[str] = None) -> Dict[str, Any]:
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
                target_area = area or "General"

                # Validar si ya existe en invoices y si ya fue vinculada por otra área
                cur.execute("SELECT id, area, supplier, contractNumber, enFacture FROM invoices WHERE invoiceNumber = %s", (doc_num,))
                existing_inv = cur.fetchone()
                if existing_inv:
                    existing_area = (existing_inv.get("area") or "").strip()
                    if existing_area and existing_area != "General" and target_area != "General" and existing_area.lower() != target_area.lower():
                        raise ValueError(f"No se puede vincular: La factura {doc_num} ya fue vinculada previamente por el área '{existing_area}' al proveedor '{existing_inv.get('supplier')}'.")
                    if existing_inv.get("enFacture") == "SÍ":
                        raise ValueError(f"La factura {doc_num} ya se encuentra vinculada en el sistema. Cada factura solo debe vincularse una única vez.")

                ai_short = (doc.get("aiShortSummary") or "").strip()

                # 1. Matching inteligente de proveedor y concepto
                match_res = self.match_supplier_and_concept(
                    issuer_name=issuer,
                    issuer_nit=nit,
                    amount=amount,
                    raw_detail=ai_short or doc["rawDetail"] or ""
                )

                matched_concept = (ai_short or match_res["matchedConcept"]).strip()
                if not matched_concept or "SE RECIBE DOCUMENTO" in matched_concept.upper():
                    matched_concept = f"Servicio {sup_name}"
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
                        "area": target_area,
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
                    WHERE supplier = %s AND (service = %s OR service LIKE '%%Se recibe documento%%')
                      AND (invoiceNumber = '' OR invoiceNumber = 'COT-' OR invoiceNumber LIKE 'rec-%%') 
                      AND (value = 0 OR value IS NULL)
                    ORDER BY id ASC
                    LIMIT 1
                """, (sup_name, matched_concept))
                placeholder = cur.fetchone()

                items_json_str = doc.get("itemsJson") or None

                if placeholder:
                    # Reutilizar y actualizar el registro placeholder
                    inv_id = placeholder["id"]
                    cur.execute("""
                        UPDATE invoices 
                        SET invoiceNumber = %s,
                            area = %s,
                            service = %s,
                            emissionDate = %s,
                            deliveryDate = %s,
                            value = %s,
                            enFacture = 'SÍ',
                            aiShortSummary = %s,
                            itemsJson = IF(%s IS NOT NULL, %s, itemsJson),
                            dianEventsStatus = IF(%s IS NOT NULL, %s, dianEventsStatus)
                        WHERE id = %s
                    """, (doc_num, target_area, matched_concept, emission, reception, amount, ai_short or matched_concept, items_json_str, items_json_str, doc.get("dianEventsStatus") or "PENDIENTE", doc.get("dianEventsStatus") or "PENDIENTE", inv_id))
                else:
                    # Insertar nuevo registro
                    inv_id = f"inv-{doc_num.replace(' ', '-').replace('/', '-')}"
                    cur.execute("""
                        INSERT INTO invoices (
                            id, supplier, area, service, invoiceNumber, emissionDate, deliveryDate,
                            value, signed, orderStd, oc, enFacture, delivered, aiShortSummary,
                            itemsJson, dianEventsStatus
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE
                            supplier = VALUES(supplier),
                            area = VALUES(area),
                            service = VALUES(service),
                            value = VALUES(value),
                            enFacture = 'SÍ',
                            aiShortSummary = VALUES(aiShortSummary),
                            itemsJson = IF(VALUES(itemsJson) IS NOT NULL, VALUES(itemsJson), itemsJson);
                    """, (
                        inv_id,
                        sup_name,
                        target_area,
                        matched_concept,
                        doc_num,
                        emission,
                        reception,
                        amount,
                        "NO",
                        "NO",
                        "",
                        "SÍ",
                        "NO",
                        ai_short or matched_concept,
                        items_json_str,
                        doc.get("dianEventsStatus") or "PENDIENTE"
                    ))

                # 3. Marcar documento como sincronizado
                cur.execute("UPDATE facture_inbox_documents SET isSyncedToMain = 1, aiShortSummary = IF(%s != '', %s, aiShortSummary) WHERE id = %s", (ai_short, ai_short, facture_doc_id))

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

    def unlink_document(self, document_number: str) -> Dict[str, Any]:
        """
        Desvincula un documento de Facture.co de la tabla principal de invoices
        y de sap_presolicitudes, reseteando su estado para poder ser vinculado de nuevo.
        """
        clean_doc = document_number.strip()
        sup_name = ""
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, supplier FROM invoices WHERE invoiceNumber = %s", (clean_doc,))
                inv = cur.fetchone()
                if inv:
                    sup_name = inv.get("supplier") or ""

        self.repo.unlink_facture_document(clean_doc)

        self.add_audit_log(
            action_type="UNLINK_DOCUMENT",
            status="SUCCESS",
            message=f"Documento {clean_doc} desvinculado de {sup_name or 'facturas'}. Ahora disponible para volver a vincular.",
            doc_number=clean_doc,
            issuer=sup_name
        )
        return {"success": True, "message": f"Documento {clean_doc} desvinculado correctamente"}

    def evaluate_recurrent_match(self, doc_data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Reconoce automáticamente si una factura de Facture.co corresponde a un contrato/proveedor recurrente:
        - Mismo NIT o Mismo Proveedor
        - Variación de valor dentro de tolerancia (±10%)
        - Reutiliza lectura AI previa sin consumir nuevos tokens.
        """
        clean_nit = (doc_data.get("issuerNit") or "").strip()
        issuer_name = (doc_data.get("issuerName") or "").strip()
        doc_amount = float(doc_data.get("detailAmount") or 0.0)
        doc_num = (doc_data.get("documentNumber") or "").strip()

        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                # 1. Buscar proveedor
                cur.execute("""
                    SELECT id, name, nit, area, services 
                    FROM suppliers 
                    WHERE (nit != '' AND nit = %s) OR LOWER(name) = LOWER(%s)
                """, (clean_nit, issuer_name))
                sup = cur.fetchone()
                if not sup:
                    return None

                sup_name = sup["name"]
                
                # 2. Buscar facturas históricas del mismo proveedor con ítems leídos o contrato
                cur.execute("""
                    SELECT id, invoiceNumber, service, value, contractNumber, area, itemsJson, aiShortSummary, emissionDate
                    FROM invoices 
                    WHERE (supplier = %s OR id LIKE %s) AND value > 0 AND invoiceNumber != %s
                    ORDER BY createdAt DESC
                    LIMIT 20
                """, (sup_name, f"%{sup['id']}%", doc_num))
                candidates = cur.fetchall()

                best_candidate = None
                best_diff_pct = 999.0
                match_reason = ""

                for cand in candidates:
                    cand_val = float(cand.get("value") or 0.0)
                    if cand_val <= 0:
                        continue
                    diff_pct = abs(doc_amount - cand_val) / cand_val * 100.0
                    
                    # Tolerancia de valor (±10%)
                    if diff_pct <= 10.0:
                        if diff_pct < best_diff_pct:
                            best_diff_pct = diff_pct
                            best_candidate = cand
                            match_reason = (
                                f"Mismo NIT ({clean_nit}) y Proveedor '{sup_name}'. "
                                f"Variación de monto de {diff_pct:.1f}% respecto a factura previa {cand.get('invoiceNumber')} (${cand_val:,.2f}) (tolerancia ±10%)."
                            )

                if best_candidate:
                    return {
                        "parentId": best_candidate["id"],
                        "parentInvoiceNumber": best_candidate.get("invoiceNumber"),
                        "supplier": sup_name,
                        "area": best_candidate.get("area") or "General",
                        "contractNumber": best_candidate.get("contractNumber") or "",
                        "aiShortSummary": best_candidate.get("aiShortSummary") or best_candidate.get("service"),
                        "itemsJson": best_candidate.get("itemsJson"),
                        "matchReason": match_reason,
                        "valueTolerancePercent": round(best_diff_pct, 2)
                    }
        return None

    def approve_ai_reading(self, document_number: str) -> Dict[str, Any]:
        """
        Aprueba la lectura inteligente realizada por AI.
        Pasa el estado a 'APROBADA' y sincroniza con invoices si ya está vinculada.
        """
        clean_doc = document_number.strip()
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE facture_inbox_documents 
                    SET aiReadingStatus = 'APROBADA', updatedAt = NOW()
                    WHERE documentNumber = %s OR id = %s
                """, (clean_doc, f"facture-{clean_doc.replace(' ', '-').replace('/', '-')}"))

                cur.execute("""
                    SELECT aiShortSummary, itemsJson, rawDetail, issuerName FROM facture_inbox_documents 
                    WHERE documentNumber = %s OR id = %s
                """, (clean_doc, f"facture-{clean_doc.replace(' ', '-').replace('/', '-')}"))
                row = cur.fetchone()
                ai_short = (row.get("aiShortSummary") or "").strip() if row else ""

                if not ai_short or "SE RECIBE DOCUMENTO" in ai_short.upper():
                    raw_items = row.get("itemsJson") if row else None
                    if raw_items:
                        try:
                            itms = json.loads(raw_items) if isinstance(raw_items, str) else raw_items
                            if itms and isinstance(itms, list):
                                built = InvoiceAIService._build_short_summary(itms, f"Servicio {(row and row.get('issuerName')) or 'Facturación'}")
                                if built and "SE RECIBE DOCUMENTO" not in built.upper():
                                    ai_short = built
                        except Exception:
                            pass
                if not ai_short or "SE RECIBE DOCUMENTO" in ai_short.upper():
                    ai_short = f"Servicio {(row and row.get('issuerName')) or 'Facturación'}"

                cur.execute("""
                    UPDATE facture_inbox_documents 
                    SET aiReadingStatus = 'APROBADA', aiShortSummary = %s, updatedAt = NOW()
                    WHERE documentNumber = %s OR id = %s
                """, (ai_short, clean_doc, f"facture-{clean_doc.replace(' ', '-').replace('/', '-')}"))

                if ai_short:
                    cur.execute("""
                        UPDATE invoices 
                        SET aiShortSummary = %s,
                            service = %s,
                            updatedAt = NOW()
                        WHERE invoiceNumber = %s
                    """, (ai_short, ai_short, clean_doc))

                    # También actualizar en suppliers.services si el proveedor tiene este servicio
                    iss_name = (row.get("issuerName") or "").strip() if row else ""
                    if iss_name:
                        cur.execute("SELECT id, services FROM suppliers WHERE LOWER(name) = LOWER(%s)", (iss_name,))
                        sup_r = cur.fetchone()
                        if sup_r and sup_r.get("services"):
                            try:
                                srv_arr = json.loads(sup_r["services"]) if isinstance(sup_r["services"], str) else sup_r["services"]
                                changed = False
                                for s in srv_arr:
                                    s_name = s.get("serviceName", "")
                                    if "SE RECIBE DOCUMENTO" in s_name.upper() or s.get("aiShortSummary"):
                                        s["serviceName"] = ai_short
                                        s["aiShortSummary"] = ai_short
                                        changed = True
                                if changed:
                                    cur.execute("UPDATE suppliers SET services = %s WHERE id = %s", (json.dumps(srv_arr, ensure_ascii=False), sup_r["id"]))
                            except Exception:
                                pass

        self.add_audit_log(
            action_type="APPROVE_AI_READING",
            status="SUCCESS",
            message=f"Lectura AI para factura {clean_doc} aprobada por el usuario.",
            doc_number=clean_doc
        )
        return {
            "success": True,
            "documentNumber": clean_doc,
            "aiReadingStatus": "APROBADA",
            "message": f"Lectura AI para la factura {clean_doc} aprobada con éxito."
        }

    def auto_match_and_link_recurrent_invoices(self, target_year: str = "2026", target_month: str = "Noviembre") -> Dict[str, Any]:
        """
        Escanea automáticamente todos los documentos de Facture.co:
        1. Extrae o valida la descripción e ítems del PDF.
        2. Valida contra facturas de los 2 últimos meses por proveedor, valor similar (±15%) e ítems/conceptos similares.
        3. Marca la factura en Facturas / Cotizaciones con `enFacture = 'SÍ'`, vincula el documento.
        4. Pre-llena automáticamente la plantilla SAP (pre-solicitud) para que quede lista para revisión.
        5. Devuelve la lista de facturas vinculadas y listas para Acuse, Aceptación, Recibo y Firma.
        """
        matched_results = []
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                # Obtener documentos de Facture no vinculados a una factura activa
                cur.execute("""
                    SELECT f.*, i.id as linkedInvoiceId, i.enFacture as linkedEnFacture
                    FROM facture_inbox_documents f
                    LEFT JOIN invoices i ON f.documentNumber = i.invoiceNumber
                    WHERE i.id IS NULL OR i.enFacture != 'SÍ' OR f.isSyncedToMain = 0
                    ORDER BY f.emissionDate DESC
                """)
                unlinked_docs = cur.fetchall()

                # Asegurar que existan conceptos en Facturas / Cotizaciones para el mes
                month_tag = f"{target_year}-{target_month.lower()}"

                for doc in unlinked_docs:
                    doc_num = doc.get("documentNumber") or ""
                    doc_amount = float(doc.get("detailAmount") or 0.0)
                    if not doc_num or doc_amount <= 0:
                        continue

                    # Extraer texto/descripción si falta
                    clean_doc = doc_num.strip()
                    expected_pdf_name = f"Factura_{clean_doc.replace(' ', '_').replace('/', '_')}.pdf"
                    pdf_full_path = os.path.join(UPLOADS_DIR, expected_pdf_name)
                    
                    extracted_summary = doc.get("aiShortSummary") or ""
                    extracted_items = []
                    if doc.get("itemsJson"):
                        try:
                            extracted_items = json.loads(doc["itemsJson"]) if isinstance(doc["itemsJson"], str) else doc["itemsJson"]
                        except Exception:
                            extracted_items = []

                    if os.path.exists(pdf_full_path) and (not extracted_summary or "SE RECIBE DOCUMENTO" in extracted_summary.upper() or not extracted_items):
                        try:
                            pdf_text = InvoiceAIService.extract_text_from_pdf(pdf_full_path)
                            if pdf_text:
                                analysis = InvoiceAIService._deterministic_invoice_parser(pdf_text, {
                                    "numeroFactura": clean_doc,
                                    "emisor": {"razonSocial": doc.get("issuerName"), "nit": doc.get("issuerNit")},
                                    "totalConIva": doc_amount
                                })
                                if analysis and analysis.get("items"):
                                    extracted_items = analysis["items"]
                                    extracted_summary = analysis.get("resumenCorto") or InvoiceAIService._build_short_summary(extracted_items, doc.get("rawDetail") or "")
                                    cur.execute("""
                                        UPDATE facture_inbox_documents
                                        SET aiShortSummary = %s, itemsJson = %s, aiReadingStatus = 'APROBADA', updatedAt = NOW()
                                        WHERE id = %s
                                    """, (extracted_summary, json.dumps(extracted_items, ensure_ascii=False), doc["id"]))
                                    doc["aiShortSummary"] = extracted_summary
                                    doc["itemsJson"] = json.dumps(extracted_items, ensure_ascii=False)
                        except Exception:
                            pass

                    # Evaluar coincidencia recurrente con los últimos 2 meses
                    recurrent = self.evaluate_recurrent_match(doc)
                    if not recurrent:
                        continue

                    sup_name = recurrent["supplier"]
                    sup_area = recurrent.get("area") or "Tecnología (TI)"
                    srv_desc = extracted_summary or recurrent.get("aiShortSummary") or f"Servicio {sup_name}"
                    if "SE RECIBE DOCUMENTO" in srv_desc.upper():
                        srv_desc = recurrent.get("aiShortSummary") or f"Servicio {sup_name}"

                    # Buscar factura objetivo en el mes actual (plantilla en blanco o existente para este proveedor)
                    cur.execute("""
                        SELECT id, invoiceNumber, service, value, area, enFacture 
                        FROM invoices 
                        WHERE (LOWER(supplier) = LOWER(%s) OR id LIKE %s)
                          AND (id LIKE %s OR emissionDate LIKE %s)
                          AND (invoiceNumber IS NULL OR invoiceNumber = '' OR invoiceNumber = %s OR value = 0)
                        LIMIT 1
                    """, (sup_name, f"%{recurrent.get('parentId', '')}%", f"%{month_tag}%", f"{target_year}-11%", clean_doc))
                    target_inv = cur.fetchone()

                    target_inv_id = None
                    if target_inv:
                        target_inv_id = target_inv["id"]
                        cur.execute("""
                            UPDATE invoices
                            SET invoiceNumber = %s,
                                value = %s,
                                emissionDate = %s,
                                dueDate = %s,
                                area = %s,
                                service = %s,
                                aiShortSummary = %s,
                                itemsJson = %s,
                                enFacture = 'SÍ',
                                aiReadingStatus = 'APROBADA',
                                pdfPath = %s,
                                recurrentParentId = %s,
                                recurrentMatchReason = %s,
                                updatedAt = NOW()
                            WHERE id = %s
                        """, (
                            clean_doc,
                            doc_amount,
                            doc.get("emissionDate") or f"{target_year}-11-01",
                            doc.get("dueDate") or "",
                            sup_area,
                            srv_desc,
                            srv_desc,
                            json.dumps(extracted_items, ensure_ascii=False) if extracted_items else recurrent.get("itemsJson"),
                            f"uploads/invoices/{expected_pdf_name}" if os.path.exists(pdf_full_path) else None,
                            recurrent["parentId"],
                            recurrent["matchReason"],
                            target_inv_id
                        ))
                    else:
                        # Crear la factura vinculada para el nuevo mes
                        target_inv_id = f"inv-{clean_doc.replace(' ', '-').replace('/', '-')}"
                        cur.execute("""
                            INSERT INTO invoices (
                                id, supplier, area, service, invoiceNumber, emissionDate, dueDate,
                                value, signed, orderStd, oc, enFacture, delivered, approvalStatus,
                                aiShortSummary, itemsJson, aiReadingStatus, pdfPath, recurrentParentId, recurrentMatchReason
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE 
                                invoiceNumber = VALUES(invoiceNumber),
                                value = VALUES(value),
                                enFacture = 'SÍ',
                                aiReadingStatus = 'APROBADA';
                        """, (
                            target_inv_id,
                            sup_name,
                            sup_area,
                            srv_desc,
                            clean_doc,
                            doc.get("emissionDate") or f"{target_year}-11-01",
                            doc.get("dueDate") or "",
                            doc_amount,
                            "NO",
                            "NO",
                            "",
                            "SÍ",
                            "NO",
                            "PENDIENTE",
                            srv_desc,
                            json.dumps(extracted_items, ensure_ascii=False) if extracted_items else recurrent.get("itemsJson"),
                            "APROBADA",
                            f"uploads/invoices/{expected_pdf_name}" if os.path.exists(pdf_full_path) else None,
                            recurrent["parentId"],
                            recurrent["matchReason"]
                        ))

                    # Vincular documento en Facture
                    cur.execute("""
                        UPDATE facture_inbox_documents
                        SET isSyncedToMain = 1,
                            aiReadingStatus = 'APROBADA',
                            aiShortSummary = %s,
                            updatedAt = NOW()
                        WHERE id = %s
                    """, (srv_desc, doc["id"]))

                    # Pre-llenar automáticamente plantilla SAP para que quede lista para revisión
                    try:
                        self.repo.get_or_create_sap_presolicitud(target_inv_id)
                    except Exception as sap_err:
                        print(f"Aviso llenado automático SAP para {target_inv_id}: {sap_err}")

                    matched_results.append({
                        "documentNumber": clean_doc,
                        "supplier": sup_name,
                        "area": sup_area,
                        "amount": doc_amount,
                        "service": srv_desc,
                        "invoiceId": target_inv_id,
                        "reason": recurrent["matchReason"]
                    })

                    self.add_audit_log(
                        action_type="AUTO_RECURRENT_LINK",
                        status="SUCCESS",
                        message=f"Factura {clean_doc} vinculada automáticamente con {sup_name} ({srv_desc}) y plantilla SAP generada.",
                        doc_number=clean_doc,
                        issuer=sup_name
                    )

        return {
            "success": True,
            "matchedCount": len(matched_results),
            "matchedInvoices": matched_results,
            "message": f"Se procesaron y vincularon automáticamente {len(matched_results)} facturas de Facture recurrentes con su plantilla SAP lista para revisión."
        }

    async def inspect_and_analyze_invoice(self, target_doc_number: str, force_download: bool = False, force_reanalysis: bool = False) -> Dict[str, Any]:
        """
        Descarga la factura en PDF desde Facture.co (si no está descargada),
        ejecuta la lectura inteligente (IA / PDF Parser) para extraer ítems, precios,
        subtotal sin IVA, IVA discriminado y totales, y sugiere la vinculación a Proveedor.
        Protege tokens de IA reutilizando lecturas previas aprobadas o realizadas a menos que se fuerce reanálisis.
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
                "rawDetail": "",
                "aiReadingStatus": "PENDIENTE",
                "aiShortSummary": ""
            }

        current_status = doc_data.get("aiReadingStatus") or "PENDIENTE"
        has_cached_items = False
        cached_items = []
        if doc_data.get("itemsJson"):
            try:
                cached_items = json.loads(doc_data["itemsJson"]) if isinstance(doc_data["itemsJson"], str) else doc_data["itemsJson"]
                if isinstance(cached_items, list) and len(cached_items) > 0:
                    has_cached_items = True
            except Exception:
                pass

        # 1. PROTECCIÓN DE TOKENS Y CONSENSO:
        # Solo reutilizar si la lectura fue explícitamente APROBADA o si ya tiene CONSENSO CONFIRMADO con ítems válidos
        is_approved = (current_status == "APROBADA")
        is_consensus_confirmed = bool(doc_data.get("consensusConfirmed"))
        is_generic_single_item = (len(cached_items) == 1 and any(
            g in (cached_items[0].get("descripcion") or "").upper() 
            for g in ["SE RECIBE DOCUMENTO", "SERVICIO / SUMINISTRO"]
        ))
        valid_cached_reading = (has_cached_items and not is_generic_single_item and is_consensus_confirmed)

        if not force_reanalysis and (is_approved or valid_cached_reading):
            subtotal = float(doc_data.get("subtotalAmount") or 0.0)
            iva = float(doc_data.get("ivaAmount") or 0.0)
            total = float(doc_data.get("detailAmount") or 0.0)
            short_sum = doc_data.get("aiShortSummary") or InvoiceAIService._build_short_summary(cached_items, doc_data.get("rawDetail") or "")

            analysis = {
                "emisor": {"razonSocial": doc_data.get("issuerName"), "nit": doc_data.get("issuerNit")},
                "receptor": {"razonSocial": "ALIMENTOS ENRIKO SAS", "nit": "890330035-2"},
                "numeroFactura": clean_doc,
                "numeroReferencia": doc_data.get("referenceNumber") or "",
                "numeroContrato": doc_data.get("contractNumber") or "",
                "fechaEmision": doc_data.get("emissionDate"),
                "fechaVencimiento": doc_data.get("dueDate"),
                "subtotalSinIva": subtotal,
                "totalIva": iva,
                "totalConIva": total,
                "totalPagarNeto": total,
                "items": cached_items,
                "resumenCorto": short_sum,
                "conceptoPrincipalSugerido": short_sum,
                "resumenEjecutivo": doc_data.get("aiSummary") or f"Factura {clean_doc} de {doc_data.get('issuerName')} por ${total:,.2f} ({len(cached_items)} ítems)",
                "aiReadingStatus": current_status,
                "aiReused": True,
                "tokensConsumed": 0
            }

            supplier_match = self.match_supplier_and_concept(
                issuer_name=doc_data.get("issuerName") or "",
                issuer_nit=doc_data.get("issuerNit") or "",
                amount=total,
                raw_detail=short_sum
            )

            linked_invoice = None
            with self.repo.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, area, supplier, contractNumber, enFacture, approvalStatus, dianEventsStatus, aiShortSummary FROM invoices WHERE invoiceNumber = %s", (clean_doc,))
                    linked_invoice = cur.fetchone()

            recurrent_match = self.evaluate_recurrent_match(doc_data)

            return {
                "success": True,
                "documentNumber": clean_doc,
                "analysis": analysis,
                "supplierMatch": supplier_match,
                "linkedInvoice": linked_invoice,
                "recurrentMatch": recurrent_match,
                "dianEventsStatus": (linked_invoice.get("dianEventsStatus") if linked_invoice else None) or ("COMPLETADO" if doc_data.get("dianStatus") == "ACEPTADO" else "PENDIENTE"),
                "dianStatus": doc_data.get("dianStatus") or "PENDIENTE",
                "pdfAvailable": os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100,
                "aiSkipped": False,
                "aiReused": True,
                "aiReadingStatus": current_status,
                "pdfUrl": f"/uploads/invoices/{expected_pdf_name}" if os.path.exists(dest_pdf_path) else None
            }

        # 2. PROTECCIÓN DE TOKENS: Reconocimiento Automático de Recurrente
        recurrent_match = self.evaluate_recurrent_match(doc_data)
        if recurrent_match and not force_reanalysis and recurrent_match.get("itemsJson"):
            try:
                parent_items = json.loads(recurrent_match["itemsJson"]) if isinstance(recurrent_match["itemsJson"], str) else recurrent_match["itemsJson"]
            except Exception:
                parent_items = []
            if parent_items:
                short_sum = recurrent_match.get("aiShortSummary") or InvoiceAIService._build_short_summary(parent_items)
                total = float(doc_data.get("detailAmount") or 0.0)
                subtotal = round(total / 1.19, 2)
                iva = round(total - subtotal, 2)

                analysis = {
                    "emisor": {"razonSocial": doc_data.get("issuerName") or recurrent_match.get("supplier"), "nit": doc_data.get("issuerNit")},
                    "receptor": {"razonSocial": "ALIMENTOS ENRIKO SAS", "nit": "890330035-2"},
                    "numeroFactura": clean_doc,
                    "numeroReferencia": doc_data.get("referenceNumber") or "",
                    "numeroContrato": recurrent_match.get("contractNumber") or "",
                    "fechaEmision": doc_data.get("emissionDate"),
                    "fechaVencimiento": doc_data.get("dueDate"),
                    "subtotalSinIva": subtotal,
                    "totalIva": iva,
                    "totalConIva": total,
                    "totalPagarNeto": total,
                    "items": parent_items,
                    "resumenCorto": short_sum,
                    "conceptoPrincipalSugerido": short_sum,
                    "resumenEjecutivo": f"Factura recurrente {clean_doc} emparejada con {recurrent_match.get('parentInvoiceNumber')} ({len(parent_items)} ítems)",
                    "aiReadingStatus": "LECTURA REALIZADA",
                    "aiReused": True,
                    "tokensConsumed": 0,
                    "recurrentMatch": recurrent_match
                }

                with self.repo.get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("""
                            UPDATE facture_inbox_documents
                            SET subtotalAmount = %s,
                                ivaAmount = %s,
                                itemsJson = %s,
                                aiShortSummary = %s,
                                aiReadingStatus = 'LECTURA REALIZADA',
                                contractNumber = IF(%s != '', %s, contractNumber)
                            WHERE documentNumber = %s OR id = %s
                        """, (subtotal, iva, json.dumps(parent_items), short_sum, recurrent_match.get("contractNumber", ""), recurrent_match.get("contractNumber", ""), clean_doc, f"facture-{clean_doc}"))

                supplier_match = self.match_supplier_and_concept(
                    issuer_name=doc_data.get("issuerName") or recurrent_match.get("supplier"),
                    issuer_nit=doc_data.get("issuerNit") or "",
                    amount=total,
                    raw_detail=short_sum
                )

                linked_invoice = None
                with self.repo.get_connection() as conn:
                    with conn.cursor() as cur:
                        cur.execute("SELECT id, area, supplier, contractNumber, enFacture, approvalStatus, dianEventsStatus, aiShortSummary FROM invoices WHERE invoiceNumber = %s", (clean_doc,))
                        linked_invoice = cur.fetchone()

                return {
                    "success": True,
                    "documentNumber": clean_doc,
                    "analysis": analysis,
                    "supplierMatch": supplier_match,
                    "linkedInvoice": linked_invoice,
                    "recurrentMatch": recurrent_match,
                    "dianEventsStatus": (linked_invoice.get("dianEventsStatus") if linked_invoice else None) or ("COMPLETADO" if doc_data.get("dianStatus") == "ACEPTADO" else "PENDIENTE"),
                    "dianStatus": doc_data.get("dianStatus") or "PENDIENTE",
                    "pdfAvailable": os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100,
                    "aiSkipped": False,
                    "aiReused": True,
                    "aiReadingStatus": "LECTURA REALIZADA",
                    "pdfUrl": f"/uploads/invoices/{expected_pdf_name}" if os.path.exists(dest_pdf_path) else None
                }

        # 3. Marcar estado como 'LEYENDO' en BD
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE facture_inbox_documents 
                    SET aiReadingStatus = 'LEYENDO', updatedAt = NOW()
                    WHERE documentNumber = %s OR id = %s
                """, (clean_doc, f"facture-{clean_doc.replace(' ', '-').replace('/', '-')}"))

        # 4. Verificar si el PDF existente en disco coincide realmente con esta factura
        alt_clean = self._normalize_doc_id(clean_doc)
        alt_pdf_path = os.path.join(UPLOADS_DIR, f"Factura_{alt_clean}.pdf")
        if not os.path.exists(dest_pdf_path) and os.path.exists(alt_pdf_path) and os.path.getsize(alt_pdf_path) > 100:
            try:
                import shutil
                shutil.copyfile(alt_pdf_path, dest_pdf_path)
            except Exception:
                pass

        if os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100 and not force_download:
            try:
                pdf_text = InvoiceAIService.extract_text_from_pdf(dest_pdf_path)
                clean_num_only = re.sub(r"^[A-Z\-_]+", "", clean_doc).strip()
                if clean_doc.upper() not in pdf_text.upper() and (clean_num_only and clean_num_only not in pdf_text):
                    print(f"[AVISO] El PDF en disco {dest_pdf_path} no corresponde a la factura {clean_doc}. Eliminando archivo cruzado para re-descargar.")
                    try: os.remove(dest_pdf_path)
                    except Exception: pass
            except Exception as e:
                print(f"Error verificando PDF en disco: {e}")

        # 5. Descargar PDF vía Playwright ÚNICAMENTE si no existe en disco o si se solicitó force_download
        pdf_already_on_disk = os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100
        if not pdf_already_on_disk or force_download:
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
                    await self._ensure_logged_in(page, username, password, nit)

                    # Navegar y buscar documento en su carpeta correspondiente o global
                    folder_hint = (doc_data.get("folderType") or "Recibidos").lower()
                    await self._navigate_to_inbox_recibidos(page)

                    found = False
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

                    if not found:
                        await self._navigate_to_inbox_recibidos(page)
                        found = await self._find_and_open_invoice_with_pagination(page, clean_doc, max_pages=15)

                    if found:
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

                        download_btn = page.locator(
                            'button:has(mat-icon:has-text("get_app")), '
                            'button[mattooltip="Descargar PDF"]:has(mat-icon:has-text("get_app")), '
                            'mat-icon:has-text("get_app"), '
                            'button[mattooltip="Descargar PDF"]'
                        ).first
                        if await download_btn.count() > 0:
                            try:
                                await download_btn.wait_for(state="visible", timeout=8000)
                                async with page.expect_download(timeout=25000) as download_info:
                                    await download_btn.click()
                                download = await download_info.value
                                await download.save_as(dest_pdf_path)
                                ensure_extracted_pdf(dest_pdf_path)

                                if alt_pdf_path != dest_pdf_path and os.path.exists(dest_pdf_path):
                                    try:
                                        import shutil
                                        shutil.copyfile(dest_pdf_path, alt_pdf_path)
                                    except Exception:
                                        pass

                                with self.repo.get_connection() as conn:
                                    with conn.cursor() as cur:
                                        cur.execute("""
                                            UPDATE facture_inbox_documents 
                                            SET pdfDownloaded = 1, pdfPath = %s, updatedAt = NOW()
                                            WHERE documentNumber = %s OR documentNumber = %s OR id = %s
                                        """, (dest_pdf_path, clean_doc, doc_data.get("documentNumber", clean_doc), doc_data.get("id", "")))
                            except Exception as dl_err:
                                print(f"Aviso durante descarga de PDF: {dl_err}")
                                pass

                    await browser.close()
            except Exception as e:
                print(f"Error descargando PDF en vivo: {e}")

        # 6. Validación de disponibilidad del PDF físico antes de llamar a la IA
        pdf_exists = os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100

        if not pdf_exists:
            print(f"[AVISO] Factura {clean_doc}: PDF no disponible. Omitiendo lectura con IA para no gastar tokens.")
            analysis = InvoiceAIService._deterministic_invoice_parser("", doc_data)
            analysis["aiSkipped"] = True
            analysis["aiReason"] = "El visor no encontró el archivo PDF físico de la factura. Se omitió la llamada a IA para proteger tokens."

            supplier_match = self.match_supplier_and_concept(
                issuer_name=doc_data.get("issuerName") or "",
                issuer_nit=doc_data.get("issuerNit") or "",
                amount=float(doc_data.get("detailAmount") or 0.0),
                raw_detail=analysis.get("resumenCorto") or doc_data.get("rawDetail") or ""
            )

            linked_invoice = None
            with self.repo.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT id, area, supplier, contractNumber, enFacture, approvalStatus, dianEventsStatus, aiShortSummary FROM invoices WHERE invoiceNumber = %s", (clean_doc,))
                    linked_invoice = cur.fetchone()

            with self.repo.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute("UPDATE facture_inbox_documents SET aiReadingStatus = 'PENDIENTE' WHERE documentNumber = %s OR id = %s", (clean_doc, f"facture-{clean_doc}"))

            return {
                "success": True,
                "documentNumber": clean_doc,
                "analysis": analysis,
                "supplierMatch": supplier_match,
                "linkedInvoice": linked_invoice,
                "recurrentMatch": recurrent_match,
                "pdfAvailable": False,
                "aiSkipped": True,
                "aiReadingStatus": "PENDIENTE",
                "message": "El visor no encontró el archivo PDF de la factura. Se omitió la lectura con IA para no consumir tokens.",
                "pdfUrl": None
            }

        # 7. Análisis con IA Multimodal (Gemini AI)
        analysis = InvoiceAIService.analyze_invoice_pdf(dest_pdf_path, doc_data)

        # 8. Matching de Proveedor y Concepto
        supplier_match = self.match_supplier_and_concept(
            issuer_name=doc_data.get("issuerName") or analysis["emisor"]["razonSocial"],
            issuer_nit=doc_data.get("issuerNit") or analysis["emisor"]["nit"],
            amount=float(analysis.get("totalConIva") or doc_data.get("detailAmount") or 0.0),
            raw_detail=analysis.get("resumenCorto") or analysis.get("conceptoPrincipalSugerido") or doc_data.get("rawDetail") or ""
        )

        # 9. Actualizar base de datos con los resultados del análisis
        items_json_str = json.dumps(analysis.get("items", []))
        detected_contract = analysis.get("numeroContrato") or ""
        short_summary = analysis.get("resumenCorto") or ""
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE facture_inbox_documents
                    SET subtotalAmount = %s,
                        ivaAmount = %s,
                        itemsJson = %s,
                        aiSummary = %s,
                        aiShortSummary = %s,
                        aiReadingStatus = 'LECTURA REALIZADA',
                        contractNumber = IF(%s != '', %s, contractNumber),
                        dueDate = IF(%s != '', %s, dueDate),
                        pdfDownloaded = IF(%s = 1, 1, pdfDownloaded),
                        pdfPath = IF(%s != '', %s, pdfPath),
                        consensusConfirmed = %s,
                        verificationPasses = %s
                    WHERE documentNumber = %s OR id = %s
                """, (
                    analysis.get("subtotalSinIva", 0.0),
                    analysis.get("totalIva", 0.0),
                    items_json_str,
                    analysis.get("resumenEjecutivo", ""),
                    short_summary,
                    detected_contract, detected_contract,
                    doc_data.get("dueDate", ""), doc_data.get("dueDate", ""),
                    1 if os.path.exists(dest_pdf_path) else 0,
                    dest_pdf_path if os.path.exists(dest_pdf_path) else "",
                    dest_pdf_path if os.path.exists(dest_pdf_path) else "",
                    1 if analysis.get("consensusConfirmed") else 0,
                    int(analysis.get("verificationPasses") or 2),
                    clean_doc, f"facture-{clean_doc.replace(' ', '-').replace('/', '-')}"
                ))

                # Si ya existe en invoices, actualizar aiShortSummary
                cur.execute("""
                    UPDATE invoices
                    SET aiShortSummary = %s,
                        service = IF(service = '' OR service LIKE '%%Se recibe documento%%', %s, service)
                    WHERE invoiceNumber = %s
                """, (short_summary, short_summary, clean_doc))

        linked_invoice = None
        with self.repo.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, area, supplier, contractNumber, enFacture, approvalStatus, dianEventsStatus, aiShortSummary FROM invoices WHERE invoiceNumber = %s", (clean_doc,))
                linked_invoice = cur.fetchone()

        analysis["aiReadingStatus"] = "LECTURA REALIZADA"
        return {
            "success": True,
            "documentNumber": clean_doc,
            "analysis": analysis,
            "supplierMatch": supplier_match,
            "linkedInvoice": linked_invoice,
            "recurrentMatch": recurrent_match,
            "dianEventsStatus": (linked_invoice.get("dianEventsStatus") if linked_invoice else None) or ("COMPLETADO" if doc_data.get("dianStatus") == "ACEPTADO" else "PENDIENTE"),
            "dianStatus": doc_data.get("dianStatus") or "PENDIENTE",
            "pdfAvailable": True,
            "aiSkipped": bool(analysis.get("aiSkipped", False)),
            "aiReadingStatus": "LECTURA REALIZADA",
            "pdfUrl": f"/uploads/invoices/{expected_pdf_name}" if os.path.exists(dest_pdf_path) else None
        }

    async def _ensure_logged_in(self, page, username: str, password: str, nit: str) -> None:
        """
        Garantiza autenticación confiable y rápida en Facture.co:
        - Si la página ya tiene sesión activa o redirigió a /home, /documentos, /inbox, no re-autentica.
        - Usa 'domcontentloaded' para evitar cuelgues causados por 'networkidle' en Angular.
        - Selectores múltiples y tolerantes para el campo de usuario (#mat-input-0, formcontrolname, placeholder).
        - Manejo seguro de formulario de selección de NIT.
        """
        current_url = page.url or ""
        if any(p in current_url for p in ["/home", "/documentos", "/inbox", "/welcome"]):
            try:
                if await page.locator('text="Documentos"').count() > 0:
                    return
            except Exception:
                pass

        try:
            await page.goto(LOGIN_URL, wait_until="domcontentloaded", timeout=40000)
        except Exception:
            await page.goto(LOGIN_URL, wait_until="load", timeout=40000)

        await page.wait_for_timeout(1500)

        # Si ya se redirigió directamente a la pantalla principal
        if any(p in (page.url or "") for p in ["/home", "/documentos", "/inbox"]):
            return

        # Selector tolerante para el campo usuario
        user_input = page.locator('input[formcontrolname="usernameField"], input[placeholder*="Usuario"], #mat-input-0, input[type="text"]').first
        try:
            await user_input.wait_for(state="visible", timeout=20000)
        except Exception:
            # Si ya se encuentra en pantalla de NIT o menú principal
            nit_check = page.locator('.cdk-overlay-pane input[formcontrolname="nit"], input[formcontrolname="nit"], #mat-input-2, input[placeholder*="NIT"]').first
            if await nit_check.count() > 0 and await nit_check.is_visible():
                await nit_check.fill(nit)
                send_btn = page.locator('.cdk-overlay-pane button:has-text("Enviar"), mat-dialog-container button:has-text("Enviar"), button:has-text("Enviar")').first
                if await send_btn.count() > 0:
                    await send_btn.click(force=True)
                else:
                    await nit_check.press("Enter")
                await page.wait_for_timeout(3500)
                return
            if await page.locator('text="Documentos"').count() > 0:
                return
            # Reintento con reload
            await page.reload(wait_until="domcontentloaded", timeout=25000)
            await page.wait_for_timeout(2000)
            user_input = page.locator('input[formcontrolname="usernameField"], input[placeholder*="Usuario"], #mat-input-0').first
            await user_input.wait_for(state="visible", timeout=15000)

        await user_input.fill(username)

        pass_input = page.locator('input[formcontrolname="passwordField"], input[placeholder*="Contraseña"], #mat-input-1, input[type="password"]').first
        await pass_input.fill(password)

        submit_btn = page.locator('button[type="submit"], button:has-text("Iniciar sesión"), button:has-text("Ingresar")').first
        await submit_btn.click()
        await page.wait_for_timeout(3500)

        # Modal de selección de NIT de la empresa
        nit_input = page.locator('.cdk-overlay-pane input[formcontrolname="nit"], input[formcontrolname="nit"], input[placeholder*="NIT"]').first
        if await nit_input.count() > 0 and await nit_input.is_visible():
            await nit_input.fill(nit)
            send_btn = page.locator('.cdk-overlay-pane button:has-text("Enviar"), mat-dialog-container button:has-text("Enviar"), button:has-text("Enviar")').first
            if await send_btn.count() > 0:
                await send_btn.click(force=True)
            else:
                await nit_input.press("Enter")
            await page.wait_for_timeout(4000)

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
                    # Click prioritario en celda de documento o celda de detalle
                    doc_cell = row.locator(f"td:has-text('{clean_target}'), mat-cell:has-text('{clean_target}')").first
                    detail_cell = row.locator("td:has-text('Se recibe'), mat-cell:has-text('Se recibe')").first
                    
                    clicked = False
                    if await doc_cell.count() > 0 and await doc_cell.is_visible():
                        await doc_cell.click()
                        clicked = True
                    elif await detail_cell.count() > 0 and await detail_cell.is_visible():
                        await detail_cell.click()
                        clicked = True
                    else:
                        cells_all = await row.locator("td").all()
                        if len(cells_all) > 3 and await cells_all[3].is_visible():
                            await cells_all[3].click()
                            clicked = True
                        else:
                            clickable = row.locator("a, button, [role='button'], mat-cell").first
                            if await clickable.count() > 0 and await clickable.is_visible():
                                await clickable.click()
                                clicked = True
                            else:
                                await row.click()
                                clicked = True

                    await page.wait_for_timeout(2500)
                    # Si aún no aparece el visor o no cambió la URL a /viewer/
                    if "/viewer/" not in (page.url or "") and await page.locator('.nbx-viewer, mat-card-title:has-text("Visor de documentos")').count() == 0:
                        if await doc_cell.count() > 0:
                            await doc_cell.dblclick()
                        elif await detail_cell.count() > 0:
                            await detail_cell.dblclick()
                        else:
                            await row.dblclick()
                        await page.wait_for_timeout(3000)

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
                await self._ensure_logged_in(page, username, password, nit)
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
                    acuse_btn = page.locator('button:has(mat-icon:has-text("drafts")), button:has-text("Acuse"), button[title*="Acuse"]').first
                    if await acuse_btn.count() > 0 and await acuse_btn.is_visible():
                        self.add_audit_log(
                            action_type="EVENT_030_ACUSE",
                            status="INFO",
                            message=f"Ejecutando doble click en Acuse (drafts) para documento {target_doc_number}...",
                            doc_number=target_doc_number
                        )
                        await acuse_btn.dblclick()
                        await page.wait_for_timeout(3000)

                        # Esperar apertura del formulario con el campo Motivo
                        motive_select = page.locator('mat-select[formcontrolname="motive"], mat-form-field:has(mat-label:has-text("Motivo")) mat-select').first
                        if await motive_select.count() > 0 and await motive_select.is_visible():
                            await motive_select.click()
                            await page.wait_for_timeout(1200)

                            # Seleccionar opción "Acuse" en el overlay desplegable
                            acuse_option = page.locator('mat-option:has-text("Acuse"), .mat-mdc-option:has-text("Acuse"), [role="option"]:has-text("Acuse")').first
                            if await acuse_option.count() > 0 and await acuse_option.is_visible():
                                await acuse_option.click()
                                await page.wait_for_timeout(1000)

                            # Click en botón Guardar
                            guardar_btn = page.locator('button[mattooltip="Guardar"], button[mattooltip*="Guardar"], button:has-text("Guardar"), button:has(mat-icon:has-text("save"))').first
                            if await guardar_btn.count() == 0:
                                g_tip = page.locator('div[role="tooltip"]:has-text("Guardar")').first
                                if await g_tip.count() > 0:
                                    g_id = await g_tip.get_attribute("id")
                                    if g_id:
                                        guardar_btn = page.locator(f'button[aria-describedby="{g_id}"]').first

                            if await guardar_btn.count() > 0 and await guardar_btn.is_visible():
                                await guardar_btn.click()
                                await page.wait_for_timeout(3500)

                            # Confirmar modal si aparece después de Guardar
                            post_confirm = page.locator('mat-dialog-container button:has-text("Aceptar"), mat-dialog-container button:has-text("Confirmar"), mat-dialog-container button:has-text("Sí")').first
                            if await post_confirm.count() > 0 and await post_confirm.is_visible():
                                await post_confirm.click()
                                await page.wait_for_timeout(2000)

                            # Click en botón Volver
                            volver_btn = page.locator('button[mattooltip="Volver"], button[mattooltip*="Volver"], button:has-text("Volver"), button:has(mat-icon:has-text("arrow_back")), button:has(mat-icon:has-text("keyboard_backspace"))').first
                            if await volver_btn.count() == 0:
                                v_tip = page.locator('div[role="tooltip"]:has-text("Volver")').first
                                if await v_tip.count() > 0:
                                    v_id = await v_tip.get_attribute("id")
                                    if v_id:
                                        volver_btn = page.locator(f'button[aria-describedby="{v_id}"]').first

                            if await volver_btn.count() > 0 and await volver_btn.is_visible():
                                await volver_btn.click()
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
                    try:
                        with self.repo.get_connection() as conn:
                            with conn.cursor() as cur:
                                cur.execute("UPDATE invoices SET dianEventsStatus = 'COMPLETADO' WHERE invoiceNumber = %s", (target_doc_number,))
                                cur.execute("UPDATE facture_inbox_documents SET dianStatus = 'ACEPTADO' WHERE documentNumber = %s OR id = %s", (target_doc_number, f"facture-{target_doc_number}"))
                                conn.commit()
                    except Exception as db_e:
                        print(f"Aviso actualizando DIAN status en DB: {db_e}")
                else:
                    steps_log.append({"phase": 4, "name": "Eventos DIAN / RADIAN", "status": "SKIPPED_READONLY"})

                # --- FASE 5: DESCARGA DEL PDF ---
                if download_pdf:
                    steps_log.append({"phase": 5, "name": "Descarga de Factura (PDF)", "status": "RUNNING"})
                    download_btn = page.locator(
                        'button:has(mat-icon:has-text("get_app")), '
                        'button[mattooltip="Descargar PDF"]:has(mat-icon:has-text("get_app")), '
                        'mat-icon:has-text("get_app"), '
                        'button[mattooltip="Descargar PDF"]'
                    ).first
                    
                    if await download_btn.count() > 0:
                        try:
                            await download_btn.wait_for(state="visible", timeout=8000)
                            async with page.expect_download(timeout=25000) as download_info:
                                await download_btn.click()
                            download = await download_info.value
                            clean_fname = f"Factura_{target_doc_number.replace(' ', '_').replace('/', '_')}.pdf"
                            dest_path = os.path.join(UPLOADS_DIR, clean_fname)
                            await download.save_as(dest_path)
                            ensure_extracted_pdf(dest_path)
                            downloaded_file_path = dest_path
                            steps_log[-1]["status"] = "SUCCESS"
                            steps_log[-1]["filePath"] = dest_path

                            alt_clean = self._normalize_doc_id(target_doc_number)
                            alt_pdf_path = os.path.join(UPLOADS_DIR, f"Factura_{alt_clean}.pdf")
                            if alt_pdf_path != dest_path and os.path.exists(dest_path):
                                try:
                                    import shutil
                                    shutil.copyfile(dest_path, alt_pdf_path)
                                except Exception:
                                    pass

                            with self.repo.get_connection() as conn:
                                with conn.cursor() as cur:
                                    cur.execute("""
                                        UPDATE facture_inbox_documents 
                                        SET pdfDownloaded = 1, pdfPath = %s, updatedAt = NOW()
                                        WHERE documentNumber = %s OR id = %s
                                    """, (dest_path, target_doc_number, f"facture-{target_doc_number}"))
                        except Exception as dl_err:
                            steps_log[-1]["status"] = f"ERROR: {str(dl_err)}"
                    else:
                        steps_log[-1]["status"] = "DOWNLOAD_BUTTON_NOT_FOUND"

                # --- FASE 6: RETORNO A RECIBIDOS CON BOTÓN DE FLECHA ATRÁS ---
                steps_log.append({"phase": 6, "name": "Retorno a Recibidos", "status": "RUNNING"})
                back_btn = page.locator('button:has-text("arrow_back"), button mat-icon:has-text("arrow_back"), button[aria-label="Volver"], button[aria-label="Atrás"], button:has-text("Volver")').first
                if await back_btn.count() > 0 and await back_btn.is_visible():
                    await back_btn.click()
                    await page.wait_for_timeout(3000)
                    steps_log[-1]["status"] = "SUCCESS"
                    try:
                        with self.repo.get_connection() as conn:
                            with conn.cursor() as cur:
                                cur.execute("UPDATE invoices SET dianEventsStatus = 'COMPLETADO' WHERE invoiceNumber = %s", (target_doc_number,))
                                cur.execute("UPDATE facture_inbox_documents SET dianStatus = 'ACEPTADO' WHERE documentNumber = %s OR id = %s", (target_doc_number, f"facture-{target_doc_number}"))
                                conn.commit()
                    except Exception as db_e:
                        print(f"Aviso actualizando DIAN status en DB: {db_e}")
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

    async def download_single_pdf_live(self, target_doc_number: str) -> Optional[str]:
        """
        Descarga el PDF de un documento específico de Facture.co en vivo usando Playwright.
        Retorna la ruta absoluta del PDF descargado o None si falló.
        """
        clean_doc = target_doc_number.strip()
        clean_fname = f"Factura_{clean_doc.replace(' ', '_').replace('/', '_')}.pdf"
        dest_pdf_path = os.path.join(UPLOADS_DIR, clean_fname)

        if os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100:
            return dest_pdf_path

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

                # 1. Login
                await self._ensure_logged_in(page, username, password, nit)

                # 2. Navegar a Inbox
                await self._navigate_to_inbox_recibidos(page)

                # 3. Buscar y abrir documento
                folder_hint = "Recibidos"
                try:
                    with self.repo.get_connection() as conn:
                        with conn.cursor() as cur:
                            cur.execute("SELECT folderType FROM facture_inbox_documents WHERE documentNumber = %s LIMIT 1", (clean_doc,))
                            r = cur.fetchone()
                            if r and r.get("folderType"):
                                folder_hint = r["folderType"]
                except Exception:
                    pass

                if "contado" in folder_hint.lower():
                    contado_btn = page.locator('text="Contado"').first
                    if await contado_btn.count() > 0:
                        await contado_btn.click()
                        await page.wait_for_timeout(2000)
                    if "procesados" in folder_hint.lower():
                        proc_t = page.locator('button:has-text("PROCESADOS"), div:has-text("PROCESADOS")').last
                        if await proc_t.count() > 0:
                            await proc_t.click()
                            await page.wait_for_timeout(1500)
                elif "procesados" in folder_hint.lower():
                    proc_t = page.locator('button:has-text("PROCESADOS"), div:has-text("PROCESADOS")').last
                    if await proc_t.count() > 0:
                        await proc_t.click()
                        await page.wait_for_timeout(1500)

                found = await self._find_and_open_invoice_with_pagination(page, clean_doc, max_pages=15)
                if not found:
                    await self._navigate_to_inbox_recibidos(page)
                    found = await self._find_and_open_invoice_with_pagination(page, clean_doc, max_pages=10)

                if found:
                    await page.wait_for_timeout(2000)
                    dl_btn = page.locator(
                        'button[mattooltip*="Descargar PDF"], '
                        'button:has(mat-icon:has-text("get_app")), '
                        'button:has(mat-icon:has-text("description")):has-text("Descargar PDF"), '
                        'button[mattooltip="Descargar PDF"]'
                    ).first
                    if await dl_btn.count() > 0:
                        await dl_btn.wait_for(state="visible", timeout=8000)
                        async with page.expect_download(timeout=25000) as dl_info:
                            await dl_btn.click()
                        dl = await dl_info.value
                        await dl.save_as(dest_pdf_path)
                        ensure_extracted_pdf(dest_pdf_path)

                        alt_clean = self._normalize_doc_id(clean_doc)
                        alt_pdf_path = os.path.join(UPLOADS_DIR, f"Factura_{alt_clean}.pdf")
                        if alt_pdf_path != dest_pdf_path and os.path.exists(dest_pdf_path):
                            try:
                                import shutil
                                shutil.copyfile(dest_pdf_path, alt_pdf_path)
                            except Exception:
                                pass

                        with self.repo.get_connection() as conn:
                            with conn.cursor() as cur:
                                rel_path = f"uploads/invoices/{clean_fname}"
                                cur.execute("""
                                    UPDATE facture_inbox_documents 
                                    SET pdfDownloaded = 1, pdfPath = %s, updatedAt = NOW()
                                    WHERE documentNumber = %s OR id = %s
                                """, (rel_path, clean_doc, f"facture-{clean_doc}"))
                                cur.execute("""
                                    UPDATE invoices
                                    SET pdfPath = %s
                                    WHERE invoiceNumber = %s AND (pdfPath IS NULL OR pdfPath = '')
                                """, (rel_path, clean_doc))

                await browser.close()
        except Exception as e:
            print(f"[download_single_pdf_live] Error para {clean_doc}: {e}")

        if os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100:
            return dest_pdf_path
        return None

    async def batch_download_inbox_pdfs(self, max_docs: int = 50, folder: str = "Recibidos") -> Dict[str, Any]:
        """
        Descarga masiva de PDFs de Facture.co con Playwright:
        Ingresa a cada factura pendiente en la bandeja de Facture, pulsa el botón de descarga y almacena el PDF en local.
        """
        creds = self.get_credentials()
        username = creds.get("username") or "TicsEnriko"
        password = creds.get("password") or "Septiembre2026*"
        nit = creds.get("nit") or "890330035"

        downloaded_count = 0
        skipped_count = 0
        errors = []

        self.add_audit_log(
            action_type="BATCH_PDF_DOWNLOAD_START",
            status="INFO",
            message=f"Iniciando descarga masiva de PDFs para hasta {max_docs} facturas en {folder}."
        )

        try:
            async with async_playwright() as p:
                browser = await p.chromium.launch(headless=True, args=PLAYWRIGHT_CHROMIUM_ARGS)
                context = await browser.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True)
                page = await context.new_page()

                # Login & NIT
                await self._ensure_logged_in(page, username, password, nit)

                await self._navigate_to_inbox_recibidos(page)

                # Si es contado o procesados, cambiar pestaña
                folder_lower = folder.lower()
                if "contado" in folder_lower:
                    contado_btn = page.locator('text="Contado"').first
                    if await contado_btn.count() > 0:
                        await contado_btn.click()
                        await page.wait_for_timeout(2000)

                current_page = 1
                while downloaded_count < max_docs:
                    await page.wait_for_timeout(2000)
                    rows = page.locator("mat-table mat-row, table tbody tr")
                    row_count = await rows.count()
                    if row_count == 0:
                        break

                    for i in range(row_count):
                        if downloaded_count >= max_docs:
                            break

                        row = page.locator("mat-table mat-row, table tbody tr").nth(i)
                        raw_text = await row.inner_text()
                        
                        doc_match = re.search(r"((?:FAC|FE|NC|ND|DE)[\-_A-Za-z0-9]+)", raw_text)
                        doc_num = doc_match.group(1).strip() if doc_match else ""
                        
                        if not doc_num:
                            continue

                        clean_fname = f"Factura_{doc_num.replace(' ', '_').replace('/', '_')}.pdf"
                        dest_pdf_path = os.path.join(UPLOADS_DIR, clean_fname)

                        # Si ya existe con tamaño válido, saltar
                        if os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100:
                            skipped_count += 1
                            continue

                        # En Facture.co la celda de la columna Documento (índice 3) abre el visor
                        doc_cell = row.locator("td").nth(3)
                        if await doc_cell.count() == 0:
                            doc_cell = row.locator("mat-cell").nth(3)
                        if await doc_cell.count() == 0:
                            doc_cell = row.locator(f"td:has-text('{doc_num}'), mat-cell:has-text('{doc_num}')").first

                        if await doc_cell.count() > 0 and await doc_cell.is_visible():
                            try:
                                cell_doc_text = (await doc_cell.inner_text()).strip()
                                if cell_doc_text:
                                    doc_num = cell_doc_text
                                clean_fname = f"Factura_{doc_num.replace(' ', '_').replace('/', '_')}.pdf"
                                dest_pdf_path = os.path.join(UPLOADS_DIR, clean_fname)

                                # Si ya existe localmente antes de hacer click
                                if os.path.exists(dest_pdf_path) and os.path.getsize(dest_pdf_path) > 100:
                                    skipped_count += 1
                                    continue

                                await doc_cell.click()
                                await page.wait_for_timeout(2500)

                                dl_btn = page.locator('button:has(mat-icon:has-text("get_app")), button[mattooltip="Descargar PDF"], button:has-text("Descargar PDF"), mat-icon:has-text("get_app")').first
                                if await dl_btn.count() > 0:
                                    await dl_btn.wait_for(state="visible", timeout=8000)
                                    async with page.expect_download(timeout=25000) as dl_info:
                                        await dl_btn.click()
                                    dl = await dl_info.value
                                    await dl.save_as(dest_pdf_path)
                                    ensure_extracted_pdf(dest_pdf_path)

                                    alt_clean = self._normalize_doc_id(doc_num)
                                    alt_pdf_path = os.path.join(UPLOADS_DIR, f"Factura_{alt_clean}.pdf")
                                    if alt_pdf_path != dest_pdf_path and os.path.exists(dest_pdf_path):
                                        try:
                                            import shutil
                                            shutil.copyfile(dest_pdf_path, alt_pdf_path)
                                        except Exception:
                                            pass

                                    with self.repo.get_connection() as conn:
                                        with conn.cursor() as cur:
                                            rel_path = f"uploads/invoices/{clean_fname}"
                                            cur.execute("""
                                                UPDATE facture_inbox_documents 
                                                SET pdfDownloaded = 1, pdfPath = %s, updatedAt = NOW()
                                                WHERE documentNumber = %s OR id = %s
                                            """, (rel_path, doc_num, f"facture-{doc_num}"))
                                            cur.execute("""
                                                UPDATE invoices
                                                SET pdfPath = %s
                                                WHERE invoiceNumber = %s AND (pdfPath IS NULL OR pdfPath = '')
                                            """, (rel_path, doc_num))

                                    downloaded_count += 1
                                    print(f"[Batch] Factura {doc_num} descargada exitosamente ({os.path.getsize(dest_pdf_path)} bytes)")

                            except Exception as dl_err:
                                errors.append(f"{doc_num}: {str(dl_err)}")
                            finally:
                                await page.go_back()
                                await page.wait_for_timeout(2500)

                    # Intentar avanzar a la siguiente página si aún faltan
                    if downloaded_count < max_docs:
                        next_page_btn = page.locator('button.mat-mdc-paginator-navigation-next, button[aria-label="Next page"], button[aria-label="Página siguiente"], button.mat-paginator-navigation-next').first
                        if await next_page_btn.count() > 0 and not await next_page_btn.is_disabled():
                            await next_page_btn.click()
                            current_page += 1
                            await page.wait_for_timeout(2500)
                        else:
                            break

                await browser.close()

        except Exception as e:
            self.add_audit_log(
                action_type="BATCH_PDF_DOWNLOAD_ERROR",
                status="ERROR",
                message=f"Error en descarga masiva: {str(e)}"
            )
            return {
                "success": False,
                "error": str(e),
                "downloaded": downloaded_count,
                "skipped": skipped_count
            }

        self.add_audit_log(
            action_type="BATCH_PDF_DOWNLOAD_SUCCESS",
            status="SUCCESS",
            message=f"Descarga masiva completada: {downloaded_count} PDFs descargados, {skipped_count} ya existían."
        )

        return {
            "success": True,
            "downloaded": downloaded_count,
            "skipped": skipped_count,
            "errors": errors[:5]
        }

    def sync_local_pdfs_with_db(self) -> Dict[str, Any]:
        """
        Escanea el directorio local `uploads/invoices`, extrae PDFs de archivos ZIP si existen,
        y actualiza en la base de datos `pdfDownloaded = 1` y `pdfPath` para cada factura encontrada.
        """
        if not os.path.exists(UPLOADS_DIR):
            return {"synced": 0}

        matched = 0
        try:
            files = os.listdir(UPLOADS_DIR)
            with self.repo.get_connection() as conn:
                with conn.cursor() as cur:
                    for f in files:
                        full_p = os.path.join(UPLOADS_DIR, f)
                        if not os.path.isfile(full_p) or os.path.getsize(full_p) < 100:
                            continue
                        
                        # Extraer si es zip
                        ensure_extracted_pdf(full_p)

                        if not f.lower().endswith(".pdf"):
                            continue

                        # Extraer posible número de factura
                        clean_name = f[:-4]
                        if clean_name.lower().startswith("factura_"):
                            doc_id = clean_name[8:]
                        else:
                            doc_id = clean_name
                        
                        doc_id_clean = doc_id.replace("_", " ").strip()
                        doc_norm = self._normalize_doc_id(doc_id_clean)

                        cur.execute("""
                            SELECT documentNumber FROM facture_inbox_documents 
                            WHERE documentNumber = %s 
                               OR documentNumber = %s 
                               OR id = %s
                               OR documentNumber LIKE %s
                            LIMIT 1
                        """, (
                            doc_id_clean,
                            doc_id.replace("_", "-"),
                            f"facture-{doc_id_clean}",
                            f"%{doc_norm}%" if doc_norm else "___NONE___"
                        ))
                        row = cur.fetchone()
                        if row:
                            target_doc = row["documentNumber"]
                            rel_path = f"uploads/invoices/{f}"
                            cur.execute("""
                                UPDATE facture_inbox_documents 
                                SET pdfDownloaded = 1, pdfPath = %s, updatedAt = NOW()
                                WHERE documentNumber = %s
                            """, (rel_path, target_doc))
                            cur.execute("""
                                UPDATE invoices 
                                SET pdfPath = %s 
                                WHERE invoiceNumber = %s AND (pdfPath IS NULL OR pdfPath = '')
                            """, (rel_path, target_doc))
                            matched += 1

            if matched > 0:
                print(f"[sync_local_pdfs_with_db] Sincronizados {matched} PDFs locales en la base de datos.")
        except Exception as e:
            print(f"[sync_local_pdfs_with_db] Error: {e}")

        return {"synced": matched}


