from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from backend.repositories.mysql_repository import MySQLRepository
from backend.services.dashboard_service import DashboardAnalyticsService
from pydantic import BaseModel

router = APIRouter()
repo = MySQLRepository()
analytics_service = DashboardAnalyticsService()

class UpdateFieldRequest(BaseModel):
    field: str
    value: Any

class InvoicePayload(BaseModel):
    id: Optional[str] = None
    supplier: str
    service: Optional[str] = ""
    invoiceNumber: Optional[str] = ""
    emissionDate: Optional[str] = ""
    deliveryDate: Optional[str] = ""
    value: Optional[float] = 0.0
    signed: Optional[str] = "NO"
    orderStd: Optional[str] = "NO"
    oc: Optional[str] = ""
    enFacture: Optional[str] = "AÚN NO"
    delivered: Optional[str] = "NO"
    pdfPath: Optional[str] = None
    pdfOriginalName: Optional[str] = None

class SupplierPayload(BaseModel):
    id: Optional[str] = None
    nit: str
    name: str
    contact: Optional[str] = ""
    phone: Optional[str] = ""
    monthlyCount: Optional[int] = 1
    area: Optional[str] = "General"
    services: Optional[List[Dict[str, Any]]] = []
    email: Optional[str] = None

class ServicesUpdatePayload(BaseModel):
    services: List[Dict[str, Any]]

# --- INVOICES ENDPOINTS ---
@router.get("/invoices")
def get_invoices():
    try:
        return repo.fetch_all_invoices()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invoices")
def create_or_update_invoice(payload: InvoicePayload):
    try:
        inv_id = repo.save_invoice(payload.model_dump())
        return {"success": True, "id": inv_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/invoices/{invoice_id}")
def update_invoice(invoice_id: str, body: UpdateFieldRequest):
    try:
        success = repo.update_invoice_field(invoice_id, body.field, body.value)
        if not success:
            raise HTTPException(status_code=404, detail="Factura no encontrada o sin cambios")
        return {"status": "success", "invoice_id": invoice_id}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/invoices/{invoice_id}")
def delete_invoice(invoice_id: str):
    try:
        success = repo.delete_invoice(invoice_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- SUPPLIERS ENDPOINTS ---
@router.get("/suppliers")
def get_suppliers():
    try:
        return repo.fetch_all_suppliers()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/suppliers")
def create_or_update_supplier(payload: SupplierPayload):
    try:
        sup_id = repo.save_supplier(payload.model_dump())
        return {"success": True, "id": sup_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/suppliers/{supplier_id}/services")
def update_supplier_services(supplier_id: str, payload: ServicesUpdatePayload):
    try:
        success = repo.update_supplier_services(supplier_id, payload.services)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/suppliers/{supplier_id}")
def delete_supplier(supplier_id: str):
    try:
        success = repo.delete_supplier(supplier_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- DASHBOARD METRICS ---
@router.get("/dashboard/metrics")
def get_metrics(month: Optional[str] = None, year: Optional[str] = None):
    try:
        return analytics_service.get_dashboard_metrics(month=month, year=year)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- DATABASE CLEANUP ---
@router.post("/clean-database")
def clean_database():
    try:
        repo.clean_invoices()
        return {"success": True, "message": "Base de datos de facturas limpiada exitosamente."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- INICIO DE MES & RECURRENCIA ---
class MonthTransitionPayload(BaseModel):
    targetYear: str
    targetMonth: str
    fromYear: Optional[str] = None
    fromMonth: Optional[str] = None
    keepUndelivered: bool = True

@router.post("/month-transition")
def handle_month_transition(payload: MonthTransitionPayload):
    try:
        # 1. Generar conceptos recurrentes en blanco para el nuevo mes
        template_res = repo.generate_month_template(payload.targetYear, payload.targetMonth)
        
        # 2. Si se solicitó mantener las no entregadas del mes anterior, migrarlas
        rollover_count = 0
        if payload.keepUndelivered and payload.fromYear and payload.fromMonth:
            roll_res = repo.rollover_unpaid_invoices(
                from_year=payload.fromYear,
                from_month=payload.fromMonth,
                to_year=payload.targetYear,
                to_month=payload.targetMonth
            )
            rollover_count = roll_res.get("rolloverCount", 0)

        return {
            "success": True,
            "createdRecurrent": template_res.get("createdConcepts", 0),
            "keptUndelivered": rollover_count,
            "message": f"Mes {payload.targetMonth} {payload.targetYear} inicializado exitosamente."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- TECH INVENTORY ENDPOINTS ---
class InventoryItemPayload(BaseModel):
    id: Optional[str] = None
    category: str
    name: str
    brandModel: Optional[str] = ""
    serialCode: Optional[str] = ""
    quantity: int = 1
    unit: Optional[str] = "Unidades"
    areaAssigned: Optional[str] = "Tecnología (TI)"
    status: Optional[str] = "Disponible"
    notes: Optional[str] = ""

class LoanPayload(BaseModel):
    quantity: int = 1
    recipient: str
    area: str
    actionType: Optional[str] = "Préstamo"

@router.get("/inventory")
def get_inventory():
    try:
        return repo.fetch_inventory()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/inventory")
def save_inventory(payload: InventoryItemPayload):
    try:
        item_id = repo.save_inventory_item(payload.model_dump())
        return {"success": True, "id": item_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/inventory/{item_id}/loan")
def loan_inventory(item_id: str, payload: LoanPayload):
    try:
        res = repo.loan_inventory_item(
            item_id=item_id,
            quantity_to_loan=payload.quantity,
            recipient=payload.recipient,
            area=payload.area,
            action_type=payload.actionType or "Préstamo"
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/inventory/{item_id}")
def delete_inventory(item_id: str):
    try:
        success = repo.delete_inventory_item(item_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
