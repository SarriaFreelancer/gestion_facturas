import time
from typing import List, Dict, Any
from backend.repositories.base_repository import BaseRepository

class AreaRepositoryMixin(BaseRepository):
    """Módulo de repositorio para áreas de la empresa y centros de costos."""

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
                    INSERT INTO company_areas (id, name, costCenterCode, director, headOrCoord, email, budgetLimit, color, icon)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON DUPLICATE KEY UPDATE
                        name = VALUES(name),
                        costCenterCode = VALUES(costCenterCode),
                        director = VALUES(director),
                        headOrCoord = VALUES(headOrCoord),
                        email = VALUES(email),
                        budgetLimit = VALUES(budgetLimit),
                        color = VALUES(color),
                        icon = VALUES(icon)
                """, (
                    area_id,
                    data.get("name", "").strip(),
                    (data.get("costCenterCode") or "").strip(),
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
