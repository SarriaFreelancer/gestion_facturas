import sys
import asyncio

if sys.platform == 'win32':
    try:
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    except Exception:
        pass

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from backend.routers.invoices_router import router as invoices_router
from backend.routers.facture_router import router as facture_router
from backend.routers.internal_invoices_router import router as internal_invoices_router

app = FastAPI(
    title="Alimentos Enriko - Facturas & Cotizaciones API",
    version="2.0.0",
    description="Backend FastAPI Service-Repository Pattern con persistencia en MySQL"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

uploads_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(uploads_dir, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

app.include_router(invoices_router, prefix="/api")
app.include_router(facture_router, prefix="/api")
app.include_router(internal_invoices_router, prefix="/api")

@app.get("/")
def root():
    return {
        "system": "Alimentos Enriko API",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
