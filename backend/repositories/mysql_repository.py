import pymysql
import json
import time
from typing import List, Dict, Any, Optional
from backend.config.settings import DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

class MySQLRepository:
    @staticmethod
    def get_connection():
        return pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor,
            autocommit=True
        )

    # --- INVOICES ---
    def fetch_all_invoices(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM invoices ORDER BY createdAt DESC")
                rows = cursor.fetchall()
                for r in rows:
                    if "value" in r and r["value"] is not None:
                        r["value"] = float(r["value"])
                return rows

    def save_invoice(self, data: Dict[str, Any]) -> str:
        inv_id = data.get("id") or f"inv-{int(time.time() * 1000)}"
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO invoices (
                        id, supplier, service, invoiceNumber, emissionDate, deliveryDate,
                        value, signed, orderStd, oc, enFacture, delivered, pdfPath, pdfOriginalName
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        supplier = VALUES(supplier),
                        service = VALUES(service),
                        invoiceNumber = VALUES(invoiceNumber),
                        emissionDate = VALUES(emissionDate),
                        deliveryDate = VALUES(deliveryDate),
                        value = VALUES(value),
                        signed = VALUES(signed),
                        orderStd = VALUES(orderStd),
                        oc = VALUES(oc),
                        enFacture = VALUES(enFacture),
                        delivered = VALUES(delivered),
                        pdfPath = VALUES(pdfPath),
                        pdfOriginalName = VALUES(pdfOriginalName);
                """
                cursor.execute(sql, (
                    inv_id,
                    data.get("supplier", ""),
                    data.get("service", ""),
                    data.get("invoiceNumber", ""),
                    data.get("emissionDate", ""),
                    data.get("deliveryDate", ""),
                    float(data.get("value", 0) or 0),
                    data.get("signed", "NO"),
                    data.get("orderStd", "NO"),
                    data.get("oc", ""),
                    data.get("enFacture", "AÚN NO"),
                    data.get("delivered", "NO"),
                    data.get("pdfPath", None),
                    data.get("pdfOriginalName", None)
                ))
                return inv_id

    def update_invoice_field(self, invoice_id: str, field: str, value: Any) -> bool:
        allowed_fields = [
            "supplier", "service", "invoiceNumber", "emissionDate", "deliveryDate",
            "value", "signed", "orderStd", "oc", "enFacture", "delivered",
            "pdfPath", "pdfOriginalName", "emailSent", "emailSentAt"
        ]
        if field not in allowed_fields:
            raise ValueError(f"Campo {field} no permitido para actualización")

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
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
                        "senderName": "Alimentos Enriko S.A.S. — Control de Facturas",
                        "emailSubject": "Reporte de Facturas Entregadas — Alimentos Enriko S.A.S.",
                        "emailTemplate": "Estimado equipo de Contabilidad y Pagos,\n\nAdjunto remitimos el reporte detallado de las facturas que han sido radicadas y entregadas formalmente para su respectiva causación y trámite de pago.\n\nPor favor verificar el detalle en la tabla anexa.",
                        "frequency": "manual",
                        "outlookIntegrationEnabled": 1
                    }
                return row

    def save_email_settings(self, data: Dict[str, Any]) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO email_settings (
                        id, recipientEmail, senderName, emailSubject, emailTemplate,
                        frequency, outlookIntegrationEnabled, smtpHost, smtpPort, smtpUser, smtpPassword
                    ) VALUES ('default', %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        recipientEmail = VALUES(recipientEmail),
                        senderName = VALUES(senderName),
                        emailSubject = VALUES(emailSubject),
                        emailTemplate = VALUES(emailTemplate),
                        frequency = VALUES(frequency),
                        outlookIntegrationEnabled = VALUES(outlookIntegrationEnabled),
                        smtpHost = VALUES(smtpHost),
                        smtpPort = VALUES(smtpPort),
                        smtpUser = VALUES(smtpUser),
                        smtpPassword = VALUES(smtpPassword)
                """, (
                    data.get("recipientEmail", "contabilidad@alimentosenriko.com"),
                    data.get("senderName", "Alimentos Enriko S.A.S. — Control de Facturas"),
                    data.get("emailSubject", "Reporte de Facturas Entregadas — Alimentos Enriko S.A.S."),
                    data.get("emailTemplate", ""),
                    data.get("frequency", "manual"),
                    int(data.get("outlookIntegrationEnabled", 1) or 1),
                    data.get("smtpHost", "smtp.office365.com"),
                    int(data.get("smtpPort", 587) or 587),
                    data.get("smtpUser", ""),
                    data.get("smtpPassword", "")
                ))
                return True

    def delete_invoice(self, invoice_id: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM invoices WHERE id = %s", (invoice_id,))
                return cursor.rowcount > 0

    def clean_invoices(self) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM invoices")
                return True

    # --- SUPPLIERS ---
    def fetch_all_suppliers(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM suppliers ORDER BY name ASC")
                rows = cursor.fetchall()
                for r in rows:
                    if isinstance(r.get("services"), str):
                        try:
                            r["services"] = json.loads(r["services"])
                        except Exception:
                            r["services"] = []
                    elif not r.get("services"):
                        r["services"] = []
                return rows

    def save_supplier(self, data: Dict[str, Any]) -> str:
        sup_id = data.get("id") or f"sup-{int(pymysql.time.time() * 1000)}"
        services = data.get("services", [])
        services_json = json.dumps(services) if not isinstance(services, str) else services

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO suppliers (id, nit, name, contact, phone, monthlyCount, area, services, email)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        nit = VALUES(nit),
                        name = VALUES(name),
                        contact = VALUES(contact),
                        phone = VALUES(phone),
                        monthlyCount = VALUES(monthlyCount),
                        area = VALUES(area),
                        services = VALUES(services),
                        email = VALUES(email);
                """
                cursor.execute(sql, (
                    sup_id,
                    data.get("nit", ""),
                    data.get("name", ""),
                    data.get("contact", ""),
                    data.get("phone", ""),
                    int(data.get("monthlyCount", 1) or 1),
                    data.get("area", "General"),
                    services_json,
                    data.get("email", None)
                ))
                return sup_id

    def update_supplier_services(self, supplier_id: str, services: List[Dict[str, Any]]) -> bool:
        services_json = json.dumps(services)
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute(
                    "UPDATE suppliers SET services = %s, updatedAt = NOW() WHERE id = %s",
                    (services_json, supplier_id)
                )
                return cursor.rowcount > 0

    def delete_supplier(self, supplier_id: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM suppliers WHERE id = %s", (supplier_id,))
                return cursor.rowcount > 0

    # --- CRM QUOTATIONS ---
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

    # --- TECH INVENTORY ---
    def fetch_inventory(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM tech_inventory ORDER BY category ASC, name ASC")
                return cursor.fetchall()

    def save_inventory_item(self, data: Dict[str, Any]) -> str:
        item_id = data.get("id") or f"ti-{int(time.time() * 1000)}"
        qty = int(data.get("quantity") or 0)
        status = data.get("status") or ("Disponible" if qty > 0 else "Agotado")
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                sql = """
                    INSERT INTO tech_inventory (
                        id, category, name, brandModel, serialCode, quantity, unit, areaAssigned, status, notes
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        category = VALUES(category),
                        name = VALUES(name),
                        brandModel = VALUES(brandModel),
                        serialCode = VALUES(serialCode),
                        quantity = VALUES(quantity),
                        unit = VALUES(unit),
                        areaAssigned = VALUES(areaAssigned),
                        status = VALUES(status),
                        notes = VALUES(notes);
                """
                cursor.execute(sql, (
                    item_id,
                    data.get("category") or "Periféricos",
                    data.get("name") or "",
                    data.get("brandModel") or "",
                    data.get("serialCode") or "",
                    qty,
                    data.get("unit") or "Unidades",
                    data.get("areaAssigned") or "Tecnología (TI)",
                    status,
                    data.get("notes") or ""
                ))
                return item_id

    def loan_inventory_item(self, item_id: str, quantity_to_loan: int, recipient: str, area: str, action_type: str = "Préstamo", notes: str = "") -> Dict[str, Any]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM tech_inventory WHERE id = %s", (item_id,))
                row = cursor.fetchone()
                if not row:
                    raise ValueError("Artículo no encontrado")
                
                current_qty = int(row.get("quantity") or 0)
                if current_qty < quantity_to_loan:
                    raise ValueError(f"Cantidad insuficiente. Stock disponible: {current_qty}, solicitado: {quantity_to_loan}")

                new_qty = current_qty - quantity_to_loan
                new_status = "Disponible" if new_qty > 0 else "Agotado"
                date_str = time.strftime('%Y-%m-%d %H:%M:%S')
                log_entry = f"\n[{action_type.upper()} {date_str}]: {quantity_to_loan} {row.get('unit', 'uds')} entregados a {recipient} ({area})."
                updated_notes = (row.get("notes") or "") + log_entry

                # Actualizar stock en tech_inventory
                cursor.execute(
                    "UPDATE tech_inventory SET quantity = %s, status = %s, notes = %s, updatedAt = NOW() WHERE id = %s",
                    (new_qty, new_status, updated_notes, item_id)
                )

                # Registrar movimiento en inventory_movements
                movement_id = f"mov-{int(time.time() * 1000)}"
                cursor.execute("""
                    INSERT INTO inventory_movements (
                        id, itemId, itemName, itemCategory, quantity, recipient, area, actionType, status, notes
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    movement_id,
                    item_id,
                    row.get("name") or "Artículo",
                    row.get("category") or "General",
                    quantity_to_loan,
                    recipient,
                    area,
                    action_type,
                    "Activo" if action_type == "Préstamo" else "Entregado",
                    notes or log_entry.strip()
                ))

                return {
                    "success": True,
                    "movementId": movement_id,
                    "previousQuantity": current_qty,
                    "loanedQuantity": quantity_to_loan,
                    "remainingQuantity": new_qty
                }

    def return_inventory_movement(self, movement_id: str, return_qty: int = 0, return_notes: str = "") -> Dict[str, Any]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM inventory_movements WHERE id = %s", (movement_id,))
                mov = cursor.fetchone()
                if not mov:
                    raise ValueError("Movimiento no encontrado")

                item_id = mov.get("itemId")
                qty = return_qty if return_qty > 0 else int(mov.get("quantity") or 1)

                # Devolver cantidad a stock
                cursor.execute("SELECT quantity FROM tech_inventory WHERE id = %s", (item_id,))
                inv_row = cursor.fetchone()
                if inv_row:
                    new_inv_qty = int(inv_row.get("quantity") or 0) + qty
                    new_inv_status = "Disponible" if new_inv_qty > 0 else "Agotado"
                    cursor.execute(
                        "UPDATE tech_inventory SET quantity = %s, status = %s, updatedAt = NOW() WHERE id = %s",
                        (new_inv_qty, new_inv_status, item_id)
                    )

                # Actualizar movimiento
                cursor.execute("""
                    UPDATE inventory_movements 
                    SET status = 'Devuelto', returnDate = NOW(), returnedQuantity = %s, notes = CONCAT(COALESCE(notes,''), %s), updatedAt = NOW()
                    WHERE id = %s
                """, (
                    qty,
                    f"\n[DEVOLUCIÓN {time.strftime('%Y-%m-%d')}]: {qty} uds devueltas. {return_notes}".strip(),
                    movement_id
                ))

                return {"success": True, "message": f"Devolución de {qty} unidades registrada correctamente"}

    def fetch_inventory_movements(self, item_id: Optional[str] = None) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                if item_id:
                    cursor.execute("SELECT * FROM inventory_movements WHERE itemId = %s ORDER BY movementDate DESC", (item_id,))
                else:
                    cursor.execute("SELECT * FROM inventory_movements ORDER BY movementDate DESC")
                return cursor.fetchall()

    def delete_inventory_item(self, item_id: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM tech_inventory WHERE id = %s", (item_id,))
                return cursor.rowcount > 0

    # --- INVENTORY CATEGORIES ---
    def fetch_inventory_categories(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM inventory_categories ORDER BY name ASC")
                return cursor.fetchall()

    def save_inventory_category(self, data: Dict[str, Any]) -> str:
        cat_id = data.get("id") or f"cat-{int(time.time() * 1000)}"
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO inventory_categories (id, name, description, icon)
                    VALUES (%s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE name=VALUES(name), description=VALUES(description), icon=VALUES(icon)
                """, (
                    cat_id,
                    data.get("name", "").strip(),
                    data.get("description", "").strip(),
                    data.get("icon", "Layers")
                ))
                return cat_id

    def delete_inventory_category(self, cat_id: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM inventory_categories WHERE id = %s", (cat_id,))
                return cursor.rowcount > 0

    # --- INICIO DE MES: GENERAR PLANTILLA RECURRENTE Y MIGRAR NO ENTREGADAS ---
    def generate_month_template(self, target_year: str, target_month: str) -> Dict[str, Any]:
        """
        Genera para el nuevo mes las facturas y cotizaciones recurrentes vacías
        basadas en los conceptos configurados en cada proveedor.
        En fechas vacías y con todos los interruptores en NO.
        """
        suppliers = self.fetch_all_suppliers()
        existing_invoices = self.fetch_all_invoices()
        created_count = 0

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                for sup in suppliers:
                    services = sup.get("services") or []
                    for idx, srv in enumerate(services):
                        if srv.get("enabled") == False:
                            continue
                        
                        srv_name = srv.get("serviceName") or f"Servicio #{idx + 1}"
                        srv_type = srv.get("type") or "factura"
                        prefix = "COT" if srv_type == "cotizacion" else "FAC"
                        # Identificador único de plantilla recurrente para ese mes
                        clean_sup_id = (sup.get("id") or "").replace(" ", "-")
                        auto_id = f"rec-{clean_sup_id}-{idx}-{target_year}-{target_month.lower()}"

                        # Verificar si ya existe este concepto para el mes
                        already_exists = any(i.get("id") == auto_id for i in existing_invoices)
                        if already_exists:
                            continue

                        # Se crea en blanco esperando recibir
                        sql = """
                            INSERT INTO invoices (
                                id, supplier, service, invoiceNumber, emissionDate, deliveryDate,
                                value, signed, orderStd, oc, enFacture, delivered
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                            ON DUPLICATE KEY UPDATE id = id;
                        """
                        cursor.execute(sql, (
                            auto_id,
                            sup.get("name"),
                            srv_name,
                            "", # Número en blanco
                            "", # Fecha emisión vacía
                            "", # Fecha entrega vacía
                            0.0,
                            "NO", # Firmado en NO
                            "NO", # Orden Std en NO
                            "",   # OC en blanco
                            "AÚN NO", # En Facture en NO/AÚN NO
                            "NO"  # Entregado en NO
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

        # Identificar las no entregadas
        month_map_rev = {
            'enero': 1, 'febrero': 2, 'marzo': 3, 'abril': 4,
            'mayo': 5, 'junio': 6, 'julio': 7, 'agosto': 8,
            'septiembre': 9, 'octubre': 10, 'noviembre': 11, 'diciembre': 12
        }
        target_from_m = month_map_rev.get(from_month.lower())

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                for inv in all_invoices:
                    is_delivered = (inv.get("delivered") or "").upper() == "SÍ"
                    if is_delivered:
                        continue # Ya fue entregada, no se pasa

                    # Verificar si pertenecía al mes anterior
                    d_str = inv.get("emissionDate") or str(inv.get("createdAt") or "")
                    if not d_str:
                        continue
                    
                    # Si no está entregada, se permite mantenerla en el mes actual
                    inv_id = inv.get("id")
                    new_id = f"rollover-{inv_id}-{to_year}-{to_month.lower()}"
                    
                    # Evitar duplicar si ya se pasó
                    cursor.execute("SELECT id FROM invoices WHERE id = %s", (new_id,))
                    if cursor.fetchone():
                        continue

                    # Insertar copia para el nuevo mes manteniendo sus datos
                    sql = """
                        INSERT INTO invoices (
                            id, supplier, service, invoiceNumber, emissionDate, deliveryDate,
                            value, signed, orderStd, oc, enFacture, delivered, notes
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    """
                    # Comprobar si la columna notes existe en invoices o no
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
                            inv.get("emissionDate") or "",
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

    # --- TECH BUDGETS ---
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

    # --- COMPANY AREAS ---
    def fetch_areas(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT * FROM company_areas ORDER BY name ASC")
                rows = cursor.fetchall()
                for r in rows:
                    if "budgetLimit" in r and r["budgetLimit"] is not None:
                        r["budgetLimit"] = float(r["budgetLimit"])
                return rows

    def save_area(self, data: Dict[str, Any]) -> str:
        area_id = data.get("id") or f"area-{int(time.time() * 1000)}"
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO company_areas (id, name, director, headOrCoord, email, budgetLimit, color, icon)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        director = VALUES(director),
                        headOrCoord = VALUES(headOrCoord),
                        email = VALUES(email),
                        budgetLimit = VALUES(budgetLimit),
                        color = VALUES(color),
                        icon = VALUES(icon)
                """, (
                    area_id,
                    data.get("name", "").strip(),
                    data.get("director", "").strip(),
                    data.get("headOrCoord", "").strip(),
                    data.get("email", "").strip(),
                    float(data.get("budgetLimit") or 0.0),
                    data.get("color", "red"),
                    data.get("icon", "Building2")
                ))
                return area_id

    def delete_area(self, area_id: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM company_areas WHERE id = %s", (area_id,))
                return cursor.rowcount > 0

    # --- USERS ---
    def fetch_users(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, username, name, email, role, area, status, createdAt FROM users ORDER BY role ASC, name ASC")
                return cursor.fetchall()

    def save_user(self, data: Dict[str, Any]) -> str:
        user_id = data.get("id") or f"usr-{int(time.time() * 1000)}"
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # Si viene con contraseña nueva, se actualiza, si no se mantiene la existente
                password = data.get("password") or "123456"
                cursor.execute("""
                    INSERT INTO users (id, username, name, email, password, role, area, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        username = VALUES(username),
                        name = VALUES(name),
                        email = VALUES(email),
                        password = IF(VALUES(password) != '', VALUES(password), password),
                        role = VALUES(role),
                        area = VALUES(area),
                        status = VALUES(status)
                """, (
                    user_id,
                    data.get("username", "").strip(),
                    data.get("name", "").strip(),
                    data.get("email", "").strip(),
                    password,
                    data.get("role", "admin"),
                    data.get("area", "General"),
                    data.get("status", "Activo")
                ))
                return user_id

    def delete_user(self, user_id: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("DELETE FROM users WHERE id = %s", (user_id,))
                return cursor.rowcount > 0

    def authenticate_user(self, username_or_email: str, password: str) -> Optional[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("""
                    SELECT id, username, name, email, password, role, area, status, createdAt 
                    FROM users 
                    WHERE (LOWER(username) = LOWER(%s) OR (email IS NOT NULL AND LOWER(email) = LOWER(%s)))
                """, (username_or_email.strip(), username_or_email.strip()))
                user = cursor.fetchone()
                if not user:
                    return None
                if user.get("password") != password:
                    return None
                if user.get("status") != "Activo":
                    raise ValueError("El usuario se encuentra inactivo. Contacte al administrador.")
                user.pop("password", None)
                return user

    def register_user(self, data: Dict[str, Any]) -> Dict[str, Any]:
        username = data.get("username", "").strip()
        email = data.get("email", "").strip() or None
        if not username:
            raise ValueError("El nombre de usuario es requerido.")
        
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                # Verificar si ya existe el usuario
                cursor.execute("SELECT id FROM users WHERE LOWER(username) = LOWER(%s)", (username,))
                if cursor.fetchone():
                    raise ValueError(f"El usuario '{username}' ya se encuentra registrado.")
                
                if email:
                    cursor.execute("SELECT id FROM users WHERE email IS NOT NULL AND LOWER(email) = LOWER(%s)", (email,))
                    if cursor.fetchone():
                        raise ValueError(f"El correo electrónico '{email}' ya está asociado a otra cuenta.")
                
                user_id = f"usr-{int(time.time() * 1000)}"
                password = data.get("password") or "123456"
                name = data.get("name", "").strip() or username
                role = data.get("role") or "admin"
                area = data.get("area") or "Tecnología (TI)"
                status = "Activo"
                
                cursor.execute("""
                    INSERT INTO users (id, username, name, email, password, role, area, status)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """, (user_id, username, name, email, password, role, area, status))
                
                return {
                    "id": user_id,
                    "username": username,
                    "name": name,
                    "email": email,
                    "role": role,
                    "area": area,
                    "status": status
                }

