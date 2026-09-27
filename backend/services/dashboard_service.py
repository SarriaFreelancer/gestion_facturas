from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.repositories.mysql_repository import MySQLRepository

MONTH_NAMES_ES = {
    1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril',
    5: 'Mayo', 6: 'Junio', 7: 'Julio', 8: 'Agosto',
    9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
}

MONTH_TO_NUM = {v.lower(): k for k, v in MONTH_NAMES_ES.items()}

class DashboardAnalyticsService:
    def __init__(self):
        self.repo = MySQLRepository()

    def _parse_date(self, date_str: Optional[str]) -> Optional[datetime]:
        if not date_str or not isinstance(date_str, str):
            return None
        cleaned = date_str.strip().split('T')[0].split(' ')[0]
        formats = ['%Y-%m-%d', '%d/%m/%Y', '%Y/%m/%d', '%d-%m-%Y']
        for fmt in formats:
            try:
                return datetime.strptime(cleaned, fmt)
            except ValueError:
                continue
        return None

    def get_dashboard_metrics(self, month: Optional[str] = None, year: Optional[str] = None) -> Dict[str, Any]:
        all_invoices = self.repo.fetch_all_invoices()
        suppliers = self.repo.fetch_all_suppliers()

        # Filtrar facturas según mes y año si se especifican
        invoices = []
        for inv in all_invoices:
            d = self._parse_date(inv.get("emissionDate")) or self._parse_date(str(inv.get("createdAt") or ""))
            
            # Filtro de año
            if year and year != "Todos":
                if not d or str(d.year) != str(year):
                    continue
            
            # Filtro de mes
            if month and month != "Todos":
                m_num = MONTH_TO_NUM.get(month.lower())
                if not d or d.month != m_num:
                    continue

            invoices.append(inv)

        total = len(invoices)
        fac_count = sum(1 for i in invoices if (i.get("invoiceNumber") or "").upper().startswith("FAC") or (i.get("service") or "").upper().startswith("FAC"))
        cot_count = sum(1 for i in invoices if (i.get("invoiceNumber") or "").upper().startswith("COT") or (i.get("service") or "").upper().startswith("COT"))
        
        if fac_count == 0 and cot_count == 0 and total > 0:
            fac_count = sum(1 for i in invoices if i.get("invoiceNumber"))
            cot_count = total - fac_count

        to_sign_count = sum(1 for i in invoices if (i.get("signed") or "").upper() != "SÍ")
        facture_count = sum(1 for i in invoices if (i.get("enFacture") or "").upper() == "SÍ")
        pending_facture = total - facture_count
        delivered_count = sum(1 for i in invoices if (i.get("delivered") or "").upper() == "SÍ")
        pending_delivery = total - delivered_count
        total_amount = sum(float(i.get("value") or 0) for i in invoices)

        # 1. Gráfico Mes a Mes (Evolución de montos y conteo del año seleccionado)
        target_year = int(year) if year and year != "Todos" else (datetime.now().year)
        monthly_stats = []
        for m_idx in range(1, 13):
            m_name = MONTH_NAMES_ES[m_idx]
            m_invs = []
            for inv in all_invoices:
                d = self._parse_date(inv.get("emissionDate")) or self._parse_date(str(inv.get("createdAt") or ""))
                if d and d.year == target_year and d.month == m_idx:
                    m_invs.append(inv)

            monthly_stats.append({
                "month": m_name,
                "short": m_name[:3],
                "count": len(m_invs),
                "totalAmount": sum(float(i.get("value") or 0) for i in m_invs),
                "facCount": sum(1 for i in m_invs if (i.get("invoiceNumber") or "").upper().startswith("FAC") or i.get("invoiceNumber")),
                "cotCount": sum(1 for i in m_invs if (i.get("invoiceNumber") or "").upper().startswith("COT"))
            })

        # 2. Facturas Recibidas (enFacture) vs Entregadas por Día de la Semana
        days_es = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        weekly_received_delivered = [
            {"day": d_name, "received": 0, "delivered": 0} for d_name in days_es
        ]
        for inv in invoices:
            d = self._parse_date(inv.get("emissionDate")) or self._parse_date(str(inv.get("createdAt") or ""))
            if d:
                weekday_idx = d.weekday()
                if (inv.get("enFacture") or "").upper() == "SÍ":
                    weekly_received_delivered[weekday_idx]["received"] += 1
                if (inv.get("delivered") or "").upper() == "SÍ":
                    weekly_received_delivered[weekday_idx]["delivered"] += 1

        # 3. Estudio de Facturas y Servicios Recurrentes (Mapeo por proveedor)
        recurrence_study = []
        for sup in suppliers:
            services = sup.get("services") or []
            if isinstance(services, list):
                total_concepts = len(services)
                fac_concepts = sum(1 for s in services if s.get("type") == "factura")
                cot_concepts = sum(1 for s in services if s.get("type") == "cotizacion")
                active_concepts = sum(1 for s in services if s.get("enabled") != False)
            else:
                total_concepts, fac_concepts, cot_concepts, active_concepts = 0, 0, 0, 0

            # Buscar cuántas facturas reales se registraron para este proveedor en el filtro
            registered_in_period = [i for i in invoices if (i.get("supplier") or "").strip().lower() == (sup.get("name") or "").strip().lower()]
            total_spent = sum(float(i.get("value") or 0) for i in registered_in_period)

            recurrence_study.append({
                "supplierId": sup.get("id"),
                "supplierName": sup.get("name"),
                "nit": sup.get("nit"),
                "area": sup.get("area") or "General",
                "monthlyCount": sup.get("monthlyCount") or 1,
                "totalConcepts": total_concepts,
                "activeConcepts": active_concepts,
                "facConcepts": fac_concepts,
                "cotConcepts": cot_concepts,
                "registeredInvoices": len(registered_in_period),
                "totalSpent": total_spent,
                "compliance": round((len(registered_in_period) / total_concepts * 100), 1) if total_concepts > 0 else 100.0
            })

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
            "delayedCount": 0,
            "monthlyStats": monthly_stats,
            "weeklyReceivedDelivered": weekly_received_delivered,
            "recurrenceStudy": recurrence_study
        }
