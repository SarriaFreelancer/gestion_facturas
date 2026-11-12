import os
import json
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.repositories.base_repository import BaseRepository

class InvoiceRepositoryMixin(BaseRepository):
    """Módulo de repositorio para facturas, presupuestos, configuración de correo y plantillas mensuales."""

    def fetch_all_invoices(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT i.*,
                           COALESCE(NULLIF(i.aiShortSummary, ''), NULLIF(f.aiShortSummary, ''), '') as coalescedAiShortSummary,
                           f.itemsJson as factureItemsJson
                    FROM invoices i
                    LEFT JOIN facture_inbox_documents f ON (f.documentNumber = i.invoiceNumber)
                    ORDER BY i.createdAt DESC
                """)
                rows = cursor.fetchall()
                for r in rows:
                    if "value" in r and r["value"] is not None:
                        r["value"] = float(r["value"])
                    
                    # Consolidar aiShortSummary
                    ai_short = (r.get("coalescedAiShortSummary") or r.get("aiShortSummary") or "").strip()
                    if "SE RECIBE DOCUMENTO" in ai_short.upper():
                        ai_short = ""

                    # Parsear itemsJson
                    raw_items = r.get("itemsJson") or r.get("factureItemsJson")
                    if raw_items:
                        if isinstance(raw_items, str):
                            try:
                                r["itemsJson"] = json.loads(raw_items)
                            except Exception:
                                r["itemsJson"] = []
                        elif isinstance(raw_items, list):
                            r["itemsJson"] = raw_items
                    else:
                        r["itemsJson"] = []

                    # Si ai_short está vacío, calcularlo de itemsJson
                    if not ai_short and r["itemsJson"]:
                        try:
                            from backend.services.invoice_ai_service import InvoiceAIService
                            built = InvoiceAIService._build_short_summary(r["itemsJson"], f"Servicio {r.get('supplier')}")
                            if built and "SE RECIBE DOCUMENTO" not in built.upper():
                                ai_short = built
                        except Exception:
                            pass

                    if not ai_short and r.get("supplier"):
                        ai_short = f"Servicio {r.get('supplier')}"

                    r["aiShortSummary"] = ai_short

                    # Reemplazar descripción si contiene 'Se recibe documento' o es genérica
                    srv_curr = str(r.get("service") or "").strip()
                    if not srv_curr or "SE RECIBE DOCUMENTO" in srv_curr.upper() or srv_curr.startswith("Facturación Electrónica DIAN"):
                        r["service"] = ai_short or f"Servicio {r.get('supplier') or 'Facturación'}"
                return rows

    def save_invoice(self, data: Dict[str, Any]) -> str:
        inv_id = data.get("id") or f"inv-{int(time.time() * 1000)}"
        items_json = data.get("itemsJson")
        if isinstance(items_json, (list, dict)):
            items_json_str = json.dumps(items_json)
        else:
            items_json_str = items_json or None

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO invoices (
                        id, supplier, area, service, invoiceNumber, emissionDate, deliveryDate, dueDate,
                        value, signed, approvalStatus, approvedBy, approvedAt, orderStd, oc, contractNumber,
                        enFacture, delivered, pdfPath, pdfOriginalName, itemsJson, sapExported, sapDocNum,
                        aiShortSummary, dianEventsStatus, recurrentParentId, recurrentMatchReason
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        supplier = VALUES(supplier),
                        area = VALUES(area),
                        service = VALUES(service),
                        invoiceNumber = VALUES(invoiceNumber),
                        emissionDate = VALUES(emissionDate),
                        deliveryDate = VALUES(deliveryDate),
                        dueDate = VALUES(dueDate),
                        value = VALUES(value),
                        signed = VALUES(signed),
                        approvalStatus = VALUES(approvalStatus),
                        approvedBy = VALUES(approvedBy),
                        approvedAt = VALUES(approvedAt),
                        orderStd = VALUES(orderStd),
                        oc = VALUES(oc),
                        contractNumber = VALUES(contractNumber),
                        enFacture = VALUES(enFacture),
                        delivered = VALUES(delivered),
                        pdfPath = VALUES(pdfPath),
                        pdfOriginalName = VALUES(pdfOriginalName),
                        itemsJson = IF(VALUES(itemsJson) IS NOT NULL, VALUES(itemsJson), itemsJson),
                        sapExported = VALUES(sapExported),
                        sapDocNum = VALUES(sapDocNum),
                        aiShortSummary = IF(VALUES(aiShortSummary) IS NOT NULL AND VALUES(aiShortSummary) != '', VALUES(aiShortSummary), aiShortSummary),
                        dianEventsStatus = IF(VALUES(dianEventsStatus) IS NOT NULL, VALUES(dianEventsStatus), dianEventsStatus),
                        recurrentParentId = IF(VALUES(recurrentParentId) IS NOT NULL, VALUES(recurrentParentId), recurrentParentId),
                        recurrentMatchReason = IF(VALUES(recurrentMatchReason) IS NOT NULL, VALUES(recurrentMatchReason), recurrentMatchReason);
                """
                cursor.execute(sql, (
                    inv_id,
                    data.get("supplier", ""),
                    data.get("area", "General"),
                    data.get("service", ""),
                    data.get("invoiceNumber", ""),
                    data.get("emissionDate", ""),
                    data.get("deliveryDate", None),
                    data.get("dueDate", None),
                    float(data.get("value", 0) or 0),
                    data.get("signed", "NO"),
                    data.get("approvalStatus", "Pendiente"),
                    data.get("approvedBy", None),
                    data.get("approvedAt", None),
                    data.get("orderStd", "NO"),
                    data.get("oc", ""),
                    data.get("contractNumber", ""),
                    data.get("enFacture", "AÚN NO"),
                    data.get("delivered", "NO"),
                    data.get("pdfPath", None),
                    data.get("pdfOriginalName", None),
                    items_json_str,
                    int(data.get("sapExported") or 0),
                    data.get("sapDocNum", None),
                    data.get("aiShortSummary", None),
                    data.get("dianEventsStatus", "PENDIENTE"),
                    data.get("recurrentParentId", None),
                    data.get("recurrentMatchReason", None)
                ))
                return inv_id

    def update_invoice_field(self, invoice_id: str, field: str, value: Any) -> bool:
        allowed_fields = [
            "supplier", "area", "service", "invoiceNumber", "emissionDate", "deliveryDate", "dueDate",
            "value", "signed", "approvalStatus", "approvedBy", "approvedAt", "orderStd", "oc", "contractNumber",
            "enFacture", "delivered", "pdfPath", "pdfOriginalName", "itemsJson", "sapExported", "sapDocNum",
            "emailSent", "emailSentAt", "aiShortSummary", "dianEventsStatus", "recurrentParentId", "recurrentMatchReason"
        ]
        if field not in allowed_fields:
            raise ValueError(f"Campo {field} no permitido para actualización")

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                if field == "delivered" and str(value).upper() in ["SÍ", "SI", "YES", "TRUE", "1"]:
                    sql = "UPDATE invoices SET `delivered` = %s, `deliveryDate` = IF(deliveryDate IS NULL OR deliveryDate = '', CURDATE(), deliveryDate), updatedAt = NOW() WHERE id = %s"
                    cursor.execute(sql, (value, invoice_id))
                elif field == "oc":
                    order_val = "SÍ" if value and str(value).strip() else "NO"
                    sql = "UPDATE invoices SET `oc` = %s, `orderStd` = %s, updatedAt = NOW() WHERE id = %s"
                    cursor.execute(sql, (value, order_val, invoice_id))
                elif field == "signed":
                    # Al firmar, también sincronizar approvalStatus
                    is_signed = str(value).upper() in ["SÍ", "SI", "YES", "TRUE", "1"]
                    signed_str = "SÍ" if is_signed else "NO"
                    app_status = "Aprobado" if is_signed else "Pendiente"
                    sql = "UPDATE invoices SET `signed` = %s, `approvalStatus` = %s, `approvedAt` = IF(%s = 'SÍ', NOW(), approvedAt), updatedAt = NOW() WHERE id = %s"
                    cursor.execute(sql, (signed_str, app_status, signed_str, invoice_id))
                elif field == "approvalStatus":
                    # Al aprobar en el módulo de jefes, se marca signed = 'SÍ'
                    is_app = str(value).capitalize() == "Aprobado"
                    signed_str = "SÍ" if is_app else "NO"
                    sql = "UPDATE invoices SET `approvalStatus` = %s, `signed` = %s, `approvedAt` = IF(%s = 'Aprobado', NOW(), approvedAt), updatedAt = NOW() WHERE id = %s"
                    cursor.execute(sql, (value, signed_str, value, invoice_id))
                else:
                    sql = f"UPDATE invoices SET `{field}` = %s, updatedAt = NOW() WHERE id = %s"
                    cursor.execute(sql, (value, invoice_id))
                return cursor.rowcount > 0

    def mark_invoices_email_sent(self, invoice_ids: List[str]) -> bool:
        if not invoice_ids:
            return True
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                format_strings = ','.join(['%s'] * len(invoice_ids))
                cursor.execute(f"UPDATE invoices SET emailSent = 'SÍ', emailSentAt = NOW() WHERE id IN ({format_strings})", tuple(invoice_ids))
                return True

    def fetch_email_settings(self) -> Dict[str, Any]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM email_settings WHERE id = 'default'")
                row = cursor.fetchone()
                if not row:
                    return {
                        "id": "default",
                        "recipientEmail": "contabilidad@alimentosenriko.com",
                        "ccEmails": "",
                        "senderName": "Alimentos Enriko S.A.S. — Control de Facturas",
                        "emailSubject": "Reporte de Facturas Entregadas — Alimentos Enriko S.A.S.",
                        "emailTemplate": "Estimado equipo de Contabilidad y Pagos,\n\nAdjunto remitimos el reporte detallado de las facturas que han sido radicadas y entregadas formalmente para su respectiva causación y trámite de pago.\n\nPor favor verificar el detalle en la tabla anexa.",
                        "frequency": "manual",
                        "outlookIntegrationEnabled": 1,
                        "smtpHost": "smtp.office365.com",
                        "smtpPort": 587,
                        "smtpUser": "",
                        "smtpPassword": "",
                        "portalEnabled": 1,
                        "inventoryEnabled": 1,
                        "categoriesEnabled": 1,
                        "defaultClientName": "ALIMENTOS ENRIKO SAS",
                        "defaultClientNit": "890330035",
                        "geminiApiKey": os.getenv("GEMINI_API_KEY", ""),
                        "googleClientId": os.getenv("GOOGLE_CLIENT_ID", ""),
                        "googleClientSecret": os.getenv("GOOGLE_CLIENT_SECRET", ""),
                        "googleProjectId": os.getenv("GOOGLE_PROJECT_ID", "facturacionenriko")
                    }
                if row.get("ccEmails") is None:
                    row["ccEmails"] = ""
                if row.get("portalEnabled") is None:
                    row["portalEnabled"] = 1
                if row.get("inventoryEnabled") is None:
                    row["inventoryEnabled"] = 1
                if row.get("categoriesEnabled") is None:
                    row["categoriesEnabled"] = 1
                if not row.get("defaultClientName"):
                    row["defaultClientName"] = "ALIMENTOS ENRIKO SAS"
                if not row.get("defaultClientNit"):
                    row["defaultClientNit"] = "890330035"
                if not row.get("geminiApiKey"):
                    row["geminiApiKey"] = os.getenv("GEMINI_API_KEY", "")
                if not row.get("googleClientId"):
                    row["googleClientId"] = os.getenv("GOOGLE_CLIENT_ID", "")
                if not row.get("googleClientSecret"):
                    row["googleClientSecret"] = os.getenv("GOOGLE_CLIENT_SECRET", "")
                if not row.get("googleProjectId"):
                    row["googleProjectId"] = os.getenv("GOOGLE_PROJECT_ID", "facturacionenriko")
                return row

    def save_email_settings(self, data: Dict[str, Any]) -> bool:
        gemini_key = data.get("geminiApiKey")
        if gemini_key:
            os.environ["GEMINI_API_KEY"] = gemini_key.strip()

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO email_settings (
                        id, recipientEmail, ccEmails, senderName, emailSubject, emailTemplate,
                        frequency, outlookIntegrationEnabled, smtpHost, smtpPort, smtpUser, smtpPassword,
                        portalEnabled, inventoryEnabled, categoriesEnabled, defaultClientName, defaultClientNit, geminiApiKey,
                        googleClientId, googleClientSecret, googleProjectId
                    ) VALUES ('default', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        recipientEmail = VALUES(recipientEmail),
                        ccEmails = VALUES(ccEmails),
                        senderName = VALUES(senderName),
                        emailSubject = VALUES(emailSubject),
                        emailTemplate = VALUES(emailTemplate),
                        frequency = VALUES(frequency),
                        outlookIntegrationEnabled = VALUES(outlookIntegrationEnabled),
                        smtpHost = VALUES(smtpHost),
                        smtpPort = VALUES(smtpPort),
                        smtpUser = VALUES(smtpUser),
                        smtpPassword = VALUES(smtpPassword),
                        portalEnabled = VALUES(portalEnabled),
                        inventoryEnabled = VALUES(inventoryEnabled),
                        categoriesEnabled = VALUES(categoriesEnabled),
                        defaultClientName = VALUES(defaultClientName),
                        defaultClientNit = VALUES(defaultClientNit),
                        geminiApiKey = VALUES(geminiApiKey),
                        googleClientId = VALUES(googleClientId),
                        googleClientSecret = VALUES(googleClientSecret),
                        googleProjectId = VALUES(googleProjectId)
                """, (
                    data.get("recipientEmail", "contabilidad@alimentosenriko.com"),
                    data.get("ccEmails", ""),
                    data.get("senderName", "Alimentos Enriko S.A.S. — Control de Facturas"),
                    data.get("emailSubject", "Reporte de Facturas Entregadas — Alimentos Enriko S.A.S."),
                    data.get("emailTemplate", ""),
                    data.get("frequency", "manual"),
                    int(data.get("outlookIntegrationEnabled", 1) or 1),
                    data.get("smtpHost", "smtp.office365.com"),
                    int(data.get("smtpPort", 587) or 587),
                    data.get("smtpUser", ""),
                    data.get("smtpPassword", ""),
                    int(data.get("portalEnabled", 1) if data.get("portalEnabled") is not None else 1),
                    int(data.get("inventoryEnabled", 1) if data.get("inventoryEnabled") is not None else 1),
                    int(data.get("categoriesEnabled", 1) if data.get("categoriesEnabled") is not None else 1),
                    data.get("defaultClientName", "ALIMENTOS ENRIKO SAS"),
                    data.get("defaultClientNit", "890330035"),
                    gemini_key or None,
                    data.get("googleClientId", ""),
                    data.get("googleClientSecret", ""),
                    data.get("googleProjectId", "facturacionenriko")
                ))
                return True

    def delete_invoice(self, invoice_id: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # 1. Obtener número de factura antes de eliminar para desvincular en Facture.co
                cursor.execute("SELECT invoiceNumber FROM invoices WHERE id = %s", (invoice_id,))
                row = cursor.fetchone()
                inv_num = (row.get("invoiceNumber") or "").strip() if row else ""

                # 2. Eliminar de sap_presolicitudes si existe
                cursor.execute("DELETE FROM sap_presolicitudes WHERE invoiceId = %s OR (docNumber = %s AND docNumber != '')", (invoice_id, inv_num))

                # 3. Eliminar la factura
                cursor.execute("DELETE FROM invoices WHERE id = %s", (invoice_id,))
                deleted = cursor.rowcount > 0

                # 4. Si tenía número de factura, marcar en Facture como NO sincronizada para que se pueda volver a vincular
                if inv_num:
                    cursor.execute("UPDATE facture_inbox_documents SET isSyncedToMain = 0 WHERE documentNumber = %s", (inv_num,))
                    try:
                        cursor.execute("""
                            UPDATE internal_uploaded_invoices 
                            SET importedToMain = 0, mainInvoiceId = NULL, status = 'Pendiente'
                            WHERE invoiceNumber = %s OR mainInvoiceId = %s
                        """, (inv_num, invoice_id))
                    except Exception:
                        pass
                else:
                    try:
                        cursor.execute("""
                            UPDATE internal_uploaded_invoices 
                            SET importedToMain = 0, mainInvoiceId = NULL, status = 'Pendiente'
                            WHERE mainInvoiceId = %s
                        """, (invoice_id,))
                    except Exception:
                        pass
                return deleted

    def clean_invoices(self) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM invoices")
                cursor.execute("UPDATE facture_inbox_documents SET isSyncedToMain = 0")
                cursor.execute("DELETE FROM sap_presolicitudes")
                try:
                    cursor.execute("UPDATE internal_uploaded_invoices SET importedToMain = 0, mainInvoiceId = NULL, status = 'Pendiente'")
                except Exception:
                    pass
                return True

    def unlink_facture_document(self, document_number: str) -> bool:
        clean_doc = document_number.strip()
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # 1. Desvincular en facture_inbox_documents
                cursor.execute("UPDATE facture_inbox_documents SET isSyncedToMain = 0 WHERE documentNumber = %s", (clean_doc,))
                # 2. Desvincular / eliminar de invoices
                cursor.execute("DELETE FROM invoices WHERE invoiceNumber = %s", (clean_doc,))
                # 3. Eliminar de sap_presolicitudes
                cursor.execute("DELETE FROM sap_presolicitudes WHERE docNumber = %s", (clean_doc,))
                # 4. Actualizar facturas internas si existía
                try:
                    cursor.execute("""
                        UPDATE internal_uploaded_invoices 
                        SET importedToMain = 0, mainInvoiceId = NULL, status = 'Pendiente'
                        WHERE documentNumber = %s
                    """, (clean_doc,))
                except Exception:
                    pass
                return True

    def generate_month_template(self, target_year: str, target_month: str) -> Dict[str, Any]:
        """
        Genera para el nuevo mes las facturas y cotizaciones recurrentes vacías
        basadas en los conceptos configurados en cada proveedor.
        En fechas del 1° del mes y con todos los interruptores en NO.
        """
        suppliers = self.fetch_all_suppliers()
        existing_invoices = self.fetch_all_invoices()
        created_count = 0

        month_map_rev = {
            'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
            'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
            'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
        }
        target_m_num = month_map_rev.get(target_month.lower(), 1)
        default_emission_date = f"{target_year}-{target_m_num:02d}-01"

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                for sup in suppliers:
                    services = sup.get("services") or []
                    sup_area = sup.get("area") or "Tecnología (TI)"

                    # Si el proveedor no tiene servicios configurados, inferir de facturas de los últimos 2 meses
                    if not services or len(services) == 0:
                        cursor.execute("""
                            SELECT DISTINCT service, contractNumber 
                            FROM invoices 
                            WHERE (LOWER(supplier) = LOWER(%s) OR id LIKE %s) AND service != '' AND service IS NOT NULL
                            ORDER BY createdAt DESC LIMIT 5
                        """, (sup.get("name"), f"%{sup.get('id')}%"))
                        inferred_rows = cursor.fetchall()
                        if inferred_rows:
                            services = [{"serviceName": r["service"], "type": "factura", "enabled": True, "contractNumber": r.get("contractNumber") or ""} for r in inferred_rows]

                    for idx, srv in enumerate(services):
                        if srv.get("enabled") == False:
                            continue
                        
                        srv_name = srv.get("serviceName") or f"Servicio #{idx + 1}"
                        srv_type = srv.get("type") or "factura"
                        srv_contract = srv.get("contractNumber") or ""
                        clean_sup_id = (sup.get("id") or "").replace(" ", "-")
                        auto_id = f"rec-{clean_sup_id}-{idx}-{target_year}-{target_month.lower()}"

                        # Verificar si ya existe este concepto para el mes
                        already_exists = any(i.get("id") == auto_id for i in existing_invoices)
                        if already_exists:
                            continue

                        inv_num_placeholder = "COT-" if srv_type == "cotizacion" else ""

                        # Se crea con las fechas del nuevo mes, área del proveedor y estados en NO / AÚN NO
                        sql = """
                            INSERT INTO invoices (
                                id, supplier, area, service, invoiceNumber, emissionDate, deliveryDate,
                                value, signed, orderStd, oc, contractNumber, enFacture, delivered, approvalStatus
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE id = id;
                        """
                        cursor.execute(sql, (
                            auto_id,
                            sup.get("name"),
                            sup_area,
                            srv_name,
                            inv_num_placeholder,
                            default_emission_date, # Fecha de emisión inicial del nuevo mes (ej. 2026-11-01)
                            "", # Fecha entrega vacía
                            0.0, # Valor en 0
                            "NO", # Firmado en NO
                            "NO", # Orden Std en NO
                            "",   # OC en blanco
                            srv_contract,
                            "AÚN NO", # En Facture en NO/AÚN NO
                            "NO",  # Entregado en NO
                            "PENDIENTE"
                        ))
                        created_count += 1

        return {"success": True, "createdConcepts": created_count}

    def rollover_unpaid_invoices(self, from_year: str, from_month: str, to_year: str, to_month: str) -> Dict[str, Any]:
        """
        Mantiene en el mes actual las facturas y cotizaciones del mes anterior que no fueron entregadas
        (delivered != 'SÍ').
        """
        all_invoices = self.fetch_all_invoices()
        rollover_count = 0

        month_map_rev = {
            'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
            'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
            'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
        }
        to_m_num = month_map_rev.get(to_month.lower(), 1)
        default_rollover_date = f"{to_year}-{to_m_num:02d}-01"

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                for inv in all_invoices:
                    is_delivered = (inv.get("delivered") or "").upper() == "SÍ"
                    if is_delivered:
                        continue # Ya fue entregada, no se pasa

                    inv_id = inv.get("id")
                    new_id = f"rollover-{inv_id}-{to_year}-{to_month.lower()}"
                    
                    cursor.execute("SELECT id FROM invoices WHERE id = %s", (new_id,))
                    if cursor.fetchone():
                        continue

                    try:
                        cursor.execute("""
                            INSERT INTO invoices (
                                id, supplier, service, invoiceNumber, emissionDate, deliveryDate,
                                value, signed, orderStd, oc, enFacture, delivered
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        """, (
                            new_id,
                            inv.get("supplier"),
                            f"{inv.get('service', '')} (Pendiente mes anterior)",
                            inv.get("invoiceNumber"),
                            default_rollover_date,
                            "",
                            float(inv.get("value") or 0),
                            inv.get("signed") or "NO",
                            inv.get("orderStd") or "NO",
                            inv.get("oc") or "",
                            inv.get("enFacture") or "AÚN NO",
                            "NO"
                        ))
                        rollover_count += 1
                    except Exception:
                        pass

        return {"success": True, "rolloverCount": rollover_count}

    def fetch_budgets(self, year: Optional[str] = None, area: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                sql = "SELECT * FROM tech_budgets WHERE 1=1"
                params = []
                if year and year != "Todos":
                    sql += " AND year = %s"
                    params.append(year)
                if area and area != "Todos":
                    sql += " AND area = %s"
                    params.append(area)
                sql += " ORDER BY year DESC, area ASC, category ASC"
                cursor.execute(sql, params)
                return cursor.fetchall()
