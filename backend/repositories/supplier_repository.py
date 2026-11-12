import json
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.repositories.base_repository import BaseRepository

class SupplierRepositoryMixin(BaseRepository):
    """Módulo de repositorio para proveedores, sincronización de conceptos recurrentes y cotizaciones CRM."""

    def fetch_all_suppliers(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM suppliers ORDER BY name ASC")
                rows = cursor.fetchall()

                # Mapa de proveedor/contrato -> aiShortSummary más reciente
                cursor.execute("""
                    SELECT supplier, contractNumber, aiShortSummary, service, itemsJson
                    FROM invoices
                    ORDER BY createdAt DESC
                """)
                inv_rows = cursor.fetchall()
                sup_summaries = {}
                contract_summaries = {}
                for inv in inv_rows:
                    s_name = (inv.get("supplier") or "").strip().lower()
                    c_num = (inv.get("contractNumber") or "").strip()
                    sum_text = (inv.get("aiShortSummary") or "").strip()
                    if "SE RECIBE DOCUMENTO" in sum_text.upper():
                        sum_text = ""
                    if not sum_text and inv.get("itemsJson"):
                        try:
                            itms = json.loads(inv["itemsJson"]) if isinstance(inv["itemsJson"], str) else inv["itemsJson"]
                            if itms and isinstance(itms, list):
                                from backend.services.invoice_ai_service import InvoiceAIService
                                built = InvoiceAIService._build_short_summary(itms, f"Servicio {inv.get('supplier')}")
                                if built and "SE RECIBE DOCUMENTO" not in built.upper():
                                    sum_text = built
                        except Exception:
                            pass
                    if not sum_text:
                        srv_c = (inv.get("service") or "").strip()
                        if srv_c and "SE RECIBE DOCUMENTO" not in srv_c.upper() and not srv_c.startswith("Facturación Electrónica DIAN"):
                            sum_text = srv_c

                    if s_name and sum_text and s_name not in sup_summaries:
                        sup_summaries[s_name] = sum_text
                    if c_num and sum_text and c_num not in contract_summaries:
                        contract_summaries[c_num] = sum_text

                cursor.execute("""
                    SELECT issuerName, documentNumber, aiShortSummary, itemsJson
                    FROM facture_inbox_documents
                    ORDER BY createdAt DESC
                """)
                facture_rows = cursor.fetchall()
                for f in facture_rows:
                    iss = (f.get("issuerName") or "").strip().lower()
                    sum_text = (f.get("aiShortSummary") or "").strip()
                    if "SE RECIBE DOCUMENTO" in sum_text.upper():
                        sum_text = ""
                    if not sum_text and f.get("itemsJson"):
                        try:
                            itms = json.loads(f["itemsJson"]) if isinstance(f["itemsJson"], str) else f["itemsJson"]
                            if itms and isinstance(itms, list):
                                from backend.services.invoice_ai_service import InvoiceAIService
                                built = InvoiceAIService._build_short_summary(itms, f"Servicio {f.get('issuerName')}")
                                if built and "SE RECIBE DOCUMENTO" not in built.upper():
                                    sum_text = built
                        except Exception:
                            pass
                    if iss and sum_text and iss not in sup_summaries:
                        sup_summaries[iss] = sum_text

                for r in rows:
                    if isinstance(r.get("services"), str):
                        try:
                            r["services"] = json.loads(r["services"])
                        except Exception:
                            r["services"] = []
                    elif not r.get("services"):
                        r["services"] = []

                    sup_clean = (r.get("name") or "").strip().lower()
                    fallback_ai = sup_summaries.get(sup_clean) or f"Servicio {r.get('name') or 'Facturación'}"

                    for srv in r["services"]:
                        s_name = str(srv.get("serviceName") or "").strip()
                        c_num = str(srv.get("contractNumber") or "").strip()
                        matched_ai = contract_summaries.get(c_num) or fallback_ai
                        if "SE RECIBE DOCUMENTO" in matched_ai.upper():
                            matched_ai = f"Servicio {r.get('name') or 'Facturación'}"
                        
                        srv["aiShortSummary"] = matched_ai

                        # Reemplazar descripción genérica 'Se recibe documento' por el resumen corto de la AI
                        if not s_name or "SE RECIBE DOCUMENTO" in s_name.upper():
                            srv["serviceName"] = matched_ai
                return rows

    def sync_supplier_concepts_to_invoices(self, supplier_id: str, supplier_name: str, services: List[Dict[str, Any]]) -> int:
        now = datetime.now()
        target_year = str(now.year)
        month_names = [
            'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
            'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ]
        target_m_num = now.month
        target_month = month_names[target_m_num - 1]
        default_emission_date = f"{target_year}-{target_m_num:02d}-01"

        clean_sup_id = str(supplier_id).replace(" ", "-")
        created = 0

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id FROM invoices")
                existing_ids = {r["id"] for r in cursor.fetchall()}

                for idx, srv in enumerate(services):
                    if srv.get("enabled") == False:
                        continue
                    
                    srv_name = srv.get("serviceName") or f"Servicio #{idx + 1}"
                    srv_type = (srv.get("type") or "factura").lower()
                    auto_id = f"rec-{clean_sup_id}-{idx}-{target_year}-{target_month}"

                    if auto_id in existing_ids:
                        cursor.execute("UPDATE invoices SET supplier = %s, service = %s WHERE id = %s", (supplier_name, srv_name, auto_id))
                        continue

                    inv_num_placeholder = "COT-" if srv_type == "cotizacion" else ""

                    sql = """
                        INSERT INTO invoices (
                            id, supplier, service, invoiceNumber, emissionDate, deliveryDate,
                            value, signed, orderStd, oc, enFacture, delivered
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON DUPLICATE KEY UPDATE id = id;
                    """
                    cursor.execute(sql, (
                        auto_id,
                        supplier_name,
                        srv_name,
                        inv_num_placeholder,
                        "",
                        "",
                        0.0,
                        "NO",
                        "NO",
                        "",
                        "AÚN NO",
                        "NO"
                    ))
                    created += 1
        return created

    def save_supplier(self, data: Dict[str, Any]) -> str:
        sup_id = data.get("id") or f"sup-{int(time.time() * 1000)}"
        clean_nit = data.get("nit", "").strip()
        services = data.get("services", [])
        services_json = json.dumps(services) if not isinstance(services, str) else services

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # No permitir creación o actualización con un NIT que ya pertenezca a otro proveedor
                if clean_nit:
                    cursor.execute("SELECT id, name FROM suppliers WHERE nit = %s AND id != %s", (clean_nit, sup_id))
                    dup_sup = cursor.fetchone()
                    if dup_sup:
                        raise ValueError(f"No es posible guardar: Ya existe un proveedor registrado con el NIT '{clean_nit}' ({dup_sup['name']}).")

                sql = """
                    INSERT INTO suppliers (
                        id, nit, sapCode, name, tradeName, address, city, contact, phone, email,
                        monthlyCount, area, paymentConditions, bankName, bankAccountType, bankAccountNumber,
                        status, services
                    )
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        nit = VALUES(nit),
                        sapCode = VALUES(sapCode),
                        name = VALUES(name),
                        tradeName = VALUES(tradeName),
                        address = VALUES(address),
                        city = VALUES(city),
                        contact = VALUES(contact),
                        phone = VALUES(phone),
                        email = VALUES(email),
                        monthlyCount = VALUES(monthlyCount),
                        area = VALUES(area),
                        paymentConditions = VALUES(paymentConditions),
                        bankName = VALUES(bankName),
                        bankAccountType = VALUES(bankAccountType),
                        bankAccountNumber = VALUES(bankAccountNumber),
                        status = VALUES(status),
                        services = VALUES(services);
                """
                cursor.execute(sql, (
                    sup_id,
                    data.get("nit", "").strip(),
                    (data.get("sapCode") or "").strip(),
                    data.get("name", "").strip(),
                    data.get("tradeName", data.get("name", "")).strip(),
                    data.get("address", ""),
                    data.get("city", "Cali"),
                    data.get("contact", ""),
                    data.get("phone", ""),
                    data.get("email", None),
                    int(data.get("monthlyCount", 1) or 1),
                    data.get("area", "General"),
                    data.get("paymentConditions", "Crédito 30 días"),
                    data.get("bankName", ""),
                    data.get("bankAccountType", "Corriente"),
                    data.get("bankAccountNumber", ""),
                    data.get("status", "Activo"),
                    services_json
                ))

        # Sincronizar automáticamente con la tabla de Facturas / Cotizaciones
        parsed_services = services if isinstance(services, list) else json.loads(services)
        self.sync_supplier_concepts_to_invoices(sup_id, data.get("name", ""), parsed_services)

        return sup_id

    def update_supplier_services(self, supplier_id: str, services: List[Dict[str, Any]]) -> bool:
        services_json = json.dumps(services)
        sup_name = ""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE suppliers SET services = %s, updatedAt = NOW() WHERE id = %s",
                    (services_json, supplier_id)
                )
                cursor.execute("SELECT name FROM suppliers WHERE id = %s", (supplier_id,))
                row = cursor.fetchone()
                if row:
                    sup_name = row["name"]

        if sup_name:
            self.sync_supplier_concepts_to_invoices(supplier_id, sup_name, services)

        return True

    def delete_supplier(self, supplier_id: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # 1. Obtener nombre del proveedor antes de eliminar
                cursor.execute("SELECT name FROM suppliers WHERE id = %s", (supplier_id,))
                row = cursor.fetchone()
                sup_name = row["name"] if row else None

                # 2. Desvincular en Facture.co todas las facturas asociadas a este proveedor
                clean_sup_id = str(supplier_id).replace(" ", "-")
                if sup_name:
                    cursor.execute("""
                        SELECT id, invoiceNumber FROM invoices 
                        WHERE supplier = %s OR id LIKE %s
                    """, (sup_name, f"%{clean_sup_id}%"))
                else:
                    cursor.execute("SELECT id, invoiceNumber FROM invoices WHERE id LIKE %s", (f"%{clean_sup_id}%",))
                inv_rows = cursor.fetchall()
                inv_ids = [r["id"] for r in inv_rows if r.get("id")]
                inv_numbers = [r["invoiceNumber"].strip() for r in inv_rows if r.get("invoiceNumber") and r["invoiceNumber"].strip()]

                for num in inv_numbers:
                    cursor.execute("UPDATE facture_inbox_documents SET isSyncedToMain = 0 WHERE documentNumber = %s", (num,))
                    cursor.execute("DELETE FROM sap_presolicitudes WHERE docNumber = %s", (num,))
                    try:
                        cursor.execute("""
                            UPDATE internal_uploaded_invoices 
                            SET importedToMain = 0, mainInvoiceId = NULL, status = 'Pendiente'
                            WHERE invoiceNumber = %s
                        """, (num,))
                    except Exception:
                        pass

                for inv_id in inv_ids:
                    cursor.execute("DELETE FROM sap_presolicitudes WHERE invoiceId = %s", (inv_id,))

                # 3. Eliminar de suppliers
                cursor.execute("DELETE FROM suppliers WHERE id = %s", (supplier_id,))

                # 4. Eliminar facturas y conceptos vinculados a este proveedor
                if sup_name:
                    cursor.execute("""
                        DELETE FROM invoices 
                        WHERE supplier = %s OR id LIKE %s
                    """, (sup_name, f"%{clean_sup_id}%"))
                else:
                    cursor.execute("DELETE FROM invoices WHERE id LIKE %s", (f"%{clean_sup_id}%",))

                return True

    def fetch_all_crm(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM crm_quotations ORDER BY createdAt DESC")
                rows = cursor.fetchall()
                for r in rows:
                    if isinstance(r.get("suppliers"), str):
                        try:
                            r["suppliers"] = json.loads(r["suppliers"])
                        except Exception:
                            r["suppliers"] = []
                return rows
