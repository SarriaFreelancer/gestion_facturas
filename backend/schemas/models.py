from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class SupplierBase(BaseModel):
    nit: str
    name: str
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    area: Optional[str] = "General"

class SupplierCreate(SupplierBase):
    pass

class SupplierOut(SupplierBase):
    id: str
    createdAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class InvoiceBase(BaseModel):
    supplierId: str
    supplierName: str
    type: str = "INVOICE" # "QUOTATION" | "INVOICE"
    description: str = ""
    invoiceCode: str
    remissionDate: datetime
    deliveryDate: Optional[datetime] = None
    amount: float = 0.0
    quotationSigned: bool = False
    invoiceSigned: bool = False
    factureReceived: str = "AÚN NO"
    delivered: bool = False
    oc: Optional[str] = None

class InvoiceCreate(InvoiceBase):
    pass

class InvoiceOut(InvoiceBase):
    id: str
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserAuth(BaseModel):
    username: str
    password: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str

class AIQueryRequest(BaseModel):
    prompt: str
    model: Optional[str] = "llama-3.3-70b-versatile"
