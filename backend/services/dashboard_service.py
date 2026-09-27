from typing import Dict, Any, List
from backend.repositories.mysql_repository import MySQLRepository

class DashboardAnalyticsService:
    def __init__(self):
        self.repo = MySQLRepository()

    def get_dashboard_metrics(self) -> Dict[str, Any]:
        invoices = self.repo.fetch_all_invoices()
        
        total = len(invoices)
        # Identificar Facturas vs Cotizaciones según número o prefijo
        fac_count = sum(1 for i in invoices if (i.get("invoiceNumber") or "").upper().startswith("FAC") or (i.get("service") or "").upper().startswith("FAC"))
        cot_count = sum(1 for i in invoices if (i.get("invoiceNumber") or "").upper().startswith("COT") or (i.get("service") or "").upper().startswith("COT"))
        
        # Si no tienen prefijo explícito, facCount son los que tienen número de factura
        if fac_count == 0 and cot_count == 0 and total > 0:
            fac_count = sum(1 for i in invoices if i.get("invoiceNumber"))
            cot_count = total - fac_count

        to_sign_count = sum(1 for i in invoices if (i.get("signed") or "").upper() != "SÍ")
        facture_count = sum(1 for i in invoices if (i.get("enFacture") or "").upper() == "SÍ")
        pending_facture = total - facture_count
        delivered_count = sum(1 for i in invoices if (i.get("delivered") or "").upper() == "SÍ")
        pending_delivery = total - delivered_count

        total_amount = sum(float(i.get("value") or 0) for i in invoices)

        return {
            "total": total,
            "facCount": fac_count,
            "cotCount": cot_count,
            "toSignCount": to_sign_count,
            "pendingFactureCount": pending_facture,
            "factureCount": facture_count,
            "deliveredCount": delivered_count,
            "pendingDeliveryCount": pending_delivery,
            "totalAmount": total_amount,
            "delayedCount": 0
        }
