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
  },

  // Movimientos de Inventario (Préstamos, Entregas y Devoluciones)
  async getInventoryMovements(itemId?: string): Promise<any[]> {
    const url = itemId ? `${API_BASE_URL}/inventory/movements?itemId=${itemId}` : `${API_BASE_URL}/inventory/movements`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener movimientos de inventario');
    return res.json();
  },

  async returnInventoryMovement(movementId: string, returnQuantity?: number, notes?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/inventory/movements/${movementId}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ returnQuantity, notes })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al procesar devolución');
    }
    return res.json();
  },

  // Categorías de Inventario TI
  async getInventoryCategories(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/inventory/categories`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar categorías');
    return res.json();
  },

  async saveInventoryCategory(category: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/inventory/categories`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(category)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al guardar categoría');
    }
    return res.json();
  },

  async deleteInventoryCategory(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/inventory/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar categoría');
    return res.json();
  },

  // Áreas de la Empresa (Alimentos Enriko S.A.S.)
  async getCompanyAreas(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/areas`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar áreas de la empresa');
    return res.json();
  },

  async saveCompanyArea(area: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/areas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(area)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al guardar área');
    }
    return res.json();
  },

  async deleteCompanyArea(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/areas/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar área');
    return res.json();
  },

  // Usuarios del Sistema (Control de Acceso SuperAdmin vs Admins de Área)
  async getUsers(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/users`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar usuarios');
    return res.json();
  },

  async saveUser(user: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al guardar usuario');
    }
    return res.json();
  },

  async deleteUser(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/users/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Error al eliminar usuario');
    return res.json();
  },

  // Autenticación & Control de Sesión
  async login(username: string, password: string): Promise<{ success: boolean; user: any; token: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al iniciar sesión');
    }
    const data = await res.json();
    if (typeof window !== 'undefined' && data.token) {
      localStorage.setItem('ae_token', data.token);
      localStorage.setItem('ae_auth_user', JSON.stringify(data.user));
      localStorage.setItem('ae_last_activity', Date.now().toString());
      if (data.expiresAt) {
        localStorage.setItem('ae_session_expires_at', (data.expiresAt * 1000).toString());
      }
    }
    return data;
  },

  async verifySession(tokenOverride?: string): Promise<{ valid: boolean; user: any; expiresAt?: number }> {
    const token = tokenOverride || (typeof window !== 'undefined' ? localStorage.getItem('ae_token') : null);
    if (!token) {
      throw new Error('No hay token de sesión activo');
    }
    const res = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ token })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Sesión inválida o expirada');
    }
    const data = await res.json();
    if (typeof window !== 'undefined' && data.user) {
      localStorage.setItem('ae_auth_user', JSON.stringify(data.user));
      localStorage.setItem('ae_last_activity', Date.now().toString());
      if (data.expiresAt) {
        localStorage.setItem('ae_session_expires_at', (data.expiresAt * 1000).toString());
      }
    }
    return data;
  },

  async logoutUser(userId?: string, username?: string, reason?: string): Promise<any> {
    const token = typeof window !== 'undefined' ? localStorage.getItem('ae_token') : null;
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ userId, username, reason: reason || 'Cierre de sesión de usuario' })
      });
    } catch (e) {
      // Ignorar error de red en logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ae_token');
        localStorage.removeItem('ae_auth_user');
        localStorage.removeItem('ae_last_activity');
        localStorage.removeItem('ae_session_expires_at');
        localStorage.removeItem('token');
        localStorage.removeItem('current_user');
      }
    }
  },

  async register(data: { username: string; name?: string; email?: string; password: string; role?: string; area?: string }): Promise<{ success: boolean; user: any; token: string }> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al registrar usuario');
    }
    const resData = await res.json();
    if (typeof window !== 'undefined' && resData.token) {
      localStorage.setItem('ae_token', resData.token);
      localStorage.setItem('ae_auth_user', JSON.stringify(resData.user));
      localStorage.setItem('ae_last_activity', Date.now().toString());
    }
    return resData;
  },

  // Configuración de Correo & Reportes Outlook
  async getEmailSettings(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/settings/email`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar configuración de correo');
    return res.json();
  },

  async saveEmailSettings(settings: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/settings/email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!res.ok) throw new Error('Error al guardar configuración de correo');
    return res.json();
  },

  async markInvoicesEmailSent(invoiceIds: string[]): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/invoices/mark-email-sent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceIds })
    });
    if (!res.ok) throw new Error('Error al marcar facturas enviadas');
    return res.json();
  },

  async sendInvoicesEmailDirect(payload: { invoiceIds: string[]; recipientEmail?: string; ccEmails?: string; subject?: string; introMessage?: string }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/invoices/send-email-direct`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al enviar correo automático');
    }
    return res.json();
  },

  async testEmailConnection(recipientEmail?: string, ccEmails?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/settings/test-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientEmail, ccEmails })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error en la prueba de conexión SMTP');
    }
    return res.json();
  },

  // --- FACTURE.CO INTEGRATION & TRACEABILITY ---
  async getFactureStatus(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/facture/status`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al consultar estado de Facture.co');
    return res.json();
  },

  async updateFactureCredentials(data: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/facture/credentials`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al actualizar credenciales de Facture.co');
    }
    return res.json();
  },

  async syncFactureInbox(): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/facture/sync`, { method: 'POST' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al sincronizar bandeja de Facture.co');
    }
    return res.json();
  },

  async getFactureInbox(folder: string = 'Todos', search?: string): Promise<any[]> {
    let url = `${API_BASE_URL}/facture/inbox?folder=${encodeURIComponent(folder)}`;
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener documentos de Facture.co');
    return res.json();
  },

  async getFactureLogs(): Promise<any[]> {
    const res = await fetch(`${API_BASE_URL}/facture/logs`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al cargar logs de auditoría de Facture.co');
    return res.json();
  },

  async importFactureDocToMain(factureDocId: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/facture/import-to-invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ factureDocId })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al importar factura');
    }
    return res.json();
  },

  async inspectAndReadFactureDoc(documentNumber: string, forceDownload: boolean = false): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/facture/inspect-and-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ documentNumber, forceDownload })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al inspeccionar y leer la factura con IA');
    }
    return res.json();
  },

  async matchSupplierConcept(issuerName: string, issuerNit: string, amount: number, rawDetail?: string): Promise<any> {
    const params = new URLSearchParams({
      issuerName,
      issuerNit,
      amount: String(amount),
      rawDetail: rawDetail || ''
    });
    const res = await fetch(`${API_BASE_URL}/facture/match-supplier?${params.toString()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al validar proveedor y concepto');
    return res.json();
  },

  async processFactureWorkflow(payload: {
    documentNumber: string;
    executeEvents?: boolean;
    downloadPdf?: boolean;
    responsibleName?: string;
    responsibleLastName?: string;
    responsibleIdNumber?: string;
  }): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/facture/process-workflow`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al procesar flujo automatizado');
    }
    return res.json();
  },

  async testAiConnection(apiKey?: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/settings/test-ai`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al verificar API Key de Gemini AI');
    }
    return res.json();
  },

  // Facturas Internas / Portal Proveedores
  async getInternalInvoices(folder: string = 'Todos', search?: string): Promise<any[]> {
    let url = `${API_BASE_URL}/internal-invoices?folder=${encodeURIComponent(folder)}`;
    if (search && search.trim()) {
      url += `&search=${encodeURIComponent(search.trim())}`;
    }
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener facturas internas');
    return res.json();
  },

  async getInternalInvoice(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/internal-invoices/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Error al obtener detalle de la factura interna');
    return res.json();
  },

  async saveInternalInvoice(data: any): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/internal-invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al guardar factura interna');
    }
    return res.json();
  },

  async uploadAndAnalyzeInvoicePdf(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/internal-invoices/upload-and-analyze`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al analizar PDF con IA');
    }
    return res.json();
  },

  async importInternalInvoiceToMain(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/internal-invoices/import-to-invoices`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al vincular factura');
    }
    return res.json();
  },

  async deleteInternalInvoice(id: string): Promise<any> {
    const res = await fetch(`${API_BASE_URL}/internal-invoices/${id}`, {
      method: 'DELETE'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Error al eliminar factura');
    }
    return res.json();
  }
};




