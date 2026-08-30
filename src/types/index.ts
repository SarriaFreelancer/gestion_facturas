export type DocumentType = 'QUOTATION' | 'INVOICE' | 'SIGNED_QUOTATION' | 'SIGNED_INVOICE' | 'OTHER';

export type InvoiceType = 'QUOTATION' | 'INVOICE';

export type FactureStatus = 'SÍ' | 'AÚN NO';

export interface Supplier {
  id: string;
  nit: string;
  name: string;
  contact?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRecord {
  id: string;
  invoiceId: string;
  type: DocumentType;
  originalName: string;
  storedName: string;
  relativePath: string;
  mimeType: string;
  size: number;
  uploadedBy: string;
  createdAt: string;
}

export interface DocumentHistoryRecord {
  id: string;
  documentId: string;
  oldName: string;
  oldPath: string;
  replacedBy: string;
  replacedAt: string;
  reason?: string;
}

export interface AuditLogRecord {
  id: string;
  invoiceId: string;
  action: string;
  user: string;
  details?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  supplierId: string;
  supplierName: string;
  type: InvoiceType;
  description: string;
  invoiceCode: string;
  remissionDate: string;
  deliveryDate?: string;
  amount: number;

  // Cotización
  quotationSigned: boolean;
  quotationSignedDate?: string;
  quotationSignedBy?: string;

  // Factura
  invoiceSigned: boolean;
  invoiceSignedDate?: string;
  invoiceSignedBy?: string;

  // Facture
  factureReceived: FactureStatus;
  factureReceivedDate?: string;
  factureReceivedBy?: string;

  // Gestión & Entrega
  management: boolean;
  managementDate?: string;
  managedBy?: string;

  delivered: boolean;
  deliveredDate?: string;
  deliveredBy?: string;

  // Relación Cotización
  relatedQuotationId?: string;
  relatedQuotationCode?: string;

  // Documentos adjuntos (rutas relativas)
  quotationDocumentPath?: string;
  invoiceDocumentPath?: string;
  signedQuotationDocumentPath?: string;
  signedInvoiceDocumentPath?: string;

  createdAt: string;
  updatedAt: string;
}

export interface DatabaseSchema {
  suppliers: Supplier[];
  invoices: Invoice[];
  documents: DocumentRecord[];
  documentHistory: DocumentHistoryRecord[];
  auditLogs: AuditLogRecord[];
}
