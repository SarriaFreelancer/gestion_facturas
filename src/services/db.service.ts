import fs from 'fs';
import path from 'path';
import { DatabaseSchema, Supplier, Invoice, DocumentRecord, DocumentHistoryRecord, AuditLogRecord } from '../types';

let mysql: any = null;
try {
  mysql = require('mysql2/promise');
} catch (e) {
  // Fallback si no está cargado mysql2
}

const DB_PATH = path.join(process.cwd(), 'database.json');

const defaultData: DatabaseSchema = {
  suppliers: [
    {
      id: 'sup-1',
      nit: '900.123.456-1',
      name: 'Proveedor ABC',
      contact: 'Carlos Pérez',
      phone: '3001234567',
      email: 'contacto@proveedorabc.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sup-2',
      nit: '800.987.654-2',
      name: 'Distribuidora Lácteos Enriko',
      contact: 'María Gómez',
      phone: '3109876543',
      email: 'ventas@lacteosenriko.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sup-3',
      nit: '901.555.777-3',
      name: 'Empaques e Insumos SAS',
      contact: 'Juan Rodriguez',
      phone: '3205557777',
      email: 'pedidos@empaques.com',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  invoices: [],
  documents: [],
  documentHistory: [],
  auditLogs: []
};

class DBService {
  private data: DatabaseSchema;
  private isMysqlConfigured = false;
  private mysqlConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'root',
    database: 'GESTION_FACTURAS'
  };

  constructor() {
    this.data = defaultData;
    this.init();
    this.initMySQL();
  }

  private async initMySQL() {
    if (!mysql) return;
    try {
      // 1. Conectar a MySQL en localhost:3306 root/root sin DB primero para asegurar que la BD exista
      const rootConn = await mysql.createConnection({
        host: this.mysqlConfig.host,
        port: this.mysqlConfig.port,
        user: this.mysqlConfig.user,
        password: this.mysqlConfig.password
      });

      await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${this.mysqlConfig.database}\`;`);
      await rootConn.end();

      // 2. Conectar a la base de datos GESTION_FACTURAS
      const conn = await mysql.createConnection(this.mysqlConfig);

      // Crear tablas si no existen
      await conn.query(`
        CREATE TABLE IF NOT EXISTS suppliers (
          id VARCHAR(100) PRIMARY KEY,
          nit VARCHAR(50) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          contact VARCHAR(255),
          phone VARCHAR(50),
          email VARCHAR(255),
          createdAt DATETIME,
          updatedAt DATETIME
        );
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS invoices (
          id VARCHAR(100) PRIMARY KEY,
          supplierId VARCHAR(100),
          supplierName VARCHAR(255),
          type VARCHAR(50),
          description TEXT,
          invoiceCode VARCHAR(100),
          remissionDate DATETIME,
          deliveryDate DATETIME,
          amount DOUBLE,
          quotationSigned TINYINT(1) DEFAULT 0,
          quotationSignedDate DATETIME,
          quotationSignedBy VARCHAR(255),
          invoiceSigned TINYINT(1) DEFAULT 0,
          invoiceSignedDate DATETIME,
          invoiceSignedBy VARCHAR(255),
          factureReceived VARCHAR(20) DEFAULT 'AÚN NO',
          factureReceivedDate DATETIME,
          factureReceivedBy VARCHAR(255),
          management TINYINT(1) DEFAULT 0,
          managementDate DATETIME,
          managedBy VARCHAR(255),
          delivered TINYINT(1) DEFAULT 0,
          deliveredDate DATETIME,
          deliveredBy VARCHAR(255),
          relatedQuotationId VARCHAR(100),
          relatedQuotationCode VARCHAR(100),
          quotationDocumentPath TEXT,
          invoiceDocumentPath TEXT,
          signedQuotationDocumentPath TEXT,
          signedInvoiceDocumentPath TEXT,
          createdAt DATETIME,
          updatedAt DATETIME
        );
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS documents (
          id VARCHAR(100) PRIMARY KEY,
          invoiceId VARCHAR(100),
          type VARCHAR(50),
          originalName VARCHAR(255),
          storedName VARCHAR(255),
          relativePath TEXT,
          mimeType VARCHAR(100),
          size INT,
          uploadedBy VARCHAR(255),
          createdAt DATETIME
        );
      `);

      await conn.query(`
        CREATE TABLE IF NOT EXISTS audit_logs (
          id VARCHAR(100) PRIMARY KEY,
          invoiceId VARCHAR(100),
          action VARCHAR(255),
          user VARCHAR(255),
          details TEXT,
          createdAt DATETIME
        );
      `);

      console.log('✅ Conexión y tablas creadas exitosamente en MySQL (GESTION_FACTURAS en localhost:3306 root:root)');
      this.isMysqlConfigured = true;
      await conn.end();
    } catch (err: any) {
      console.warn('⚠️ No se pudo conectar directamente a MySQL localhost:3306 (root/root). Usando motor de respaldo JSON/SQLite:', err.message);
    }
  }

  private init() {
    if (fs.existsSync(DB_PATH)) {
      try {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        if (!this.data.suppliers) this.data.suppliers = defaultData.suppliers;
        if (!this.data.invoices) this.data.invoices = [];
        if (!this.data.documents) this.data.documents = [];
        if (!this.data.documentHistory) this.data.documentHistory = [];
        if (!this.data.auditLogs) this.data.auditLogs = [];
      } catch (e) {
        this.save();
      }
    } else {
      this.save();
    }
  }

  public save() {
    fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  // Suppliers
  public getSuppliers(): Supplier[] {
    return this.data.suppliers;
  }

  public addSupplier(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Supplier {
    const newSup: Supplier = {
      ...supplier,
      id: 'sup-' + Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.suppliers.push(newSup);
    this.save();
    return newSup;
  }

  // Invoices
  public getInvoices(): Invoice[] {
    return this.data.invoices;
  }

  public getInvoiceById(id: string): Invoice | undefined {
    return this.data.invoices.find(i => i.id === id);
  }

  public addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice {
    const newInv: Invoice = {
      ...invoice,
      id: 'inv-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.invoices.push(newInv);

    this.addAuditLog(newInv.id, `${newInv.type === 'QUOTATION' ? 'Cotización' : 'Factura'} registrada`, 'Usuario Administrador', `Código: ${newInv.invoiceCode}`);
    
    this.save();
    return newInv;
  }

  public updateInvoice(id: string, updates: Partial<Invoice>, currentUser = 'Usuario Administrador'): Invoice | null {
    const index = this.data.invoices.findIndex(i => i.id === id);
    if (index === -1) return null;

    const current = this.data.invoices[index];
    const updated: Invoice = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.data.invoices[index] = updated;
    this.save();
    return updated;
  }

  // Documents
  public getDocumentsByInvoiceId(invoiceId: string): DocumentRecord[] {
    return this.data.documents.filter(d => d.invoiceId === invoiceId);
  }

  public getDocumentById(id: string): DocumentRecord | undefined {
    return this.data.documents.find(d => d.id === id);
  }

  public addDocument(doc: Omit<DocumentRecord, 'id' | 'createdAt'>): DocumentRecord {
    const newDoc: DocumentRecord = {
      ...doc,
      id: 'doc-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString()
    };
    this.data.documents.push(newDoc);
    this.save();
    return newDoc;
  }

  public replaceDocument(docId: string, newDocData: Omit<DocumentRecord, 'id' | 'createdAt'>, replacedBy = 'Usuario Administrador'): DocumentRecord | null {
    const docIndex = this.data.documents.findIndex(d => d.id === docId);
    if (docIndex === -1) return null;

    const oldDoc = this.data.documents[docIndex];

    const historyItem: DocumentHistoryRecord = {
      id: 'dh-' + Date.now(),
      documentId: oldDoc.id,
      oldName: oldDoc.originalName,
      oldPath: oldDoc.relativePath,
      replacedBy,
      replacedAt: new Date().toISOString(),
      reason: 'Reemplazo de documento'
    };
    this.data.documentHistory.push(historyItem);

    const updatedDoc: DocumentRecord = {
      ...oldDoc,
      ...newDocData,
      createdAt: new Date().toISOString()
    };
    this.data.documents[docIndex] = updatedDoc;
    this.save();
    return updatedDoc;
  }

  // History & Audit
  public getAuditLogsByInvoiceId(invoiceId: string): AuditLogRecord[] {
    return this.data.auditLogs
      .filter(l => l.invoiceId === invoiceId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  public addAuditLog(invoiceId: string, action: string, user = 'Usuario Administrador', details?: string): AuditLogRecord {
    const log: AuditLogRecord = {
      id: 'log-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      invoiceId,
      action,
      user,
      details,
      createdAt: new Date().toISOString()
    };
    this.data.auditLogs.push(log);
    this.save();
    return log;
  }
}

export const dbService = new DBService();
