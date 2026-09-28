from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime
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

# --- INICIO DE MES, FECHA DEL SERVIDOR & RECURRENCIA ---
MONTH_NAMES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

@router.get("/system/date-status")
def get_system_date_status(month: Optional[str] = None, year: Optional[str] = None):
    """
    Verifica la fecha actual oficial desde el servidor.
    Las facturas en 0 (plantilla recurrente del nuevo mes) se habilitan
    a partir del día 1° del siguiente mes.
    """
    now = datetime.now()
    cur_year = now.year
    cur_month_idx = now.month # 1-12
    cur_day = now.day
    cur_month_name = MONTH_NAMES[cur_month_idx - 1]

    # Mes y año anterior
    if cur_month_idx == 1:
        prev_month_name = MONTH_NAMES[11]
        prev_year = cur_year - 1
    else:
        prev_month_name = MONTH_NAMES[cur_month_idx - 2]
        prev_year = cur_year

    # Verificar si el mes consultado puede inicializarse (a partir del día 1)
    target_month_name = (month or cur_month_name).lower()
    target_year_val = int(year) if year and year.isdigit() else cur_year

    # Determinar si ya es primero del mes o si el mes consultado ya pasó / es el actual
    target_month_idx = MONTH_NAMES.index(target_month_name) + 1 if target_month_name in MONTH_NAMES else cur_month_idx
    is_same_or_past_month = (target_year_val < cur_year) or (target_year_val == cur_year and target_month_idx <= cur_month_idx)
    # A partir del día 1 del mes destino es apto para inicializar en 0
    can_generate_zero_template = is_same_or_past_month and (cur_day >= 1)

    return {
        "serverDate": now.strftime("%Y-%m-%d %H:%M:%S"),
        "currentDay": cur_day,
        "currentMonth": cur_month_name.capitalize(),
        "currentMonthIndex": cur_month_idx,
        "currentYear": str(cur_year),
        "previousMonth": prev_month_name.capitalize(),
        "previousYear": str(prev_year),
        "isFirstDayOrLater": cur_day >= 1,
        "canGenerateZeroTemplate": can_generate_zero_template,
        "policyMessage": f"A partir del 1° de {target_month_name.capitalize()} se habilitan las facturas en 0 y migración de pendientes."
    }

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
            "message": f"Mes {payload.targetMonth} {payload.targetYear} inicializado exitosamente a partir del día 1."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- TECH INVENTORY ENDPOINTS ---
class InventoryItemPayload(BaseModel):
    id: Optional[str] = None
    category: Optional[str] = "Periféricos"
    name: str
    brandModel: Optional[str] = None
    serialCode: Optional[str] = None
    quantity: Optional[int] = 1
    unit: Optional[str] = "Unidades"
    areaAssigned: Optional[str] = "Tecnología (TI)"
    status: Optional[str] = "Disponible"
    notes: Optional[str] = None

class LoanPayload(BaseModel):
    quantity: Optional[int] = 1
    recipient: str
    area: Optional[str] = "General"
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

# --- INVENTORY MOVEMENTS (HISTORIAL PRÉSTAMOS & ENTREGAS) ---
class ReturnMovementPayload(BaseModel):
    returnQuantity: Optional[int] = 0
    notes: Optional[str] = ""

@router.get("/inventory/movements")
def get_inventory_movements(itemId: Optional[str] = None):
    try:
        return repo.fetch_inventory_movements(item_id=itemId)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/inventory/movements/{movement_id}/return")
def return_inventory_movement(movement_id: str, payload: ReturnMovementPayload):
    try:
        res = repo.return_inventory_movement(
            movement_id=movement_id,
            return_qty=payload.returnQuantity or 0,
            return_notes=payload.notes or ""
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- INVENTORY CATEGORIES ---
class CategoryPayload(BaseModel):
    id: Optional[str] = None
    name: str
    description: Optional[str] = ""
    icon: Optional[str] = "Layers"

@router.get("/inventory/categories")
def get_inventory_categories():
    try:
        return repo.fetch_inventory_categories()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/inventory/categories")
def save_inventory_category(payload: CategoryPayload):
    try:
        cat_id = repo.save_inventory_category(payload.model_dump())
        return {"success": True, "id": cat_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/inventory/categories/{cat_id}")
def delete_inventory_category(cat_id: str):
    try:
        success = repo.delete_inventory_category(cat_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- COMPANY AREAS ---
class AreaPayload(BaseModel):
    id: Optional[str] = None
    name: str
    director: Optional[str] = ""
    headOrCoord: Optional[str] = ""
    email: Optional[str] = ""
    budgetLimit: Optional[float] = 0.0
    color: Optional[str] = "red"
    icon: Optional[str] = "Building2"

@router.get("/areas")
def get_company_areas():
    try:
        return repo.fetch_areas()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/areas")
def save_company_area(payload: AreaPayload):
    try:
        area_id = repo.save_area(payload.model_dump())
        return {"success": True, "id": area_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/areas/{area_id}")
def delete_company_area(area_id: str):
    try:
        success = repo.delete_area(area_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- USERS (SUPERADMIN GESTIONA USUARIOS Y ASIGNA ADMINS POR ÁREA) ---
class UserPayload(BaseModel):
    id: Optional[str] = None
    username: str
    name: str
    email: Optional[str] = ""
    password: Optional[str] = ""
    role: Optional[str] = "admin"
    area: Optional[str] = "General"
    status: Optional[str] = "Activo"

@router.get("/users")
def get_users():
    try:
        return repo.fetch_users()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users")
def save_user(payload: UserPayload):
    try:
        user_id = repo.save_user(payload.model_dump())
        return {"success": True, "id": user_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/users/{user_id}")
def delete_user(user_id: str):
    try:
        success = repo.delete_user(user_id)
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- AUTHENTICATION ---
class LoginPayload(BaseModel):
    username: str
    password: str

class RegisterPayload(BaseModel):
    username: str
    name: Optional[str] = ""
    email: Optional[str] = ""
    password: str
    role: Optional[str] = "admin"
    area: Optional[str] = "Tecnología (TI)"

@router.post("/auth/login")
def login(payload: LoginPayload):
    try:
        user = repo.authenticate_user(payload.username, payload.password)
        if not user:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos.")
        return {"success": True, "user": user}
    except ValueError as ve:
        raise HTTPException(status_code=403, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/register")
def register(payload: RegisterPayload):
    try:
        user = repo.register_user(payload.model_dump())
        return {"success": True, "user": user}
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from backend.services.email_service import EmailNotificationService

# --- EMAIL SETTINGS & DELIVERED INVOICES REPORTING (AUTOMATIC SMTP & OUTLOOK) ---
class EmailSettingsPayload(BaseModel):
    recipientEmail: Optional[str] = "contabilidad@alimentosenriko.com"
    senderName: Optional[str] = "Alimentos Enriko S.A.S. — Control de Facturas"
    emailSubject: Optional[str] = "Reporte de Facturas Entregadas — Alimentos Enriko S.A.S."
    emailTemplate: Optional[str] = ""
    frequency: Optional[str] = "manual"
    outlookIntegrationEnabled: Optional[int] = 1
    smtpHost: Optional[str] = "smtp.office365.com"
    smtpPort: Optional[int] = 587
    smtpUser: Optional[str] = ""
    smtpPassword: Optional[str] = ""

@router.get("/settings/email")
def get_email_settings():
    try:
        return repo.fetch_email_settings()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings/email")
def save_email_settings(payload: EmailSettingsPayload):
    try:
        success = repo.save_email_settings(payload.model_dump())
        return {"success": success}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class MarkEmailSentPayload(BaseModel):
    invoiceIds: List[str]

@router.post("/invoices/mark-email-sent")
def mark_invoices_email_sent(payload: MarkEmailSentPayload):
    try:
        success = repo.mark_invoices_email_sent(payload.invoiceIds)
        return {"success": success, "count": len(payload.invoiceIds)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SendDirectEmailPayload(BaseModel):
    invoiceIds: List[str]
    recipientEmail: Optional[str] = None
    subject: Optional[str] = None
    introMessage: Optional[str] = None

@router.post("/invoices/send-email-direct")
def send_invoices_email_direct(payload: SendDirectEmailPayload):
    try:
        if not payload.invoiceIds:
            raise HTTPException(status_code=400, detail="Debe seleccionar al menos una factura para enviar.")

        # 1. Obtener todas las facturas y filtrar las seleccionadas
        all_invoices = repo.fetch_all_invoices()
        selected_invoices = [inv for inv in all_invoices if inv.get("id") in payload.invoiceIds]
        
        if not selected_invoices:
            raise HTTPException(status_code=404, detail="No se encontraron las facturas seleccionadas.")

        # 2. Obtener configuración SMTP
        settings = repo.fetch_email_settings()
        smtp_host = settings.get("smtpHost") or "smtp.office365.com"
        smtp_port = int(settings.get("smtpPort") or 587)
        smtp_user = settings.get("smtpUser") or ""
        smtp_password = settings.get("smtpPassword") or ""
        sender_name = settings.get("senderName") or "Alimentos Enriko S.A.S."

        if not smtp_user or not smtp_password:
            raise HTTPException(
                status_code=400,
                detail="No se han configurado las credenciales SMTP (Usuario/Correo y Contraseña). Ve al módulo de Configuración para ingresarlas."
            )

        recipient = payload.recipientEmail or settings.get("recipientEmail") or "contabilidad@alimentosenriko.com"
        subject = payload.subject or settings.get("emailSubject") or "Reporte de Facturas Entregadas — Alimentos Enriko S.A.S."
        intro = payload.introMessage or settings.get("emailTemplate") or ""

        # 3. Generar HTML estilizado
        html_content = EmailNotificationService.generate_delivered_invoices_html(
            invoices=selected_invoices,
            intro_text=intro
        )

        # 4. Enviar mediante SMTP
        EmailNotificationService.send_html_email(
            smtp_host=smtp_host,
            smtp_port=smtp_port,
            smtp_user=smtp_user,
            smtp_password=smtp_password,
            sender_name=sender_name,
            recipient_emails=recipient,
            subject=subject,
            html_body=html_content
        )

        # 5. Marcar facturas como enviadas en base de datos para no duplicar
        repo.mark_invoices_email_sent(payload.invoiceIds)

        return {
            "success": True,
            "message": f"Correo enviado exitosamente a {recipient} con {len(selected_invoices)} facturas.",
            "count": len(selected_invoices),
            "recipient": recipient
        }
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al enviar correo SMTP: {str(e)}")

class TestEmailPayload(BaseModel):
    recipientEmail: Optional[str] = None

@router.post("/settings/test-email")
def test_email_connection(payload: TestEmailPayload):
    try:
        settings = repo.fetch_email_settings()
        smtp_host = settings.get("smtpHost") or "smtp.office365.com"
        smtp_port = int(settings.get("smtpPort") or 587)
        smtp_user = settings.get("smtpUser") or ""
        smtp_password = settings.get("smtpPassword") or ""
        sender_name = settings.get("senderName") or "Alimentos Enriko S.A.S."

        if not smtp_user or not smtp_password:
            raise HTTPException(
                status_code=400,
                detail="Por favor ingresa primero el Correo Remitente y la Contraseña SMTP antes de realizar la prueba."
            )

        recipient = payload.recipientEmail or settings.get("recipientEmail") or smtp_user
        subject = "Prueba de Conexión SMTP — Alimentos Enriko S.A.S."

        test_html = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0; max-width: 600px;">
            <div style="background: #dc2626; padding: 15px; border-radius: 8px; color: #ffffff; text-align: center;">
                <h2 style="margin: 0;">Alimentos Enriko S.A.S.</h2>
                <span style="font-size: 11px;">Verificación Exitosa del Servidor SMTP</span>
            </div>
            <div style="padding: 20px 10px; font-size: 13px; color: #334155;">
                <p>¡Hola! Este es un correo de prueba generado automáticamente desde el Sistema Corporativo de Alimentos Enriko S.A.S.</p>
                <p>Tu servidor SMTP <strong>{smtp_host}:{smtp_port}</strong> con el usuario <strong>{smtp_user}</strong> está conectado y funcionando correctamente.</p>
                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 10px; border-radius: 6px; color: #166534; font-size: 11px;">
                    ✓ Los reportes automáticos de facturas entregadas se enviarán directamente a través de este canal sin necesidad de abrir aplicaciones externas.
                </div>
            </div>
            <div style="text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 10px;">
                Alimentos Enriko S.A.S. • Conexión Segura TLS
            </div>
        </div>
        """

        EmailNotificationService.send_html_email(
            smtp_host=smtp_host,
            smtp_port=smtp_port,
            smtp_user=smtp_user,
            smtp_password=smtp_password,
            sender_name=sender_name,
            recipient_emails=recipient,
            subject=subject,
            html_body=test_html
        )

        return {
            "success": True,
            "message": f"Correo de prueba enviado con éxito a {recipient}."
        }
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en la prueba de correo: {str(e)}")




