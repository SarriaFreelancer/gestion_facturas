import time
from typing import List, Dict, Any, Optional
from backend.repositories.base_repository import BaseRepository

class InventoryRepositoryMixin(BaseRepository):
    """Módulo de repositorio para inventario tecnológico, movimientos de préstamo/devolución y categorías."""

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
        with self.get_transaction() as (conn, cursor):
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
        with self.get_transaction() as (conn, cursor):
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
