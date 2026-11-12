import json
from typing import List, Dict, Any, Optional
from backend.repositories.base_repository import BaseRepository

class ApprovalRepositoryMixin(BaseRepository):
    """Módulo de repositorio para el módulo de aprobación y rechazo de facturas por jefes de área."""

    def fetch_invoices_for_area_approval(
        self, 
        area: Optional[str] = None, 
        status: Optional[str] = "Pendiente",
        user_role: Optional[str] = None,
        authorized_areas: Optional[List[str]] = None
    ) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                sql = """
                    SELECT 
                        i.*,
                        s.sapCode as supplierSapCode,
                        s.nit as supplierNit,
                        ca.costCenterCode as areaCostCenterCode,
                        ca.director as areaDirector,
                        ca.headOrCoord as areaHead,
                        COALESCE(NULLIF(i.aiShortSummary, ''), NULLIF(f.aiShortSummary, ''), '') as coalescedAiShortSummary,
                        f.itemsJson as factureItemsJson
                    FROM invoices i
                    LEFT JOIN suppliers s ON (LOWER(s.name) = LOWER(i.supplier) OR (s.name != '' AND INSTR(i.supplier, s.name) > 0))
                    LEFT JOIN company_areas ca ON (LOWER(ca.name) = LOWER(i.area))
                    LEFT JOIN facture_inbox_documents f ON (f.documentNumber = i.invoiceNumber)
                    WHERE 1=1
                """
                params = []
                if status and status != "Todos":
                    sql += " AND i.approvalStatus = %s"
                    params.append(status)
                
                # Para rol Aprobador de Área: Solo áreas autorizadas y eventos DIAN completados
                if user_role == "aprobador_area":
                    sql += " AND (i.dianEventsStatus = 'COMPLETADO' OR i.dianEventsStatus = 'COMPLETADOS')"
                    if authorized_areas and len(authorized_areas) > 0:
                        placeholders = ','.join(['%s'] * len(authorized_areas))
                        sql += f" AND (i.area IN ({placeholders}) OR ca.name IN ({placeholders}))"
                        params.extend(authorized_areas)
                        params.extend(authorized_areas)
                    else:
                        return []
                else:
                    if area and area != "Todos":
                        sql += " AND (i.area = %s OR ca.name = %s)"
                        params.extend([area, area])

                sql += " ORDER BY i.createdAt DESC"
                cur.execute(sql, tuple(params))
                rows = cur.fetchall()
                for r in rows:
                    if "value" in r and r["value"] is not None:
                        r["value"] = float(r["value"])
                    
                    ai_short = (r.get("coalescedAiShortSummary") or r.get("aiShortSummary") or "").strip()
                    if "SE RECIBE DOCUMENTO" in ai_short.upper():
                        ai_short = ""

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

                    # Reemplazar 'Se recibe documento' por resumen corto AI
                    srv_curr = str(r.get("service") or "").strip()
                    if not srv_curr or "SE RECIBE DOCUMENTO" in srv_curr.upper() or srv_curr.startswith("Facturación Electrónica DIAN"):
                        r["service"] = ai_short or f"Servicio {r.get('supplier') or 'Facturación'}"
                return rows

    def approve_invoices_by_area(self, invoice_ids: List[str], approver_name: str) -> Dict[str, Any]:
        if not invoice_ids:
            return {"success": True, "count": 0}
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                format_strings = ','.join(['%s'] * len(invoice_ids))
                sql = f"""
                    UPDATE invoices 
                    SET approvalStatus = 'Aprobado',
                        signed = 'SÍ',
                        approvedBy = %s,
                        approvedAt = NOW(),
                        updatedAt = NOW()
                    WHERE id IN ({format_strings})
                """
                cur.execute(sql, tuple([approver_name] + invoice_ids))
                updated = cur.rowcount
                return {"success": True, "approvedCount": updated, "message": f"{updated} facturas aprobadas y firmadas exitosamente."}

    def reject_invoices_by_area(self, invoice_ids: List[str], rejector_name: str, reason: str = "") -> Dict[str, Any]:
        if not invoice_ids:
            return {"success": True, "count": 0}
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                format_strings = ','.join(['%s'] * len(invoice_ids))
                sql = f"""
                    UPDATE invoices 
                    SET approvalStatus = 'Rechazado',
                        signed = 'NO',
                        approvedBy = %s,
                        approvedAt = NOW(),
                        updatedAt = NOW()
                    WHERE id IN ({format_strings})
                """
                cur.execute(sql, tuple([rejector_name] + invoice_ids))
                updated = cur.rowcount
                return {"success": True, "rejectedCount": updated, "message": f"{updated} facturas rechazadas."}
