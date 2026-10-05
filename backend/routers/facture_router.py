import sys
import asyncio
import concurrent.futures
import os
from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.services.facture_service import FactureService, UPLOADS_DIR

router = APIRouter(prefix="/facture", tags=["Facture.co"])
service = FactureService()

def run_in_proactor_thread(coro_fn, *args, **kwargs):
    def target():
        if sys.platform == 'win32':
            try:
                asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
            except Exception:
                pass
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            return loop.run_until_complete(coro_fn(*args, **kwargs))
        finally:
            loop.close()

    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as executor:
        future = executor.submit(target)
        return future.result()

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
def trigger_inbox_sync():
    try:
        res = run_in_proactor_thread(service.live_sync_inbox)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error durante la sincronización: {str(e)}")

@router.get("/inbox")
def get_inbox_documents(folder: Optional[str] = "Todos", search: Optional[str] = None, limit: Optional[int] = 10000):
    try:
        return service.get_inbox_documents(folder=folder, search=search, limit=limit or 10000)
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

class InspectPayload(BaseModel):
    documentNumber: str
    forceDownload: Optional[bool] = False

@router.post("/inspect-and-read")
def inspect_and_read_invoice(payload: InspectPayload):
    try:
        res = run_in_proactor_thread(
            service.inspect_and_analyze_invoice,
            target_doc_number=payload.documentNumber,
            force_download=bool(payload.forceDownload)
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/match-supplier")
def match_supplier_concept(issuerName: str, issuerNit: str, amount: float, rawDetail: Optional[str] = ""):
    try:
        return service.match_supplier_and_concept(
            issuer_name=issuerName,
            issuer_nit=issuerNit,
            amount=amount,
            raw_detail=rawDetail or ""
        )
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
def process_invoice_workflow(payload: WorkflowPayload):
    try:
        override = {}
        if payload.responsibleName:
            override["name"] = payload.responsibleName
        if payload.responsibleLastName:
            override["lastName"] = payload.responsibleLastName
        if payload.responsibleIdNumber:
            override["idNumber"] = payload.responsibleIdNumber

        res = run_in_proactor_thread(
            service.process_single_invoice_workflow,
            target_doc_number=payload.documentNumber,
            execute_events=bool(payload.executeEvents),
            download_pdf=bool(payload.downloadPdf),
            override_responsible=override if override else None
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from backend.utils.security import is_safe_path
from backend.services.facture_service import ensure_extracted_pdf

@router.get("/pdf/{document_number}")
def get_invoice_pdf(document_number: str):
    clean_doc = os.path.basename(document_number.strip())
    clean_fname = f"Factura_{clean_doc.replace(' ', '_').replace('/', '_')}.pdf"
    file_path = os.path.join(UPLOADS_DIR, clean_fname)

    # 1. Buscar en BD si tiene pdfPath registrado específicamente para esta factura
    if not os.path.exists(file_path):
        try:
            with service.repo.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT pdfPath FROM facture_inbox_documents WHERE documentNumber = %s OR id = %s",
                        (clean_doc, f"facture-{clean_doc.replace(' ', '-').replace('/', '-')}")
                    )
                    row = cur.fetchone()
                    if row and row.get("pdfPath") and os.path.exists(row["pdfPath"]):
                        file_path = row["pdfPath"]
        except Exception:
            pass

    # 2. Si no se encontró en BD, verificar nombres de archivo normalizados exactos
    if not os.path.exists(file_path):
        normalized_target = f"{clean_doc.replace(' ', '_').replace('/', '_')}".lower()
        for fname in os.listdir(UPLOADS_DIR):
            f_norm = fname.lower()
            if (f_norm == f"factura_{normalized_target}.pdf" or 
                f_norm == f"{normalized_target}.pdf" or
                f_norm == f"factura_{normalized_target}.zip" or
                f_norm == f"{normalized_target}.zip"):
                file_path = os.path.join(UPLOADS_DIR, fname)
                break

    if not os.path.exists(file_path) or not is_safe_path(UPLOADS_DIR, file_path):
        raise HTTPException(status_code=404, detail="Archivo PDF no encontrado para este documento.")

    # Asegurar que si el archivo es un ZIP contenedor, se sirva el PDF real
    ensure_extracted_pdf(file_path)

    return FileResponse(
        path=file_path,
        media_type="application/pdf",
        filename=os.path.basename(file_path),
        headers={"Content-Disposition": f"inline; filename={os.path.basename(file_path)}"}
    )

