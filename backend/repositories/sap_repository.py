import json
from datetime import datetime
from typing import List, Dict, Any
from backend.repositories.base_repository import BaseRepository

class SapRepositoryMixin(BaseRepository):
    """Módulo de repositorio para integración con SAP (solicitud de compra y pre-solicitudes de 29 campos oficiales)."""

    def get_sap_solicitud_compra_data(self, invoice_id: str, current_user_name: str = "Usuario") -> Dict[str, Any]:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    SELECT 
                        i.*,
                        s.sapCode as supplierSapCode,
                        s.nit as supplierNit,
                        s.name as fullSupplierName,
                        ca.costCenterCode as areaCostCenterCode
                    FROM invoices i
                    LEFT JOIN suppliers s ON (LOWER(s.name) = LOWER(i.supplier) OR (s.name != '' AND INSTR(i.supplier, s.name) > 0))
                    LEFT JOIN company_areas ca ON (LOWER(ca.name) = LOWER(i.area))
                    WHERE i.id = %s
                """, (invoice_id,))
                inv = cur.fetchone()
                if not inv:
                    raise ValueError(f"Factura {invoice_id} no encontrada.")

                items_data = inv.get("itemsJson")
                if isinstance(items_data, str):
                    try:
                        items = json.loads(items_data)
                    except Exception:
                        items = []
                elif isinstance(items_data, list):
                    items = items_data
                else:
                    items = []

                # Si no tiene ítems detallados guardados, creamos uno con el servicio global
                if not items:
                    items = [{
                        "numeroItem": 1,
                        "codigo": "SERV-001",
                        "descripcion": inv.get("service") or f"Servicio Factura {inv.get('invoiceNumber')}",
                        "unidadMedida": "UND",
                        "cantidad": 1.0,
                        "precioUnitario": float(inv.get("value") or 0.0),
                        "porcentajeIva": 19.0,
                        "valorIva": round(float(inv.get("value") or 0.0) * 0.19, 2),
                        "subtotal": float(inv.get("value") or 0.0),
                        "total": float(inv.get("value") or 0.0),
                        "tieneIva": True
                    }]

                today_str = datetime.now().strftime("%Y-%m-%d")
                doc_due_date = inv.get("dueDate") or inv.get("emissionDate") or today_str
                sap_supplier_code = inv.get("supplierSapCode") or inv.get("supplierNit") or "PROV-SAP"
                cost_center = inv.get("areaCostCenterCode") or inv.get("area") or "CC-GENERAL"

                sap_rows = []
                for idx, it in enumerate(items, 1):
                    qty = float(it.get("cantidad") or it.get("quantity") or 1.0)
                    price = float(it.get("precioUnitario") or it.get("unitPrice") or 0.0)
                    tax_val = float(it.get("valorIva") or it.get("taxAmount") or 0.0)
                    subtotal = float(it.get("subtotal") or round(qty * price, 2))
                    line_total = float(it.get("total") or it.get("totalPrice") or round(subtotal + tax_val, 2))

                    sap_rows.append({
                        "itemLine": idx,
                        "cardCode": sap_supplier_code,
                        "cardName": inv.get("fullSupplierName") or inv.get("supplier"),
                        "docDate": today_str,
                        "docDueDate": doc_due_date,
                        "costCenter": cost_center,
                        "areaName": inv.get("area") or "General",
                        "userSignature": current_user_name,
                        "contractNumber": inv.get("contractNumber") or "",
                        "invoiceNumber": inv.get("invoiceNumber") or "",
                        "itemCode": it.get("codigo") or it.get("code") or f"ART-{idx:03d}",
                        "description": it.get("descripcion") or it.get("name") or it.get("description") or f"Ítem {idx}",
                        "unit": it.get("unidadMedida") or it.get("unit") or "UND",
                        "quantity": qty,
                        "unitPrice": price,
                        "taxCode": "IVA_19" if (tax_val > 0 or it.get("porcentajeIva", 0) > 0) else "EXENTO",
                        "taxAmount": tax_val,
                        "lineTotal": line_total
                    })

                return {
                    "invoiceId": inv["id"],
                    "invoiceNumber": inv.get("invoiceNumber"),
                    "supplier": inv.get("supplier"),
                    "supplierNit": inv.get("supplierNit"),
                    "supplierSapCode": sap_supplier_code,
                    "area": inv.get("area"),
                    "costCenter": cost_center,
                    "contractNumber": inv.get("contractNumber"),
                    "signed": inv.get("signed"),
                    "approvalStatus": inv.get("approvalStatus"),
                    "approvedBy": inv.get("approvedBy"),
                    "approvedAt": inv.get("approvedAt"),
                    "generatedAt": today_str,
                    "generatedBy": current_user_name,
                    "totalItems": len(sap_rows),
                    "totalAmount": float(inv.get("value") or 0.0),
                    "sapRows": sap_rows
                }

    def get_or_create_sap_presolicitud(self, invoice_id: str, current_user_name: str = "Usuario") -> Dict[str, Any]:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT * FROM sap_presolicitudes WHERE invoiceId = %s ORDER BY itemLine ASC", (invoice_id,))
                existing_rows = cur.fetchall()
                if existing_rows:
                    for r in existing_rows:
                        for k in ["requiredQuantity", "infoPrice", "taxPercentage", "discountPercentage", "totalMl", "foreignUnitPrice"]:
                            if k in r and r[k] is not None:
                                r[k] = float(r[k])
                        # Recalcular Total (ML) con IVA siempre a partir de PRECIO INFO + IVA
                        q = float(r.get("requiredQuantity") or 1.0)
                        p = float(r.get("infoPrice") or 0.0)
                        t = float(r.get("taxPercentage") or 0.0)
                        d = float(r.get("discountPercentage") or 0.0)
                        base = round(q * p * (1.0 - d / 100.0), 2)
                        tax_line = round(base * (t / 100.0), 2) if t > 0 else 0.0
                        calc_ml = round(base + tax_line, 2)
                        if r.get("totalMl") is None or float(r.get("totalMl") or 0.0) == 0.0 or calc_ml > 0:
                            r["totalMl"] = calc_ml
                            cur.execute("UPDATE sap_presolicitudes SET totalMl = %s WHERE id = %s", (calc_ml, r["id"]))

                        # Si Descripcion_Adic tiene el texto genérico de recepción, actualizarlo
                        if r.get("additionalDescription") and "SE RECIBE DOCUMENTO" in str(r["additionalDescription"]).upper():
                            cur.execute("SELECT aiShortSummary, service FROM invoices WHERE id = %s", (invoice_id,))
                            inv_info = cur.fetchone()
                            clean_desc = (inv_info.get("aiShortSummary") if inv_info else None) or "Servicio Suministro"
                            r["additionalDescription"] = clean_desc
                            cur.execute("UPDATE sap_presolicitudes SET additionalDescription = %s WHERE id = %s", (clean_desc, r["id"]))
                    conn.commit()
                    return {
                        "invoiceId": invoice_id,
                        "rows": existing_rows,
                        "isNew": False
                    }

                # Si no existen, generar a partir de la factura aprobada
                cur.execute("""
                    SELECT 
                        i.*,
                        s.sapCode as supplierSapCode,
                        s.nit as supplierNit,
                        s.name as fullSupplierName,
                        ca.costCenterCode as areaCostCenterCode,
                        f.itemsJson as factureItemsJson,
                        f.aiShortSummary as factureAiShortSummary
                    FROM invoices i
                    LEFT JOIN suppliers s ON (LOWER(s.name) = LOWER(i.supplier) OR (s.name != '' AND INSTR(i.supplier, s.name) > 0))
                    LEFT JOIN company_areas ca ON (LOWER(ca.name) = LOWER(i.area))
                    LEFT JOIN facture_inbox_documents f ON (f.documentNumber = i.invoiceNumber)
                    WHERE i.id = %s
                """, (invoice_id,))
                inv = cur.fetchone()
                if not inv:
                    raise ValueError(f"Factura {invoice_id} no encontrada.")

                # Buscar si este proveedor / contrato recurrente ya tiene una plantilla previa guardada
                cur.execute("""
                    SELECT sp.* 
                    FROM sap_presolicitudes sp
                    JOIN invoices prev_i ON sp.invoiceId = prev_i.id
                    WHERE prev_i.id != %s 
                      AND (LOWER(prev_i.supplier) = LOWER(%s) OR (prev_i.contractNumber IS NOT NULL AND prev_i.contractNumber != '' AND prev_i.contractNumber = %s))
                    ORDER BY sp.createdAt DESC
                """, (invoice_id, inv.get("supplier", ""), inv.get("contractNumber", "")))
                prev_template_rows = cur.fetchall()
                prev_map = {p["itemLine"]: p for p in prev_template_rows} if prev_template_rows else {}
                prev_default = prev_template_rows[0] if prev_template_rows else None

                raw_items = inv.get("itemsJson") or inv.get("factureItemsJson")
                if isinstance(raw_items, str):
                    try:
                        items = json.loads(raw_items)
                    except Exception:
                        items = []
                elif isinstance(raw_items, list):
                    items = raw_items
                else:
                    items = []

                if not items:
                    ai_short_fallback = inv.get("aiShortSummary") or inv.get("factureAiShortSummary")
                    clean_desc = ai_short_fallback or inv.get("service") or f"Servicio Factura {inv.get('invoiceNumber')}"
                    if "SE RECIBE DOCUMENTO" in clean_desc.upper():
                        clean_desc = f"Servicio {inv.get('supplier')}"
                    val = float(inv.get("value") or 0.0)
                    base_price = round(val / 1.19, 2)
                    items = [{
                        "numeroItem": 1,
                        "codigo": "ISVVR00001",
                        "descripcion": clean_desc,
                        "unidadMedida": "Und",
                        "cantidad": 1.0,
                        "precioUnitario": base_price,
                        "porcentajeIva": 19.0,
                        "valorIva": round(val - base_price, 2),
                        "subtotal": base_price,
                        "total": val
                    }]

                # Determinar datos de SAP
                clean_digits = "".join([c for c in str(inv.get("supplierNit") or "") if c.isdigit()])
                suggested_supplier = inv.get("supplierSapCode") or (f"PN{clean_digits}" if clean_digits else "PN1144180553")
                cost_center = inv.get("areaCostCenterCode") or "AA0122"
                today_str = datetime.now().strftime("%d/%m/%Y")
                req_date = inv.get("dueDate") or inv.get("emissionDate") or today_str
                # Formato de fecha d/m/Y si es YYYY-MM-DD
                if "-" in str(req_date) and len(str(req_date).split("-")) == 3:
                    p = str(req_date).split("-")
                    req_date = f"{int(p[2])}/{int(p[1])}/{p[0]}"

                created_rows = []
                for idx, it in enumerate(items, 1):
                    prev_tmpl = prev_map.get(idx) or prev_default
                    qty = float(it.get("cantidad") or it.get("quantity") or 1.0)
                    price = float(it.get("precioUnitario") or it.get("unitPrice") or 0.0)
                    tax_pct = float(it.get("porcentajeIva") or (19.0 if (it.get("valorIva") or 0) > 0 else 0.0))
                    tax_indicator = prev_tmpl.get("taxIndicator") if (prev_tmpl and prev_tmpl.get("taxIndicator")) else ("IVAD33" if tax_pct >= 19.0 else ("IVAD0" if tax_pct == 0.0 else "IVAD5"))
                    
                    # Reutilizar plantilla previa si es recurrente, o valores predeterminados
                    item_code = (prev_tmpl.get("itemCode") if prev_tmpl else None) or it.get("codigo") or "ISVVR00001"
                    doc_type = (prev_tmpl.get("docType") if prev_tmpl else None) or "PEDIDO"
                    item_type = (prev_tmpl.get("itemType") if prev_tmpl else None) or "Servicios"
                    item_desc = (prev_tmpl.get("itemDescription") if prev_tmpl else None) or "Accesorios Varios (51)"
                    warehouse = (prev_tmpl.get("warehouse") if prev_tmpl else None) or "Servic01"
                    item_cc = (prev_tmpl.get("costCenter") if prev_tmpl else None) or cost_center

                    # Descripción exacta de cada ítem leído por AI del PDF
                    item_name = (it.get("descripcion") or it.get("name") or "").strip()
                    if not item_name or "SE RECIBE DOCUMENTO" in item_name.upper():
                        item_name = (inv.get("aiShortSummary") or inv.get("factureAiShortSummary") or f"Servicio {inv.get('supplier')}").strip()
                    
                    # Determinar PRECIO INFO base y porcentaje de descuento
                    discount_pct = float(it.get("porcentajeDescuento") or 0.0)
                    ai_item_total = float(it.get("total") or 0.0)
                    ai_subtotal = float(it.get("subtotal") or 0.0)

                    if price == 0 and qty > 0:
                        if ai_subtotal > 0:
                            price = round(ai_subtotal / qty, 2)
                        elif ai_item_total > 0:
                            price = round((ai_item_total / (1.0 + tax_pct / 100.0)) / qty, 2) if tax_pct > 0 else round(ai_item_total / qty, 2)

                    # Total ML automático: PRECIO INFO + IVA (si IVA es 0, solo PRECIO INFO)
                    base_line = round(qty * price * (1.0 - discount_pct / 100.0), 2)
                    tax_line = round(base_line * (tax_pct / 100.0), 2) if tax_pct > 0 else 0.0
                    total_ml = round(base_line + tax_line, 2)

                    row_id = f"presol-{invoice_id}-{idx}"

                    cur.execute("""
                        INSERT INTO sap_presolicitudes (
                            id, invoiceId, docNumber, itemLine, itemCode, docType, itemType,
                            itemDescription, additionalDescription, requiredQuantity, unit,
                            infoPrice, taxIndicator, taxPercentage, discountPercentage, warehouse,
                            suggestedSupplier, requiredDate, costCenter, totalMl, requestedBy,
                            observation, motive, urgency, originCountry, foreignUnitPrice,
                            transportRequestDate, billingManagement, donationNovelty, freeText,
                            currency, donationNovelty2, giftNovelty, status
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s,
                            %s, %s, %s, %s,
                            %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s,
                            %s, %s, %s, %s,
                            %s, %s, %s, %s
                        )
                    """, (
                        row_id, invoice_id, inv.get("invoiceNumber"), idx, item_code, doc_type, item_type,
                        item_desc, item_name, qty, it.get("unidadMedida") or "Und",
                        price, tax_indicator, tax_pct, discount_pct, warehouse,
                        suggested_supplier, str(req_date), item_cc, total_ml,
                        inv.get("approvedBy") or current_user_name,
                        f"Factura {inv.get('invoiceNumber')}", "", "Normal", "CO", 0.0,
                        "", "SI", "", "",
                        "COP", "", "", "Borrador"
                    ))

                    created_rows.append({
                        "id": row_id,
                        "invoiceId": invoice_id,
                        "docNumber": inv.get("invoiceNumber"),
                        "itemLine": idx,
                        "itemCode": item_code,
                        "docType": doc_type,
                        "itemType": item_type,
                        "itemDescription": item_desc,
                        "additionalDescription": item_name,
                        "requiredQuantity": qty,
                        "unit": it.get("unidadMedida") or "Und",
                        "infoPrice": price,
                        "taxIndicator": tax_indicator,
                        "taxPercentage": tax_pct,
                        "discountPercentage": discount_pct,
                        "warehouse": warehouse,
                        "suggestedSupplier": suggested_supplier,
                        "requiredDate": str(req_date),
                        "costCenter": item_cc,
                        "totalMl": total_ml,
                        "requestedBy": inv.get("approvedBy") or current_user_name,
                        "observation": f"Factura {inv.get('invoiceNumber')}",
                        "motive": "",
                        "urgency": "Normal",
                        "originCountry": "CO",
                        "foreignUnitPrice": 0.0,
                        "transportRequestDate": "",
                        "billingManagement": "SI",
                        "donationNovelty": "",
                        "freeText": "",
                        "currency": "COP",
                        "donationNovelty2": "",
                        "giftNovelty": "",
                        "status": "Borrador"
                    })
                conn.commit()
                return {
                    "invoiceId": invoice_id,
                    "rows": created_rows,
                    "isNew": True
                }

    def save_sap_presolicitud_rows(self, invoice_id: str, rows: List[Dict[str, Any]], current_user_name: str = "Usuario") -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("DELETE FROM sap_presolicitudes WHERE invoiceId = %s", (invoice_id,))
                for idx, r in enumerate(rows, 1):
                    row_id = r.get("id") or f"presol-{invoice_id}-{idx}"
                    q = float(r.get("requiredQuantity") or 1.0)
                    p = float(r.get("infoPrice") or 0.0)
                    t = float(r.get("taxPercentage") or 0.0)
                    d = float(r.get("discountPercentage") or 0.0)
                    base = round(q * p * (1.0 - d / 100.0), 2)
                    tax_line = round(base * (t / 100.0), 2) if t > 0 else 0.0
                    calc_total_ml = round(base + tax_line, 2)

                    cur.execute("""
                        INSERT INTO sap_presolicitudes (
                            id, invoiceId, docNumber, itemLine, itemCode, docType, itemType,
                            itemDescription, additionalDescription, requiredQuantity, unit,
                            infoPrice, taxIndicator, taxPercentage, discountPercentage, warehouse,
                            suggestedSupplier, requiredDate, costCenter, totalMl, requestedBy,
                            observation, motive, urgency, originCountry, foreignUnitPrice,
                            transportRequestDate, billingManagement, donationNovelty, freeText,
                            currency, donationNovelty2, giftNovelty, status
                        ) VALUES (
                            %s, %s, %s, %s, %s, %s, %s,
                            %s, %s, %s, %s,
                            %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s,
                            %s, %s, %s, %s, %s,
                            %s, %s, %s, %s,
                            %s, %s, %s, %s
                        )
                    """, (
                        row_id, invoice_id, r.get("docNumber"), idx, r.get("itemCode", "ISVVR00001"),
                        r.get("docType", "PEDIDO"), r.get("itemType", "Servicios"),
                        r.get("itemDescription", "Accesorios Varios (51)"), r.get("additionalDescription", ""),
                        q, r.get("unit", "Und"),
                        p, r.get("taxIndicator", "IVAD33"),
                        t, d,
                        r.get("warehouse", "Servic01"), r.get("suggestedSupplier", ""),
                        r.get("requiredDate", ""), r.get("costCenter", "AA0122"),
                        calc_total_ml, r.get("requestedBy", current_user_name),
                        r.get("observation", ""), r.get("motive", ""), r.get("urgency", ""),
                        r.get("originCountry", "CO"), float(r.get("foreignUnitPrice") or 0.0),
                        r.get("transportRequestDate", ""), r.get("billingManagement", ""),
                        r.get("donationNovelty", ""), r.get("freeText", ""),
                        r.get("currency", "COP"), r.get("donationNovelty2", ""),
                        r.get("giftNovelty", ""), r.get("status", "Guardado")
                    ))
                conn.commit()
                return True
