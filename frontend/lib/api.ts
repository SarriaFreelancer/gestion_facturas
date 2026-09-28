import { Invoice, Supplier, DashboardMetrics } from '../app/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const api = {
  // Invoices
  async getInvoices(): Promise<Invoice[]> {
    const res = await fetch(`${API_BASE_URL}/invoices`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar facturas');
    return res.json();
  },

  async updateInvoiceField(id: string, field: string, value: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ field, value })
    });
    if (!res.ok) throw new Error('Error al actualizar factura');
    return res.json();
  },

  async createOrUpdateInvoice(invoice: Partial<Invoice>): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invoice)
    });
    if (!res.ok) throw new Error('Error al guardar factura');
    return res.json();
  },

  async deleteInvoice(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/invoices/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar factura');
    return res.json();
  },

  // Suppliers
  async getSuppliers(): Promise<Supplier[]> {
    const res = await fetch(`${API_BASE_URL}/suppliers`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar proveedores');
    return res.json();
  },

  async createOrUpdateSupplier(supplier: Partial<Supplier>): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/suppliers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(supplier)
    });
    if (!res.ok) throw new Error('Error al guardar proveedor');
    return res.json();
  },

  async updateSupplierServices(id: string, services: any[]): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/suppliers/${id}/services`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ services })
    });
    if (!res.ok) throw new Error('Error al actualizar servicios del proveedor');
    return res.json();
  },

  async deleteSupplier(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/suppliers/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar proveedor');
    return res.json();
  },

  // Dashboard Metrics
  async getMetrics(month?: string, year?: string): Promise<DashboardMetrics> {
    const params = new URLSearchParams();
    if (month && month !== 'Todos') params.append('month', month);
    if (year && year !== 'Todos') params.append('year', year);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API_BASE_URL}/dashboard/metrics${queryString}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar métricas');
    return res.json();
  },

  // Clean Database
  async cleanDatabase(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/clean-database`, { method: 'POST' });
    if (!res.ok) throw new Error('Error al limpiar base de datos');
    return res.json();
  },

  // Inicio de Mes & Rollover
  async getSystemDateStatus(month?: string, year?: string): Promise<any> {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    if (year) params.append('year', year);
    const res = await fetch(`${API_BASE_URL}/system/date-status?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar fecha del servidor');
    return res.json();
  },

  async handleMonthTransition(targetYear: string, targetMonth: string, fromYear?: string, fromMonth?: string, keepUndelivered: boolean = true): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/month-transition`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetYear, targetMonth, fromYear, fromMonth, keepUndelivered })
    });
    if (!res.ok) throw new Error('Error al inicializar mes');
    return res.json();
  },

  // Tech Inventory
  async getInventory(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/inventory`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar inventario TI');
    return res.json();
  },

  async saveInventoryItem(item: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al guardar artículo en inventario');
    }
    return res.json();
  },

  async loanInventoryItem(id: string, quantity: number, recipient: string, area: string, actionType: string = 'Préstamo'): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}/loan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quantity, recipient, area, actionType })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al prestar/entregar equipo');
    }
    return res.json();
  },

  async deleteInventoryItem(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/inventory/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar artículo');
    return res.json();
  }
};
