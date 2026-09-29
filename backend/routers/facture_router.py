from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.services.facture_service import FactureService

router = APIRouter(prefix="/facture", tags=["Facture.co"])
service = FactureService()

class CredentialsPayload(BaseModel):
    username: str
    password: str
    nit: str
    companyName: Optional[str] = "ALIMENTOS ENRIKO S.A.S"
    responsibleName: Optional[str] = "DAVID"
    responsibleLastName: Optional[str] = "SARRIA"
    responsibleIdNumber: Optional[str] = "1144078413"
    autoSync: Optional[int] = 0

class ImportPayload(BaseModel):
    factureDocId: str

@router.get("/status")
def get_facture_status():
    try:
        creds = service.get_credentials()
        # Ocultar contraseña por seguridad en la API
        safe_creds = {**creds}
        if "password" in safe_creds and safe_creds["password"]:
            safe_creds["password"] = "••••••••••••"
        return safe_creds
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/credentials")
def update_facture_credentials(payload: CredentialsPayload):
    try:
        service.save_credentials(payload.model_dump())
        return {"success": True, "message": "Credenciales de Facture.co actualizadas correctamente."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync")
async def trigger_inbox_sync():
    try:
        res = await service.live_sync_inbox()
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error durante la sincronización: {str(e)}")

@router.get("/inbox")
def get_inbox_documents(folder: Optional[str] = "Todos", search: Optional[str] = None, limit: Optional[int] = 100):
    try:
        return service.get_inbox_documents(folder=folder, search=search, limit=limit or 100)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/logs")
def get_facture_logs(limit: Optional[int] = 50):
    try:
        return service.get_audit_logs(limit=limit or 50)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/import-to-invoices")
def import_to_main_invoices(payload: ImportPayload):
    try:
        return service.import_to_main_invoices(payload.factureDocId)
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class WorkflowPayload(BaseModel):
    documentNumber: str
    executeEvents: Optional[bool] = False
    downloadPdf: Optional[bool] = True
    responsibleName: Optional[str] = None
    responsibleLastName: Optional[str] = None
    responsibleIdNumber: Optional[str] = None

@router.post("/process-workflow")
async def process_invoice_workflow(payload: WorkflowPayload):
    try:
        override = {}
        if payload.responsibleName:
            override["name"] = payload.responsibleName
        if payload.responsibleLastName:
            override["lastName"] = payload.responsibleLastName
        if payload.responsibleIdNumber:
            override["idNumber"] = payload.responsibleIdNumber

        res = await service.process_single_invoice_workflow(
            target_doc_number=payload.documentNumber,
            execute_events=bool(payload.executeEvents),
            download_pdf=bool(payload.downloadPdf),
            override_responsible=override if override else None
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
