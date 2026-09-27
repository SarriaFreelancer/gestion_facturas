from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routers.invoices_router import router as invoices_router

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

app.include_router(invoices_router, prefix="/api")

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
