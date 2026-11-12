"""
Repositorio MySQL Central y Unificado (Patrón Fachada / Mixins).
Este archivo es modular y liviano, delegando la lógica en submódulos por dominio
mientras preserva 100% de compatibilidad con todos los servicios y routers existentes.
"""

from backend.repositories.base_repository import BaseRepository, _pool
from backend.repositories.invoice_repository import InvoiceRepositoryMixin
from backend.repositories.supplier_repository import SupplierRepositoryMixin
from backend.repositories.inventory_repository import InventoryRepositoryMixin
from backend.repositories.area_repository import AreaRepositoryMixin
from backend.repositories.user_repository import UserRepositoryMixin
from backend.repositories.internal_invoice_repository import InternalInvoiceRepositoryMixin
from backend.repositories.approval_repository import ApprovalRepositoryMixin
from backend.repositories.sap_repository import SapRepositoryMixin

class MySQLRepository(
    InvoiceRepositoryMixin,
    SupplierRepositoryMixin,
    InventoryRepositoryMixin,
    AreaRepositoryMixin,
    UserRepositoryMixin,
    InternalInvoiceRepositoryMixin,
    ApprovalRepositoryMixin,
    SapRepositoryMixin
):
    """
    Repositorio central que encapsula todas las operaciones de base de datos.
    Cada grupo de operaciones (facturas, proveedores, inventario, áreas, usuarios,
    aprobaciones, SAP) reside en su propio submódulo especializado.
    """
    pass

__all__ = [
    "MySQLRepository",
    "BaseRepository",
    "InvoiceRepositoryMixin",
    "SupplierRepositoryMixin",
    "InventoryRepositoryMixin",
    "AreaRepositoryMixin",
    "UserRepositoryMixin",
    "InternalInvoiceRepositoryMixin",
    "ApprovalRepositoryMixin",
    "SapRepositoryMixin",
    "_pool"
]
