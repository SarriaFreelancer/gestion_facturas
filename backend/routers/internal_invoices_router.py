import os
import time
import shutil
from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.repositories.mysql_repository import MySQLRepository
from backend.services.invoice_ai_service import InvoiceAIService
from backend.utils.security import is_safe_path

router = APIRouter(prefix="/internal-invoices", tags=["Facturas Internas / Proveedores"])
repo = MySQLRepository()

UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)

class InternalInvoicePayload(BaseModel):
    id: Optional[str] = None
    documentNumber: str
    docType: Optional[str] = "FACTURA DE VENTA"
    paymentType: Optional[str] = "Crédito"
    referenceNumber: Optional[str] = ""
    issuerName: str
    issuerNit: str
    clientName: Optional[str] = "ALIMENTOS ENRIKO SAS"
    clientNit: Optional[str] = "890330035"
    emissionDate: Optional[str] = ""
    dueDate: Optional[str] = ""
    paymentCondition: Optional[str] = "CREDITO 30 DIAS"
    paymentMethod: Optional[str] = "TRANSFERENCIA"
    subtotalAmount: Optional[float] = 0.0
    ivaAmount: Optional[float] = 0.0
    totalAmount: Optional[float] = 0.0
    retentionAmount: Optional[float] = 0.0
    netPayableAmount: Optional[float] = 0.0
    hasIva: Optional[int] = 0
    itemsCount: Optional[int] = 1
    itemsWithIvaCount: Optional[int] = 0
    itemsWithoutIvaCount: Optional[int] = 1
    rawDetail: Optional[str] = ""
    itemsJson: Optional[Any] = []
    pdfPath: Optional[str] = None
    pdfOriginalName: Optional[str] = None
    status: Optional[str] = "Radicada"
    folderType: Optional[str] = "Recibidos"
    uploadedBy: Optional[str] = "Proveedor"

class ImportInternalPayload(BaseModel):
    id: str

class InternalEventPayload(BaseModel):
    eventType: str

@router.get("")
def get_internal_invoices(folder: Optional[str] = "Todos", search: Optional[str] = None, supplier_nit: Optional[str] = None, limit: Optional[int] = 1000):
    try:
        return repo.fetch_internal_invoices(folder_type=folder, search=search, supplier_nit=supplier_nit, limit=limit or 1000)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{invoice_id}")
def get_single_internal_invoice(invoice_id: str):
    try:
        inv = repo.fetch_internal_invoice_by_id(invoice_id)
        if not inv:
            raise HTTPException(status_code=404, detail="Factura interna no encontrada")
        return inv
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
def save_internal_invoice(payload: InternalInvoicePayload):
    try:
        saved_id = repo.save_internal_invoice(payload.model_dump())
        return {"success": True, "id": saved_id, "message": "Factura radicada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error guardando factura: {str(e)}")

@router.post("/{invoice_id}/event")
def execute_internal_invoice_event(invoice_id: str, payload: InternalEventPayload):
    try:
        res = repo.update_internal_invoice_event(invoice_id, payload.eventType)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/upload-and-analyze")
async def upload_and_analyze_pdf(file: UploadFile = File(...)):
    try:
        if not file.filename:
            raise HTTPException(status_code=400, detail="Archivo no válido")
        
        orig_name = file.filename
        clean_name = f"Internal_{int(time.time() * 1000)}_{orig_name.replace(' ', '_')}"
        dest_path = os.path.join(UPLOADS_DIR, clean_name)

        with open(dest_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Analizar con IA Multimodal
        analysis = InvoiceAIService.analyze_invoice_pdf(dest_path)

        return {
            "success": True,
            "filename": clean_name,
            "originalName": orig_name,
            "pdfPath": dest_path,
            "analysis": analysis
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analizando archivo con IA: {str(e)}")

@router.post("/import-to-invoices")
def import_internal_invoice(payload: ImportInternalPayload):
    try:
        res = repo.import_internal_to_main(payload.id)
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{invoice_id}")
def delete_internal_invoice(invoice_id: str):
    try:
        success = repo.delete_internal_invoice(invoice_id)
        if not success:
            raise HTTPException(status_code=404, detail="Factura no encontrada o ya eliminada")
        return {"success": True, "message": "Factura eliminada correctamente"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pdf/{document_number}")
def get_internal_pdf(document_number: str):
    clean_doc = os.path.basename(document_number.strip())
    
    # 1. Buscar en BD primero por ID o por documentNumber para obtener el pdfPath exacto
    target_path = None
    try:
        inv = repo.fetch_internal_invoice_by_id(clean_doc)
        if inv and inv.get("pdfPath") and os.path.exists(inv["pdfPath"]):
            target_path = inv["pdfPath"]
    except Exception:
        pass

    # 2. Si no se encontró por BD, buscar en UPLOADS_DIR por nombre exacto o coincidencia
    if not target_path or not os.path.exists(target_path):
        direct_path = os.path.join(UPLOADS_DIR, clean_doc)
        if os.path.exists(direct_path):
            target_path = direct_path
        else:
            for fname in os.listdir(UPLOADS_DIR):
                if clean_doc.lower() in fname.lower() and (fname.endswith(".pdf") or fname.endswith(".zip")):
                    target_path = os.path.join(UPLOADS_DIR, fname)
                    break

    if not target_path or not os.path.exists(target_path) or not is_safe_path(UPLOADS_DIR, target_path):
        raise HTTPException(status_code=404, detail="Archivo PDF no encontrado")

    from backend.services.facture_service import ensure_extracted_pdf
    ensure_extracted_pdf(target_path)

    return FileResponse(
        path=target_path,
        media_type="application/pdf",
        filename=os.path.basename(target_path),
        headers={"Content-Disposition": f"inline; filename={os.path.basename(target_path)}"}
    )
