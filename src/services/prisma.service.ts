import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { Supplier, Invoice, DocumentRecord, AuditLogRecord } from '../types';

export const prisma = new PrismaClient();

export class PrismaService {
  private static instance: PrismaService;
  private initialized = false;

  private constructor() {
    this.runStartupSqlScript();
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  /**
   * Ejecuta el script SQL GESTION_FACTURAS.sql al iniciar el servidor
   */
  public async runStartupSqlScript() {
    if (this.initialized) return;
    try {
      console.log('🚀 [Prisma & MySQL] Ejecutando script de inicialización GESTION_FACTURAS.sql...');
      const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        multipleStatements: true
      });

      const sqlPath = path.join(process.cwd(), 'GESTION_FACTURAS.sql');
      if (fs.existsSync(sqlPath)) {
        const sqlContent = fs.readFileSync(sqlPath, 'utf-8');
        await connection.query(sqlContent);
        console.log('✅ [Prisma & MySQL] Script GESTION_FACTURAS.sql ejecutado correctamente al iniciar!');
      } else {
        console.warn('⚠️ Archivo GESTION_FACTURAS.sql no encontrado en la raíz.');
      }

      await connection.end();
      this.initialized = true;
    } catch (err: any) {
      console.error('⚠️ Error ejecutando script SQL de arranque en MySQL:', err.message);
    }
  }

  // Suppliers
  public async getSuppliers(): Promise<Supplier[]> {
    await this.runStartupSqlScript();
    const suppliers = await prisma.supplier.findMany({
      orderBy: { name: 'asc' }
    });
    return suppliers.map(s => ({
      ...s,
      contact: s.contact || undefined,
      phone: s.phone || undefined,
      email: s.email || undefined,
      createdAt: s.createdAt.toISOString(),
      updatedAt: s.updatedAt.toISOString()
    }));
  }

  public async addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const created = await prisma.supplier.create({
      data: {
        nit: supplier.nit,
        name: supplier.name,
        contact: supplier.contact,
        phone: supplier.phone,
        email: supplier.email
      }
    });

    return {
      ...created,
      contact: created.contact || undefined,
      phone: created.phone || undefined,
      email: created.email || undefined,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString()
    };
  }

  // Invoices
  public async getInvoices(): Promise<Invoice[]> {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return invoices.map(i => ({
      ...i,
      type: i.type as 'QUOTATION' | 'INVOICE',
      factureReceived: i.factureReceived as 'SÍ' | 'AÚN NO',
      remissionDate: i.remissionDate.toISOString(),
      deliveryDate: i.deliveryDate ? i.deliveryDate.toISOString() : undefined,
      quotationSignedDate: i.quotationSignedDate ? i.quotationSignedDate.toISOString() : undefined,
      quotationSignedBy: i.quotationSignedBy || undefined,
      invoiceSignedDate: i.invoiceSignedDate ? i.invoiceSignedDate.toISOString() : undefined,
      invoiceSignedBy: i.invoiceSignedBy || undefined,
      factureReceivedDate: i.factureReceivedDate ? i.factureReceivedDate.toISOString() : undefined,
      factureReceivedBy: i.factureReceivedBy || undefined,
      managementDate: i.managementDate ? i.managementDate.toISOString() : undefined,
      managedBy: i.managedBy || undefined,
      deliveredDate: i.deliveredDate ? i.deliveredDate.toISOString() : undefined,
      deliveredBy: i.deliveredBy || undefined,
      relatedQuotationId: i.relatedQuotationId || undefined,
      relatedQuotationCode: i.relatedQuotationCode || undefined,
      quotationDocumentPath: i.quotationDocumentPath || undefined,
      invoiceDocumentPath: i.invoiceDocumentPath || undefined,
      signedQuotationDocumentPath: i.signedQuotationDocumentPath || undefined,
      signedInvoiceDocumentPath: i.signedInvoiceDocumentPath || undefined,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString()
    }));
  }

  public async getInvoiceById(id: string): Promise<Invoice | null> {
    const i = await prisma.invoice.findUnique({ where: { id } });
    if (!i) return null;

    return {
      ...i,
      type: i.type as 'QUOTATION' | 'INVOICE',
      factureReceived: i.factureReceived as 'SÍ' | 'AÚN NO',
      remissionDate: i.remissionDate.toISOString(),
      deliveryDate: i.deliveryDate ? i.deliveryDate.toISOString() : undefined,
      quotationSignedDate: i.quotationSignedDate ? i.quotationSignedDate.toISOString() : undefined,
      quotationSignedBy: i.quotationSignedBy || undefined,
      invoiceSignedDate: i.invoiceSignedDate ? i.invoiceSignedDate.toISOString() : undefined,
      invoiceSignedBy: i.invoiceSignedBy || undefined,
      factureReceivedDate: i.factureReceivedDate ? i.factureReceivedDate.toISOString() : undefined,
      factureReceivedBy: i.factureReceivedBy || undefined,
      managementDate: i.managementDate ? i.managementDate.toISOString() : undefined,
      managedBy: i.managedBy || undefined,
      deliveredDate: i.deliveredDate ? i.deliveredDate.toISOString() : undefined,
      deliveredBy: i.deliveredBy || undefined,
      relatedQuotationId: i.relatedQuotationId || undefined,
      relatedQuotationCode: i.relatedQuotationCode || undefined,
      quotationDocumentPath: i.quotationDocumentPath || undefined,
      invoiceDocumentPath: i.invoiceDocumentPath || undefined,
      signedQuotationDocumentPath: i.signedQuotationDocumentPath || undefined,
      signedInvoiceDocumentPath: i.signedInvoiceDocumentPath || undefined,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString()
    };
  }

  public async addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    const created = await prisma.invoice.create({
      data: {
        supplierId: invoice.supplierId,
        supplierName: invoice.supplierName,
        type: invoice.type,
        description: invoice.description,
        invoiceCode: invoice.invoiceCode,
        remissionDate: new Date(invoice.remissionDate),
        deliveryDate: invoice.deliveryDate ? new Date(invoice.deliveryDate) : null,
        amount: invoice.amount,
        quotationSigned: invoice.quotationSigned,
        invoiceSigned: invoice.invoiceSigned,
        factureReceived: invoice.factureReceived,
        management: invoice.management,
        delivered: invoice.delivered,
        relatedQuotationId: invoice.relatedQuotationId,
        relatedQuotationCode: invoice.relatedQuotationCode
      }
    });

    await this.addAuditLog(created.id, `${created.type === 'QUOTATION' ? 'Cotización' : 'Factura'} registrada`, 'Usuario Administrador', `Código: ${created.invoiceCode}`);

    return this.getInvoiceById(created.id) as Promise<Invoice>;
  }

  public async updateInvoice(id: string, updates: Partial<Invoice>, currentUser = 'Usuario Administrador'): Promise<Invoice | null> {
    const dataToUpdate: any = { ...updates };
    if (updates.remissionDate) dataToUpdate.remissionDate = new Date(updates.remissionDate);
    if (updates.deliveryDate) dataToUpdate.deliveryDate = new Date(updates.deliveryDate);
    if (updates.quotationSignedDate) dataToUpdate.quotationSignedDate = new Date(updates.quotationSignedDate);
    if (updates.invoiceSignedDate) dataToUpdate.invoiceSignedDate = new Date(updates.invoiceSignedDate);
    if (updates.factureReceivedDate) dataToUpdate.factureReceivedDate = new Date(updates.factureReceivedDate);
    if (updates.managementDate) dataToUpdate.managementDate = new Date(updates.managementDate);
    if (updates.deliveredDate) dataToUpdate.deliveredDate = new Date(updates.deliveredDate);

    await prisma.invoice.update({
      where: { id },
      data: dataToUpdate
    });

    return this.getInvoiceById(id);
  }

  // Documents
  public async getDocumentsByInvoiceId(invoiceId: string): Promise<DocumentRecord[]> {
    const docs = await prisma.document.findMany({
      where: { invoiceId }
    });
    return docs.map(d => ({
      ...d,
      type: d.type as any,
      createdAt: d.createdAt.toISOString()
    }));
  }

  public async getDocumentById(id: string): Promise<DocumentRecord | null> {
    const d = await prisma.document.findUnique({ where: { id } });
    if (!d) return null;
    return {
      ...d,
      type: d.type as any,
      createdAt: d.createdAt.toISOString()
    };
  }

  public async addDocument(doc: Omit<DocumentRecord, 'id' | 'createdAt'>): Promise<DocumentRecord> {
    const created = await prisma.document.create({
      data: {
        invoiceId: doc.invoiceId,
        type: doc.type,
        originalName: doc.originalName,
        storedName: doc.storedName,
        relativePath: doc.relativePath,
        mimeType: doc.mimeType,
        size: doc.size,
        uploadedBy: doc.uploadedBy
      }
    });

    return {
      ...created,
      type: created.type as any,
      createdAt: created.createdAt.toISOString()
    };
  }

  public async replaceDocument(docId: string, newDocData: Omit<DocumentRecord, 'id' | 'createdAt'>, replacedBy = 'Usuario Administrador'): Promise<DocumentRecord | null> {
    const updated = await prisma.document.update({
      where: { id: docId },
      data: {
        originalName: newDocData.originalName,
        storedName: newDocData.storedName,
        relativePath: newDocData.relativePath,
        mimeType: newDocData.mimeType,
        size: newDocData.size,
        uploadedBy: replacedBy
      }
    });

    return {
      ...updated,
      type: updated.type as any,
      createdAt: updated.createdAt.toISOString()
    };
  }

  public async deleteSupplier(id: string): Promise<boolean> {
    await prisma.supplier.delete({ where: { id } });
    return true;
  }

  public async deleteInvoice(id: string): Promise<boolean> {
    await prisma.invoice.delete({ where: { id } });
    return true;
  }

  public async convertQuotationToInvoice(id: string, invoiceCode: string, currentUser = 'Usuario Administrador'): Promise<Invoice | null> {
    const quote = await this.getInvoiceById(id);
    if (!quote) return null;

    const newInvoice = await this.addInvoice({
      supplierId: quote.supplierId,
      supplierName: quote.supplierName,
      type: 'INVOICE',
      description: `Factura generada desde Cotización ${quote.invoiceCode}: ${quote.description}`,
      invoiceCode,
      remissionDate: new Date().toISOString(),
      deliveryDate: quote.deliveryDate,
      amount: quote.amount,
      quotationSigned: true,
      invoiceSigned: false,
      factureReceived: 'AÚN NO',
      management: false,
      delivered: false,
      relatedQuotationId: quote.id,
      relatedQuotationCode: quote.invoiceCode,
      quotationDocumentPath: quote.quotationDocumentPath
    });

    await this.addAuditLog(quote.id, `Cotización convertida a Factura (${invoiceCode})`, currentUser);
    return newInvoice;
  }

  // Users
  public async getUsers(): Promise<any[]> {
    return await prisma.user.findMany({ orderBy: { name: 'asc' } });
  }

  public async addUser(user: { username: string; name: string; role: string }): Promise<any> {
    return await prisma.user.create({
      data: {
        username: user.username,
        name: user.name,
        role: user.role,
        status: 'Activo'
      }
    });
  }

  // Audit Logs
  public async getAllAuditLogs(): Promise<AuditLogRecord[]> {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    return logs.map(l => ({
      ...l,
      details: l.details || undefined,
      createdAt: l.createdAt.toISOString()
    }));
  }

  public async getAuditLogsByInvoiceId(invoiceId: string): Promise<AuditLogRecord[]> {
    const logs = await prisma.auditLog.findMany({
      where: { invoiceId },
      orderBy: { createdAt: 'asc' }
    });
    return logs.map(l => ({
      ...l,
      details: l.details || undefined,
      createdAt: l.createdAt.toISOString()
    }));
  }

  public async addAuditLog(invoiceId: string, action: string, user = 'Usuario Administrador', details?: string): Promise<AuditLogRecord> {
    const created = await prisma.auditLog.create({
      data: {
        invoiceId,
        action,
        user,
        details
      }
    });

    return {
      ...created,
      details: created.details || undefined,
      createdAt: created.createdAt.toISOString()
    };
  }
}

export const prismaService = PrismaService.getInstance();

