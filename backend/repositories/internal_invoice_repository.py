import json
import time
from datetime import datetime
from typing import List, Dict, Any, Optional
from backend.repositories.base_repository import BaseRepository

class InternalInvoiceRepositoryMixin(BaseRepository):
    """Módulo de repositorio para facturas internas, radicación local de proveedores, eventos DIAN y contratos habituales."""

    def fetch_internal_invoices(self, folder: Optional[str] = None, folder_type: Optional[str] = None, search: Optional[str] = None, supplier_nit: Optional[str] = None, limit: Optional[int] = 1000) -> List[Dict[str, Any]]:
        target_folder = folder or folder_type
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                query = "SELECT * FROM internal_uploaded_invoices WHERE 1=1"
                params = []

                if supplier_nit and supplier_nit.strip():
                    clean_nit = supplier_nit.strip()
                    # Buscar coincidencia exacta o sin dígito de verificación
                    nit_base = clean_nit.split('-')[0].strip()
                    query += " AND (issuerNit = %s OR issuerNit LIKE %s)"
                    params.extend([clean_nit, f"{nit_base}%"])

                if target_folder and target_folder != "Todos":
                    if target_folder == "Recibidos" or target_folder == "Recibidos Crédito":
                        query += " AND (folderType = 'Recibidos' OR paymentType = 'Crédito') AND docType != 'NOTA CRÉDITO'"
                    elif target_folder == "Recibidos (contado)" or target_folder == "Recibidos Contado":
                        query += " AND (folderType = 'Recibidos (contado)' OR paymentType = 'Contado') AND docType != 'NOTA CRÉDITO'"
                    elif target_folder == "Notas Crédito":
                        query += " AND docType = 'NOTA CRÉDITO'"
                    elif target_folder == "Procesados":
                        query += " AND (folderType = 'Procesados' OR status IN ('Procesada', 'Vinculada', 'Aprobada') OR importedToMain = 1)"
                    else:
                        query += " AND folderType = %s"
                        params.append(target_folder)

                if search and search.strip():
                    term = f"%{search.strip().lower()}%"
                    query += " AND (LOWER(documentNumber) LIKE %s OR LOWER(issuerName) LIKE %s OR LOWER(issuerNit) LIKE %s OR LOWER(referenceNumber) LIKE %s OR LOWER(rawDetail) LIKE %s)"
                    params.extend([term, term, term, term, term])

                query += " ORDER BY createdAt DESC LIMIT %s"
                params.append(limit or 1000)
                cursor.execute(query, tuple(params))
                return cursor.fetchall()

    def fetch_internal_invoice_by_id(self, doc_id: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM internal_uploaded_invoices WHERE id = %s OR documentNumber = %s", (doc_id, doc_id))
                return cursor.fetchone()

    def update_internal_invoice_event(self, doc_id: str, event_type: str) -> Dict[str, Any]:
        """Registra la ejecución de eventos DIAN (030, 032, 033, 031) y notifica al proveedor."""
        now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        event_code = str(event_type).strip()

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                if event_code in ["030", "acuse", "Acuse"]:
                    sql = """
                        UPDATE internal_uploaded_invoices
                        SET eventAcuse = 1,
                            eventAcuseDate = %s,
                            eventStatus = 'Acusada (Evento 030 DIAN)',
                            eventNotification = %s,
                            updatedAt = NOW()
                        WHERE id = %s OR documentNumber = %s
                    """
                    msg = f"Evento 030 (Acuse de Recibo) generado exitosamente por Alimentos Enriko el {now_str}."
                    cursor.execute(sql, (now_str, msg, doc_id, doc_id))
                elif event_code in ["032", "recibo", "Recibo"]:
                    sql = """
                        UPDATE internal_uploaded_invoices
                        SET eventRecibo = 1,
                            eventReciboDate = %s,
                            eventStatus = 'Bienes / Servicios Recibidos (Evento 032 DIAN)',
                            eventNotification = %s,
                            updatedAt = NOW()
                        WHERE id = %s OR documentNumber = %s
                    """
                    msg = f"Evento 032 (Recibo del Bien o Servicio) confirmado formalmente el {now_str}."
                    cursor.execute(sql, (now_str, msg, doc_id, doc_id))
                elif event_code in ["033", "aceptacion", "Aceptación", "Aceptacion"]:
                    sql = """
                        UPDATE internal_uploaded_invoices
                        SET eventAceptacion = 1,
                            eventAceptacionDate = %s,
                            eventStatus = 'Aceptada Expresamente (Título Valor RADIAN 033)',
                            eventNotification = %s,
                            status = 'Aprobada',
                            updatedAt = NOW()
                        WHERE id = %s OR documentNumber = %s
                    """
                    msg = f"¡Factura Aceptada Expresamente! Constituida como título valor ante la DIAN el {now_str}."
                    cursor.execute(sql, (now_str, msg, doc_id, doc_id))
                elif event_code in ["031", "rechazo", "Rechazo", "reclamo"]:
                    sql = """
                        UPDATE internal_uploaded_invoices
                        SET eventRechazo = 1,
                            eventRechazoDate = %s,
                            eventStatus = 'Reclamada / Rechazada (Evento 031 DIAN)',
                            eventNotification = %s,
                            status = 'Rechazada',
                            updatedAt = NOW()
                        WHERE id = %s OR documentNumber = %s
                    """
                    msg = f"Se registró reclamo (Evento 031 DIAN) sobre este documento el {now_str}."
                    cursor.execute(sql, (now_str, msg, doc_id, doc_id))
                else:
                    raise ValueError(f"Tipo de evento {event_type} no reconocido.")

                return {"success": True, "event": event_code, "executedAt": now_str, "message": msg}

    def save_internal_invoice(self, data: Dict[str, Any]) -> str:
        doc_num = data.get("documentNumber", "").strip()
        doc_id = data.get("id") or f"int-{doc_num.replace(' ', '-').replace('/', '-')}"
        
        items_json = data.get("itemsJson")
        if isinstance(items_json, (list, dict)):
            items_json_str = json.dumps(items_json)
        else:
            items_json_str = items_json or "[]"

        subtotal = float(data.get("subtotalAmount") or 0.0)
        iva = float(data.get("ivaAmount") or 0.0)
        total = float(data.get("totalAmount") or (subtotal + iva))
        neto = float(data.get("netPayableAmount") or total)

        doc_type = data.get("docType") or "FACTURA DE VENTA"
        payment_type = data.get("paymentType") or "Crédito"
        folder_type = "Notas Crédito" if doc_type == "NOTA CRÉDITO" else ("Recibidos (contado)" if payment_type == "Contado" else "Recibidos")

        contract_num = data.get("contractNumber") or ""

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO internal_uploaded_invoices (
                        id, documentNumber, docType, paymentType, referenceNumber, contractNumber,
                        issuerName, issuerNit, clientName, clientNit, emissionDate, dueDate,
                        paymentCondition, paymentMethod, subtotalAmount, ivaAmount, totalAmount,
                        retentionAmount, netPayableAmount, hasIva, itemsCount, itemsWithIvaCount,
                        itemsWithoutIvaCount, rawDetail, itemsJson, pdfPath, pdfOriginalName,
                        status, folderType, uploadedBy
                    ) VALUES (
                        %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s, %s, %s,
                        %s, %s, %s
                    )
                    ON DUPLICATE KEY UPDATE
                        docType = VALUES(docType),
                        paymentType = VALUES(paymentType),
                        referenceNumber = VALUES(referenceNumber),
                        contractNumber = VALUES(contractNumber),
                        issuerName = VALUES(issuerName),
                        issuerNit = VALUES(issuerNit),
                        clientName = VALUES(clientName),
                        clientNit = VALUES(clientNit),
                        emissionDate = VALUES(emissionDate),
                        dueDate = VALUES(dueDate),
                        paymentCondition = VALUES(paymentCondition),
                        paymentMethod = VALUES(paymentMethod),
                        subtotalAmount = VALUES(subtotalAmount),
                        ivaAmount = VALUES(ivaAmount),
                        totalAmount = VALUES(totalAmount),
                        retentionAmount = VALUES(retentionAmount),
                        netPayableAmount = VALUES(netPayableAmount),
                        hasIva = VALUES(hasIva),
                        itemsCount = VALUES(itemsCount),
                        itemsWithIvaCount = VALUES(itemsWithIvaCount),
                        itemsWithoutIvaCount = VALUES(itemsWithoutIvaCount),
                        rawDetail = VALUES(rawDetail),
                        itemsJson = VALUES(itemsJson),
                        pdfPath = VALUES(pdfPath),
                        pdfOriginalName = VALUES(pdfOriginalName),
                        status = VALUES(status),
                        folderType = VALUES(folderType),
                        uploadedBy = VALUES(uploadedBy)
                """
                cursor.execute(sql, (
                    doc_id,
                    doc_num,
                    doc_type,
                    payment_type,
                    data.get("referenceNumber", ""),
                    contract_num,
                    data.get("issuerName", "").strip(),
                    data.get("issuerNit", "").strip(),
                    data.get("clientName", "ALIMENTOS ENRIKO SAS"),
                    data.get("clientNit", "890330035"),
                    data.get("emissionDate", ""),
                    data.get("dueDate", ""),
                    data.get("paymentCondition", "CREDITO 30 DIAS"),
                    data.get("paymentMethod", "TRANSFERENCIA"),
                    subtotal,
                    iva,
                    total,
                    float(data.get("retentionAmount") or 0.0),
                    neto,
                    1 if iva > 0 else 0,
                    int(data.get("itemsCount") or 1),
                    int(data.get("itemsWithIvaCount") or (1 if iva > 0 else 0)),
                    int(data.get("itemsWithoutIvaCount") or (0 if iva > 0 else 1)),
                    data.get("rawDetail", ""),
                    items_json_str,
                    data.get("pdfPath"),
                    data.get("pdfOriginalName"),
                    data.get("status", "Radicada"),
                    folder_type,
                    data.get("uploadedBy", "Proveedor")
                ))
                return doc_id

    def delete_internal_invoice(self, doc_id: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT documentNumber, mainInvoiceId FROM internal_uploaded_invoices WHERE id = %s", (doc_id,))
                row = cursor.fetchone()
                doc_num = (row.get("documentNumber") or "").strip() if row else ""
                main_inv_id = row.get("mainInvoiceId") if row else None

                cursor.execute("DELETE FROM internal_uploaded_invoices WHERE id = %s", (doc_id,))
                deleted = cursor.rowcount > 0

                if doc_num:
                    cursor.execute("UPDATE facture_inbox_documents SET isSyncedToMain = 0 WHERE documentNumber = %s", (doc_num,))
                    cursor.execute("DELETE FROM sap_presolicitudes WHERE docNumber = %s", (doc_num,))
                    cursor.execute("DELETE FROM invoices WHERE invoiceNumber = %s", (doc_num,))
                if main_inv_id:
                    cursor.execute("DELETE FROM invoices WHERE id = %s", (main_inv_id,))
                    cursor.execute("DELETE FROM sap_presolicitudes WHERE invoiceId = %s", (main_inv_id,))
                return deleted

    def import_internal_to_main(self, doc_id: str) -> Dict[str, Any]:
        doc = self.fetch_internal_invoice_by_id(doc_id)
        if not doc:
            raise ValueError(f"Documento {doc_id} no encontrado")

        # 1. Asegurar proveedor
        issuer_name = doc.get("issuerName", "Proveedor").strip()
        issuer_nit = doc.get("issuerNit", "").strip()
        doc_contract = doc.get("contractNumber") or ""
        doc_detail = doc.get("rawDetail") or f"Suministro {doc.get('documentNumber')}"
        
        # Buscar o crear proveedor y actualizar concepto/contrato habitual si aplica
        sup_id = None
        supplier_area = "General"
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, area, services FROM suppliers WHERE nit = %s OR LOWER(name) = LOWER(%s)", (issuer_nit, issuer_name))
                existing_sup = cur.fetchone()
                if existing_sup:
                    sup_id = existing_sup["id"]
                    supplier_area = existing_sup.get("area") or "General"
                    # Si tiene contrato, registrarlo en la lista de servicios habituales del proveedor
                    if doc_contract:
                        try:
                            srvs = json.loads(existing_sup.get("services") or "[]")
                        except Exception:
                            srvs = []
                        has_concept = any(s.get("contractNumber") == doc_contract or s.get("serviceName") == doc_detail for s in srvs)
                        if not has_concept:
                            srvs.append({
                                "serviceName": doc_detail,
                                "type": "factura",
                                "contractNumber": doc_contract,
                                "enabled": True
                            })
                            cur.execute("UPDATE suppliers SET services = %s WHERE id = %s", (json.dumps(srvs), sup_id))
                else:
                    sup_id = f"sup-{int(time.time() * 1000)}"
                    init_services = []
                    if doc_contract:
                        init_services.append({
                            "serviceName": doc_detail,
                            "type": "factura",
                            "contractNumber": doc_contract,
                            "enabled": True
                        })
                    cur.execute("""
                        INSERT INTO suppliers (id, nit, name, contact, phone, area, monthlyCount, services)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (sup_id, issuer_nit, issuer_name, "Contacto Directo", "", "General", 1, json.dumps(init_services)))

        # 2. Guardar en invoices principal
        inv_id = f"inv-{int(time.time() * 1000)}"
        emission_dt = doc.get("emissionDate") or datetime.now().strftime("%Y-%m-%d")
        
        main_inv = {
            "id": inv_id,
            "supplier": issuer_name,
            "area": supplier_area,
            "service": doc_detail,
            "invoiceNumber": doc.get("documentNumber"),
            "emissionDate": emission_dt,
            "deliveryDate": None,
            "dueDate": doc.get("dueDate"),
            "value": float(doc.get("totalAmount") or 0.0),
            "signed": "NO",
            "approvalStatus": "Pendiente",
            "orderStd": "SÍ" if doc.get("referenceNumber") else "NO",
            "oc": doc.get("referenceNumber") or "",
            "contractNumber": doc_contract,
            "enFacture": "SÍ",
            "delivered": "NO",
            "pdfPath": doc.get("pdfPath"),
            "pdfOriginalName": doc.get("pdfOriginalName"),
            "itemsJson": doc.get("itemsJson")
        }
        self.save_invoice(main_inv)

        # 3. Marcar documento interno como importado
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE internal_uploaded_invoices 
                    SET importedToMain = 1, mainInvoiceId = %s, status = 'Vinculada', folderType = 'Procesados'
                    WHERE id = %s
                """, (inv_id, doc_id))

        return {"success": True, "mainInvoiceId": inv_id, "supplierId": sup_id}

    def check_invoice_duplicate(self, invoice_number: str, supplier_name: Optional[str] = None) -> Optional[Dict[str, Any]]:
        clean_num = invoice_number.strip()
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                if supplier_name and supplier_name.strip():
                    cur.execute(
                        "SELECT * FROM invoices WHERE invoiceNumber = %s AND (LOWER(supplier) = LOWER(%s) OR supplier LIKE %s)",
                        (clean_num, supplier_name.strip(), f"%{supplier_name.strip()}%")
                    )
                else:
                    cur.execute("SELECT * FROM invoices WHERE invoiceNumber = %s", (clean_num,))
                return cur.fetchone()

    def save_habitual_supplier_contract_and_invoice(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        1. Valida si la factura ya existe.
        2. Registra o actualiza el proveedor asociando el servicio con su número de contrato como habitual.
        3. Inserta o actualiza la factura en invoices con contrato, área, ítems leídos por IA y estado 'Pendiente'
           para que pase directamente al módulo de Jefes por Área.
        """
        doc_num = (data.get("invoiceNumber") or data.get("documentNumber") or "").strip()
        supplier_name = (data.get("supplier") or data.get("issuerName") or "Proveedor").strip()
        supplier_nit = (data.get("supplierNit") or data.get("issuerNit") or "").strip()
        contract_num = (data.get("contractNumber") or "").strip()
        items_json = data.get("itemsJson") or []
        if isinstance(items_json, str):
            try:
                items_json = json.loads(items_json)
            except Exception:
                items_json = []

        ai_short = (data.get("aiShortSummary") or "").strip()
        if "SE RECIBE DOCUMENTO" in ai_short.upper():
            ai_short = ""

        if not ai_short and items_json:
            try:
                from backend.services.invoice_ai_service import InvoiceAIService
                built = InvoiceAIService._build_short_summary(items_json, f"Servicio {supplier_name}")
                if built and "SE RECIBE DOCUMENTO" not in built.upper():
                    ai_short = built
            except Exception:
                pass

        if not ai_short:
            ai_short = f"Servicio {supplier_name}"

        service_candidate = (data.get("service") or "").strip()
        if not service_candidate or "SE RECIBE DOCUMENTO" in service_candidate.upper():
            service_name = ai_short
        else:
            service_name = service_candidate

        area_name = (data.get("area") or "General").strip()
        emission_date = data.get("emissionDate") or datetime.now().strftime("%Y-%m-%d")
        due_date = data.get("dueDate")
        total_val = float(data.get("value") or data.get("totalAmount") or 0.0)
        pdf_path = data.get("pdfPath")
        pdf_orig = data.get("pdfOriginalName") or (f"{doc_num}.pdf" if doc_num else None)
        oc_num = data.get("oc") or data.get("referenceNumber") or ""

        # 1. Verificar si ya existe en invoices
        existing_invoice = self.check_invoice_duplicate(doc_num, supplier_name)
        is_duplicate = existing_invoice is not None

        if existing_invoice:
            existing_area = (existing_invoice.get("area") or "").strip()
            # No permitir vincular si ya hay otra area que la vinculo previamente
            if existing_area and existing_area != "General" and area_name and area_name != "General" and existing_area.lower() != area_name.lower():
                raise ValueError(f"No se puede vincular: La factura {doc_num} ya fue vinculada previamente por el área '{existing_area}' al proveedor '{existing_invoice.get('supplier')}'.")
            
            # Una factura solo se debe vincular una vez
            if existing_invoice.get("contractNumber") and existing_invoice.get("enFacture") == "SÍ":
                raise ValueError(f"La factura {doc_num} ya se encuentra vinculada al contrato '{existing_invoice.get('contractNumber')}' del proveedor '{existing_invoice.get('supplier')}'. Cada factura solo debe vincularse una única vez.")

        # 2. Registrar o actualizar proveedor con el contrato habitual
        sup_id = None
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT id, area, services, sapCode FROM suppliers WHERE (nit != '' AND nit = %s) OR LOWER(name) = LOWER(%s)", (supplier_nit, supplier_name))
                sup = cur.fetchone()
                if sup:
                    sup_id = sup["id"]
                    try:
                        srvs = json.loads(sup.get("services") or "[]")
                    except Exception:
                        srvs = []
                    # Agregar o actualizar el servicio habitual con el contrato
                    found = False
                    for s in srvs:
                        if s.get("serviceName") == service_name or (contract_num and s.get("contractNumber") == contract_num):
                            s["contractNumber"] = contract_num or s.get("contractNumber", "")
                            s["serviceName"] = service_name
                            s["enabled"] = True
                            found = True
                            break
                    if not found:
                        srvs.append({
                            "serviceName": service_name,
                            "type": "factura",
                            "contractNumber": contract_num,
                            "enabled": True
                        })
                    
                    # Asociar el proveedor con múltiples áreas si aún no incluye el área actual
                    existing_areas = [a.strip() for a in (sup.get("area") or "").split(",") if a.strip()]
                    if area_name and area_name != "General":
                        if not any(a.lower() == area_name.lower() for a in existing_areas):
                            if "General" in existing_areas:
                                existing_areas.remove("General")
                            existing_areas.append(area_name)
                    updated_area_str = ", ".join(existing_areas) if existing_areas else area_name

                    cur.execute(
                        "UPDATE suppliers SET services = %s, area = %s, updatedAt = NOW() WHERE id = %s",
                        (json.dumps(srvs), updated_area_str, sup_id)
                    )
                else:
                    sup_id = f"sup-{int(time.time() * 1000)}"
                    init_srvs = [{
                        "serviceName": service_name,
                        "type": "factura",
                        "contractNumber": contract_num,
                        "enabled": True
                    }]
                    cur.execute("""
                        INSERT INTO suppliers (id, nit, name, contact, phone, area, monthlyCount, services)
                        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """, (sup_id, supplier_nit, supplier_name, "Contacto Directo", "", area_name, 1, json.dumps(init_srvs)))

        # 3. Guardar / Actualizar en invoices con approvalStatus = 'Pendiente' para el módulo de Jefes
        inv_id = existing_invoice["id"] if existing_invoice else f"inv-{int(time.time() * 1000)}"
        
        main_inv = {
            "id": inv_id,
            "supplier": supplier_name,
            "area": area_name,
            "service": service_name,
            "aiShortSummary": ai_short or service_name,
            "invoiceNumber": doc_num,
            "emissionDate": emission_date,
            "deliveryDate": existing_invoice.get("deliveryDate") if existing_invoice else None,
            "dueDate": due_date,
            "value": total_val,
            "signed": "NO",
            "approvalStatus": "Pendiente",
            "orderStd": "SÍ" if oc_num else "NO",
            "oc": oc_num,
            "contractNumber": contract_num,
            "enFacture": "SÍ",
            "delivered": existing_invoice.get("delivered", "NO") if existing_invoice else "NO",
            "pdfPath": pdf_path or (existing_invoice.get("pdfPath") if existing_invoice else None),
            "pdfOriginalName": pdf_orig or (existing_invoice.get("pdfOriginalName") if existing_invoice else None),
            "itemsJson": items_json,
            "dianEventsStatus": data.get("dianEventsStatus") or "PENDIENTE",
            "recurrentParentId": data.get("recurrentParentId"),
            "recurrentMatchReason": data.get("recurrentMatchReason")
        }
        self.save_invoice(main_inv)

        # 4. Asegurar actualización en facture_inbox_documents si existe
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE facture_inbox_documents 
                    SET isSyncedToMain = 1,
                        aiShortSummary = IF(%s != '', %s, aiShortSummary)
                    WHERE documentNumber = %s OR id = %s
                """, (ai_short, ai_short, doc_num, f"facture-{doc_num}"))

        return {
            "success": True,
            "invoiceId": inv_id,
            "supplierId": sup_id,
            "isDuplicate": is_duplicate,
            "contractNumber": contract_num,
            "area": area_name,
            "message": f"Factura {doc_num} {'actualizada' if is_duplicate else 'registrada'} con contrato habitual '{contract_num}' y enviada al módulo de Jefes de Área."
        }
