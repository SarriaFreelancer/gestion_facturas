import pymysql
import json
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
        inv_id = data.get("id") or f"inv-{int(pymysql.time.time() * 1000)}"
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
            "pdfPath", "pdfOriginalName"
        ]
        if field not in allowed_fields:
            raise ValueError(f"Campo {field} no permitido para actualización")

        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                sql = f"UPDATE invoices SET `{field}` = %s, updatedAt = NOW() WHERE id = %s"
                cursor.execute(sql, (value, invoice_id))
                return cursor.rowcount > 0

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

    # --- USERS ---
    def fetch_users(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT id, username, name, role, area, status, createdAt FROM users ORDER BY name ASC")
                return cursor.fetchall()
