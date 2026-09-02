import { Injectable } from '@nestjs/common';
import { User, Supplier, Invoice } from '../types';

@Injectable()
export class DbService {
  private users: User[] = [
    { id: 'usr-1', username: 'superadmin', name: 'Super Administrador', role: 'SuperAdmin', area: 'Todas las Áreas', pass: 'superadmin123' },
    { id: 'usr-2', username: 'admin_ti', name: 'Juan Rodríguez (Admin TI)', role: 'Administrador', area: 'Tecnología (TI)', pass: 'admin123' },
    { id: 'usr-3', username: 'admin_compras', name: 'María Fernanda Ruiz (Admin Compras)', role: 'Administrador', area: 'Adquisiciones & Compras', pass: 'compras123' }
  ];

  private suppliers: Supplier[] = [
    { id: 'sup-1', nit: '800.789.012-4', name: 'Servicios de Tecnología S.A.S.', contact: 'Laura Restrepo', phone: '+57 300 123 4567', monthlyCount: 2, areas: ['Tecnología (TI)', 'Contabilidad & Finanzas'] },
    { id: 'sup-2', nit: '900.123.456-1', name: 'Distribuidora Carnes Enriko', contact: 'Carlos Mendoza', phone: '+57 310 455 8899', monthlyCount: 3, areas: ['Adquisiciones & Compras', 'Operaciones & Logística'] },
    { id: 'sup-3', nit: '890.334.112-9', name: 'Mantenimiento e Insumos Industriales', contact: 'Roberto Gómez', phone: '+57 315 789 1234', monthlyCount: 1, areas: ['Mantenimiento & Planta', 'Tecnología (TI)'] },
    { id: 'sup-4', nit: '860.001.245-8', name: 'Soluciones Financieras & Contables', contact: 'Diana Páez', phone: '+57 312 998 7766', monthlyCount: 1, areas: ['Contabilidad & Finanzas'] },
    { id: 'sup-5', nit: '901.442.889-0', name: 'Agencia Marketing Creativo', contact: 'Felipe Silva', phone: '+57 318 654 3210', monthlyCount: 2, areas: ['Marketing & Publicidad'] }
  ];

  private invoices: Invoice[] = [
    { id: 'inv-aug-1', monthYear: '2026-08', supplierName: 'Servicios de Tecnología S.A.S.', type: 'INVOICE', area: 'Tecnología (TI)', description: 'Soporte de Servidores Agosto', invoiceCode: 'FAC-2026-0811', factureReceived: 'SÍ', invoiceSigned: true, management: true, remissionDate: '2026-08-15', deliveredDate: '2026-08-15 11:00', amount: 3200000, delivered: true },
    { id: 'inv-sep-1', monthYear: '2026-09', supplierName: 'Servicios de Tecnología S.A.S.', type: 'INVOICE', area: 'Tecnología (TI)', description: 'Mantenimiento Servidores Septiembre', invoiceCode: 'FAC-2026-4412', factureReceived: 'SÍ', invoiceSigned: true, management: true, remissionDate: '2026-09-01', deliveredDate: '2026-09-01 16:01', amount: 3200000, delivered: true },
    { id: 'inv-sep-2', monthYear: '2026-09', supplierName: 'Distribuidora Carnes Enriko', type: 'INVOICE', area: 'Adquisiciones & Compras', description: 'Carne vacuna insumos Septiembre', invoiceCode: 'FAC-2026-9901', factureReceived: 'SÍ', invoiceSigned: true, management: true, remissionDate: '2026-09-01', deliveredDate: '2026-09-01 14:20', amount: 8450000, delivered: true }
  ];

  // METODOS USUARIOS
  getUsers(): User[] { return this.users; }
  addUser(user: User): User { this.users.push(user); return user; }

  // METODOS PROVEEDORES
  getSuppliers(): Supplier[] { return this.suppliers; }
  addSupplier(supplier: Supplier): Supplier { this.suppliers.unshift(supplier); return supplier; }
  updateSupplier(id: string, updateData: Partial<Supplier>): Supplier | null {
    const idx = this.suppliers.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.suppliers[idx] = { ...this.suppliers[idx], ...updateData };
      return this.suppliers[idx];
    }
    return null;
  }
  deleteSupplier(id: string): boolean {
    const initLen = this.suppliers.length;
    this.suppliers = this.suppliers.filter(s => s.id !== id);
    return this.suppliers.length < initLen;
  }

  // METODOS FACTURAS
  getInvoices(): Invoice[] { return this.invoices; }
  addInvoice(invoice: Invoice): Invoice { this.invoices.unshift(invoice); return invoice; }
  updateInvoice(id: string, updateData: Partial<Invoice>): Invoice | null {
    const idx = this.invoices.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.invoices[idx] = { ...this.invoices[idx], ...updateData };
      return this.invoices[idx];
    }
    return null;
  }
}
