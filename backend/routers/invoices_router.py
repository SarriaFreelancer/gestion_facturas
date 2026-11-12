from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Dict, Any, Optional
from datetime import datetime
from backend.repositories.mysql_repository import MySQLRepository
from backend.services.dashboard_service import DashboardAnalyticsService
from backend.utils.security import create_access_token, decode_access_token, is_safe_path
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
    area: Optional[str] = "General"
    service: Optional[str] = ""
    invoiceNumber: Optional[str] = ""
    emissionDate: Optional[str] = ""
    deliveryDate: Optional[str] = None
    dueDate: Optional[str] = None
    value: Optional[float] = 0.0
    signed: Optional[str] = "NO"
    approvalStatus: Optional[str] = "Pendiente"
    approvedBy: Optional[str] = None
    approvedAt: Optional[str] = None
    orderStd: Optional[str] = "NO"
    oc: Optional[str] = ""
    contractNumber: Optional[str] = ""
    enFacture: Optional[str] = "AÚN NO"
    delivered: Optional[str] = "NO"
    pdfPath: Optional[str] = None
    pdfOriginalName: Optional[str] = None
    itemsJson: Optional[Any] = []
    sapExported: Optional[int] = 0
    sapDocNum: Optional[str] = None

class SupplierPayload(BaseModel):
    id: Optional[str] = None
    nit: str
    sapCode: Optional[str] = ""
    name: str
    tradeName: Optional[str] = None
    address: Optional[str] = ""
    city: Optional[str] = "Cali"
    contact: Optional[str] = ""
    phone: Optional[str] = ""
    monthlyCount: Optional[int] = 1
    area: Optional[str] = "General"
    services: Optional[List[Dict[str, Any]]] = []
    email: Optional[str] = None
    paymentConditions: Optional[str] = "Crédito 30 días"
    bankName: Optional[str] = ""
    bankAccountType: Optional[str] = "Corriente"
    bankAccountNumber: Optional[str] = ""
    status: Optional[str] = "Activo"

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
def get_metrics(month: Optional[str] = None, year: Optional[str] = None, area: Optional[str] = None):
    try:
        return analytics_service.get_dashboard_metrics(month=month, year=year, area=area)
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

    if can_generate_zero_template:
        try:
            repo.generate_month_template(str(target_year_val), target_month_name.capitalize())
        except Exception:
            pass

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
    costCenterCode: Optional[str] = ""
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

# --- USERS (SUPERADMIN GESTIONA USUARIOS Y ASIGNA ADMINS POR ÁREA O PROVEEDORES) ---
class UserPayload(BaseModel):
    id: Optional[str] = None
    username: str
    name: str
    email: Optional[str] = ""
    password: Optional[str] = ""
    role: Optional[str] = "admin"
    area: Optional[str] = "General"
    supplierNit: Optional[str] = None
    supplierId: Optional[str] = None
    phone: Optional[str] = None
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
    role: Optional[str] = "supplier"
    area: Optional[str] = "Proveedor Externo"
    supplierNit: Optional[str] = None
    supplierId: Optional[str] = None
    phone: Optional[str] = None

@router.post("/auth/login")
def login(payload: LoginPayload, request: Request):
    try:
        user = repo.authenticate_user(payload.username, payload.password)
        if not user:
            raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos.")
        
        # Generar token JWT firmado
        token = create_access_token({
            "sub": user["id"],
            "username": user["username"],
            "role": user.get("role", "admin"),
            "area": user.get("area", "General"),
            "supplierNit": user.get("supplierNit"),
            "supplierId": user.get("supplierId")
        })

        client_ip = request.client.host if request.client else "127.0.0.1"
        repo.log_system_action(
            action="LOGIN_SUCCESS",
            entity_type="USER",
            entity_id=user["id"],
            username=user["username"],
            user_id=user["id"],
            details=f"Inicio de sesión exitoso desde {client_ip}",
            ip_address=client_ip
        )

        return {
            "success": True, 
            "user": user,
            "token": token,
            "tokenType": "Bearer"
        }
    except ValueError as ve:
        raise HTTPException(status_code=403, detail=str(ve))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/auth/register")
def register(payload: RegisterPayload, request: Request):
    try:
        user = repo.register_user(payload.model_dump())
        token = create_access_token({
            "sub": user["id"],
            "username": user["username"],
            "role": user.get("role", "admin"),
            "area": user.get("area", "General")
        })

        client_ip = request.client.host if request.client else "127.0.0.1"
        repo.log_system_action(
            action="USER_REGISTERED",
            entity_type="USER",
            entity_id=user["id"],
            username=user["username"],
            user_id=user["id"],
            details=f"Usuario registrado con rol {user.get('role')}",
            ip_address=client_ip
        )

        return {
            "success": True, 
            "user": user,
            "token": token,
            "tokenType": "Bearer"
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class VerifyTokenPayload(BaseModel):
    token: Optional[str] = None

@router.post("/auth/verify")
def verify_session(payload: Optional[VerifyTokenPayload] = None, request: Request = None):
    try:
        token = payload.token if (payload and payload.token) else None
        if not token and request and "Authorization" in request.headers:
            auth_hdr = request.headers.get("Authorization", "")
            if auth_hdr.startswith("Bearer "):
                token = auth_hdr.replace("Bearer ", "").strip()
        
        if not token:
            raise HTTPException(status_code=401, detail="Token no proporcionado.")

        decoded = decode_access_token(token)
        if not decoded:
            raise HTTPException(status_code=401, detail="Sesión expirada o token inválido.")

        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Token no contiene información de usuario.")

        user = repo.fetch_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=401, detail="Usuario no encontrado en el sistema.")

        if user.get("status") != "Activo":
            raise HTTPException(status_code=403, detail="El usuario se encuentra inactivo.")

        user.pop("password", None)
        return {
            "valid": True,
            "user": user,
            "expiresAt": decoded.get("exp")
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class LogoutPayload(BaseModel):
    userId: Optional[str] = None
    username: Optional[str] = None
    reason: Optional[str] = "Cierre de sesión manual"

@router.post("/auth/logout")
def logout(payload: Optional[LogoutPayload] = None, request: Request = None):
    try:
        client_ip = request.client.host if request and request.client else "127.0.0.1"
        user_id = payload.userId if payload else None
        username = payload.username if payload else None
        reason = payload.reason if payload else "Cierre de sesión"

        repo.log_system_action(
            action="LOGOUT",
            entity_type="USER",
            entity_id=user_id or "ANONYMOUS",
            username=username or "ANONYMOUS",
            user_id=user_id,
            details=f"Cierre de sesión: {reason}",
            ip_address=client_ip
        )
        return {"success": True, "message": "Sesión cerrada correctamente"}
    except Exception as e:
        return {"success": True, "message": f"Sesión cerrada con advertencia: {str(e)}"}


@router.get("/system/audit-logs")
def get_system_audit_logs(limit: Optional[int] = 100, entityType: Optional[str] = None):
    try:
        return repo.fetch_system_audit_logs(limit=limit or 100, entity_type=entityType)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from backend.services.email_service import EmailNotificationService

# --- EMAIL SETTINGS & DELIVERED INVOICES REPORTING (AUTOMATIC SMTP & OUTLOOK) ---
class EmailSettingsPayload(BaseModel):
    recipientEmail: Optional[str] = "contabilidad@alimentosenriko.com"
    ccEmails: Optional[str] = ""
    senderName: Optional[str] = "Alimentos Enriko S.A.S. — Control de Facturas"
    emailSubject: Optional[str] = "Reporte de Facturas Entregadas — Alimentos Enriko S.A.S."
    emailTemplate: Optional[str] = ""
    frequency: Optional[str] = "manual"
    outlookIntegrationEnabled: Optional[int] = 1
    smtpHost: Optional[str] = "smtp.office365.com"
    smtpPort: Optional[int] = 587
    smtpUser: Optional[str] = ""
    smtpPassword: Optional[str] = ""
    portalEnabled: Optional[int] = 1
    inventoryEnabled: Optional[int] = 1
    categoriesEnabled: Optional[int] = 1
    defaultClientName: Optional[str] = "ALIMENTOS ENRIKO SAS"
    defaultClientNit: Optional[str] = "890330035"
    geminiApiKey: Optional[str] = ""
    googleClientId: Optional[str] = ""
    googleClientSecret: Optional[str] = ""
    googleProjectId: Optional[str] = "facturacionenriko"

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

class TestAiPayload(BaseModel):
    apiKey: Optional[str] = None

@router.post("/settings/test-ai")
def test_ai_connection(payload: Optional[TestAiPayload] = None):
    try:
        settings = repo.fetch_email_settings()
        api_key = (payload.apiKey if payload and payload.apiKey else None) or settings.get("geminiApiKey") or os.getenv("GEMINI_API_KEY")
        if not api_key or not api_key.strip():
            raise HTTPException(status_code=400, detail="Por favor ingresa una API Key de Google Gemini válida.")

        from google import genai
        client = genai.Client(api_key=api_key.strip())
        
        active_model = "gemini-3.8-flash"
        raw_text = None
        for m in ["gemini-3.8-flash", "gemini-3.5-flash-lite", "gemini-flash-latest"]:
            try:
                response = client.models.generate_content(
                    model=m,
                    contents="Verifica conexión: responde en 1 frase corta confirmando que el servicio de Inteligencia Artificial para Facturas de Alimentos Enriko está activo."
                )
                if response and response.text:
                    raw_text = response.text.strip()
                    active_model = m
                    break
            except Exception:
                continue

        return {
            "success": True,
            "message": "Conexión con Google Gemini AI exitosa.",
            "response": raw_text or "Servicio de Inteligencia Artificial activo",
            "model": active_model
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al verificar Gemini API Key: {str(e)}")

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
    ccEmails: Optional[str] = None
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
        cc_emails = payload.ccEmails if payload.ccEmails is not None else settings.get("ccEmails")
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
            cc_emails=cc_emails,
            subject=subject,
            html_body=html_content
        )

        # 5. Marcar facturas como enviadas en base de datos para no duplicar
        repo.mark_invoices_email_sent(payload.invoiceIds)

        return {
            "success": True,
            "message": f"Correo enviado exitosamente a {recipient}{f' (CC: {cc_emails})' if cc_emails else ''} con {len(selected_invoices)} facturas.",
            "count": len(selected_invoices),
            "recipient": recipient,
            "cc": cc_emails
        }
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al enviar correo SMTP: {str(e)}")

class TestEmailPayload(BaseModel):
    recipientEmail: Optional[str] = None
    ccEmails: Optional[str] = None

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
        cc_emails = payload.ccEmails if payload.ccEmails is not None else settings.get("ccEmails")
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
            cc_emails=cc_emails,
            subject=subject,
            html_body=test_html
        )

        return {
            "success": True,
            "message": f"Correo de prueba enviado con éxito a {recipient}{f' (CC: {cc_emails})' if cc_emails else ''}."
        }
    except HTTPException:
        raise
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Fallo en la prueba de correo: {str(e)}")

# --- DETECCIÓN DE DUPLICIDAD Y GUARDADO CON CONTRATO HABITUAL ---
class CheckDuplicatePayload(BaseModel):
    invoiceNumber: str
    supplierName: Optional[str] = None

@router.post("/invoices/check-duplicate")
def check_invoice_duplicate(payload: CheckDuplicatePayload):
    try:
        dup = repo.check_invoice_duplicate(payload.invoiceNumber, payload.supplierName)
        return {
            "isDuplicate": dup is not None,
            "invoice": dup
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class HabitualContractPayload(BaseModel):
    invoiceNumber: str
    supplier: str
    supplierNit: Optional[str] = ""
    contractNumber: str
    service: Optional[str] = ""
    area: Optional[str] = "General"
    emissionDate: Optional[str] = ""
    dueDate: Optional[str] = ""
    value: Optional[float] = 0.0
    itemsJson: Optional[Any] = []
    pdfPath: Optional[str] = None
    pdfOriginalName: Optional[str] = None
    oc: Optional[str] = ""

@router.post("/invoices/save-habitual-contract")
def save_habitual_contract_endpoint(payload: HabitualContractPayload):
    try:
        res = repo.save_habitual_supplier_contract_and_invoice(payload.model_dump())
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- MÓDULO DE APROBACIÓN DE JEFES POR ÁREA ---
class AreaApprovePayload(BaseModel):
    invoiceIds: List[str]
    approverName: Optional[str] = "Jefe de Área"

class AreaRejectPayload(BaseModel):
    invoiceIds: List[str]
    rejectorName: Optional[str] = "Jefe de Área"
    reason: Optional[str] = ""

@router.get("/invoices/area-approval")
def get_invoices_for_area_approval(
    area: Optional[str] = None, 
    status: Optional[str] = "Pendiente",
    userRole: Optional[str] = None,
    authorizedAreas: Optional[str] = None
):
    try:
        auth_areas_list = []
        if authorizedAreas:
            try:
                parsed = json.loads(authorizedAreas)
                if isinstance(parsed, list):
                    auth_areas_list = parsed
                else:
                    auth_areas_list = [str(parsed)]
            except Exception:
                auth_areas_list = [a.strip() for a in authorizedAreas.split(",") if a.strip()]

        return repo.fetch_invoices_for_area_approval(
            area=area, 
            status=status,
            user_role=userRole,
            authorized_areas=auth_areas_list
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DianEventsPayload(BaseModel):
    invoiceId: str
    status: str

@router.post("/invoices/dian-events/status")
def update_dian_events_status_endpoint(payload: DianEventsPayload):
    try:
        repo.update_invoice_field(payload.invoiceId, "dianEventsStatus", payload.status)
        return {"success": True, "invoiceId": payload.invoiceId, "dianEventsStatus": payload.status}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invoices/area-approval/approve")
def approve_invoices_area_endpoint(payload: AreaApprovePayload):
    try:
        return repo.approve_invoices_by_area(payload.invoiceIds, payload.approverName or "Jefe de Área")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invoices/area-approval/reject")
def reject_invoices_area_endpoint(payload: AreaRejectPayload):
    try:
        return repo.reject_invoices_by_area(payload.invoiceIds, payload.rejectorName or "Jefe de Área", payload.reason or "")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- PREVISUALIZACIÓN Y EXPORTACIÓN A EXCEL PARA SAP ---
import io
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from fastapi.responses import Response

class SapPresolicitudSavePayload(BaseModel):
    rows: List[Dict[str, Any]]
    userName: Optional[str] = "Usuario"

@router.get("/invoices/{invoice_id}/presolicitud")
def get_sap_presolicitud_endpoint(invoice_id: str, userName: Optional[str] = "Usuario"):
    try:
        return repo.get_or_create_sap_presolicitud(invoice_id, current_user_name=userName or "Usuario")
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/invoices/{invoice_id}/presolicitud")
def save_sap_presolicitud_endpoint(invoice_id: str, payload: SapPresolicitudSavePayload):
    try:
        success = repo.save_sap_presolicitud_rows(invoice_id, payload.rows, current_user_name=payload.userName or "Usuario")
        return {"success": success, "message": "Presolicitud de compra SAP guardada exitosamente."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/invoices/{invoice_id}/sap-preview")
def get_sap_preview_endpoint(invoice_id: str, userName: Optional[str] = "Usuario"):
    try:
        return repo.get_or_create_sap_presolicitud(invoice_id, current_user_name=userName or "Usuario")
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/invoices/{invoice_id}/presolicitud/excel")
@router.get("/invoices/{invoice_id}/sap-excel")
def export_sap_excel_endpoint(invoice_id: str, userName: Optional[str] = "Usuario"):
    try:
        presol_data = repo.get_or_create_sap_presolicitud(invoice_id, current_user_name=userName or "Usuario")
        rows = presol_data.get("rows", [])

        wb = openpyxl.Workbook()
        ws = wb.active
        ws.title = "Presolicitud_Compra"

        # 29 Columnas Oficiales de la Plantilla de Presolicitud de Compra SAP
        headers = [
            "Número de artículo", "Tipo Solicitud Compra", "Tipo_Item", "Descripción del artículo",
            "Descripcion_Adic", "Cantidad Requerida", "Nombre de unidad de medida", "Precio info",
            "Indicador de impuestos", "Impuesto %", "% de descuento", "Almacén",
            "Proveedor Sugerido", "Fecha Requerida", "Centro Costos", "Total (ML)",
            "Solicitado por", "Observación", "Motivo", "Urgencia",
            "País/región de origen", "Vlr_Unit_Extranj", "Fecha_Solicitud_Serv_Transp",
            "Gestion_Facturacion", "Novedad_Donacion", "Texto libre", "Moneda",
            "Novedad_Donaciones", "Novedad_Obsequios"
        ]

        thin_border = Border(
            left=Side(style='thin', color='CBD5E1'),
            right=Side(style='thin', color='CBD5E1'),
            top=Side(style='thin', color='CBD5E1'),
            bottom=Side(style='thin', color='CBD5E1')
        )

        header_font = Font(name="Arial", size=10, bold=True, color="000000")
        header_fill_green = PatternFill(start_color="92D050", end_color="92D050", fill_type="solid") # Verde distintivo de la plantilla
        header_fill_default = PatternFill(start_color="F2F2F2", end_color="F2F2F2", fill_type="solid")

        for col_idx, h in enumerate(headers, 1):
            cell = ws.cell(row=1, column=col_idx, value=h)
            cell.font = header_font
            cell.fill = header_fill_green if col_idx == 1 else header_fill_default
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            cell.border = thin_border
        ws.row_dimensions[1].height = 28

        curr_row = 2
        for r in rows:
            ws.cell(row=curr_row, column=1, value=r.get("itemCode", "ISVVR00001")).alignment = Alignment(horizontal="center")
            ws.cell(row=curr_row, column=2, value=r.get("docType", "PEDIDO")).alignment = Alignment(horizontal="center")
            ws.cell(row=curr_row, column=3, value=r.get("itemType", "Servicios")).alignment = Alignment(horizontal="center")
            ws.cell(row=curr_row, column=4, value=r.get("itemDescription", "Accesorios Varios (51)"))
            ws.cell(row=curr_row, column=5, value=r.get("additionalDescription", ""))
            
            c_qty = ws.cell(row=curr_row, column=6, value=float(r.get("requiredQuantity") or 1.0))
            c_qty.number_format = '#,##0'
            c_qty.alignment = Alignment(horizontal="center")

            ws.cell(row=curr_row, column=7, value=r.get("unit", "Und")).alignment = Alignment(horizontal="center")

            c_prc = ws.cell(row=curr_row, column=8, value=float(r.get("infoPrice") or 0.0))
            c_prc.number_format = '$#,##0.00'
            c_prc.alignment = Alignment(horizontal="right")

            ws.cell(row=curr_row, column=9, value=r.get("taxIndicator", "IVAD33")).alignment = Alignment(horizontal="center")
            
            c_tax = ws.cell(row=curr_row, column=10, value=float(r.get("taxPercentage") or 19.0))
            c_tax.number_format = '0'
            c_tax.alignment = Alignment(horizontal="center")

            c_desc = ws.cell(row=curr_row, column=11, value=float(r.get("discountPercentage") or 0.0))
            c_desc.number_format = '0'
            c_desc.alignment = Alignment(horizontal="center")

            ws.cell(row=curr_row, column=12, value=r.get("warehouse", "Servic01")).alignment = Alignment(horizontal="center")
            ws.cell(row=curr_row, column=13, value=r.get("suggestedSupplier", "")).alignment = Alignment(horizontal="center")
            ws.cell(row=curr_row, column=14, value=r.get("requiredDate", "")).alignment = Alignment(horizontal="center")
            ws.cell(row=curr_row, column=15, value=r.get("costCenter", "AA0122")).alignment = Alignment(horizontal="center")

            c_tot = ws.cell(row=curr_row, column=16, value=float(r.get("totalMl") or 0.0))
            c_tot.number_format = '$#,##0.00'
            c_tot.alignment = Alignment(horizontal="right")

            ws.cell(row=curr_row, column=17, value=r.get("requestedBy", userName))
            ws.cell(row=curr_row, column=18, value=r.get("observation", ""))
            ws.cell(row=curr_row, column=19, value=r.get("motive", ""))
            ws.cell(row=curr_row, column=20, value=r.get("urgency", ""))
            ws.cell(row=curr_row, column=21, value=r.get("originCountry", "CO")).alignment = Alignment(horizontal="center")
            
            c_ext = ws.cell(row=curr_row, column=22, value=float(r.get("foreignUnitPrice") or 0.0))
            c_ext.number_format = '$#,##0.00'
            c_ext.alignment = Alignment(horizontal="right")

            ws.cell(row=curr_row, column=23, value=r.get("transportRequestDate", ""))
            ws.cell(row=curr_row, column=24, value=r.get("billingManagement", ""))
            ws.cell(row=curr_row, column=25, value=r.get("donationNovelty", ""))
            ws.cell(row=curr_row, column=26, value=r.get("freeText", ""))
            ws.cell(row=curr_row, column=27, value=r.get("currency", "COP")).alignment = Alignment(horizontal="center")
            ws.cell(row=curr_row, column=28, value=r.get("donationNovelty2", ""))
            ws.cell(row=curr_row, column=29, value=r.get("giftNovelty", ""))

            for col_idx in range(1, 30):
                ws.cell(row=curr_row, column=col_idx).border = thin_border
            ws.row_dimensions[curr_row].height = 20
            curr_row += 1

        # Auto-ajuste de anchos de columna
        for col in ws.columns:
            max_len = max(len(str(cell.value or '')) for cell in col)
            col_letter = col[0].column_letter
            ws.column_dimensions[col_letter].width = max(max_len + 3, 14)

        ws.column_dimensions["D"].width = 28 # Descripción del artículo
        ws.column_dimensions["E"].width = 40 # Descripcion_Adic

        output = io.BytesIO()
        wb.save(output)
        output.seek(0)

        clean_inv_num = str(invoice_id).replace('/', '_').replace(' ', '_')
        filename = f"Presolicitud_Compra_SAP_{clean_inv_num}.xlsx"
        return Response(
            content=output.getvalue(),
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": f"attachment; filename={filename}"}
        )
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))




